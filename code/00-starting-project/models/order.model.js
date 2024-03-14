const db = require('../data/database');

class Order {
  // Status => pending, fulfilled, cancelled
  constructor(cart, userData, status = 'pending', date, orderId) {
    this.productData = cart;
    this.userData = userData;
    this.status = status;
    this.date = new Date(date);
    if (this.date) {
      this.formattedDate = this.date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    this.id = orderId;
  }

  async save() {
    if (this.id) {
      // Updating
    } else {
      const orderCart = this.productData;
      const orderCartItems = orderCart.items;

      const order = [
        this.userData.id,
        new Date(),
        this.status,
        orderCart.totalQuantity,
        orderCart.totalPrice,
      ];

      console.log('ORDER: ', order);
      const [orderResult] = await db.execute(
        'INSERT INTO orders (userId, date, status, total_quantity, total_price) VALUES (?, ?, ?, ?, ?)',
        order
      );
      const orderId = orderResult.insertId;

      console.log('ORDER RESULT: ', orderResult);
      console.log('orderCartItems: ', orderCartItems);

      for (const item of orderCartItems) {
        // add each product from cart to the order_product table
        const orderProduct = [
          orderId,
          item.product.id,
          item.quantity,
          item.product.price,
          item.totalPrice,
        ];

        const [orderProductResult] = await db.execute(
          'INSERT INTO order_product (orderId, productId, quantity, single_price, total_price) VALUES (?, ?, ?, ?, ?)',
          orderProduct
        );

        console.log('orderProductResult: ', orderProductResult);
      }
    }
  }
}

module.exports = Order;
