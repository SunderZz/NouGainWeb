<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol>
        <a
          v-for="(recipe, index) in recipes"
          :key="index"
          :href="`#/RecipesDetail/${recipe.Id_Recipes}`"
          class="recipe-card-link"
        >
          <div class="recipe-card d-flex mb-4">
            <img
              :src="recipe.image"
              alt="Recipe image"
              class="recipe-image me-3"
            />
            <div class="recipe-info flex-grow-1">
              <h5 class="recipe-title mb-1">{{ recipe.Title }}</h5>
              <p class="recipe-description mb-0">{{ recipe.description }}</p>
            </div>
          </div>
        </a>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol } from "mdb-vue-ui-kit";

interface Recipe {
  Id_Recipes: number;
  Title: string;
  description: string;
  image: string;
}

const recipes = ref<Recipe[]>([]);

const fetchRecipes = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/recipes/");
    const data = response.data;
    for (const recipe of data) {
      try {
        const imageResponse = await axios.get(
          `http://127.0.0.1:8000/produit_image/?produit_image_id=${recipe.Id_Recipes}&field_name=Id_Recipes`,
          { responseType: "blob" }
        );
        const imageUrl = URL.createObjectURL(imageResponse.data);
        recipe.image = imageUrl;
      } catch (error) {
        recipe.image = "https://via.placeholder.com/150";
      }
    }
    recipes.value = data;
  } catch (error) {
  }
};

onMounted(fetchRecipes);
</script>
<style scoped>
.recipe-card-link {
  text-decoration: none;
  color: inherit;
}

.recipe-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  transition: transform 0.3s;
}

.recipe-card:hover {
  transform: scale(1.02);
}

.recipe-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  border-radius: 10px;
}

.recipe-info {
  flex-grow: 1;
}

.recipe-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.recipe-description {
  font-size: 1rem;
  color: #666;
}
</style>
