<template>
  <MDBNavbar expand="lg" container="fluid" style="border: none">
    <div class="container-fluid">
      <div class="row w-100">
        <div class="col-md-3 d-flex justify-content-start align-items-center">
          <MDBNavbarBrand tag="router-link" to="/">
            <MDBIcon icon="home" size="sm" />
          </MDBNavbarBrand>
        </div>
        <div
          class="col-md-6 d-flex justify-content-center align-items-center position-relative"
        >
          <form class="d-flex input-group w-75" @submit.prevent="search">
            <input
              type="search"
              class="form-control"
              placeholder="Rechercher"
              aria-label="Search"
              v-model="searchQuery"
              @input="onInput"
            />
            <MDBBtn
              class="custom-btn"
              style="background-color: white"
              @click="search"
            >
              <MDBIcon icon="search" />
            </MDBBtn>
          </form>
          <div class="search-results-container" v-if="searchQuery.length >= 2">
            <div
              v-if="products.length || recipes.length"
              class="search-results"
            >
              <h5>Produits</h5>
              <ul v-if="products.length">
                <li v-for="product in products" :key="product.id">
                  {{ product.Name }}
                </li>
              </ul>
              <h5>Recettes</h5>
              <ul v-if="recipes.length">
                <li v-for="recipe in recipes" :key="recipe.id">
                  {{ recipe.Title }}
                </li>
              </ul>
            </div>
            <div v-else class="no-results">
              <p>Aucun résultat trouvé.</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 d-flex justify-content-end align-items-center">
          <MDBNavbarNav class="mb-2 mb-lg-0 d-flex">
            <MDBNavbarItem tag="router-link" to="/ProductList" active>
              Boutique
            </MDBNavbarItem>
            <MDBNavbarItem tag="router-link" to="/Recipes" active>
              Recettes
            </MDBNavbarItem>
            <MDBNavbarItem tag="router-link" to="/AgriculteurList" active>
              Producteurs
            </MDBNavbarItem>
            <MDBNavbarBrand :tag="'router-link'" :to="userProfileLink">
              <MDBIcon icon="user" class="me-3" size="sm" />
            </MDBNavbarBrand>
            <MDBNavbarBrand tag="router-link" to="/Cart">
              <MDBIcon icon="shopping-cart" size="sm" />
              <span class="badge badge-pill badge-danger">{{
                cartItemCount
              }}</span>
            </MDBNavbarBrand>
          </MDBNavbarNav>
        </div>
      </div>
    </div>
  </MDBNavbar>
</template>

<script setup lang="ts">
import {
  MDBBtn,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBIcon,
} from "mdb-vue-ui-kit";
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";

const store = useStore();
const cartItemCount = computed(() => store.getters.cartItemCount);

const searchQuery = ref("");
const products = ref([]);
const recipes = ref([]);
const errorMessage = ref("");

const authToken = localStorage.getItem("authToken");
const userProfileLink = ref("/Login");

const onInput = () => {
  if (searchQuery.value.length >= 2) {
    search();
  }
};

const search = async () => {
  try {
    const [productResponse, recipeResponse] = await Promise.all([
      axios.get("http://127.0.0.1:8000/products/", {
        params: { query: searchQuery.value },
      }),
      axios.get("http://127.0.0.1:8000/recipes/", {
        params: { query: searchQuery.value },
      }),
    ]);

    products.value = productResponse.data.filter(
      (product) =>
        product &&
        product.Name &&
        product.Name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    recipes.value = recipeResponse.data.filter(
      (recipe) =>
        recipe &&
        recipe.Title &&
        recipe.Title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  } catch (error) {
    errorMessage.value =
      "Erreur lors de la récupération des produits ou recettes: " +
      error.message;
    console.error(
      "Erreur lors de la récupération des produits ou recettes:",
      error
    );
  }
};

const checkUserProfile = async () => {
  if (!authToken) {
    return;
  }
  try {
    const userResponse = await axios.get(
      "http://127.0.0.1:8000/users_by_token",
      {
        params: { token: authToken },
      }
    );

    const userId = userResponse.data.Id_Users;

    try {
      const producerResponse = await axios.get(
        `http://127.0.0.1:8000/producers/${userId}`
      );

      if (producerResponse.data.Id_Producers) {
        userProfileLink.value = "/ProfilAgriculteur";
      } else {
        userProfileLink.value = "/ProfilCustomer";
      }
    } catch (producerError) {
      userProfileLink.value = "/ProfilCustomer";
    }
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du profil utilisateur:",
      error
    );
    userProfileLink.value = "/Login";
  }
};

onMounted(() => {
  checkUserProfile();
});
</script>

<style>
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
.search-results-container {
  width: 100%;
  max-width: 600px;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.search-results {
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}
.search-results h5 {
  margin-top: 10px;
}
.search-results ul {
  list-style-type: none;
  padding: 0;
}
.search-results li {
  background-color: #f8f9fa;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
}
.no-results {
  padding: 10px;
  color: #999;
}
</style>
