import Inventory from '../models/Inventory.js';
import Cart from '../models/Cart.js';


export const getProductByBarcode = async (req, res) => {
    try {
        const { barCord } = req.query;
        const shop = req.shopId || req.shop?._id || req.headers['x-shop-id'];

        if (!shop || !barCord) {
            return res.status(400).json({ success: false, message: "Shop ID or barcode missing." });
        }

        const product = await Inventory.findOne({ barcode: barCord.trim(), shop });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.status(200).json({
            success: true,
            product: {
                id: product._id,
                item: product.name,
                price: product.price,
                barcode: product.barcode,
                qty: product.qty
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Get product by barcode and add/update it in the employee's cart: /api/pos/list
export const getCartByBarcode = async (req, res) => {
    try {
        const { barCord } = req.query;

        // Retrieve shop ID and map to 'shop' (matching your Cart schema)
        const shop = req.shopId || req.shop?._id || req.headers['x-shop-id'];
        
        // Retrieve cashier/employee ID and map to 'cashierId' (matching your Cart schema)
        const cashierId = req.user?._id || req.user?.id || req.userId;

        if (!shop) {
            return res.status(400).json({
                success: false,
                message: "Shop ID is missing. Please select an active shop."
            });
        }

        if (!cashierId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Employee session not found in cookie."
            });
        }

        if (!barCord) {
            return res.status(400).json({ 
                success: false, 
                message: "Barcode query parameter is required." 
            });
        }

        // 1. Find product in inventory filtered by barcode and shop
        const product = await Inventory.findOne({ 
            barcode: barCord.trim(),
            shop: shop 
        });

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: `Product with barcode "${barCord}" not found in this shop.` 
            });
        }

        // 2. Check stock availability
        if (product.qty <= 0) {
            return res.status(400).json({
                success: false,
                message: `"${product.name}" is out of stock! Cannot add to cart.`,
            });
        }

        // 3. Find or create the Cart model using 'shop' and 'cashierId'
        let cart = await Cart.findOne({ shop, cashierId });

        if (!cart) {
            cart = new Cart({
                shop,
                cashierId,
                items: []
            });
        }

        // 4. Check if the product already exists in the cart items list
        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === product._id.toString()
        );

        const quantityToAdd = 1;

        if (itemIndex > -1) {
            // If item exists, check if adding more exceeds available inventory quantity
            if (cart.items[itemIndex].quantity + quantityToAdd > product.qty) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Only ${product.qty} items left in stock.`
                });
            }
            cart.items[itemIndex].quantity += quantityToAdd;
            // Optionally update unit price in case it changed
            cart.items[itemIndex].unitPrice = product.price;
        } else {
            // If item doesn't exist, push a new cart item entry
            cart.items.push({
                productId: product._id,
                itemName: product.name,
                unitPrice: product.price,
                quantity: quantityToAdd,
                discountPercentage: 0
            });
        }

        await cart.save();

        // Populate product references before sending back to client
        await cart.populate({
            path: 'items.productId',
            select: 'name price barcode category type qty'
        });

        // 5. Broadcast real-time update via Socket.io to this employee's cart room
        const io = req.app.get('io');
        if (io) {
            const roomName = `cart_${shop}_${cashierId}`;
            io.to(roomName).emit('cart_updated', cart);
        }

        // 6. Success: Return updated cart data to the frontend
        return res.status(200).json({
            success: true,
            message: `"${product.name}" added to cart successfully.`,
            product: {
                id: product._id,
                item: product.name,
                price: product.price,
            },
            cart
        });

    } catch (error) {
        console.error("Error in getCartByBarcode:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Get current employee cart: /api/pos/current
export const getCart = async (req, res) => {
    try {
        const shop = req.shopId || req.shop?._id || req.headers['x-shop-id'];
        const cashierId = req.user?._id || req.user?.id || req.userId;

        if (!shop || !cashierId) {
            return res.status(400).json({ success: false, message: "Shop or User session missing." });
        }

        let cart = await Cart.findOne({ shop, cashierId }).populate({
            path: 'items.productId',
            select: 'name price barcode category type qty'
        });

        if (!cart) {
            cart = { shop, cashierId, items: [] };
        }

        return res.status(200).json({ success: true, cart });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Remove an item or decrease quantity from the cart: /api/pos/remove
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const shop = req.shopId || req.shop?._id || req.headers['x-shop-id'];
        const cashierId = req.user?._id || req.user?.id || req.userId;

        if (!shop || !cashierId || !productId) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        let cart = await Cart.findOne({ shop, cashierId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        // Filter out the item to remove it completely
        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== productId.toString()
        );

        await cart.save();

        // Populate product references
        await cart.populate({
            path: 'items.productId',
            select: 'name price barcode category type qty'
        });

        // Broadcast real-time update via Socket.io
        const io = req.app.get('io');
        if (io) {
            const roomName = `cart_${shop}_${cashierId}`;
            io.to(roomName).emit('cart_updated', cart);
        }

        return res.status(200).json({
            success: true,
            message: "Item removed from cart.",
            cart
        });

    } catch (error) {
        console.error("Error in removeFromCart:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};