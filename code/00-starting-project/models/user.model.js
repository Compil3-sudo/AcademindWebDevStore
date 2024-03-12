const bcrypt = require("bcryptjs");
const db = require("../data/database");

async function insertAddress(street, postalCode, city) {
  const query =
    "INSERT INTO addresses (street, postalCode, city) VALUES (?, ?, ?)";
  const values = [street, postalCode, city];

  console.log("Trying to insert address: ", ...values);

  try {
    const result = await db.execute(query, values);
    console.log("IMPORTANT");
    console.log(result);
    return 1;
  } catch (error) {
    console.log("ERROR");
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

  async signup() {
    // insert address into address table
    const addressResult = await insertAddress(
      this.address.street,
      this.address.postalCode,
      this.address.city
    );

    if (!addressResult) {
      console.log("Could not insert address into database.");
      return;
    } else {
      // encrypt user's password with bcrypt
      // insert user with address into users table
      const query =
        "INSERT INTO users (email, password, fullname, addressId) VALUES ?";

      const hashedPassword = await bcrypt.hash(this.password, 12);

      const values = [this.email, hashedPassword, this.fullname, addressResult];
      console.log(values);
      // try {
      //   const result = await db.execute(query, values);
      //   console.log(result);
      //   return 1;
      // } catch (error) {
      //   console.log(error);
      //   return 0;
      // }
    }
  }
}

module.exports = User;
