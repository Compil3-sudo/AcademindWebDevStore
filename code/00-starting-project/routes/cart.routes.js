const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');

router.post('/items', cartController.addCartItem);

module.exports = router;
