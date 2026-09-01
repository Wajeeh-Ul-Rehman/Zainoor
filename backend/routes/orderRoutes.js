const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/user/:userId', orderController.getUserOrders); // <-- Add this route
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;