<template>
  <MDBContainer fluid class="mb-2">
    <MDBRow class="mb-4" style="border-bottom: 1px solid">
      <div class="text-center">Produit</div>
      <MDBCol class="d-flex justify-content-end">
        <div class="dropdown">
          <button class="dropdown-toggle" @click="toggleDropdown">
            Trier par
          </button>
          <div v-show="dropdown1" class="dropdown-menu">
            <button class="dropdown-item" @click="sortProducts('priceAsc')">
              Prix croissant
            </button>
            <button class="dropdown-item" @click="sortProducts('priceDesc')">
              Prix décroissant
            </button>
            <button class="dropdown-item" @click="sortProducts('promotion')">
              Promotion
            </button>
          </div>
        </div>
        <hr />
      </MDBCol>
    </MDBRow>

    <MDBRow>
      <MDBCol md="2" style="border-right: 1px solid">
        <div v-for="(filter, index) in filters" :key="index" class="mb-4">
          <h5 class="border-bottom pb-2">{{ filter.title }}</h5>
          <div
            v-for="(option, idx) in filter.options"
            :key="idx"
            class="form-check"
          >
            <MDBCheckbox
              :label="option.label"
              v-model="option.checked"
              @change="filterProducts"
            />
          </div>
        </div>
      </MDBCol>

      <MDBCol md="10">
        <MDBRow>
          <MDBCol
            v-for="(product, index) in filteredProducts"
            :key="index"
            md="4"
            class="mb-4"
          >
            <MDBCard>
              <MDBCardBody>
                <MDBCardTitle class="text-center">{{
                  product.Name
                }}</MDBCardTitle>
                <a :href="`#/ProductDetail/${product.Id_Product}`">
                  <MDBCardImg
                    :src="product.imageUrl || defaultImage"
                    top
                    alt="Product image"
                  />
                </a>
                <MDBCardText>{{ product.Description }}</MDBCardText>
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center">
                    <MDBBtn
                      v-if="product.quantity > 0"
                      @click="decrementQuantity(product, index)"
                      color="danger"
                      >-</MDBBtn
                    >
                    <span v-if="product.quantity > 0" class="mx-2">{{
                      product.quantity
                    }}</span>
                    <MDBBtn @click="incrementQuantity(product)" color="primary"
                      >+</MDBBtn
                    >
                  </div>
                  <span class="ms-2"
                    >{{
                      product.quantity > 0
                        ? (product.Price_ht * product.quantity).toFixed(2)
                        : product.Price_ht.toFixed(2)
                    }}
                    €</span
                  >
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCheckbox,
  MDBCard,
  MDBCardImg,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
} from "mdb-vue-ui-kit";
import { useStore } from "vuex";

const store = useStore();

const dropdown1 = ref(false);

const toggleDropdown = () => {
  dropdown1.value = !dropdown1.value;
};

const filters = ref([
  {
    title: "Saison",
    options: [],
  },
]);

const products = ref([]);
const filteredProducts = ref([]);
const selectedProducts = ref(new Set());
const defaultImage = "https://via.placeholder.com/300";

const fetchProducts = async () => {
  await store.dispatch("fetchProducts");
  products.value = store.state.products;
  filteredProducts.value = products.value;
};

const fetchFilters = async () => {
  try {
    const seasonResponse = await axios.get("http://127.0.0.1:8000/seasons");
    filters.value[0].options = seasonResponse.data.map((season) => ({
      label: season.Name,
      id: season.Id_Season,
      checked: false,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des filtres:", error);
  }
};

onMounted(() => {
  fetchProducts();
  fetchFilters();
});

const incrementQuantity = async (product) => {
  if (product.quantity === 0) {
    selectedProducts.value.add(product.Name);
  }
  product.quantity++;
  localStorage.setItem(
    `product_${product.Id_Product}_quantity`,
    product.quantity
  );

  await addOrUpdateCart(product.Id_Product, product.quantity);

  store.commit("ADD_TO_CART", product);
  store.commit("UPDATE_PRODUCT_QUANTITY", {
    productId: product.Id_Product,
    quantity: product.quantity,
  });
};

const decrementQuantity = async (product, index) => {
  if (product.quantity > 0) {
    product.quantity--;
    localStorage.setItem(
      `product_${product.Id_Product}_quantity`,
      product.quantity
    );

    await addOrUpdateCart(product.Id_Product, product.quantity);

    if (product.quantity === 0) {
      store.commit("REMOVE_FROM_CART", product.Id_Product);
    } else {
      store.commit("UPDATE_CART", {
        productId: product.Id_Product,
        quantity: product.quantity,
      });
    }

    store.commit("UPDATE_PRODUCT_QUANTITY", {
      productId: product.Id_Product,
      quantity: product.quantity,
    });

    if (product.quantity === 0) {
      selectedProducts.value.delete(product.Name);
    }
  }
};

const removeProduct = async (productId, index) => {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    console.error("OrderId non trouvé dans le localStorage");
    return;
  }

  try {
    await axios.delete(`http://127.0.0.1:8000/linede/${orderId}/${productId}`);
    // Ne pas supprimer le produit de products.value, juste mettre à jour la quantité dans le localStorage et le store
    localStorage.removeItem(`product_${productId}_quantity`);
    store.commit("DECREMENT_CART_ITEM_COUNT");
  } catch (error) {
    console.error("Erreur lors de la suppression du produit du panier:", error);
  }
};

const emitSelectedProducts = () => {
  const selectedCount = selectedProducts.value.size;
};

const sortProducts = (criteria: string) => {
  switch (criteria) {
    case "priceAsc":
      filteredProducts.value.sort((a, b) => a.Price_ht - b.Price_ht);
      break;
    case "priceDesc":
      filteredProducts.value.sort((a, b) => b.Price_ht - a.Price_ht);
      break;
    case "promotion":
      filteredProducts.value.sort(
        (a, b) => (b.Discount || 0) - (a.Discount || 0)
      );
      break;
  }
};

const selectSeason = (option) => {
  filters.value[0].options.forEach((opt) => {
    if (opt !== option) opt.checked = false;
  });

  option.checked = !option.checked;

  filterProducts();
};

const filterProducts = async () => {
  const activeFilters = filters.value.flatMap((filter) =>
    filter.options.filter((option) => option.checked)
  );

  if (activeFilters.length === 0) {
    filteredProducts.value = products.value;
    return;
  }

  const selectedSeasonIds = activeFilters.map((filter) => filter.id);

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/products/season?is_on=${selectedSeasonIds.join(
        ","
      )}`
    );
    const seasonProducts = response.data;

    filteredProducts.value = products.value.filter((product) => {
      return seasonProducts.some((sp) => sp.Id_Product === product.Id_Product);
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits par saison:",
      error
    );
  }
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

      orderId = response.data.Id_Orders;
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
  products,
  () => {
    emitSelectedProducts();
  },
  { deep: true }
);

watch(
  filters,
  () => {
    filterProducts();
  },
  { deep: true }
);
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-toggle {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}
.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}
.dropdown-menu .dropdown-item {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}
.dropdown-menu .dropdown-item:hover {
  background-color: #f1f1f1;
}
.dropdown:hover .dropdown-menu {
  display: block;
}
.custom-btn {
  height: 35px;
}
.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: red;
  color: white;
}
</style>
