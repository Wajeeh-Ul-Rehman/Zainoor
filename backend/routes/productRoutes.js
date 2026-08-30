const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/hide', productController.toggleHide);
router.patch('/:id/sale', productController.setSale);
router.post('/upload', upload.array('images', 10), productController.uploadImages);

module.exports = router;