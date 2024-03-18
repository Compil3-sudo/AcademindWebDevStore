const Cart = require('../models/cart.models');

function initializeCart(req, res, next) {
  let cart;

  if (!req.session.cart) {
    cart = new Cart();
  } else {
    const sessionCart = req.session.cart;
    cart = new Cart(
      req.session.cart.items,
      sessionCart.totalQuantity,
      sessionCart.totalPrice
    );
  }

  res.locals.cart = cart;
  console.log('IMPORTANT');
  console.log(cart);
  console.log(res.locals);

  next();
}

module.exports = initializeCart;
