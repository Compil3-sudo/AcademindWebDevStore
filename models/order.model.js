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
    // PostgreSQL orders Schema (What I receive):
    // order.id
    // order.user_id
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
      SELECT u.email, u.fullname AS name, address.*
      FROM users AS u
      JOIN addresses AS address ON u.address_id = address.id
      WHERE u.id = $1
      LIMIT 1
    `;
    const { rows: userData } = await db.query(userDataQuery, [order.user_id]);

    const userAddressData = {
      email: userData[0].email,
      name: userData[0].name,
      address: {
        street: userData[0].street,
        postalCode: userData[0].postalCode,
        city: userData[0].city,
      },
    };

    // order_product PostgreSQL schema:
    // id
    // order_d
    // product_d
    // quantity (quantity of a product from the cart)
    // single_price
    // total_price (single_price * quantity)
    const orderProductsQuery = `
      SELECT op.*, p.*
      FROM order_product op
      JOIN products p ON op.product_id = p.id
      WHERE op.order_id = $1
    `;
    const { rows: orderProducts } = await db.query(orderProductsQuery, [
      order.id,
    ]);

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
    const { rows: orders } = await db.query(
      `SELECT * FROM orders ORDER BY date DESC`
    );
    return this.transformOrders(orders);
  }

  static async findAllForUser(userId) {
    const { rows: orders } = await db.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY date DESC`,
      [+userId]
    );

    return this.transformOrders(orders);
  }

  static async findById(orderId) {
    const query = `SELECT * FROM orders WHERE id = $1 LIMIT 1`;
    const { rows: order } = await db.query(query, [+orderId]);
    // order is an array with only 1 order, because only 1 order can exist with that id
    // however transformOrders needs an array to map => send array
    const transformedOrder = await this.transformOrders(order); // returns array with 1 element
    return transformedOrder[0]; // send back only the order
  }

  async save() {
    if (this.id) {
      // Update order - simplified: Only Admin can change Order status
      const query = `UPDATE orders SET status = $1 WHERE id = $2`;
      await db.query(query, [this.status, this.id]);
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

      const { rows: orderResult } = await db.query(
        'INSERT INTO orders (user_id, date, status, total_quantity, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        order
      );
      const orderId = orderResult[0].id;

      for (const item of orderCartItems) {
        // add each item from cart to the order_product table
        const orderProduct = [
          orderId,
          item.product.id,
          item.quantity,
          item.product.price,
          item.totalPrice,
        ];

        await db.query(
          'INSERT INTO order_product (order_id, product_id, quantity, single_price, total_price) VALUES ($1, $2, $3, $4, $5)',
          orderProduct
        );
      }
    }
  }
}

module.exports = Order;
