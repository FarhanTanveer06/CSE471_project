const express = require('express');
const router = express.Router();
const resellProductController = require('../controllers/resellProduct.controller');
const auth = require('../middlewares/authMiddleware');

router.get('/', resellProductController.getAllResellProducts);
router.get('/my-items', auth, resellProductController.getUserResellProducts);
router.get('/:id', resellProductController.getResellProductById);

router.post('/', auth, resellProductController.createResellProduct);
router.put('/:id', auth, resellProductController.updateResellProduct);
router.delete('/:id', auth, resellProductController.deleteResellProduct);

router.post('/:id/sold', auth, resellProductController.markAsSold);
router.post('/:id/purchase', auth, resellProductController.purchaseResellProduct);

module.exports = router;

