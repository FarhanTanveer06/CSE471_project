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

// Get complementary products for outfit suggestions
exports.getComplementaryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Define complementary categories based on current product category
    let complementaryCategories = [];
    if (product.category === 'shirts') {
      complementaryCategories = ['pants', 'blazers'];
    } else if (product.category === 'pants') {
      complementaryCategories = ['shirts', 'blazers'];
    } else if (product.category === 'blazers') {
      complementaryCategories = ['shirts', 'pants'];
    }

    // Define color compatibility - colors that work well together
    const colorCompatibility = {
      'Black': ['Black', 'White', 'Gray', 'Navy'],
      'White': ['Black', 'Navy', 'Gray', 'Brown'],
      'Navy': ['White', 'Gray', 'Black', 'Brown'],
      'Gray': ['Black', 'White', 'Navy', 'Brown'],
      'Brown': ['White', 'Navy', 'Gray', 'Black']
    };

    const compatibleColors = colorCompatibility[product.color] || [product.color];

    // Find complementary products
    // Priority: Same type > Compatible colors > In stock > Featured
    const allSuggestions = await Product.find({
      _id: { $ne: product._id }, // Exclude the current product
      category: { $in: complementaryCategories },
      availability: { $gt: 0 }, // Only in-stock items
      $or: [
        { type: product.type }, // Same type (e.g., both Formal)
        { color: { $in: compatibleColors } } // Compatible colors
      ]
    })
    .sort({ 
      featured: -1,
      createdAt: -1 
    });

    // Sort by priority: same type first, then by featured and date
    const suggestions = allSuggestions
      .sort((a, b) => {
        // Prioritize products with same type
        const aSameType = a.type === product.type ? 1 : 0;
        const bSameType = b.type === product.type ? 1 : 0;
        if (aSameType !== bSameType) {
          return bSameType - aSameType;
        }
        // Then by featured
        if (a.featured !== b.featured) {
          return b.featured - a.featured;
        }
        // Then by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 8); // Limit to 8 suggestions

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get outfit suggestions based on Bangladeshi culture and events
exports.getEventOutfitSuggestions = async (req, res) => {
  try {
    const { event } = req.query;

    if (!event) {
      return res.status(400).json({ message: 'Event parameter is required' });
    }

    // Define event-based outfit requirements
    const eventRules = {
      'pahela-baishakh': {
        categories: ['panjabi'],
        colors: ['red', 'white', 'maroon'],
        description: 'For Pahela Baishakh, we suggest Panjabi in traditional colors: red, white, or maroon to celebrate the Bengali New Year with style.'
      },
      'language-martyrs-day': {
        categories: ['panjabi'],
        colors: ['black', 'white'],
        description: 'For Language Martyrs Day, we suggest Panjabi in black and white to honor the language movement with respect and dignity.'
      },
      'wedding': {
        categories: ['blazers', 'panjabi', 'pants'],
        colors: [],
        description: 'For weddings, we suggest a complete formal ensemble including Blazer, Panjabi, and Pants for a sophisticated and elegant look.'
      },
      'eid': {
        categories: ['panjabi', 'shirts', 'pants'],
        colors: [],
        description: 'For Eid celebrations, we suggest Panjabi, Shirts, and Pants for a traditional yet modern festive look.'
      },
      'puja': {
        categories: ['panjabi'],
        colors: [],
        description: 'For Puja celebrations, we suggest Panjabi in traditional styles suitable for religious ceremonies.'
      },
      'victory-day': {
        categories: ['panjabi'],
        colors: ['green', 'red', 'maroon'],
        description: 'For Victory Day, we suggest Panjabi in green, red, and maroon to honor the colors of the Bangladeshi flag and celebrate independence.'
      }
    };

    const rule = eventRules[event.toLowerCase()];

    if (!rule) {
      return res.status(400).json({ message: 'Invalid event. Supported events: pahela-baishakh, language-martyrs-day, wedding, eid, puja, victory-day' });
    }

    // Build filter
    const filter = {
      category: { $in: rule.categories },
      availability: { $gt: 0 } // Only available products
    };

    // Add strict color filter if specified
    if (rule.colors.length > 0) {
      // Use $or with exact case-insensitive color matching
      // This ensures only products with exactly matching colors are returned
      filter.$or = rule.colors.map(color => ({
        color: { $regex: `^${color}$`, $options: 'i' }
      }));
    }

    // Fetch products with strict filtering
    let products = await Product.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(50);

    // Apply additional strict filtering in JavaScript to ensure exact matches
    // This handles cases where color might contain additional words (e.g., "Light Red" should not match "Red" for strict filtering)
    if (rule.colors.length > 0) {
      const normalizedColors = rule.colors.map(c => c.toLowerCase().trim());
      products = products.filter(product => {
        const productColor = product.color.toLowerCase().trim();
        // Check if product color exactly matches one of the allowed colors
        return normalizedColors.some(allowedColor => productColor === allowedColor);
      });
    }

    // Group products by category for better organization
    const groupedProducts = {};
    rule.categories.forEach(cat => {
      groupedProducts[cat] = products.filter(p => p.category === cat);
    });

    // Sort products by featured and date for consistent ordering
    Object.keys(groupedProducts).forEach(cat => {
      groupedProducts[cat].sort((a, b) => {
        if (a.featured !== b.featured) return b.featured - a.featured;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    // Rebuild products array from grouped products
    products = [];
    Object.values(groupedProducts).forEach(catProducts => {
      products.push(...catProducts);
    });

    // Final sort by featured and date
    products.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      event: event,
      description: rule.description,
      suggestions: groupedProducts,
      allProducts: products.slice(0, 20) // Return first 20 for display
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};