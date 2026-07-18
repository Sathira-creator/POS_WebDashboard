import mongoose from "mongoose";
import Order from "../models/Order.js"; // Adjust this relative path to your actual model

// Your mock inventory dataset array
const realMockProducts = [
  { name: "Coca-Cola Classic 500ml", category: "Beverages", type: "Soda", barcode: "880101", price: 1.50, qty: 45, supplier: "Global Beverages Ltd" },
  { name: "Diet Coke 500ml", category: "Beverages", type: "Soda", barcode: "880102", price: 1.50, qty: 30, supplier: "Global Beverages Ltd" },
  { name: "Sprite Lemon-Lime 500ml", category: "Beverages", type: "Soda", barcode: "880103", price: 1.45, qty: 25, supplier: "Global Beverages Ltd" },
  { name: "Fanta Orange 500ml", category: "Beverages", type: "Soda", barcode: "880104", price: 1.45, qty: 20, supplier: "Global Beverages Ltd" },
  { name: "Pepsi Cola 500ml", category: "Beverages", type: "Soda", barcode: "880105", price: 1.40, qty: 40, supplier: "Apex Distributors" },
  { name: "7UP Lemon-Lime 500ml", category: "Beverages", type: "Soda", barcode: "880106", price: 1.40, qty: 15, supplier: "Apex Distributors" },
  { name: "Red Bull Energy Drink 250ml", category: "Beverages", type: "Energy Drink", barcode: "880107", price: 2.80, qty: 50, supplier: "Apex Distributors" },
  { name: "Monster Energy Original 500ml", category: "Beverages", type: "Energy Drink", barcode: "880108", price: 3.20, qty: 35, supplier: "Apex Distributors" },
  { name: "Lipton Ice Tea Lemon 500ml", category: "Beverages", type: "Ice Tea", barcode: "880109", price: 1.85, qty: 22, supplier: "Global Beverages Ltd" },
  { name: "Nescafe Blend 43 Instant Coffee 150g", category: "Beverages", type: "Coffee", barcode: "880110", price: 6.50, qty: 18, supplier: "Nestle Wholesalers" },
  { name: "Heineken Lager Premium Beer 6-Pack", category: "Beverages", type: "Alcohol", barcode: "880111", price: 12.50, qty: 12, supplier: "Metro Liquors" },
  { name: "Corona Extra Beer 6-Pack", category: "Beverages", type: "Alcohol", barcode: "880112", price: 13.99, qty: 10, supplier: "Metro Liquors" },
  { name: "Tropicana Orange Juice 1L", category: "Beverages", type: "Juice", barcode: "880113", price: 3.40, qty: 14, supplier: "FreshCo Logistics" },
  { name: "Ocean Spray Cranberry Juice 1L", category: "Beverages", type: "Juice", barcode: "880114", price: 3.80, qty: 16, supplier: "FreshCo Logistics" },
  { name: "Evian Natural Mineral Water 1L", category: "Beverages", type: "Water", barcode: "880115", price: 1.95, qty: 60, supplier: "Global Beverages Ltd" },
  { name: "San Pellegrino Sparkling Water 750ml", category: "Beverages", type: "Water", barcode: "880116", price: 2.50, qty: 28, supplier: "Global Beverages Ltd" },
  { name: "Pringles Sour Cream & Onion 134g", category: "Snacks", type: "Chips", barcode: "880117", price: 2.30, qty: 40, supplier: "Apex Distributors" },
  { name: "Lay's Classic Salted Potato Chips 170g", category: "Snacks", type: "Chips", barcode: "880118", price: 2.99, qty: 35, supplier: "Apex Distributors" },
  { name: "Doritos Nacho Cheese 170g", category: "Snacks", type: "Chips", barcode: "880119", price: 3.20, qty: 30, supplier: "Apex Distributors" },
  { name: "Cheetos Crunchy Cheese Snacks 150g", category: "Snacks", type: "Chips", barcode: "880120", price: 2.80, qty: 25, supplier: "Apex Distributors" },
  { name: "Cadbury Dairy Milk Chocolate 180g", category: "Snacks", type: "Chocolate", barcode: "880121", price: 4.50, qty: 24, supplier: "Nestle Wholesalers" },
  { name: "Snickers Chocolate Bar 50g", category: "Snacks", type: "Chocolate", barcode: "880122", price: 1.20, qty: 80, supplier: "Nestle Wholesalers" },
  { name: "KitKat 4-Finger Chocolate Bar 45g", category: "Snacks", type: "Chocolate", barcode: "880123", price: 1.25, qty: 75, supplier: "Nestle Wholesalers" },
  { name: "M&M's Peanut Chocolate Bag 180g", category: "Snacks", type: "Confectionery", barcode: "880124", price: 3.99, qty: 30, supplier: "Nestle Wholesalers" },
  { name: "Haribo Goldbears Gummy Candy 175g", category: "Snacks", type: "Confectionery", barcode: "880125", price: 2.10, qty: 40, supplier: "Apex Distributors" },
  { name: "Oreo Original Cookies 133g", category: "Snacks", type: "Biscuits", barcode: "880126", price: 1.60, qty: 50, supplier: "Apex Distributors" },
  { name: "McVitie's Digestive Biscuits 400g", category: "Snacks", type: "Biscuits", barcode: "880127", price: 2.50, qty: 20, supplier: "FreshCo Logistics" },
  { name: "Ritz Crackers Original 300g", category: "Snacks", type: "Biscuits", barcode: "880128", price: 3.10, qty: 18, supplier: "Apex Distributors" },
  { name: "Kellogg's Corn Flakes 380g", category: "Groceries", type: "Cereal", barcode: "880129", price: 4.20, qty: 15, supplier: "FreshCo Logistics" },
  { name: "San Remo Spaghetti Pasta No.5 500g", category: "Groceries", type: "Pasta", barcode: "880130", price: 1.80, qty: 45, supplier: "FreshCo Logistics" },
  { name: "Barilla Penne Rigate Pasta 500g", category: "Groceries", type: "Pasta", barcode: "880131", price: 2.10, qty: 40, supplier: "FreshCo Logistics" },
  { name: "Dolmio Tomato Pasta Sauce 500g", category: "Groceries", type: "Sauce", barcode: "880132", price: 3.25, qty: 22, supplier: "FreshCo Logistics" },
  { name: "Heinz Tomato Ketchup 500ml", category: "Groceries", type: "Sauce", barcode: "880133", price: 2.95, qty: 35, supplier: "Apex Distributors" },
  { name: "Hellmann's Real Mayonnaise 400g", category: "Groceries", type: "Sauce", barcode: "880134", price: 3.80, qty: 20, supplier: "Apex Distributors" },
  { name: "Nutella Hazelnut Spread 400g", category: "Groceries", type: "Spread", barcode: "880135", price: 5.20, qty: 16, supplier: "Nestle Wholesalers" },
  { name: "Vegemite Spread Yeast Extract 220g", category: "Groceries", type: "Spread", barcode: "880136", price: 4.10, qty: 12, supplier: "FreshCo Logistics" },
  { name: "Skippy Creamy Peanut Butter 462g", category: "Groceries", type: "Spread", barcode: "880137", price: 4.60, qty: 18, supplier: "Apex Distributors" },
  { name: "Twinings English Breakfast Tea 50 Pack", category: "Beverages", type: "Tea", barcode: "880138", price: 5.50, qty: 25, supplier: "Global Beverages Ltd" },
  { name: "Full Cream Fresh Milk 1L", category: "Dairy", type: "Milk", barcode: "880139", price: 2.10, qty: 24, supplier: "Dairy Land Co" },
  { name: "Skim Pure Milk 1L", category: "Dairy", type: "Milk", barcode: "880140", price: 2.15, qty: 15, supplier: "Dairy Land Co" },
  { name: "Bega Cheese Block Cheddar 500g", category: "Dairy", type: "Cheese", barcode: "880141", price: 7.20, qty: 14, supplier: "Dairy Land Co" },
  { name: "Kraft Singles Cheese 24 Slices", category: "Dairy", type: "Cheese", barcode: "880142", price: 5.50, qty: 20, supplier: "Dairy Land Co" },
  { name: "Philadelphia Cream Cheese 250g", category: "Dairy", type: "Cheese", barcode: "880143", price: 3.90, qty: 18, supplier: "Dairy Land Co" },
  { name: "Chobani Greek Yogurt Plain 907g", category: "Dairy", type: "Yogurt", barcode: "880144", price: 6.80, qty: 10, supplier: "Dairy Land Co" },
  { name: "Yoplait Strawberry Yogurt 4-Pack", category: "Dairy", type: "Yogurt", barcode: "880145", price: 4.20, qty: 12, supplier: "Dairy Land Co" },
  { name: "Western Star Butter Salted 250g", category: "Dairy", type: "Butter", barcode: "880146", price: 3.60, qty: 30, supplier: "Dairy Land Co" },
  { name: "Flora Margarine Spread 500g", category: "Dairy", type: "Butter", barcode: "880147", price: 4.10, qty: 22, supplier: "Dairy Land Co" },
  { name: "Wonder White Bread Sliced 700g", category: "Bakery", type: "Bread", barcode: "880148", price: 3.40, qty: 15, supplier: "Sun-Rise Bakery" },
  { name: "Tip Top The One Wholemeal Bread 700g", category: "Bakery", type: "Bread", barcode: "880149", price: 3.50, qty: 10, supplier: "Sun-Rise Bakery" },
  { name: "Mission Tortillas Large 6-Pack", category: "Bakery", type: "Bread", barcode: "880150", price: 4.20, qty: 16, supplier: "Sun-Rise Bakery" },
  { name: "White Croissants Multi-Pack 4pc", category: "Bakery", type: "Pastry", barcode: "880151", price: 4.80, qty: 8, supplier: "Sun-Rise Bakery" },
  { name: "Colgate Total Toothpaste 115g", category: "Personal Care", type: "Hygiene", barcode: "880152", price: 4.50, qty: 35, supplier: "MediHealth Pharma" },
  { name: "Oral-B Indicator Toothbrush Medium", category: "Personal Care", type: "Hygiene", barcode: "880153", price: 3.20, qty: 40, supplier: "MediHealth Pharma" },
  { name: "Listerine Cool Mint Mouthwash 500ml", category: "Personal Care", type: "Hygiene", barcode: "880154", price: 6.20, qty: 20, supplier: "MediHealth Pharma" },
  { name: "Dettol Liquid Handwash Refill 500ml", category: "Personal Care", type: "Hygiene", barcode: "880155", price: 5.10, qty: 25, supplier: "MediHealth Pharma" },
  { name: "Dove Beauty Cream Bar Soap 4x100g", category: "Personal Care", type: "Hygiene", barcode: "880156", price: 5.50, qty: 28, supplier: "Unilever Direct" },
  { name: "Palmolive Naturals Shower Gel 500ml", category: "Personal Care", type: "Hygiene", barcode: "880157", price: 4.95, qty: 22, supplier: "MediHealth Pharma" },
  { name: "Head & Shoulders Shampoo 400ml", category: "Personal Care", type: "Haircare", barcode: "880158", price: 8.50, qty: 15, supplier: "Unilever Direct" },
  { name: "Pantene Pro-V Conditioner 400ml", category: "Personal Care", type: "Haircare", barcode: "880159", price: 7.99, qty: 18, supplier: "Unilever Direct" },
  { name: "Gillette Mach 3 Razor Blades 4-Pack", category: "Personal Care", type: "Grooming", barcode: "880160", price: 14.50, qty: 12, supplier: "MediHealth Pharma" },
  { name: "Nivea Smooth Body Lotion 400ml", category: "Personal Care", type: "Skincare", barcode: "880161", price: 6.80, qty: 14, supplier: "Unilever Direct" },
  { name: "Rexona Men Deodorant Spray 250ml", category: "Personal Care", type: "Grooming", barcode: "880162", price: 5.20, qty: 30, supplier: "Unilever Direct" },
  { name: "Panadol Rapid Paracetamol 20 Tablets", category: "Personal Care", type: "Pharmacy", barcode: "880163", price: 4.95, qty: 50, supplier: "MediHealth Pharma" },
  { name: "Band-Aid Plastic Strips 50-Pack", category: "Personal Care", type: "Pharmacy", barcode: "880164", price: 3.50, qty: 40, supplier: "MediHealth Pharma" },
  { name: "Huggies Ultra Dry Nappies Size 4 44pc", category: "Baby Care", type: "Diapers", barcode: "880165", price: 18.99, qty: 8, supplier: "MediHealth Pharma" },
  { name: "Johnson's Baby Wipes Fragrance Free 80pc", category: "Baby Care", type: "Wipes", barcode: "880166", price: 3.80, qty: 25, supplier: "Unilever Direct" },
  { name: "Kleenex Facial Tissues 2-Ply 200 Pack", category: "Cleaning", type: "Paper", barcode: "880167", price: 2.70, qty: 35, supplier: "CleanPro Logistics" },
  { name: "Quilton Toilet Tissue 3-Ply 12 Roll", category: "Cleaning", type: "Paper", barcode: "880168", price: 7.50, qty: 24, supplier: "CleanPro Logistics" },
  { name: "Sorbent Paper Towels 4-Pack", category: "Cleaning", type: "Paper", barcode: "880169", price: 4.20, qty: 20, supplier: "CleanPro Logistics" },
  { name: "Fairy Original Dishwashing Liquid 800ml", category: "Cleaning", type: "Detergent", barcode: "880170", price: 5.50, qty: 22, supplier: "CleanPro Logistics" },
  { name: "Finish Powerball Dishwasher Tabs 30-Pack", category: "Cleaning", type: "Detergent", barcode: "880171", price: 14.90, qty: 15, supplier: "CleanPro Logistics" },
  { name: "Omo Laundry Detergent Powder 2kg", category: "Cleaning", type: "Detergent", barcode: "880172", price: 16.50, qty: 12, supplier: "Unilever Direct" },
  { name: "Dynamo Liquid Laundry Detergent 2L", category: "Cleaning", type: "Detergent", barcode: "880173", price: 17.20, qty: 10, supplier: "CleanPro Logistics" },
  { name: "Comfort Fabric Softener 1L", category: "Cleaning", type: "Detergent", barcode: "880174", price: 5.99, qty: 16, supplier: "Unilever Direct" },
  { name: "Dettol Disinfectant Surface Spray 450g", category: "Cleaning", type: "Cleaner", barcode: "880175", price: 6.50, qty: 25, supplier: "MediHealth Pharma" },
  { name: "Windex Glass Cleaner Spray 500ml", category: "Cleaning", type: "Cleaner", barcode: "880176", price: 4.10, qty: 20, supplier: "CleanPro Logistics" },
  { name: "Harpic Liquid Toilet Cleaner 700ml", category: "Cleaning", type: "Cleaner", barcode: "880177", price: 4.50, qty: 18, supplier: "CleanPro Logistics" },
  { name: "Glad Garbage Bags Medium 50-Pack", category: "Cleaning", type: "Bags", barcode: "880178", price: 5.20, qty: 30, supplier: "CleanPro Logistics" },
  { name: "Pedigree Dry Dog Food Beef 2.5kg", category: "Pet Care", type: "Dog Food", barcode: "880179", price: 11.50, qty: 10, supplier: "Apex Distributors" },
  { name: "Whiskas Wet Cat Food Pouches 12-Pack", category: "Pet Care", type: "Cat Food", barcode: "880180", price: 9.80, qty: 14, supplier: "Apex Distributors" },
  { name: "Friskies Seafood Sensations Cat Food 1.5kg", category: "Pet Care", type: "Cat Food", barcode: "880181", price: 7.99, qty: 12, supplier: "Nestle Wholesalers" },
  { name: "BIC Cristal Ballpoint Pens Black 10pc", category: "Stationery", type: "Office", barcode: "880182", price: 2.50, qty: 40, supplier: "WriteWell Supplies" },
  { name: "Staedtler Tradition 2B Pencils 3-Pack", category: "Stationery", type: "Office", barcode: "880183", price: 1.95, qty: 35, supplier: "WriteWell Supplies" },
  { name: "Reflex A4 Copy Paper Copy 500 Sheets", category: "Stationery", type: "Office", barcode: "880184", price: 6.90, qty: 50, supplier: "WriteWell Supplies" },
  { name: "Post-it Notes Canary Yellow 3x3", category: "Stationery", type: "Office", barcode: "880185", price: 2.20, qty: 45, supplier: "WriteWell Supplies" },
  { name: "Scotch Magic Tape with Dispenser", category: "Stationery", type: "Office", barcode: "880186", price: 3.10, qty: 30, supplier: "WriteWell Supplies" },
  { name: "Duracell AA Alkaline Batteries 10-Pack", category: "Hardware", type: "Battery", barcode: "880187", price: 11.99, qty: 25, supplier: "CleanPro Logistics" },
  { name: "Energizer AAA Batteries 10-Pack", category: "Hardware", type: "Battery", barcode: "880188", price: 11.50, qty: 20, supplier: "CleanPro Logistics" },
  { name: "Philips LED Light Bulb E27 Warm White", category: "Hardware", type: "Lighting", barcode: "880189", price: 4.50, qty: 30, supplier: "CleanPro Logistics" },
  { name: "WD-40 Multi-Use Lubricant Spray 150g", category: "Hardware", type: "Utility", barcode: "880190", price: 6.20, qty: 15, supplier: "CleanPro Logistics" },
  { name: "Heinz Baked Beans in Tomato Sauce 420g", category: "Groceries", type: "Canned", barcode: "880191", price: 2.10, qty: 40, supplier: "Apex Distributors" },
  { name: "John West Tuna Chunks in Brine 95g", category: "Groceries", type: "Canned", barcode: "880192", price: 1.90, qty: 60, supplier: "FreshCo Logistics" },
  { name: "Spam Regular Luncheon Meat 340g", category: "Groceries", type: "Canned", barcode: "880193", price: 4.80, qty: 18, supplier: "Apex Distributors" },
  { name: "Campbell's Condensed Tomato Soup 400g", category: "Groceries", type: "Canned", barcode: "880194", price: 2.30, qty: 25, supplier: "FreshCo Logistics" },
  { name: "McCain Superfries Straight Cut 1kg", category: "Groceries", type: "Frozen", barcode: "880195", price: 4.99, qty: 12, supplier: "FreshCo Logistics" },
  { name: "Streets Blue Ribbon Vanilla Ice Cream 2L", category: "Dairy", type: "Frozen", barcode: "880196", price: 6.50, qty: 10, supplier: "Unilever Direct" },
  { name: "Birds Eye Frozen Garden Peas 500g", category: "Groceries", type: "Frozen", barcode: "880197", price: 2.80, qty: 20, supplier: "FreshCo Logistics" },
  { name: "CSR Pure White Sugar 1kg", category: "Groceries", type: "Baking", barcode: "880198", price: 1.95, qty: 35, supplier: "FreshCo Logistics" },
  { name: "White Wings Plain Flour 1kg", category: "Groceries", type: "Baking", barcode: "880199", price: 2.40, qty: 30, supplier: "FreshCo Logistics" },
  { name: "Bertolli Extra Virgin Olive Oil 500ml", category: "Groceries", type: "Oil", barcode: "880200", price: 8.90, qty: 16, supplier: "FreshCo Logistics" }
];

