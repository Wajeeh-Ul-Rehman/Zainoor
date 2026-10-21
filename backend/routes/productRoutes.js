const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

// Fetch products
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

// Create and Update products
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

// Toggle hide status (Supports both /hide and /toggle-hide endpoints)
router.patch('/:id/hide', productController.toggleHide);
router.patch('/:id/toggle-hide', productController.toggleHide);

// Sale settings
router.patch('/:id/sale', productController.setSale);

// Image Upload with JSON Error Handling
router.post('/upload', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer Upload Error:', err);
      return res.status(400).json({ 
        success: false, 
        message: err.message || 'Image upload failed' 
      });
    }
    next();
  });
}, productController.uploadImages);

module.exports = router;