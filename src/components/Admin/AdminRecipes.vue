<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4 align-items-center">
      <MDBCol md="6">
        <MDBDropdown v-model="dropdown">
          <MDBDropdownToggle
            tag="a"
            class="btn btn-primary"
            @click="dropdown = !dropdown"
            id="dropdownMenuLink"
          >
            Menu
          </MDBDropdownToggle>
          <MDBDropdownMenu aria-labelledby="dropdownMenuLink">
            <MDBDropdownItem tag="router-link" to="/AdminHome">Acceuil</MDBDropdownItem>
            <MDBDropdownItem tag="router-link" to="/AdminProducteurs">Producteurs</MDBDropdownItem>
            <MDBDropdownItem tag="router-link" to="/AdminRecipes">Recettes</MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBCol>
      <MDBCol md="6" class="text-end">
        <MDBBtn tag="router-link" to="/AdminCreateRecipePage" color="success">
          Créer une nouvelle recette
        </MDBBtn>
      </MDBCol>
    </MDBRow>

    <h3>Recettes</h3>
    <div class="list-container">
      <MDBRow>
        <MDBCol
          v-for="(recipe) in recipes"
          :key="recipe.Id_Recipes"
          md="12"
          class="mb-3"
        >
          <MDBCard @click="openRecipe(recipe.Id_Recipes)" class="cursor-pointer">
            <MDBCardBody class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h5>{{ recipe.Title }}</h5>
                <p>{{ recipe.description }}</p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </div>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBBtn
} from 'mdb-vue-ui-kit';
import axios from 'axios';

interface Recipe {
  description: string;
  Title: string;
  Recipe: string;
  ingredient: string;
  Id_Recipes: number;
}

const recipes = ref<Recipe[]>([]);
const dropdown = ref<boolean>(false);
const router = useRouter();

const fetchRecipes = async (): Promise<void> => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/recipes/');
    recipes.value = response.data;
  } catch (error) {
  }
};

const openRecipe = (id: number): void => {
  router.push(`/AdminConfigRecipes/${id}`);
};

onMounted((): void => {
  fetchRecipes();
});
</script>

<style scoped>
.list-container {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
