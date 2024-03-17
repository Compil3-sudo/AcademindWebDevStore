const bcrypt = require('bcryptjs');
const db = require('../data/database');

async function insertAddress(street, postalCode, city) {
  const query =
    'INSERT INTO addresses (street, postal_code, city) VALUES ($1, $2, $3) RETURNING id';
  const values = [street, postalCode, city];

  try {
    const { rows: result } = await db.query(query, values);
    return result[0].id;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

class User {
  constructor(email, password, fullname, street, postal, city) {
    this.email = email;
    this.password = password;
    this.fullname = fullname;
    this.address = {
      street: street,
      postalCode: postal,
      city: city,
    };
  }

  static async findById(userId) {
    const query = `
      SELECT email, fullname, addressId
      FROM users 
      WHERE id = $1 LIMIT 1`;
    const { rows: result } = await db.query(query, [+userId]); // convert userId from string to INT
    const user = { ...result.rows[0], id: userId };
    return user;
  }

  async getUserByEmail() {
    const { rows: result } = await db.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [this.email]
    );

    return result[0];
  }

  async existsAlready() {
    const existingUser = await this.getUserByEmail();

    if (existingUser) {
      return true;
    } else {
      return false;
    }
  }

  async signup() {
    // insert address into address table
    const addressResult = await insertAddress(
      this.address.street,
      this.address.postalCode,
      this.address.city
    );

    if (!addressResult) {
      console.log('Could not insert address into database.');
      throw new Error('Could not insert address into database.');
    } else {
      // encrypt user's password with bcrypt
      // insert user with address into users table
      const query =
        'INSERT INTO users (email, password, fullname, address_id) VALUES ($1, $2, $3, $4)';

      const hashedPassword = await bcrypt.hash(this.password, 12);

      const values = [this.email, hashedPassword, this.fullname, addressResult];

      try {
        await db.query(query, values);
        return 1;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    }
  }

  hasMatchingPassword(hashedPassword) {
    return bcrypt.compare(this.password, hashedPassword);
  }
}

module.exports = User;
