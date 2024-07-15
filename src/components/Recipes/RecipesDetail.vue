<template>
  <MDBContainer fluid class="mt-4" style="min-height: 100vh;">
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
      <MDBCol md="12">
        <h3>Étapes</h3>
        <ol class="steps-list">
          <li v-for="(step, index) in recipe.steps" :key="index">{{ step }}</li>
        </ol>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol } from "mdb-vue-ui-kit";

interface Recipe {
  title: string;
  description: string;
  image: string;
  ingredients: string[];
  steps: string[];
}

const route = useRoute();
const recipeId = route.params.id as string;
const recipe = ref<Recipe>({
  title: "",
  description: "",
  image: "",
  ingredients: [],
  steps: [],
});

const fetchRecipeDetails = async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/recipes_id?recipe=${recipeId}`);
    const data = response.data;
    recipe.value = {
      title: data.Title,
      description: data.description,
      image: data.image,
      ingredients: data.ingredient.split('.').map((item: string) => item.trim()),
      steps: data.Recipe.split('.').map((item: string) => item.trim()),
    };
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchRecipeDetails);
</script>

<style scoped>
body, html {
  height: 100%;
  margin: 0;
}

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
  width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.ingredients-list,
.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredients-list li,
.steps-list li {
  font-size: 1rem;
  margin-bottom: 10px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.steps-list {
  counter-reset: step;
}

.steps-list li {
  counter-increment: step;
  position: relative;
  padding-left: 30px;
}

.steps-list li::before {
  content: counter(step) ". ";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #007bff;
}
</style>
