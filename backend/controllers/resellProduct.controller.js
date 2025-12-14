const ResellProduct = require('../models/ResellProduct');

exports.getAllResellProducts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      color, 
      size,
      condition,
      minPrice, 
      maxPrice, 
      sortBy 
    } = req.query;

    const filter = { status: 'available' };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (color) {
      filter.color = { $regex: color, $options: 'i' };
    }

    if (size) {
      filter.size = size;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    let sort = {};
    if (sortBy === 'newArrival') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'priceLowToHigh') {
      sort = { price: 1 };
    } else if (sortBy === 'priceHighToLow') {
      sort = { price: -1 };
    } else {
      sort = { createdAt: -1 };
    }

    const products = await ResellProduct.find(filter)
      .populate('sellerId', 'name username')
      .sort(sort);
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getResellProductById = async (req, res) => {
  try {
    const product = await ResellProduct.findById(req.params.id)
      .populate('sellerId', 'name username');
    
    if (!product) {
      return res.status(404).json({ message: 'Resell product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserResellProducts = async (req, res) => {
  try {
    const products = await ResellProduct.find({ sellerId: req.user.id })
      .populate('sellerId', 'name username')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createResellProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      type,
      color,
      size,
      images,
      description,
      condition,
      fabricType,
      originalPrice,
      purchaseDate
    } = req.body;

    if (!name || !price || !category || !type || !color || !size || !images || !condition) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = new ResellProduct({
      sellerId: req.user.id,
      name,
      price,
      category,
      type,
      color,
      size,
      images,
      description,
      condition,
      fabricType,
      originalPrice,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined
    });

    await product.save();
    await product.populate('sellerId', 'name username');

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateResellProduct = async (req, res) => {
  try {
    const product = await ResellProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Resell product not found' });
    }

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    if (product.status === 'sold') {
      return res.status(400).json({ message: 'Cannot update sold product' });
    }

    Object.assign(product, req.body);
    await product.save();
    await product.populate('sellerId', 'name username');

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteResellProduct = async (req, res) => {
  try {
    const product = await ResellProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Resell product not found' });
    }

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await ResellProduct.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resell product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsSold = async (req, res) => {
  try {
    const product = await ResellProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Resell product not found' });
    }

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (product.status === 'sold') {
      return res.status(400).json({ message: 'Product already marked as sold' });
    }

    product.status = 'sold';
    product.soldAt = new Date();
    await product.save();
    await product.populate('sellerId', 'name username');

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.purchaseResellProduct = async (req, res) => {
  try {
    const product = await ResellProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Resell product not found' });
    }

    if (product.sellerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot purchase your own product' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available for purchase' });
    }

    product.status = 'sold';
    product.soldTo = req.user.id;
    product.soldAt = new Date();
    await product.save();
    await product.populate('sellerId', 'name username');

    res.json({ message: 'Product purchased successfully', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

