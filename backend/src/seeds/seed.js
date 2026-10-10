import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import InventoryItem from '../models/InventoryItem.js';
import InventoryMovement from '../models/InventoryMovement.js';
import Batch from '../models/Batch.js';
import Recipe from '../models/Recipe.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Expense from '../models/Expense.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import { ROLES, ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, MOVEMENT_TYPES } from '../config/constants.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zuno_db';
    console.log(`[Seed] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      InventoryItem.deleteMany({}),
      InventoryMovement.deleteMany({}),
      Batch.deleteMany({}),
      Recipe.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Expense.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      Setting.deleteMany({})
    ]);

    console.log('[Seed] Seeding Roles & Users...');
    const defaultPassword = 'Password@123';

    const users = await User.create([
      {
        name: 'Vikas Sharma (Super Admin)',
        email: 'superadmin@zuno.com',
        password: defaultPassword,
        phone: '+919876543210',
        role: ROLES.SUPER_ADMIN
      },
      {
        name: 'Rohan Mehta (Operations Admin)',
        email: 'admin@zuno.com',
        password: defaultPassword,
        phone: '+919876543211',
        role: ROLES.ADMIN
      },
      {
        name: 'Suresh Patil (Inventory Manager)',
        email: 'inventory@zuno.com',
        password: defaultPassword,
        phone: '+919876543212',
        role: ROLES.INVENTORY_MANAGER
      },
      {
        name: 'Amit Verma (Production Manager)',
        email: 'production@zuno.com',
        password: defaultPassword,
        phone: '+919876543213',
        role: ROLES.PRODUCTION_MANAGER
      },
      {
        name: 'Rajesh Kumar (Delivery Partner)',
        email: 'partner@zuno.com',
        password: defaultPassword,
        phone: '+919876543214',
        role: ROLES.DELIVERY_PARTNER,
        deliveryPartnerProfile: {
          vehicleType: 'Electric Scooter',
          vehicleNumber: 'DL 08 AB 4321',
          isAvailable: true,
          servicePincodes: ['110001', '110020', '110048', '560001', '400001'],
          activeDeliveriesCount: 0,
          totalDeliveredCount: 84,
          rating: 4.9
        }
      },
      {
        name: 'Priya Iyer (Customer)',
        email: 'customer@zuno.com',
        password: defaultPassword,
        phone: '+919876543215',
        role: ROLES.CUSTOMER,
        addresses: [
          {
            fullName: 'Priya Iyer',
            phone: '+919876543215',
            addressLine1: 'Flat 402, Lotus Orchid Apartments, MG Road',
            addressLine2: 'Near Indiranagar Metro Station',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            landmark: 'Opposite Cafe Coffee Day',
            isDefault: true
          }
        ]
      }
    ]);

    const adminUser = users[0];
    const customerUser = users[5];
    const deliveryUser = users[4];

    console.log('[Seed] Seeding Settings...');
    await Setting.create([
      { key: 'brand_name', value: 'Zuno' },
      { key: 'tagline', value: 'Artisanal Slow-Roasted Fox Nut Superfood' },
      { key: 'free_delivery_threshold', value: 499 },
      { key: 'standard_delivery_fee', value: 49 },
      { key: 'support_email', value: 'support@zuno.com' },
      { key: 'support_phone', value: '+919876543210' },
      { key: 'auto_dispatch_enabled', value: true },
      {
        key: 'serviceable_pincodes',
        value: ['110001', '110020', '110048', '560001', '560034', '400001', '400050', '500001']
      }
    ]);

    console.log('[Seed] Seeding Categories...');
    const categories = await Category.create([
      {
        name: 'Classic Roasted',
        slug: 'classic-roasted',
        description: 'Lightly roasted with pure cold-pressed oils and natural pink salts.',
        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
        displayOrder: 1
      },
      {
        name: 'Gourmet Flavoured',
        slug: 'gourmet-flavoured',
        description: 'Exotic spice blends and artisanal savoury glazes for guilt-free snacking.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        displayOrder: 2
      },
      {
        name: 'Sweet Delights',
        slug: 'sweet-delights',
        description: 'Slow-roasted crunch hand-dusted with jaggery caramel and pure cacao.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        displayOrder: 3
      },
      {
        name: 'Raw Superfood',
        slug: 'raw-superfood',
        description: 'Handpicked Grade-A jumbo fox nuts directly sourced from Mithila lakes.',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
        displayOrder: 4
      },
      {
        name: 'Combos & Family Packs',
        slug: 'combos-and-family-packs',
        description: 'Value gift boxes and multi-pack samplers for the entire family.',
        image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
        displayOrder: 5
      }
    ]);

    console.log('[Seed] Seeding Products & Variants...');
    const products = await Product.create([
      {
        name: 'Himalayan Pink Salt Roasted Makhana',
        slug: 'himalayan-pink-salt-roasted-makhana',
        category: categories[0]._id,
        brand: 'Zuno',
        shortDescription: 'Slow-roasted with cold-pressed olive oil & hand-mined Himalayan pink salt.',
        description: 'Crafted with premium Grade-A fox nuts sourced from the wetlands of Mithila. Each kernel is gently slow-roasted in cold-pressed virgin olive oil and seasoned with mineral-rich Himalayan pink salt. Naturally vegan, gluten-free, and high in plant-based protein.',
        images: [
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          {
            sku: 'ZUNO-CL-SALT-100G',
            barcode: '890123400101',
            packSize: '100g Pouch',
            weightGrams: 100,
            flavor: 'Himalayan Pink Salt',
            mrp: 149,
            sellingPrice: 129,
            costPrice: 52,
            taxPercent: 5,
            isDefault: true,
            isActive: true
          },
          {
            sku: 'ZUNO-CL-SALT-250G',
            barcode: '890123400102',
            packSize: '250g Value Jar',
            weightGrams: 250,
            flavor: 'Himalayan Pink Salt',
            mrp: 349,
            sellingPrice: 299,
            costPrice: 125,
            taxPercent: 5,
            isDefault: false,
            isActive: true
          }
        ],
        ingredients: ['Fox Nuts (Makhana) 88%', 'Cold-Pressed Olive Oil 8%', 'Himalayan Pink Rock Salt 4%'],
        nutritionalInfo: {
          servingSize: '100g',
          energyKcal: 382,
          proteinG: 9.8,
          carbohydratesG: 72.4,
          dietaryFiberG: 7.9,
          totalFatG: 6.2,
          calciumMg: 64,
          ironMg: 1.6,
          sodiumMg: 280
        },
        allergens: 'Packed in a facility handling tree nuts and seeds.',
        tags: ['classic', 'pink-salt', 'vegan', 'gluten-free', 'bestseller'],
        isFeatured: true,
        averageRating: 4.9,
        reviewCount: 38
      },
      {
        name: 'Spicy Peri Peri Roasted Makhana',
        slug: 'spicy-peri-peri-roasted-makhana',
        category: categories[1]._id,
        brand: 'Zuno',
        shortDescription: 'Zesty bird’s eye chili, garlic, and tangy lemon seasoning on crispy makhana.',
        description: 'For those who crave bold flavors. Our signature Peri Peri seasoning combines sun-dried bird’s eye chili, roasted garlic, cracked black pepper, and citrus zest. An addictive crunch without the guilt of fried potato chips.',
        images: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          {
            sku: 'ZUNO-GM-PERI-100G',
            barcode: '890123400201',
            packSize: '100g Pouch',
            weightGrams: 100,
            flavor: 'Spicy Peri Peri',
            mrp: 159,
            sellingPrice: 139,
            costPrice: 56,
            taxPercent: 5,
            isDefault: true,
            isActive: true
          },
          {
            sku: 'ZUNO-GM-PERI-250G',
            barcode: '890123400202',
            packSize: '250g Value Jar',
            weightGrams: 250,
            flavor: 'Spicy Peri Peri',
            mrp: 369,
            sellingPrice: 319,
            costPrice: 132,
            taxPercent: 5,
            isDefault: false,
            isActive: true
          }
        ],
        ingredients: ['Fox Nuts 85%', 'Cold-Pressed Olive Oil 7%', 'Peri Peri Spice Blend (Red Chili, Garlic, Onion, Black Pepper, Citric Acid, Sea Salt) 8%'],
        nutritionalInfo: {
          servingSize: '100g',
          energyKcal: 395,
          proteinG: 9.4,
          carbohydratesG: 71.0,
          dietaryFiberG: 7.5,
          totalFatG: 7.8,
          calciumMg: 58,
          ironMg: 1.8,
          sodiumMg: 420
        },
        allergens: 'Packed in a facility handling tree nuts and seeds.',
        tags: ['spicy', 'peri-peri', 'snack', 'bestseller'],
        isFeatured: true,
        averageRating: 4.8,
        reviewCount: 52
      },
      {
        name: 'Cream & Garden Onion Makhana',
        slug: 'cream-and-garden-onion-makhana',
        category: categories[1]._id,
        brand: 'Zuno',
        shortDescription: 'Delicate creaminess balanced with roasted shallots, chives, and herbs.',
        description: 'Smooth, comforting, and perfectly seasoned. A luxurious balance of dairy-free creamy seasoning, sweet roasted shallots, and fresh garden chives on slow-toasted airy fox nuts.',
        images: [
          'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          {
            sku: 'ZUNO-GM-CRON-100G',
            barcode: '890123400301',
            packSize: '100g Pouch',
            weightGrams: 100,
            flavor: 'Cream & Garden Onion',
            mrp: 159,
            sellingPrice: 139,
            costPrice: 55,
            taxPercent: 5,
            isDefault: true,
            isActive: true
          }
        ],
        ingredients: ['Fox Nuts 86%', 'Refined Rice Bran Oil 6%', 'Cream & Onion Seasoning (Dehydrated Onion, Herbs, Sea Salt, Natural Flavoring) 8%'],
        nutritionalInfo: {
          servingSize: '100g',
          energyKcal: 388,
          proteinG: 9.1,
          carbohydratesG: 73.2,
          dietaryFiberG: 7.2,
          totalFatG: 6.9,
          calciumMg: 62,
          ironMg: 1.5,
          sodiumMg: 350
        },
        tags: ['cream-onion', 'smooth', 'herbs'],
        isFeatured: false,
        averageRating: 4.7,
        reviewCount: 24
      },
      {
        name: 'Tangy Pudina Mint Makhana',
        slug: 'tangy-pudina-mint-makhana',
        category: categories[1]._id,
        brand: 'Zuno',
        shortDescription: 'Refreshing garden mint, dry mango powder, and Indian chaat spices.',
        description: 'An explosion of desi flavours. Real crushed dry mint leaves paired with tangy amchur, cumin, and rock salt provide an invigorating tea-time snacking experience.',
        images: [
          'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          {
            sku: 'ZUNO-GM-PUD-100G',
            barcode: '890123400401',
            packSize: '100g Pouch',
            weightGrams: 100,
            flavor: 'Pudina Punch',
            mrp: 159,
            sellingPrice: 139,
            costPrice: 54,
            taxPercent: 5,
            isDefault: true,
            isActive: true
          }
        ],
        ingredients: ['Fox Nuts 86%', 'Olive Oil 6%', 'Pudina Chaat Masala (Dried Mint 3%, Mango Powder, Black Salt, Cumin) 8%'],
        tags: ['pudina', 'mint', 'chaat', 'desi'],
        isFeatured: false,
        averageRating: 4.9,
        reviewCount: 19
      },
      {
        name: 'Organic Jaggery Caramel Makhana',
        slug: 'organic-jaggery-caramel-makhana',
        category: categories[2]._id,
        brand: 'Zuno',
        shortDescription: 'Glazed with unrefined organic jaggery (Gur) and toasted white sesame.',
        description: 'Naturally sweetened superfood. We slow-melt pure unrefined sugarcane jaggery and coat crispy fox nuts with a delicate caramel crunch and toasted nutty sesame seeds.',
        images: [
          'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          {
            sku: 'ZUNO-SW-JAGG-120G',
            barcode: '890123400501',
            packSize: '120g Pouch',
            weightGrams: 120,
            flavor: 'Jaggery Caramel',
            mrp: 179,
            sellingPrice: 159,
            costPrice: 62,
            taxPercent: 5,
            isDefault: true,
            isActive: true
          }
        ],
        ingredients: ['Fox Nuts 65%', 'Organic Sugarcane Jaggery 30%', 'Ghee 3%', 'White Sesame Seeds 2%'],
        tags: ['sweet', 'jaggery', 'healthy-dessert'],
        isFeatured: true,
        averageRating: 4.9,
        reviewCount: 31
      },
      {
        name: 'Raw Jumbo Makhana (Grade A - 6 Suta)',
        slug: 'raw-jumbo-makhana-grade-a',
        category: categories[3]._id,
        brand: 'Zuno',
        shortDescription: 'Giant, unroasted hand-graded fox nuts directly harvested from Mithila lakes.',
        description: 'Pure, unprocessed superfood kernels for home roasting and festive fasting recipes. Screened for uniform 6-suta jumbo size, maximum puffiness, and zero chemical bleach.',
        images: [
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          {
            sku: 'ZUNO-RAW-JMB-500G',
            barcode: '890123400601',
            packSize: '500g Vacuum Pack',
            weightGrams: 500,
            flavor: 'Natural Raw',
            mrp: 499,
            sellingPrice: 429,
            costPrice: 280,
            taxPercent: 0,
            isDefault: true,
            isActive: true
          },
          {
            sku: 'ZUNO-RAW-JMB-1KG',
            barcode: '890123400602',
            packSize: '1kg Bulk Carton',
            weightGrams: 1000,
            flavor: 'Natural Raw',
            mrp: 949,
            sellingPrice: 799,
            costPrice: 540,
            taxPercent: 0,
            isDefault: false,
            isActive: true
          }
        ],
        ingredients: ['100% Raw Jumbo Fox Nuts (Euryale Ferox)'],
        tags: ['raw', 'bulk', 'superfood', 'unroasted'],
        isFeatured: false,
        averageRating: 4.9,
        reviewCount: 45
      }
    ]);

    console.log('[Seed] Seeding Inventory Items & Physical Balances...');
    const inventoryItems = await InventoryItem.create([
      // Sellable Finished Goods SKUs
      {
        sku: 'ZUNO-CL-SALT-100G',
        name: 'Zuno Pink Salt 100g',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 150,
        reservedStock: 0,
        reorderThreshold: 20,
        costPerUnit: 52
      },
      {
        sku: 'ZUNO-CL-SALT-250G',
        name: 'Zuno Pink Salt 250g Jar',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 80,
        reservedStock: 0,
        reorderThreshold: 15,
        costPerUnit: 125
      },
      {
        sku: 'ZUNO-GM-PERI-100G',
        name: 'Zuno Peri Peri 100g',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 220,
        reservedStock: 0,
        reorderThreshold: 25,
        costPerUnit: 56
      },
      {
        sku: 'ZUNO-GM-PERI-250G',
        name: 'Zuno Peri Peri 250g Jar',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 75,
        reservedStock: 0,
        reorderThreshold: 15,
        costPerUnit: 132
      },
      {
        sku: 'ZUNO-GM-CRON-100G',
        name: 'Zuno Cream & Onion 100g',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 110,
        reservedStock: 0,
        reorderThreshold: 20,
        costPerUnit: 55
      },
      {
        sku: 'ZUNO-GM-PUD-100G',
        name: 'Zuno Pudina 100g',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 95,
        reservedStock: 0,
        reorderThreshold: 20,
        costPerUnit: 54
      },
      {
        sku: 'ZUNO-SW-JAGG-120G',
        name: 'Zuno Jaggery Caramel 120g',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 60,
        reservedStock: 0,
        reorderThreshold: 15,
        costPerUnit: 62
      },
      {
        sku: 'ZUNO-RAW-JMB-500G',
        name: 'Zuno Raw Jumbo 500g',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 40,
        reservedStock: 0,
        reorderThreshold: 10,
        costPerUnit: 280
      },
      {
        sku: 'ZUNO-RAW-JMB-1KG',
        name: 'Zuno Raw Jumbo 1kg',
        type: 'finished_goods',
        unit: 'packet',
        physicalStock: 30,
        reservedStock: 0,
        reorderThreshold: 8,
        costPerUnit: 540
      },
      // Raw Materials & Packaging for Production
      {
        sku: 'RAW-MAKH-GRDA-KG',
        name: 'Bulk Raw Makhana Grade A (6 Suta)',
        type: 'raw_material',
        unit: 'kg',
        physicalStock: 650,
        reservedStock: 0,
        reorderThreshold: 100,
        costPerUnit: 520
      },
      {
        sku: 'INGR-OLIV-OIL-LT',
        name: 'Cold Pressed Virgin Olive Oil',
        type: 'ingredient',
        unit: 'litre',
        physicalStock: 120,
        reservedStock: 0,
        reorderThreshold: 25,
        costPerUnit: 480
      },
      {
        sku: 'FLAV-PERI-PWDR-KG',
        name: 'Artisanal Peri Peri Seasoning Mix',
        type: 'flavour',
        unit: 'kg',
        physicalStock: 85,
        reservedStock: 0,
        reorderThreshold: 15,
        costPerUnit: 350
      },
      {
        sku: 'FLAV-HIMSALT-KG',
        name: 'Fine Ground Himalayan Pink Salt',
        type: 'ingredient',
        unit: 'kg',
        physicalStock: 140,
        reservedStock: 0,
        reorderThreshold: 20,
        costPerUnit: 45
      },
      {
        sku: 'PKG-POUCH-PERI-100G',
        name: 'Printed Nitrogen Barrier Pouch (100g Peri Peri)',
        type: 'packaging',
        unit: 'piece',
        physicalStock: 1800,
        reservedStock: 0,
        reorderThreshold: 400,
        costPerUnit: 6.5
      },
      {
        sku: 'PKG-POUCH-SALT-100G',
        name: 'Printed Nitrogen Barrier Pouch (100g Pink Salt)',
        type: 'packaging',
        unit: 'piece',
        physicalStock: 1500,
        reservedStock: 0,
        reorderThreshold: 400,
        costPerUnit: 6.5
      }
    ]);

    console.log('[Seed] Seeding Suppliers & Purchase Orders...');
    const suppliers = await Supplier.create([
      {
        name: 'Mithila Agro Organics',
        companyName: 'Mithila Makhana Farmers Producer Co Ltd',
        contactPerson: 'Sunil Kumar Jha',
        phone: '+919835012345',
        email: 'supply@mithilamakhana.org',
        address: 'Darbhanga, Madhubani Wetland Belt, Bihar - 847001',
        gstin: '10AAACM1234F1Z8',
        suppliedCategories: ['Raw Makhana', 'Graded Fox Nuts'],
        outstandingBalance: 125000
      },
      {
        name: 'SpiceCraft Flavours Ltd',
        companyName: 'SpiceCraft Natural Seasonings India',
        contactPerson: 'Deepak Nambiar',
        phone: '+919846054321',
        email: 'sales@spicecraft.in',
        address: 'Kochi Industrial Area, Kerala - 682024',
        gstin: '32AAACS9876P1ZX',
        suppliedCategories: ['Peri Peri Spice Mix', 'Herbs & Sea Salt'],
        outstandingBalance: 35000
      },
      {
        name: 'EcoPack Flexible Solutions',
        companyName: 'EcoPack Packaging Technologies',
        contactPerson: 'Hitesh Shah',
        phone: '+919825067890',
        email: 'orders@ecopack.co.in',
        address: 'GIDC Vatva, Ahmedabad, Gujarat - 382445',
        gstin: '24AAACE5566K1Z9',
        suppliedCategories: ['Nitrogen Barrier Pouches', 'Corrugated Outer Boxes'],
        outstandingBalance: 18000
      }
    ]);

    await PurchaseOrder.create([
      {
        purchaseCode: 'PO-202610-001',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        items: [
          {
            itemSku: 'RAW-MAKH-GRDA-KG',
            itemName: 'Bulk Raw Makhana Grade A (6 Suta)',
            itemType: 'raw_material',
            quantity: 500,
            unit: 'kg',
            unitCost: 520,
            taxPercent: 5,
            totalCost: 273000,
            batchNumber: 'MITHILA-2026-B1',
            mfgDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000)
          }
        ],
        subtotal: 260000,
        taxAmount: 13000,
        totalAmount: 273000,
        paymentStatus: 'paid',
        paidAmount: 273000,
        status: 'received',
        stockReceived: true,
        receivedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        invoiceRef: 'INV-MITH-8832',
        createdBy: adminUser._id
      }
    ]);

    console.log('[Seed] Seeding Production Recipe (BOM)...');
    await Recipe.create([
      {
        name: 'Peri Peri Slow-Roasted Makhana (100g Batch)',
        product: products[1]._id,
        variantSku: 'ZUNO-GM-PERI-100G',
        targetPackSize: '100g',
        batchSizeYieldUnits: 200, // 200 packets of 100g = 20kg net output
        rawMaterials: [
          {
            itemSku: 'RAW-MAKH-GRDA-KG',
            itemName: 'Raw Makhana Grade A',
            requiredQty: 18.0,
            unit: 'kg'
          }
        ],
        ingredients: [
          {
            itemSku: 'INGR-OLIV-OIL-LT',
            itemName: 'Cold Pressed Virgin Olive Oil',
            requiredQty: 1.5,
            unit: 'litre'
          }
        ],
        flavours: [
          {
            itemSku: 'FLAV-PERI-PWDR-KG',
            itemName: 'Peri Peri Seasoning Mix',
            requiredQty: 1.6,
            unit: 'kg'
          }
        ],
        packagingMaterials: [
          {
            itemSku: 'PKG-POUCH-PERI-100G',
            itemName: 'Printed Nitrogen Barrier Pouch (100g)',
            requiredQty: 205,
            unit: 'piece'
          }
        ],
        expectedProcessingLossPercent: 4.2,
        roastingTemperatureC: 165,
        roastingTimeMinutes: 12,
        instructions: 'Slow roast raw makhana in rotating drum roaster at 165C until internal moisture is below 2.5%. Spray atomized olive oil followed by electrostatic powder coating of Peri Peri seasoning. Nitrogen-flush packaging immediately.',
        createdBy: adminUser._id
      }
    ]);

    console.log('[Seed] Seeding Coupons & Promotions...');
    await Coupon.create([
      {
        code: 'ZUNO10',
        description: '10% discount on orders above ₹399',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 399,
        maxDiscountAmount: 150,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 2000,
        usedCount: 14,
        isActive: true
      },
      {
        code: 'FIRST50',
        description: 'Flat ₹50 welcome discount on min ₹299 cart',
        discountType: 'fixed',
        discountValue: 50,
        minOrderValue: 299,
        maxDiscountAmount: 50,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 5000,
        usedCount: 28,
        isActive: true
      },
      {
        code: 'FEAST100',
        description: 'Flat ₹100 off on super family orders above ₹699',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 699,
        maxDiscountAmount: 100,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        usedCount: 9,
        isActive: true
      }
    ]);

    console.log('[Seed] Seeding Operating Expenses...');
    await Expense.create([
      {
        title: 'Industrial Roasting Facility Rent - Oct 2026',
        category: 'rent',
        amount: 45000,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paymentMethod: 'NEFT Transfer',
        paidTo: 'Apex Industrial Logistics Park',
        recordedBy: adminUser._id
      },
      {
        title: 'Warehouse Electricity & Rotary Roaster Power Bill',
        category: 'electricity',
        amount: 14200,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        paymentMethod: 'UPI / Bank',
        paidTo: 'State Electricity Board',
        recordedBy: adminUser._id
      },
      {
        title: 'Eco-Friendly Corrugated Outer Shipping Boxes',
        category: 'packaging',
        amount: 22000,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Bank Transfer',
        paidTo: 'EcoPack Flexible Solutions',
        recordedBy: adminUser._id
      },
      {
        title: 'Local Quick-Commerce Delivery Partner Fuel Subsidies',
        category: 'delivery',
        amount: 8500,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Direct Transfer',
        paidTo: 'Fleet Operations Account',
        recordedBy: adminUser._id
      }
    ]);

    console.log('[Seed] Seeding Initial Orders...');
    const pastOrder = await Order.create({
      orderNumber: 'ZUNO-91024-8192',
      invoiceNumber: 'INV-2026-104921',
      customer: customerUser._id,
      customerDetails: {
        name: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone
      },
      items: [
        {
          product: products[0]._id,
          variantSku: 'ZUNO-CL-SALT-100G',
          productName: products[0].name,
          flavor: 'Himalayan Pink Salt',
          packSize: '100g Pouch',
          weightGrams: 100,
          image: products[0].images[0],
          quantity: 2,
          unitPrice: 129,
          mrp: 149,
          subtotal: 258,
          taxPercent: 5,
          taxAmount: 12.9
        },
        {
          product: products[1]._id,
          variantSku: 'ZUNO-GM-PERI-100G',
          productName: products[1].name,
          flavor: 'Spicy Peri Peri',
          packSize: '100g Pouch',
          weightGrams: 100,
          image: products[1].images[0],
          quantity: 2,
          unitPrice: 139,
          mrp: 159,
          subtotal: 278,
          taxPercent: 5,
          taxAmount: 13.9
        }
      ],
      shippingAddress: customerUser.addresses[0],
      subtotal: 536,
      discountAmount: 50,
      couponCode: 'FIRST50',
      taxAmount: 26.8,
      deliveryFee: 0,
      totalAmount: 486,
      paymentMethod: PAYMENT_METHODS.RAZORPAY,
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentDetails: {
        razorpayOrderId: 'rzp_order_mock_99182',
        razorpayPaymentId: 'pay_mock_test_1092837',
        razorpaySignature: 'mock_sandbox_signature_verified',
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      orderStatus: ORDER_STATUS.DELIVERED,
      deliveryPartner: deliveryUser._id,
      deliveryOtp: '4821',
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: ORDER_STATUS.CONFIRMED, updatedBy: 'Customer', notes: 'Paid online via Razorpay Sandbox' },
        { status: ORDER_STATUS.READY_FOR_DISPATCH, updatedBy: 'Staff', notes: 'Packed with freshness seal' },
        { status: ORDER_STATUS.ASSIGNED, updatedBy: 'Delivery Manager', notes: 'Assigned to Rajesh Kumar' },
        { status: ORDER_STATUS.PICKED_UP, updatedBy: 'Rajesh Kumar', notes: 'Picked up from Central Hub' },
        { status: ORDER_STATUS.OUT_FOR_DELIVERY, updatedBy: 'Rajesh Kumar', notes: 'Driver en route' },
        { status: ORDER_STATUS.DELIVERED, updatedBy: 'Rajesh Kumar', notes: 'Delivered to customer' }
      ]
    });

    console.log(`\n=================================================`);
    console.log(`  Zuno Seed Data Successfully Injected!`);
    console.log(`=================================================`);
    console.log(`  Default Demo Accounts (Password: Password@123):`);
    console.log(`  • Super Admin:       superadmin@zuno.com`);
    console.log(`  • Operations Admin:  admin@zuno.com`);
    console.log(`  • Inventory Manager: inventory@zuno.com`);
    console.log(`  • Production Mgr:    production@zuno.com`);
    console.log(`  • Delivery Partner:  partner@zuno.com`);
    console.log(`  • Customer:          customer@zuno.com`);
    console.log(`=================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
