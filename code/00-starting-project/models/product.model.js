const db = require('../data/database');

class Product {
  constructor(productData) {
    this.title = productData.title;
    this.summary = productData.summary;
    this.price = +productData.price;
    this.description = productData.description;
    this.image = productData.image; // name of the image file
    this.imagePath = `product-data/images/${productData.image}`;
    this.imageUrl = `/products/assets/images/${productData.image}`;
    if (productData.id) {
      this.id = productData.id.toString(); // string or int ?
    }
  }

  static async findAll() {
    const query = `SELECT * FROM products`;
    const [products] = await db.query(query);

    return products.map((product) => {
      return new Product(product);
    });
  }

  async save() {
    const productData = [
      this.title,
      this.summary,
      this.price,
      this.description,
      this.image,
    ];

    const query = `INSERT INTO products (title, summary, price, description, image) VALUES (?, ?, ?, ?, ?)`;

    try {
      await db.execute(query, productData);
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

module.exports = Product;
