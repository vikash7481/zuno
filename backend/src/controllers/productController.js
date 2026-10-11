import Product from '../models/Product.js';
import Category from '../models/Category.js';
import InventoryItem from '../models/InventoryItem.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      flavor,
      minPrice,
      maxPrice,
      sort = 'featured',
      page = 1,
      limit = 12,
      all = 'false'
    } = req.query;

    const query = {};

    // For customers, show only published products unless admin requests all
    if (all !== 'true') {
      query.isPublished = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'variants.flavor': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.category = cat._id;
      }
    }

    if (flavor) {
      query['variants.flavor'] = { $regex: flavor, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query['variants.sellingPrice'] = {};
      if (minPrice) query['variants.sellingPrice'].$gte = Number(minPrice);
      if (maxPrice) query['variants.sellingPrice'].$lte = Number(maxPrice);
    }

    let sortOptions = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { 'variants.sellingPrice': 1 };
    else if (sort === 'price_desc') sortOptions = { 'variants.sellingPrice': -1 };
    else if (sort === 'rating') sortOptions = { averageRating: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Attach real available stock for each variant from InventoryItem
    const variantSkus = products.flatMap(p => p.variants.map(v => v.sku));
    const inventoryItems = await InventoryItem.find({ sku: { $in: variantSkus } }).lean();
    const inventoryMap = {};
    for (const item of inventoryItems) {
      inventoryMap[item.sku] = Math.max(0, (item.physicalStock || 0) - (item.reservedStock || 0));
    }

    const enhancedProducts = products.map(p => ({
      ...p,
      variants: p.variants.map(v => ({
        ...v,
        availableStock: inventoryMap[v.sku] !== undefined ? inventoryMap[v.sku] : 0
      }))
    }));

    res.json({
      success: true,
      products: enhancedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const query = mongoose.Types.ObjectId.isValid(slug)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };
    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Attach real available stock
    const variantSkus = product.variants.map(v => v.sku);
    const inventoryItems = await InventoryItem.find({ sku: { $in: variantSkus } }).lean();
    const inventoryMap = {};
    for (const item of inventoryItems) {
      inventoryMap[item.sku] = Math.max(0, (item.physicalStock || 0) - (item.reservedStock || 0));
    }

    product.variants = product.variants.map(v => ({
      ...v,
      availableStock: inventoryMap[v.sku] !== undefined ? inventoryMap[v.sku] : 0
    }));

    // Find related products in same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isPublished: true
    }).limit(4).lean();

    res.json({ success: true, product, relatedProducts });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, displayOrder } = req.body;
    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      image,
      displayOrder: displayOrder || 0
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      category,
      brand,
      shortDescription,
      description,
      images,
      variants,
      ingredients,
      nutritionalInfo,
      allergens,
      storageInstructions,
      tags,
      isFeatured
    } = req.body;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await Product.create({
      name,
      slug: generatedSlug,
      category,
      brand: brand || 'Zuno',
      shortDescription,
      description,
      images: images || [],
      variants: variants || [],
      ingredients: ingredients || [],
      nutritionalInfo: nutritionalInfo || {},
      allergens,
      storageInstructions,
      tags: tags || [],
      isFeatured: !!isFeatured
    });

    // Ensure inventory item exists for each variant
    for (const v of product.variants) {
      const existing = await InventoryItem.findOne({ sku: v.sku });
      if (!existing) {
        await InventoryItem.create({
          sku: v.sku,
          name: `${product.name} (${v.packSize})`,
          type: 'finished_goods',
          unit: 'packet',
          physicalStock: 0,
          costPerUnit: v.costPrice || 0,
          linkedProduct: product._id,
          linkedVariantSku: v.sku
        });
      }
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Sync inventory items for any new variants
    for (const v of product.variants) {
      const existing = await InventoryItem.findOne({ sku: v.sku });
      if (!existing) {
        await InventoryItem.create({
          sku: v.sku,
          name: `${product.name} (${v.packSize})`,
          type: 'finished_goods',
          unit: 'packet',
          physicalStock: 0,
          costPerUnit: v.costPrice || 0,
          linkedProduct: product._id,
          linkedVariantSku: v.sku
        });
      }
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Mark as unpublished / archived rather than hard deleting to preserve historical orders
    product.isPublished = false;
    await product.save();

    res.json({ success: true, message: 'Product successfully archived' });
  } catch (error) {
    next(error);
  }
};
