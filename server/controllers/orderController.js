import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';

// createOrder : /api/order/create
export const createOrder = async (req, res) => {
  try {
    const cashierId = req.userId || req.user?._id || req.user?.id;
    
    // Retrieve shopId from middleware attachment or headers
    const shopId = req.shopId || req.shop?._id || req.headers['x-shop-id'];

    if (!shopId) {
      return res.status(400).json({ 
        success: false, 
        message: "Shop ID is missing. Please select an active shop." 
      });
    }

    if (!cashierId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Cashier session missing." 
      });
    }

    const { 
      paymentMethod, 
      cashReceived, 
      changeGiven 
    } = req.body;

    // 1. Fetch the Active Cart for this Employee in this Shop
    const cart = await Cart.findOne({ shop: shopId, cashierId }).populate('items.productId');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Missing required payment method field." });
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const orderItems = [];

    // 2. Inventory Check, Stock Deduction & Subtotal Calculation from Cart Items
    for (const cartItem of cart.items) {
      const productId = cartItem.productId._id || cartItem.productId;
      
      const product = await Inventory.findOne({ 
        _id: productId, 
        shop: shopId 
      });
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product matching ID ${productId} was not found in this shop's inventory.` 
        });
      }

      if (product.qty < cartItem.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.qty}, Requested: ${cartItem.quantity}` 
        });
      }

      // Deduct the inventory quantity
      product.qty -= cartItem.quantity;
      await product.save();

      const itemUnitPrice = cartItem.unitPrice || product.price;
      const itemQty = cartItem.quantity;
      const itemSubtotal = itemUnitPrice * itemQty;
      const discountPercentage = cartItem.discountPercentage || 0;
      const itemDiscountAmount = (itemSubtotal * discountPercentage) / 100;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscountAmount;

      orderItems.push({
        productId: product._id,
        itemName: product.name,
        unitPrice: itemUnitPrice,
        quantity: itemQty,
        discountPercentage: discountPercentage
      });
    }

    const netTotal = subtotal - totalDiscount;

    // 3. Auto-Generate a Human-Readable Order Invoice Number
    const dateStamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `INV-${dateStamp}-${randomSuffix}`;

    // 4. Create and Save the New Order Document with shop association
    const newOrder = new Order({
      orderNumber,
      shop: shopId,
      cashierId,
      items: orderItems,
      subtotal,
      totalDiscount,
      netTotal,
      paymentMethod,
      cashReceived: cashReceived || netTotal,
      changeGiven: changeGiven || 0,
      paymentStatus: 'paid'
    });

    await newOrder.save();

    // 5. Update Cashier KPI Sales Stats
    await User.findByIdAndUpdate(cashierId, {
      $inc: { sales: netTotal }
    });

    // 6. Clear/Delete the Employee's Cart after successful checkout
    await Cart.findOneAndDelete({ shop: shopId, cashierId });

    // 6.5. Broadcast real-time cart clearance via Socket.io to sync web/mobile screens
    const io = req.app.get('io');
    if (io) {
        const roomName = `cart_${shopId}_${cashierId}`;
        io.to(roomName).emit('cart_updated', { items: [] });
    }

    // 7. Return Success Response to React Frontend
    return res.status(201).json({
      success: true,
      message: "Order processed successfully!",
      order: newOrder
    });

  } catch (error) {
    console.error("Checkout Controller Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error processing transaction.", 
      error: error.message 
    });
  }
};



// @desc    Get all orders for the active shop
// @route   GET /api/orders
// @access  Private (Admin/Worker)
// @desc    Get all orders for the active shop
// @route   GET /api/orders
// @access  Private (Admin/Worker)
// @desc    Get all orders and total count for the active shop
// @route   GET /api/order/orderlist
// @access  Private (Admin/Worker)
export const getShopOrders = async (req, res) => {
    try {
        const shopId = req.shopId || req.headers['x-shop-id'];

        if (!shopId) {
            return res.status(400).json({
                success: false,
                message: "Shop ID is missing in headers."
            });
        }

        // Fetch the total document count and the orders list concurrently for performance
        const [totalCount, orders] = await Promise.all([
            Order.countDocuments({ shop: shopId }),
            Order.find({ shop: shopId })
                .populate('cashierId', 'name email')
                .sort({ createdAt: -1 })
            // Note: If you add pagination later, you can chain .skip() and .limit() to Order.find() here
        ]);

        return res.status(200).json({
            success: true,
            count: totalCount, // Total number of orders in DB
            orders
        });

    } catch (error) {
        console.error("Error fetching shop orders:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching orders.",
            error: error.message
        });
    }
};