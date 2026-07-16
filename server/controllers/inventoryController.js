import Inventory from "../models/Inventory.js";

//add inventory: /api/inventory/add
export const addInventory = async (req, res)=>{
    try {
        const { name, category, type, barcode, price, qty, supplier } = req.body;

        //Check if the barcode already exists in the system
        const existingItem = await Inventory.findOne({ barcode });
        if (existingItem) {
            existingItem.qty += Number(qty);

            await existingItem.save();

            return res.json({ 
                success: true, 
                message: `Stock updated! Added ${qty} units to ${existingItem.name}`,
                product: existingItem 
            });
        }

        if (!name || !category || !type || !barcode || price === undefined || qty === undefined || !supplier) {
            return res.json({success: false, message: "Missing Details"})
        }

        const inventory = await Inventory.create({name, category, type, barcode, price, qty, supplier})

        return res.json({success: true,  message: "product added", product: inventory})
            
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}



// get inventory: /api/inventory/list
export const getInventory = async (req, res)=>{
    try{
        const currentPage = Math.max(1, Number(req.query.page) || 1);
        const itemsPerPage = 10;
        const type = req.query.type;

        const itemsToSkip = (currentPage - 1) * itemsPerPage;

        let filterQuery = {};

        if (type === "inStock") {
            // qty > 3
            filterQuery = { qty: { $gt: 3 } };
        } else if (type === "lowStock") {
            // 0 < qty <= 3 (Greater than 0, but less than or equal to 3)
            filterQuery = { qty: { $gt: 0, $lte: 3 } };
        } else if (type === "outStock") {
            // qty = 0
            filterQuery = { qty: 0 };
        } else if (type === "all") {
            filterQuery = {}; // No filter, get all items
        }

        const [inventory, totalItems] = await Promise.all([
            Inventory.find(filterQuery)
                .skip(itemsToSkip)
                .limit(itemsPerPage)
                .lean(),
            
            Inventory.countDocuments(filterQuery) // for total count
        ]);

        const stockCounts = await Inventory.aggregate([
            {
                $facet: {
                    inStock: [
                        { $match: { qty: { $gt: 3 } } },
                        { $count: "count" }
                    ],
                    lowStock: [
                        { $match: { qty: { $gt: 0, $lte: 3 } } },
                        { $count: "count" }
                    ],
                    outStock: [
                        { $match: { qty: { $eq: 0 } } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const counts = stockCounts[0];
        const inStockCount = counts.inStock[0]?.count || 0;
        const lowStockCount = counts.lowStock[0]?.count || 0;
        const outStockCount = counts.outStock[0]?.count || 0;
        
        return res.json({
            success: true,
            inventory,
            totalPages: Math.ceil(totalItems / itemsPerPage),
            totalItems,
            summary: {
                inStock: inStockCount,
                lowStock: lowStockCount,
                outStock: outStockCount
            }
        });

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// update inventory: /api/inventory/update
export const updateInventory = async (req, res)=>{
    try{
        const { name, category, type, barcode, price, qty, supplier } = req.body;
        if (!barcode) {
            return res.status(400).json({ success: false, message: "Barcode is required to perform an update" });
        }
        const existingItem = await Inventory.findOne({ barcode });
        if (existingItem) {
            existingItem.qty = Number(qty);
            existingItem.name = name;
            existingItem.category = category;
            existingItem.type = type;
            existingItem.price = price;
            existingItem.supplier = supplier ;

            await existingItem.save();

            return res.json({ 
                success: true, 
                message: `Stock updated`,
                product: existingItem 
            });
        }else{
            return res.status(404).json({ 
                success: false, 
                message: `No item found matching` 
            });
        }

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// delete inventory: /api/inventory/delete
export const deleteInventory = async (req, res)=>{
    try {
        const selectedId = req.query.selectedId;

        // 1. Validate that an ID was actually provided
        if (!selectedId) {
            return res.json({ 
                success: false, 
                message: "Product ID is required for deletion." 
            });
        }

        // 2. Find and delete the item in one operation
        const deletedItem = await Inventory.findByIdAndDelete(selectedId);

        // 3. Check if the item existed in the database
        if (!deletedItem) {
            return res.json({ 
                success: false, 
                message: "Product not found or already deleted." 
            });
        }

        // 4. Return success response
        return res.json({
            success: true,
            message: `"${deletedItem.name}" has been successfully deleted.`
        });

        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// search inventory: /api/inventory/search
export const searchInventory = async (req, res)=>{
    try{
        const { name, category, type, barcode, supplier, price, qty, page } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const itemsPerPage = 10;
        const itemsToSkip = (currentPage - 1) * itemsPerPage;

        let searchQuery = {};

        // Case-insensitive partial matching for text fields using Regex
        if (name) searchQuery.name = { $regex: name, $options: "i" };
        if (category) searchQuery.category = { $regex: category, $options: "i" };
        if (type) searchQuery.type = { $regex: type, $options: "i" };
        if (supplier) searchQuery.supplier = { $regex: supplier, $options: "i" };
        if (barcode) searchQuery.barcode = { $regex: barcode, $options: "i" };

        // Exact matching for numeric values (only if they are provided)
        if (price) searchQuery.price = Number(price);
        if (qty) searchQuery.qty = Number(qty);

        // 2. Fetch the matched items and the total match count in parallel
        const [results, totalMatches] = await Promise.all([
            Inventory.find(searchQuery)
                .skip(itemsToSkip)
                .limit(itemsPerPage)
                .lean(),
            Inventory.countDocuments(searchQuery)
        ]);

        // 3. Send back responses consistent with your client architecture
        return res.json({
            success: true,
            results,
            totalPages: Math.ceil(totalMatches / itemsPerPage),
            totalItems: totalMatches
        });

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


