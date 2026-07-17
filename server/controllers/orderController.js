import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';


//createOrder : /api/order/create
export const createOrder = async (req, res) => {
  try {
    const cashierId = req.userId;
    const { 
      items, 
      subtotal, 
      totalDiscount, 
      netTotal, 
      paymentMethod, 
      cashReceived, 
      changeGiven 
    } = req.body;

    // 1. Basic Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    if (!cashierId || !netTotal || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Missing required checkout fields." });
    }

    // 2. Inventory Check & Stock Deduction
    // Loop through each item in the cart to verify and deduct stock levels
    for (const item of items) {
      const product = await Inventory.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product matching ID ${item.productId} was not found in inventory.` 
        });
      }

      if (product.qty < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.qty}, Requested: ${item.quantity}` 
        });
      }

      // Deduct the inventory quantity
      product.qty -= item.quantity;
      await product.save();
    }

    // 3. Auto-Generate a Human-Readable Order Invoice Number
    // Example format: INV-20260718-X9R2 (Uses current year/date layout safely)
    const dateStamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `INV-${dateStamp}-${randomSuffix}`;

    // 4. Create and Save the New Order Document
    const newOrder = new Order({
      orderNumber,
      cashierId,
      items,
      subtotal,
      totalDiscount,
      netTotal,
      paymentMethod,
      cashReceived,
      changeGiven,
      paymentStatus: 'paid' // Defaults to paid upon successful POS transaction
    });

    await newOrder.save();

    // 5. Update Cashier KPI Sales Stats
    // Dynamically increment total lifetime accumulated dollar metrics for the logged-in staff
    await User.findByIdAndUpdate(cashierId, {
      $inc: { sales: netTotal }
    });

    // 6. Return Success Response to React Frontend
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