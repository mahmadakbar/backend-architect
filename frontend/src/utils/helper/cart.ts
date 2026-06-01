import { ICartItem, IApiResProduct } from "@interfaces/api";

const CART_KEY = "shopping_cart";

export const getCart = (): ICartItem[] => {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: ICartItem[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (
  product: IApiResProduct,
  quantity: number = 1,
): ICartItem[] => {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(
    (item) => item.product.id === product.id,
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }

  saveCart(cart);
  return cart;
};

export const updateCartItemQuantity = (
  productId: number,
  quantity: number,
): ICartItem[] => {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.product.id === productId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId: number): ICartItem[] => {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.product.id !== productId);
  saveCart(updatedCart);
  return updatedCart;
};

export const clearCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => {
    return total + parseFloat(item.product.price) * item.quantity;
  }, 0);
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};
