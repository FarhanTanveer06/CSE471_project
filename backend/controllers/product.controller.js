const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      search, 
      category, 
      color, 
      size,
      minPrice, 
      maxPrice, 
      sortBy
    } = req.query;

    // Build filter object
    const filter = {};

    // Search by name (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by color
    if (color) {
      filter.color = { $regex: color, $options: 'i' };
    }

    // Filter by size (check if size exists in sizes array)
    if (size) {
      filter.sizes = size;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Build sort object based on sortBy parameter
    let sort = {};
    if (sortBy === 'newArrival') {
      sort = { createdAt: -1 }; // Newest first
    } else if (sortBy === 'featured') {
      sort = { featured: -1, createdAt: -1 }; // Featured first, then newest
    } else if (sortBy === 'priceLowToHigh') {
      sort = { price: 1 }; // Price ascending
    } else if (sortBy === 'priceHighToLow') {
      sort = { price: -1 }; // Price descending
    } else {
      sort = { createdAt: -1 }; // Default: newest first
    }

    const products = await Product.find(filter).sort(sort);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin only
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, type, color, sizes, images, description, fabricType, gsm, availability, featured } = req.body;
    const product = new Product({ 
      name, 
      price, 
      category, 
      type,
      color,
      sizes: sizes || [],
      images, 
      description, 
      fabricType, 
      gsm, 
      availability,
      featured: featured || false
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
