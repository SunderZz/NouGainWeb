<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol md="6">
        <h1 class="recipe-title">{{ recipe.title }}</h1>
        <p class="recipe-description">{{ recipe.description }}</p>
        <h3>Ingrédients</h3>
        <ul class="ingredients-list">
          <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
            {{ ingredient }}
          </li>
        </ul>
      </MDBCol>
      <MDBCol md="6">
        <img :src="recipe.image" alt="Recipe image" class="recipe-image" />
      </MDBCol>
    </MDBRow>
    <MDBRow>
      <MDBCol md="6">
        <h3>Étapes</h3>
        <ul class="steps-list">
          <li v-for="(step, index) in recipe.steps" :key="index">{{ step }}</li>
        </ul>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol } from "mdb-vue-ui-kit";

const route = useRoute();
const recipeId = route.params.id;
const recipe = ref({
  title: "",
  description: "",
  image: "",
  ingredients: [],
  steps: [],
});

const fetchRecipeDetails = async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/recipes_id?recipe=${recipeId}`);
    console.log("Recipe details:", response.data);
    
    const data = response.data;
    recipe.value = {
      title: data.Title,
      description: data.description,
      image: data.image,
      ingredients: data.ingredient.split(", ").map(item => item.trim()),
      steps: data.Recipe.split(", ").map(item => item.trim()),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la recette:", error);
  }
};

onMounted(fetchRecipeDetails);
</script>

<style scoped>
.recipe-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.recipe-description {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
}

.recipe-image {
  width: 70%;
  height: auto;
  border-radius: 10px;
}

.ingredients-list,
.steps-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.ingredients-list li,
.steps-list li {
  font-size: 1rem;
  margin-bottom: 5px;
}
</style>
