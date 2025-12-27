const Preview = require('../models/Preview');
const Product = require('../models/Product');

// Get user's preview items
exports.getPreview = async (req, res) => {
  try {
    let preview = await Preview.findOne({ userId: req.user.id }).populate('items.productId');
    
    if (!preview) {
      preview = new Preview({ userId: req.user.id, items: [] });
      await preview.save();
    }
    
    res.json(preview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add item to preview
exports.addToPreview = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create preview
    let preview = await Preview.findOne({ userId: req.user.id });
    if (!preview) {
      preview = new Preview({ userId: req.user.id, items: [] });
    }
    
    // Check if item already exists in preview
    const existingItem = preview.items.find(
      item => item.productId.toString() === productId
    );
    
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in preview' });
    }
    
    // Populate existing items to check categories
    await preview.populate('items.productId');
    
    // Check category limits: 2 top items (non-pants) and 2 bottom items (pants)
    const isPants = product.category === 'pants';
    const itemsInSameCategory = preview.items.filter(item => {
      const itemProduct = item.productId;
      if (!itemProduct) return false;
      if (isPants) {
        return itemProduct.category === 'pants';
      } else {
        return itemProduct.category !== 'pants';
      }
    });
    
    if (itemsInSameCategory.length >= 2) {
      return res.status(400).json({ message: 'you can add only 2 items' });
    }
    
    // Add new item
    preview.items.push({ productId });
    
    await preview.save();
    await preview.populate('items.productId');
    
    res.status(201).json(preview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item from preview
exports.removeFromPreview = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const preview = await Preview.findOne({ userId: req.user.id });
    if (!preview) {
      return res.status(404).json({ message: 'Preview not found' });
    }
    
    preview.items = preview.items.filter(item => item._id.toString() !== itemId);
    await preview.save();
    await preview.populate('items.productId');
    
    res.json(preview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear entire preview
exports.clearPreview = async (req, res) => {
  try {
    const preview = await Preview.findOne({ userId: req.user.id });
    if (!preview) {
      return res.status(404).json({ message: 'Preview not found' });
    }
    
    preview.items = [];
    await preview.save();
    
    res.json({ message: 'Preview cleared successfully', preview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

