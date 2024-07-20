<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol md="8">
        <MDBInput
          v-model="recipe.title"
          label="Titre de la recette"
          type="text"
          class="mb-3"
        />

        <MDBInput
          v-model="recipe.description"
          label="Description"
          type="textarea"
          class="mb-3 description-input"
        />

        <div class="mb-3">
          <h5>Ingrédients</h5>
          <MDBRow
            v-for="(ingredient, index) in ingredientsList"
            :key="index"
            class="mb-2 align-items-center"
          >
            <MDBCol md="10">
              <MDBInput
                v-model="ingredientsList[index]"
                label="Ingrédient"
                type="text"
              />
            </MDBCol>
            <MDBCol md="2">
              <MDBBtn color="danger" @click="removeIngredient(index)"
                >Supprimer</MDBBtn
              >
            </MDBCol>
          </MDBRow>
          <MDBBtn color="primary" @click="addIngredient"
            >Ajouter un ingrédient</MDBBtn
          >
        </div>

        <div class="mb-3">
          <h5>Étapes</h5>
          <MDBRow
            v-for="(step, index) in stepsList"
            :key="index"
            class="mb-2 align-items-center"
          >
            <MDBCol md="10">
              <MDBInput v-model="stepsList[index]" label="Étape" type="text" />
            </MDBCol>
            <MDBCol md="2">
              <MDBBtn color="danger" @click="removeStep(index)"
                >Supprimer</MDBBtn
              >
            </MDBCol>
          </MDBRow>
          <MDBBtn color="primary" @click="addStep">Ajouter une étape</MDBBtn>
        </div>
      </MDBCol>

      <MDBCol md="4" class="text-center">
        <div class="image-upload-section">
          <img
            :src="imagePreview"
            class="recipe-image mb-3"
            alt="Recipe"
            @click="triggerImageUpload"
          />
          <input
            type="file"
            @change="onImageUpload"
            class="d-none"
            ref="imageInput"
          />
          <MDBBtn color="primary" @click="triggerImageUpload"
            >Ajouter une image</MDBBtn
          >
        </div>
      </MDBCol>
    </MDBRow>

    <MDBRow class="mt-5">
      <MDBCol md="4" class="text-center mb-3">
        <MDBBtn color="success" @click="saveRecipe">Sauvegarder</MDBBtn>
      </MDBCol>
      <MDBCol md="4" class="text-center mb-3">
        <MDBBtn color="warning" @click="cancel">Annuler</MDBBtn>
      </MDBCol>
      <MDBCol md="4" class="text-center mb-3">
        <MDBBtn color="danger" @click="deleteRecipe">Supprimer</MDBBtn>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from "mdb-vue-ui-kit";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

interface Recipe {
  title: string;
  description: string;
  ingredient: string;
  steps: string;
  image: File | null;
  active: boolean;
  Id_Recipes: number;
}

const recipe = ref<Recipe>({
  title: "",
  description: "",
  ingredient: "",
  steps: "",
  image: null,
  active: true,
  Id_Recipes: 0,
});

const ingredientsList = ref<string[]>([]);
const stepsList = ref<string[]>([]);
const imagePreview = ref("https://via.placeholder.com/200");
const imageInput = ref<HTMLInputElement | null>(null);
const route = useRoute();
const router = useRouter();
const adminId = ref<number | null>(null);

const fetchAdminId = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Token not found");
    }
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );
    const userId: number = userResponse.data.Id_Users;
    const adminResponse = await axios.get(
      `http://127.0.0.1:8000/admin/${userId}`
    );
    adminId.value = adminResponse.data.Id_Admin;
  } catch (error) {
  }
};

const addIngredient = () => {
  ingredientsList.value.push("");
};

const removeIngredient = (index: number) => {
  ingredientsList.value.splice(index, 1);
};

const addStep = () => {
  stepsList.value.push("");
};

const removeStep = (index: number) => {
  stepsList.value.splice(index, 1);
};

const triggerImageUpload = () => {
  if (imageInput.value) {
    imageInput.value.click();
  }
};

const onImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    recipe.value.image = file;
  }
};

const fetchRecipe = async () => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/recipes_id?recipe=${route.params.id}`
    );
    const data = response.data;
    recipe.value.title = data.Title;
    recipe.value.description = data.description;
    ingredientsList.value = data.ingredient.split(".");
    stepsList.value = data.Recipe.split(".");
    recipe.value.active = data.active;
    recipe.value.Id_Recipes = data.Id_Recipes;

    try {
      const imageResponse = await axios.get(
        `http://127.0.0.1:8000/produit_image/?produit_image_id=${data.Id_Recipes}&field_name=Id_Recipes`,
        { responseType: "blob" }
      );
      const imageUrl = URL.createObjectURL(imageResponse.data);
      imagePreview.value = imageUrl;
    } catch (error) {
      imagePreview.value = "https://via.placeholder.com/200";
    }
  } catch (error) {
  }
};

const saveRecipe = async () => {
  await fetchAdminId();

  recipe.value.ingredient = ingredientsList.value.join(".");
  recipe.value.steps = stepsList.value.join(".");

  const payload = {
    description: recipe.value.description,
    Title: recipe.value.title,
    Recipe: recipe.value.steps,
    ingredient: recipe.value.ingredient,
    Id_Recipes: recipe.value.Id_Recipes,
  };

  try {
    await axios.put(
      `http://127.0.0.1:8000/admin/${recipe.value.Id_Recipes}/modify_recipes?admin_id=${adminId.value}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (recipe.value.image) {
      const imagePayload = new FormData();
      imagePayload.append("product_id", recipe.value.Id_Recipes.toString());
      imagePayload.append("field_name", "Id_Recipes");
      imagePayload.append("nom", recipe.value.title);
      imagePayload.append("file", recipe.value.image);

      await axios.post(`http://127.0.0.1:8000/produit_image/`, imagePayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    router.push("/AdminRecipes");
  } catch (error) {
  }
};

const cancel = () => {
  router.push("/AdminRecipes");
};

const deleteRecipe = async () => {
  await fetchAdminId();

  try {
    await axios.delete(
      `http://127.0.0.1:8000/admin/recipes/${recipe.value.Id_Recipes}`,
      {
        params: { admin_id: adminId.value },
      }
    );
    router.push("/AdminRecipes");
  } catch (error) {
  }
};

onMounted(() => {
  fetchRecipe();
});
</script>

<style scoped>
.description-input {
  height: 100px;
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: fill;
  cursor: pointer;
  border-radius: 5px;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
