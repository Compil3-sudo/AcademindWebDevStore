const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const imageUploadMiddleware = require('../middlewares/image-upload');

// /admin added for all of these routes in app.js
router.get('/products', adminController.getProducts);

router.get('/products/new', adminController.getNewProduct);

router.post(
  '/products',
  imageUploadMiddleware,
  adminController.createNewProduct
);

router.get('/products/:id', adminController.getUpdateProduct);

router.post(
  '/products/:id',
  imageUploadMiddleware, // without this the productData is undefined or NaN
  // this is required because of the multiform submission (text data AND image file)
  adminController.updateProduct
);

module.exports = router;
