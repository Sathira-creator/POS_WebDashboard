import Order from "../models/Order.js";
import mongoose from "mongoose";

// get statCard data: /api/reports/statdata
export const getDashboardAnalytics = async (req, res) => {
    const { start, end } = req.query; 
    const shopId = req.shopId; // <-- Provided cleanly by your middleware
    
    try {
        const matchQuery = {
            shop: new mongoose.Types.ObjectId(shopId),
            createdAt: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        };

        const dailyMetrics = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Colombo" } },
                    dailySales: { $sum: "$netTotal" },
                    dailyOrders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        let totalSales = 0;
        let totalOrders = 0;

        dailyMetrics.forEach(day => {
            totalSales += day.dailySales;
            totalOrders += day.dailyOrders;
            day.dailySales = parseFloat(day.dailySales.toFixed(2));
        });

        const overallAOV = totalOrders > 0 ? totalSales / totalOrders : 0;

        res.status(200).json({ 
            success: true, 
            sales: Number(totalSales || 0),
            orders: Number(totalOrders || 0),
            aov: Number(overallAOV || 0)
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// get chart data (sales, orders, AOV): /api/reports/:type
export const getLineChartData = async (req, res) => {
    const { type } = req.params;
    const { start, end } = req.query; 
    const shopId = req.shopId; // <-- Provided cleanly by your middleware

    try {
        const matchQuery = {
            shop: new mongoose.Types.ObjectId(shopId),
            createdAt: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        };

        let records = [];

        if (type === 'sales') {
            records = await Order.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Colombo" } },
                        amount: { $sum: "$netTotal" }
                    }
                },
                { $project: { _id: 0, date: "$_id", amount: 1 } },
                { $sort: { date: 1 } }
            ]);
        } 
        else if (type === 'orders') {
            records = await Order.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Colombo" } },
                        amount: { $sum: 1 }
                    }
                },
                { $project: { _id: 0, date: "$_id", amount: 1 } },
                { $sort: { date: 1 } }
            ]);
        } 
        else if (type === 'aov') {
            records = await Order.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" , timezone: "Asia/Colombo" } },
                        amount: { $avg: "$netTotal" }
                    }
                },
                { $project: { _id: 0, date: "$_id", amount: 1 } },
                { $sort: { date: 1 } }
            ]);
        }

        res.status(200).json({ success: true, records });

    } catch(err){
        res.status(500).json({ success: false, error: err.message });
    }
}

// get pieChart data: /api/reports/pie
export const getPieChartData = async (req, res) => {
  const { start, end } = req.query;
  const shopId = req.shopId; // <-- Provided cleanly by your middleware

  try {
    const matchQuery = {
      shop: new mongoose.Types.ObjectId(shopId),
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    };

    const [paymentStats, categoryStats, timePeriodStats] = await Promise.all([
      // Pipeline 1: Payment Method Stats
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$paymentMethod",
            totalSales: { $sum: "$netTotal" }
          }
        },
        {
          $project: {
            _id: 0,
            label: "$_id",
            value: { $round: ["$totalSales", 2] }
          }
        }
      ]),

      // Pipeline 2: Category Stats
      Order.aggregate([
        { $match: matchQuery },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "inventories",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $group: {
            _id: "$productDetails.category",
            totalSales: {
              $sum: {
                $multiply: [
                  "$items.quantity",
                  "$items.unitPrice",
                  { $subtract: [1, { $divide: [{ $ifNull: ["$items.discountPercentage", 0] }, 100] }] }
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            label: "$_id",
            value: { $round: ["$totalSales", 2] }
          }
        },
        { $sort: { value: -1 } }
      ]),

      // Pipeline 3: Time Period Stats
      Order.aggregate([
        { $match: matchQuery },
        {
          $project: {
            netTotal: 1,
            hour: { $hour: { date: "$createdAt", timezone: "Asia/Colombo" } }
          }
        },
        {
          $project: {
            netTotal: 1,
            period: {
              $switch: {
                branches: [
                  { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 11] }] }, then: "Morning (6am-11am)" },
                  { case: { $and: [{ $gte: ["$hour", 11] }, { $lt: ["$hour", 15] }] }, then: "Lunch (11am-3pm)" },
                  { case: { $and: [{ $gte: ["$hour", 15] }, { $lt: ["$hour", 20] }] }, then: "Evening (3pm-8pm)" }
                ],
                default: "Night (8pm-6am)"
              }
            }
          }
        },
        {
          $group: {
            _id: "$period",
            totalSales: { $sum: "$netTotal" }
          }
        },
        {
          $project: {
            _id: 0,
            label: "$_id",
            value: { $round: ["$totalSales", 2] }
          }
        }
      ])
    ]);

    // Format Category Data
    const categoryColors = [
      '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
      '#8884d8', '#E91E63', '#9C27B0', '#00BCD4'
    ];

    const categoryData = categoryStats.map((item, index) => ({
      id: index,
      label: item.label ? item.label.toUpperCase() : 'UNCATEGORIZED',
      value: Number(item.value || 0),
      color: categoryColors[index % categoryColors.length]
    }));

    // Format Payment Data
    const colorMap = {
      cash: '#4caf50',
      card: '#2196f3',
      online: '#9c27b0'
    };

    const paymentData = paymentStats.map((item, index) => ({
      id: index,
      label: item.label ? item.label.toUpperCase() : 'OTHER',
      value: Number(item.value || 0),
      color: colorMap[item.label?.toLowerCase()] || '#8884d8'
    }));

    // Format Time Period Data
    const timePeriodColorMap = {
      'Morning (6am-11am)': '#ffeb3b',
      'Lunch (11am-3pm)': '#f44336',
      'Evening (3pm-8pm)': '#3f51b5',
      'Night (8pm-6am)': '#263238'
    };

    const timePeriodData = timePeriodStats.map((item, index) => ({
      id: index,
      label: item.label,
      value: Number(item.value || 0),
      color: timePeriodColorMap[item.label] || '#9e9e9e'
    }));

    res.status(200).json({
      success: true,
      paymentData,
      categoryData,
      timePeriodData
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};