// Helper to generate a random uppercase alphanumeric invoice string suffix
const generateRandomString = (length = 4) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const MONGODB_URI = "mongodb+srv://pos:pos123@cluster0.wcb4mh4.mongodb.net"; // Update with your actual DB string

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    
    console.log("Cleaning old order histories...");
    await Order.deleteMany({});

    const batchOrders = [];
    const dummyCashierId = new mongoose.Types.ObjectId(); // Standard placeholder ObjectId
    
    // Set parameters: seed historical records for the last 365 days
    const totalDays = 365;
    const today = new Date();

    console.log(`Generating orders over a ${totalDays}-day dynamic matrix...`);

    for (let d = totalDays; d >= 0; d--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - d);

      // Simulating realistic retail pacing: 4 to 12 orders per business day window
      const ordersPerDay = Math.floor(Math.random() * 9) + 4;

      for (let o = 0; o < ordersPerDay; o++) {
        // Construct transaction date string format for invoice formatting: YYYYMMDD
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, "0");
        const dateStr = String(targetDate.getDate()).padStart(2, "0");
        const orderNumber = `INV-${year}${month}${dateStr}-${generateRandomString(4)}`;

        // Randomize transaction timestamp across the day (distributing operating hours)
        const orderTimestamp = new Date(targetDate);
        orderTimestamp.setHours(
          Math.floor(Math.random() * 14) + 8, // Between 08:00 AM and 10:00 PM
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        );

        // Determine unique items count in the checkout basket (1 to 5 unique items)
        const uniqueItemsCount = Math.floor(Math.random() * 5) + 1;
        const basketItems = [];
        let subtotal = 0;
        let totalDiscount = 0;

        // Shuffle index selection to get unique items
        const shuffledProducts = [...realMockProducts].sort(() => 0.5 - Math.random());

        for (let i = 0; i < uniqueItemsCount; i++) {
          const product = shuffledProducts[i];
          const qty = Math.floor(Math.random() * 3) + 1; // 1 to 3 units per item
          
          // Apply a selective discount strategy (e.g., 15% chance of a 10% promotional rate)
          const discountPercentage = Math.random() < 0.15 ? 10 : 0;
          
          const rawCost = product.price * qty;
          const calculatedDiscount = rawCost * (discountPercentage / 100);

          subtotal += rawCost;
          totalDiscount += calculatedDiscount;

          basketItems.push({
            productId: new mongoose.Types.ObjectId(), // Virtual catalog reference matching schema
            itemName: product.name,
            quantity: qty,
            unitPrice: product.price,
            discountPercentage: discountPercentage
          });
        }

        const netTotal = parseFloat((subtotal - totalDiscount).toFixed(2));
        subtotal = parseFloat(subtotal.toFixed(2));
        totalDiscount = parseFloat(totalDiscount.toFixed(2));

        // Randomize structural payment distribution modes
        const paymentMethods = ["cash", "card", "online"];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        let cashReceived = 0;
        let changeGiven = 0;

        if (paymentMethod === "cash") {
          // Round up to nearest denominations (e.g., $5, $10, $20, $50, $100 notes)
          const bills = [5, 10, 20, 50, 100, 200];
          cashReceived = bills.find(bill => bill >= netTotal) || Math.ceil(netTotal / 50) * 50;
          changeGiven = parseFloat((cashReceived - netTotal).toFixed(2));
        }

        batchOrders.push({
          orderNumber,
          cashierId: dummyCashierId,
          items: basketItems,
          subtotal,
          totalDiscount,
          netTotal,
          paymentMethod,
          paymentStatus: "paid",
          cashReceived,
          changeGiven,
          createdAt: orderTimestamp,
          updatedAt: orderTimestamp
        });
      }
    }

    console.log(`Writing ${batchOrders.length} records safely to the database...`);
    
    // Chunk database write execution to optimize system memory usage
    const chunkSize = 1000;
    for (let i = 0; i < batchOrders.length; i += chunkSize) {
      const chunk = batchOrders.slice(i, i + chunkSize);
      await Order.insertMany(chunk, { timestamps: false }); // Bypass schema hook auto-generation to keep dates intact
    }

    console.log("✅ Seeding sequence successful! 1 year of continuous point-of-sale data generated.");
  } catch (error) {
    console.error("❌ Database seeding routine failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected cleanly from MongoDB client context.");
  }
};

seedDatabase();