import Order from "../models/Order.js";

// get chart data (sales, orders, AOV): /api/reports/:type
export const getLineChartData = async (req, res) => {
    const { type } = req.params;
    const { start, end } = req.query; 
    try{
        // 1. Build out base dynamic date boundaries
        const dateMatch = {
        createdAt: {
            $gte: new Date(start),
            $lte: new Date(end)
        }
        };

        let records = [];

        if (type === 'sales') {
        records = await Order.aggregate([
            { $match: dateMatch },
            {
            // Group transactions together by calendar date string
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Colombo" } },
                amount: { $sum: "$netTotal" } // Sums up net values for that group boundary
            }
            },
            {
            // Rename database keys to fit front-end chart expectations
            $project: {
                _id: 0,
                date: "$_id",
                amount: 1
            }
            },
            { $sort: { date: 1 } } // Keeps chart rendering chronologically left-to-right
        ]);
        } 
        
        else if (type === 'orders') {
        records = await Order.aggregate([
            { $match: dateMatch },
            {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Colombo" } },
                amount: { $sum: 1 } // Counts total transactions processed per window
            }
            },
            {
            $project: { _id: 0, date: "$_id", amount: 1 }
            },
            { $sort: { date: 1 } }
        ]);
        } 
        
        else if (type === 'aov') {
        // Average Order Value calculations
        records = await Order.aggregate([
            { $match: dateMatch },
            {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" , timezone: "Asia/Colombo" } },
                amount: { $avg: "$netTotal" } // Computes average item values per window
            }
            },
            {
            $project: { _id: 0, date: "$_id", amount: 1 }
            },
            { $sort: { date: 1 } }
        ]);
        }


        res.status(200).json({ success: true, records });

    }catch(err){
        res.status(500).json({ success: false, error: error.message });

    }
}