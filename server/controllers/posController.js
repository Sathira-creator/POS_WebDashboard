import Inventory from "../models/Inventory.js";

// get cart data by barcode: /api/pos/list
export const getCartByBarcode = async (req, res) => {
    try {
        const { barCord } = req.query;

        if (!barCord) {
            return res.status(400).json({ 
                success: false, 
                message: "Barcode query parameter is required." 
            });
        }

        const product = await Inventory.findOne({ 
            barcode: barCord.trim() 
        });

        // 4. Handle Case: Product not found in database
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: `Product with barcode "${barCord}" not found in inventory.` 
            });
        }

        // 5. Handle Case: Product is out of stock
        if (product.qty <= 0) {
            return res.status(400).json({
                success: false,
                message: `"${product.name}" is out of stock! Cannot add to cart.`,
            });
        }

        // Success: Return the item payload
        return res.status(200).json({
            success: true,
            message: "Product found successfully.",
            product: {
                id: product._id,
                item: product.name,
                price: product.price,
            }
        });
    }catch (error) {
        res.json({ success: false, message: error.message });

    }
}