const db = require('../data/database');

class Product {
  constructor(productData) {
    this.title = productData.title;
    this.summary = productData.summary;
    this.price = +productData.price;
    this.description = productData.description;
    this.image = productData.image; // name of the image file

    this.updateImageData();

    if (productData.id) {
      this.id = productData.id;
    }
  }

  static async findById(productId) {
    const [product] = await db.query(`SELECT * FROM products WHERE id = (?)`, [
      productId,
    ]);

    if (!product) {
      const error = new Error('Could not find product with provided id.');
      error.code = 404;
      throw error;
    }
    return new Product(product[0]);
  }

  static async findAll() {
    const query = `SELECT * FROM products`;
    const [products] = await db.query(query);

    return products.map((product) => {
      return new Product(product);
    });
  }

  updateImageData() {
    this.imagePath = `product-data/images/${this.image}`;
    this.imageUrl = `/products/assets/images/${this.image}`;
  }

  async save() {
    const productData = [
      this.title,
      this.summary,
      this.price,
      this.description,
      this.image,
    ];

    if (this.id) {
      let query;

      if (!this.image) {
        query = `
          UPDATE products
          SET title = (?),
              summary = (?),
              price = (?),
              description = (?)
          WHERE id = (?);
          `;
        productData.pop(); // remove the image. it stays the same
      } else {
        query = `
        UPDATE products
        SET title = (?),
            summary = (?),
            price = (?),
            description = (?),
            image = (?)
        WHERE id = (?);
        `;
      }

      productData.push(this.id); // productData did not contain the id, needed for MySQL

      await db.execute(query, productData);
    } else {
      const query = `INSERT INTO products (title, summary, price, description, image) VALUES (?, ?, ?, ?, ?)`;

      await db.execute(query, productData);
    }
  }

  async replaceImage(newImage) {
    this.image = newImage;
    this.updateImageData();
  }

  async remove() {
    return await db.query(`DELETE FROM products WHERE id = (?)`, [this.id]);
  }
}

module.exports = Product;
