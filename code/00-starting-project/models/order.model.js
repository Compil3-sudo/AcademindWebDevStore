const db = require('../data/database');
const Product = require('./product.model');
const User = require('./user.model');

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

  static async transformOrderClass(order) {
    // MySQL order Schema (What I receive):
    // order.id
    // order.userId
    // order.date
    // order.status
    // order.total_quantity (total quantity of all the cart items)
    // order.total_price (total price of all the cart items)

    // userDATA SCHEMA:
    // userdata = {
    //   email,
    //   password, // not needed
    //   name,
    //   address: {
    //     street,
    //     postalCode,
    //     city,
    //   },
    // };
    const user = await User.findById(order.userId);
    const [address] = await db.execute(
      `SELECT * FROM addresses WHERE id = (?) LIMIT 1`,
      [user.addressId]
    );

    const userData = {
      email: user.email,
      name: user.fullname,
      address: address[0], // MySQL only returns arrays => array[0]
    };

    // orderProduct schema:
    // id
    // orderId
    // productId
    // quantity (quantity of a product from the cart)
    // single_price
    // total_price (single_price * quantity)
    const orderProductsQuery = `SELECT * FROM order_product WHERE orderId = (?)`;

    const [orderProducts] = await db.execute(orderProductsQuery, [order.id]);
    const cartItems = [];

    for (const orderProduct of orderProducts) {
      const [cartProduct] = await db.execute(
        `SELECT * FROM products WHERE id = (?) LIMIT 1`,
        [orderProduct.productId]
      );
      // convert cartProduct into object from class Product
      const product = new Product(cartProduct[0]);

      const cartItem = {
        product,
        quantity: orderProduct.quantity,
        totalPrice: +orderProduct.total_price,
      };

      cartItems.push(cartItem);
    }
    // productDATA SCHEMA:
    // const productData = {
    //   items: [
    //     {
    //       product: {
    //         title: '',
    //         summary: '',
    //         price: 0,
    //         description: '',
    //         image: '',
    //         imagePath: '',
    //         imageUrl: '',
    //         id: '',
    //       },
    //       quantity: 0,
    //       totalPrice: 2,
    //     },
    //     (product2 = {}),
    //   ],
    // };

    const productData = {
      items: cartItems,
      totalQuantity: order.total_quantity,
      totalPrice: +order.total_price,
    };

    return new Order(productData, userData, order.status, order.date, order.id);
  }

  static async transformOrders(orders) {
    const transformedOrders = await Promise.all(
      orders.map(this.transformOrderClass)
    );
    return transformedOrders;
  }

  static async findAll() {
    const [orders] = await db.query(`SELECT * FROM orders ORDER BY date DESC`);
    console.log('FIND ALL ORDERS: ', orders);
    // make sure this returds orders as objects of class Order
    return orders;
  }

  static async findAllForUser(userId) {
    const [orders] = await db.execute(
      `SELECT * FROM orders WHERE userId = (?) ORDER BY date DESC`,
      [+userId]
    );

    return this.transformOrders(orders);
  }

  static async findById(orderId) {
    const query = `SELECT * FROM orders WHERE id = (?) LIMIT 1`;
    const [order] = await db.execute(query, [+orderId]);
    console.log('FIND ORDER BY ID: ', order);
    // make sure this returds orders as objects of class Order
    return order[0];
  }

  async save() {
    if (this.id) {
      // Update order - simplified: Only Admin can change Order status
      const query = `UPDATE orders SET status = (?) WHERE id = (?)`;
      await db.execute(query, [this.status, this.id]);
    } else {
      // Create new Order
      const orderCart = this.productData;
      const orderCartItems = orderCart.items;

      const order = [
        this.userData.id,
        new Date(),
        this.status,
        orderCart.totalQuantity,
        orderCart.totalPrice,
      ];

      const [orderResult] = await db.execute(
        'INSERT INTO orders (userId, date, status, total_quantity, total_price) VALUES (?, ?, ?, ?, ?)',
        order
      );
      const orderId = orderResult.insertId;

      for (const item of orderCartItems) {
        // add each item from cart to the order_product table
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
      }
    }
  }
}

module.exports = Order;
