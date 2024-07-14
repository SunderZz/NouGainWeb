<template>
  <MDBContainer fluid class="mt-4 d-flex flex-column flex-grow-1">
    <MDBRow class="mb-4 flex-grow-1">
      <MDBCol md="6">
        <MDBCard class="h-100">
          <img :src="product.image" class="card-img-top" alt="Product image" />
        </MDBCard>
      </MDBCol>
      <MDBCol md="6">
        <div class="d-flex flex-column justify-content-between h-100">
          <div>
            <h2>{{ product.Name }}</h2>
            <p>{{ product.Description }}</p>
          </div>
          <div class="d-flex align-items-center">
            <div class="me-auto">
              <MDBBtn
                v-if="product.quantity > 0"
                @click="decrementQuantity"
                color="danger"
                >-</MDBBtn
              >
              <span v-if="product.quantity > 0" class="mx-2">{{
                product.quantity
              }}</span>
              <MDBBtn @click="incrementQuantity" color="primary">+</MDBBtn>
            </div>
          </div>
        </div>
      </MDBCol>
    </MDBRow>

    <MDBRow class="mb-4">
      <MDBCol>
        <h2>{{ product.Price_ht }} €</h2>
        <p>{{ product.Description }}</p>
      </MDBCol>
    </MDBRow>

    <MDBRow class="flex-grow-1">
      <MDBCol>
        <h2>Avis</h2>
        <div class="star-rating">
          <span v-for="star in 5" :key="star" class="star">&#9733;</span>
        </div>
        <ul>
          <li v-for="(comment, index) in comments" :key="index">
            {{ comment }}
          </li>
        </ul>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBBtn } from "mdb-vue-ui-kit";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

const product = ref({
  title: "",
  description: "",
  image: "",
  quantity: 0,
  price: 0,
  Id_Product: 0,
});

const comments = ref([]);
const selectedProducts = ref(new Set());

const fetchProduct = async () => {
  try {
    const productId = parseInt(route.params.id, 10);
    const storedProduct = store.getters.getProductById(productId);
    if (storedProduct) {
      product.value = storedProduct;
    } else {
      const response = await axios.get(
        `http://127.0.0.1:8000/products_by_id/?id=${route.params.id}`
      );
      const data = response.data;
      product.value = {
        title: data.Name,
        description: data.Description,
        image: data.imageUrl || "https://placehold.co/600x400",
        quantity: 0,
        price: data.Price_ht,
        Id_Product: data.Id_Product,
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
  }
};

onMounted(() => {
  fetchProduct();
});

const incrementQuantity = async () => {
  if (product.value.quantity === 0) {
    selectedProducts.value.add(product.value.title);
  }
  product.value.quantity++;
  localStorage.setItem(
    `product_${product.value.Id_Product}_quantity`,
    product.value.quantity
  );

  await addOrUpdateCart(product.value.Id_Product, product.value.quantity);

  store.commit("ADD_TO_CART", product.value);
  store.commit("UPDATE_PRODUCT_QUANTITY", {
    productId: product.value.Id_Product,
    quantity: product.value.quantity,
  });
};

const decrementQuantity = async () => {
  if (product.value.quantity > 0) {
    product.value.quantity--;
    localStorage.setItem(
      `product_${product.value.Id_Product}_quantity`,
      product.value.quantity
    );

    await addOrUpdateCart(product.value.Id_Product, product.value.quantity);

    if (product.value.quantity === 0) {
      await removeProduct(product.value.Id_Product);
      store.commit("REMOVE_FROM_CART", product.value.Id_Product);
    } else {
      store.commit("UPDATE_CART", {
        productId: product.value.Id_Product,
        quantity: product.value.quantity,
      });
    }

    store.commit("UPDATE_PRODUCT_QUANTITY", {
      productId: product.value.Id_Product,
      quantity: product.value.quantity,
    });

    if (product.value.quantity === 0) {
      selectedProducts.value.delete(product.value.title);
    }
  }
};

const removeProduct = async (productId) => {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    console.error("OrderId non trouvé dans le localStorage");
    return;
  }

  try {
    await axios.delete(`http://127.0.0.1:8000/linede/${orderId}/${productId}`);
    localStorage.removeItem(`product_${productId}_quantity`);
    store.commit("DECREMENT_CART_ITEM_COUNT"); 
  } catch (error) {
    console.error("Erreur lors de la suppression du produit du panier:", error);
  }
};

const emitSelectedProducts = () => {
  const selectedCount = selectedProducts.value.size;
};

const getUserFromToken = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("Token non trouvé");
    return null;
  }

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

const getCustomerById = async (customerId) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/customers_by_id?customers=${customerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error);
    return null;
  }
};

const addOrUpdateCart = async (productId, quantity) => {
  const user = await getUserFromToken();
  if (!user) {
    console.error("Utilisateur non connecté");
    return;
  }

  const customerId = user.Id_Users;
  const customer = await getCustomerById(customerId);
  if (!customer) {
    console.error("Client non trouvé");
    return;
  }

  let orderId = localStorage.getItem("orderId");
  if (!orderId) {
    try {
      const response = await axios.post("http://127.0.0.1:8000/orders/", {
        Command_Date: new Date().toISOString().split("T")[0],
        Status: false,
        Preference_Ship: "Standard",
        Ship_Date: null,
        Id_Casual: customer.Id_Casual,
      });
      orderId = response.data.id;
      localStorage.setItem("orderId", orderId);
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      return;
    }
  }

  const existingLine = await checkExistingLine(orderId, productId);
  if (existingLine) {
    try {
      await axios.put(`http://127.0.0.1:8000/linede/${orderId}/${productId}`, {
        Id_Orders: orderId,
        Id_Product: productId,
        qte: quantity,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du produit dans le panier:",
        error
      );
    }
  } else {
    try {
      await axios.post("http://127.0.0.1:8000/linede/orders", {
        Id_Orders: orderId,
        Id_Product: productId,
        qte: quantity,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit au panier:", error);
    }
  }
};

const checkExistingLine = async (orderId, productId) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/linede/${orderId}`);
    const data = response.data;
    if (Array.isArray(data)) {
      return data.find((line) => line.Id_Product === productId) || null;
    } else if (data && data.Id_Product === productId) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'existence de la ligne:",
      error
    );
    return null;
  }
};

watch(
  product,
  () => {
    emitSelectedProducts();
  },
  { deep: true }
);
</script>

<style scoped>
.star-rating {
  font-size: 24px;
}

.star {
  color: #ffd700;
}
</style>
