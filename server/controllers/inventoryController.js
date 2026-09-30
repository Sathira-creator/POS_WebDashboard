import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";

// Add inventory: /api/inventory/add
export const addInventory = async (req, res) => {
    try {
        const shopId = req.shopId;
        const { name, category, type, barcode, price, qty, supplier } = req.body;

        if (!name || !category || !type || !barcode || price === undefined || qty === undefined || !supplier) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Check if the barcode already exists SPECIFICALLY within this shop
        const existingItem = await Inventory.findOne({ barcode, shopId });
        if (existingItem) {
            existingItem.qty += Number(qty);
            await existingItem.save();

            return res.json({ 
                success: true, 
                message: `Stock updated! Added ${qty} units to ${existingItem.name}`,
                product: existingItem 
            });
        }

        // Create new inventory item tied to this shop
        const inventory = await Inventory.create({
            name, 
            category, 
            type, 
            barcode, 
            price, 
            qty, 
            supplier, 
            shop: shopId
        });

        return res.json({ success: true, message: "Product added", product: inventory });
            
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get inventory: /api/inventory/list
export const getInventory = async (req, res) => {
    try {
        const shopId = req.shopId;
        const currentPage = Math.max(1, Number(req.query.page) || 1);
        const itemsPerPage = 10;
        const type = req.query.type;
        const itemsToSkip = (currentPage - 1) * itemsPerPage;

        // Base filter MUST always include the shopId
        let filterQuery = { shop: shopId };

        if (type === "inStock") {
            filterQuery.qty = { $gt: 3 };
        } else if (type === "lowStock") {
            filterQuery.qty = { $gt: 0,$lte: 3 };
        } else if (type === "outStock") {
            filterQuery.qty = 0;
        }

        const [inventory, totalItems] = await Promise.all([
            Inventory.find(filterQuery)
                .skip(itemsToSkip)
                .limit(itemsPerPage)
                .lean(),
            Inventory.countDocuments(filterQuery)
        ]);

        const stockCounts = await Inventory.aggregate([
            { $match: { shop: new mongoose.Types.ObjectId(shopId) } }, // Restrict aggregation strictly to this shop
            {
                $facet: {
                    inStock: [
                        { $match: { qty: { $gt: 3 } } },                         
                        {$count: "count" }
                    ],
                    lowStock: [
                        { $match: { qty: {$gt: 0, $lte: 3 } } },                         
                        {$count: "count" }
                    ],
                    outStock: [
                        { $match: { qty: { $eq: 0 } } },                         
                        {$count: "count" }
                    ]
                }
            }
        ]);

        const counts = stockCounts[0] || {};
        const inStockCount = counts.inStock?.[0]?.count || 0;
        const lowStockCount = counts.lowStock?.[0]?.count || 0;
        const outStockCount = counts.outStock?.[0]?.count || 0;
        
        return res.json({
            success: true,
            inventory,
            totalPages: Math.ceil(totalItems / itemsPerPage) || 1,
            totalItems,
            summary: {
                inStock: inStockCount,
                lowStock: lowStockCount,
                outStock: outStockCount
            }
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update inventory: /api/inventory/update
export const updateInventory = async (req, res) => {
    try {
        const shopId = req.shopId;
        const { name, category, type, barcode, price, qty, supplier } = req.body;
        
        if (!barcode) {
            return res.status(400).json({ success: false, message: "Barcode is required to perform an update" });
        }

        // Ensure we only find and update items belonging to this shop
        const existingItem = await Inventory.findOne({ barcode, shop: shopId });
        
        if (existingItem) {
            existingItem.qty = Number(qty);
            existingItem.name = name;
            existingItem.category = category;
            existingItem.type = type;
            existingItem.price = price;
            existingItem.supplier = supplier;

            await existingItem.save();

            return res.json({ 
                success: true, 
                message: "Stock updated",
                product: existingItem 
            });
        } else {
            return res.status(404).json({ 
                success: false, 
                message: "No item found matching this barcode in your shop" 
            });
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete inventory: /api/inventory/delete
export const deleteInventory = async (req, res) => {
    try {
        const shopId = req.shopId;
        const selectedId = req.query.selectedId;

        if (!selectedId) {
            return res.json({ success: false, message: "Product ID is required for deletion." });
        }

        // SAFE DELETE: Ensures users cannot delete items from other shops
        const deletedItem = await Inventory.findOneAndDelete({ _id: selectedId, shop: shopId });

        if (!deletedItem) {
            return res.json({ success: false, message: "Product not found or unauthorized." });
        }

        return res.json({
            success: true,
            message: `"${deletedItem.name}" has been successfully deleted.`
        });
        
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Search inventory: /api/inventory/search
export const searchInventory = async (req, res) => {
    try {
        const shopId = req.shopId;
        const { name, category, type, barcode, supplier, price, qty, page } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const itemsPerPage = 10;
        const itemsToSkip = (currentPage - 1) * itemsPerPage;

        // Search query MUST always be scoped to the shopId
        let searchQuery = { shop: shopId };

        if (name) searchQuery.name = { $regex: name,$options: "i" };
        if (category) searchQuery.category = { $regex: category,$options: "i" };
        if (type) searchQuery.type = { $regex: type,$options: "i" };
        if (supplier) searchQuery.supplier = { $regex: supplier,$options: "i" };
        if (barcode) searchQuery.barcode = { $regex: barcode,$options: "i" };

        if (price) searchQuery.price = Number(price);
        if (qty) searchQuery.qty = Number(qty);

        const [results, totalMatches] = await Promise.all([
            Inventory.find(searchQuery)
                .skip(itemsToSkip)
                .limit(itemsPerPage)
                .lean(),
            Inventory.countDocuments(searchQuery)
        ]);

        return res.json({
            success: true,
            results,
            totalPages: Math.ceil(totalMatches / itemsPerPage) || 1,
            totalItems: totalMatches
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};