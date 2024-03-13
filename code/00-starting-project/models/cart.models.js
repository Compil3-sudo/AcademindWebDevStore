class Cart {
  constructor(items = [], totalQuantity = 0, totalPrice = 0) {
    this.items = items;
    this.totalQuantity = totalQuantity;
    this.totalPrice = totalPrice;
  }

  addItem(product) {
    const cartItem = {
      product: product,
      quantity: 1,
      totalPrice: product.price,
    };

    const existingProductIndex = this.items.findIndex(
      (item) => item.id === product.id
    );

    if (existingProductIndex) {
      cartItem.quantity++;
      cartItem.totalPrice += product.price;
      this.items[existingProductIndex] = cartItem;

      this.totalQuantity++;
      this.totalPrice += product.price;
      return;
    }

    this.totalQuantity++;
    this.totalPrice += product.price;

    this.items.push(cartItem);
  }
}

module.exports = Cart;
