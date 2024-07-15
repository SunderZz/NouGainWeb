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
          class="col-md-6 d-flex justify-content-center align-items-center"
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
            <div v-if="products.length || recipes.length" class="search-results">
              <template v-if="products.length">
                <h5>Produits</h5>
                <ul>
                  <li v-for="product in products" :key="product.Id_Product">
                    <router-link :to="`/ProductDetail/${product.Id_Product}`">{{ product.Name }}</router-link>
                  </li>
                </ul>
              </template>
              <template v-if="recipes.length">
                <h5>Recettes</h5>
                <ul>
                  <li v-for="recipe in recipes" :key="recipe.Id_Recipes">
                    <router-link :to="`/RecipesDetail/${recipe.Id_Recipes}`">{{ recipe.Title }}</router-link>
                  </li>
                </ul>
              </template>
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
              <span class="badge badge-pill badge-danger">{{ cartItemCount }}</span>
            </MDBNavbarBrand>
            <MDBBtn
              v-if="authToken"
              class="ms-3 btn-sm"
              @click="logout"
              style="background-color: red; height: 25px; width: 15px;"
            >
              <MDBIcon fas icon="sign-out-alt" />
            </MDBBtn>
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
import { useRouter } from "vue-router";
import axios from "axios";

interface Product {
  Id_Product: number;
  Name: string;
  Active: boolean;
}

interface Recipe {
  Id_Recipes: number;
  Title: string;
}

const store = useStore();
const router = useRouter();
const cartItemCount = computed<number>(() => store.getters.cartItemCount);

const searchQuery = ref<string>("");
const products = ref<Product[]>([]);
const recipes = ref<Recipe[]>([]);
const errorMessage = ref<string>("");

const authToken = localStorage.getItem("authToken");
const userProfileLink = ref<string>("/Login");
const userId = ref<number | null>(null);

const onInput = () => {
  if (searchQuery.value.length >= 2) {
    search();
  }
};

const search = async () => {
  try {
    const [productResponse, recipeResponse] = await Promise.all([
      axios.get<Product[]>("http://127.0.0.1:8000/products/", {
        params: { query: searchQuery.value },
      }),
      axios.get<Recipe[]>("http://127.0.0.1:8000/recipes/", {
        params: { query: searchQuery.value },
      }),
    ]);

    products.value = productResponse.data
      .filter(
        (product) =>
          product.Active &&
          product.Name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    recipes.value = recipeResponse.data.filter(
      (recipe) =>
        recipe &&
        recipe.Title &&
        recipe.Title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  } catch (error: any) {
    errorMessage.value =
      "Erreur lors de la récupération des produits ou recettes: " +
      error.message;
  }
};

const checkUserProfile = async () => {
  if (!authToken) {
    return;
  }
  try {
    const userResponse = await axios.get<{ Id_Users: number }>(
      "http://127.0.0.1:8000/users_by_token",
      {
        params: { token: authToken },
      }
    );

    userId.value = userResponse.data.Id_Users;

    try {
      const producerResponse = await axios.get<{ Id_Producers: number }>(
        `http://127.0.0.1:8000/producers_by_user/${userId.value}`
      );
      
      if (producerResponse.data.Id_Producers) {
        userProfileLink.value = "/ProfilAgriculteur";
      } else {
        userProfileLink.value = "/ProfilCustomer";
      }
    } catch (producerError: any) {
      userProfileLink.value = "/ProfilCustomer";
    }
  } catch (error: any) {
    userProfileLink.value = "/Login";
  }
};

const logout = async () => {
  if (userId.value === null) {
    return;
  }
  
  try {
    await axios.delete("http://127.0.0.1:8000/users/logout", {
      data: { user_id: userId.value },
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    Object.keys(localStorage).forEach((key) => {
      if (key.toLowerCase().includes("token")) {
        localStorage.removeItem(key);
      }
    });
    router.push("/").then(() => {
      location.reload();
    });
  } catch (error: any) {
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
  max-width: 500px;
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
