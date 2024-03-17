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
    const { rows: product } = await db.query(
      `SELECT * FROM products WHERE id = $1 LIMIT 1`,
      [productId]
    );

    if (!product[0]) {
      const error = new Error('Could not find product with provided id.');
      error.code = 404;
      throw error;
    }
    return new Product(product[0]);
  }

  static async findAll() {
    const query = `SELECT * FROM products`;
    const { rows: products } = await db.query(query);

    return products.map((product) => {
      return new Product(product);
    });
  }

  static async findMultiple(ids) {
    // get all products from PostgreSQL products table
    // where the id is in the array of ids
    if (ids.length === 0) {
      return [];
    }
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    const query = `SELECT * FROM products WHERE id IN (${placeholders})`;

    const { rows: products } = await db.query(query, ids);

    return products.map((productDocument) => new Product(productDocument));
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
        SET title = $1,
            summary = $2,
            price = $3,
            description = $4
        WHERE id = $5;
        `;
        productData.pop(); // remove the image. it stays the same
      } else {
        query = `
      UPDATE products
      SET title = $1,
          summary = $2,
          price = $3,
          description = $4,
          image = $5
      WHERE id = $6;
      `;
      }

      productData.push(this.id); // productData did not contain the id, needed for PostgreSQL

      await db.query(query, productData);
    } else {
      const query = `INSERT INTO products (title, summary, price, description, image) VALUES ($1, $2, $3, $4, $5)`;

      await db.query(query, productData);
    }
  }

  async replaceImage(newImage) {
    this.image = newImage;
    this.updateImageData();
  }

  async remove() {
    return await db.query(`DELETE FROM products WHERE id = $1`, [this.id]);
  }
}

module.exports = Product;
