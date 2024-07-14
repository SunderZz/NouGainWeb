import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state: {
    cart: [],
    products: [],
  },
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    ADD_TO_CART(state, product) {
      const existingProduct = state.cart.find(
        (item) => item.Id_Product === product.Id_Product
      );
      if (!existingProduct) {
        state.cart.push({ ...product, quantity: 1 });
      } else {
        existingProduct.quantity++;
      }
    },
    REMOVE_FROM_CART(state, productId) {
      const product = state.products.find((p) => p.Id_Product === productId);
      if (product) {
        product.quantity = 0;
      }
      state.cart = state.cart.filter((p) => p.Id_Product !== productId);
    },
    UPDATE_CART(state, { productId, quantity }) {
      const product = state.cart.find((item) => item.Id_Product === productId);
      if (product) {
        product.quantity = quantity;
        if (product.quantity === 0) {
          state.cart = state.cart.filter(
            (item) => item.Id_Product !== productId
          );
        }
      }
    },
    UPDATE_PRODUCT_QUANTITY(state, { productId, quantity }) {
      const product = state.products.find(
        (item) => item.Id_Product === productId
      );
      if (product) {
        product.quantity = quantity;
      }
    },
    DECREMENT_CART_ITEM_COUNT(state) {
      if (state.cart.length > 0) {
        state.cart.pop();
      }
    },
    RESET_CART_ITEM_COUNT(state) {
      state.cart = [];
    },
  },
  getters: {
    cartItemCount: (state) => {
      return state.cart.length;
    },
    getProductById: (state) => (id) => {
      return state.products.find((product) => product.Id_Product === id);
    },
  },
  actions: {
    fetchProducts({ commit }) {
      return axios
        .get("http://127.0.0.1:8000/products/")
        .then((response) => {
          const products = response.data.map((product) => {
            const storedQuantity = localStorage.getItem(
              `product_${product.Id_Product}_quantity`
            );
            return {
              ...product,
              quantity: storedQuantity ? parseInt(storedQuantity, 10) : 0,
              imageUrl: product.imageUrl || "https://placehold.co/600x400",
            };
          });
          commit("SET_PRODUCTS", products);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des produits:", error);
        });
    },
  },
});

export default {
  store,
};
