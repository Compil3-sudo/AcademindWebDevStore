const db = require('../data/database');
const Product = require('./product.model');

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
    // MySQL orders Schema (What I receive):
    // order.id
    // order.userId
    // order.date
    // order.status
    // order.total_quantity (total quantity of all the cart items)
    // order.total_price (total price of all the cart items)

    // user data, which I need:
    // userdata = {
    //   email,
    //   name,
    //   address: {
    //     street,
    //     postalCode,
    //     city,
    //   },
    // };
    const userDataQuery = `
      SELECT user.email, user.fullname AS name, address.*
      FROM users user
      JOIN addresses address ON user.addressId = address.id
      WHERE user.id = (?)
      LIMIT 1
    `;
    const [userData] = await db.execute(userDataQuery, [order.userId]);

    const userAddressData = {
      email: userData[0].email,
      name: userData[0].name,
      address: {
        street: userData[0].street,
        postalCode: userData[0].postalCode,
        city: userData[0].city,
      },
    };

    // order_product MySQL schema:
    // id
    // orderId
    // productId
    // quantity (quantity of a product from the cart)
    // single_price
    // total_price (single_price * quantity)
    const orderProductsQuery = `
      SELECT op.*, p.*
      FROM order_product op
      JOIN products p ON op.productId = p.id
      WHERE op.orderId = ?
    `;

    const [orderProducts] = await db.execute(orderProductsQuery, [order.id]);

    const cartItems = orderProducts.map((orderProduct) => {
      const product = new Product(orderProduct);

      return {
        product,
        quantity: orderProduct.quantity,
        totalPrice: +orderProduct.total_price,
      };
    });

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

    return new Order(
      productData,
      userAddressData,
      order.status,
      order.date,
      order.id
    );
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
