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
            <p>
              <strong>Producteur :</strong>
              <router-link :to="'/ListAgriculteur/' + producerId">{{ producer }}</router-link>
            </p>
          </div>
          <div class="d-flex flex-column">
            <p>Ajouter au panier :</p>
            <div class="d-flex align-items-center">
              <MDBBtn v-if="product.quantity > 0" @click="decrementQuantity" color="danger">-</MDBBtn>
              <span v-if="product.quantity > 0" class="mx-2">{{ product.quantity }}</span>
              <MDBBtn @click="incrementQuantity" color="primary">+</MDBBtn>
            </div>
          </div>
        </div>
      </MDBCol>
    </MDBRow>

    <MDBRow class="mb-4">
      <MDBCol>
        <h2>{{ product.price }} €</h2>
        <p>{{ product.Description }}</p>
      </MDBCol>
    </MDBRow>

    <MDBRow class="flex-grow-1">
      <MDBCol>
        <h2>Avis (Note globale : {{ averageRating }})</h2>
        <ul>
          <li v-for="(comment, index) in comments" :key="index">
            <strong>{{ comment.Title }}</strong> - <small class="text-muted">{{ comment.Notice_date }}</small>
            <p>{{ comment.Notice }} <span>({{ comment.Note }}/10)</span></p>
          </li>
        </ul>
        <MDBBtn @click="toggleCommentForm" color="primary">Poster un commentaire</MDBBtn>
        <form v-if="showCommentForm" @submit.prevent="submitComment" class="mt-3">
          <MDBInput v-model="newComment.Title" label="Titre" type="text" class="mb-3" required />
          <MDBInput v-model="newComment.Notice" label="Commentaire" type="textarea" class="mb-3" required />
          <MDBInput v-model="newComment.Note" label="Note (1-10)" type="number" min="1" max="10" class="mb-3" required />
          <MDBBtn type="submit" color="success">Envoyer</MDBBtn>
        </form>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeMount } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBBtn, MDBInput } from "mdb-vue-ui-kit";

interface Product {
  Name: string;
  Description: string;
  image: string;
  quantity: number;
  price: number;
  Id_Product: number;
}

interface Comment {
  Title: string;
  Notice: string;
  Notice_date: string;
  Note: number;
}

const route = useRoute();
const router = useRouter();
const store = useStore();

const product = ref<Product>({
  Name: "",
  Description: "",
  image: "",
  quantity: 0,
  price: 0,
  Id_Product: 0,
});

const producer = ref<string>("");
const producerId = ref<number | null>(null);
const comments = ref<Comment[]>([]);
const selectedProducts = ref<Set<string>>(new Set());
const averageRating = ref<number>(0);
const showCommentForm = ref<boolean>(false);

const newComment = ref<Comment>({
  Title: "",
  Notice: "",
  Notice_date: new Date().toISOString().split("T")[0],
  Note: 1,
});

const fetchProduct = async (productId: number) => {
  try {
    const storedProduct = store.getters.getProductById(productId);
    if (storedProduct) {
      product.value = storedProduct;
    } else {
      const response = await axios.get(`http://127.0.0.1:8000/products_by_id/?id=${productId}`);
      const data = response.data;
      product.value = {
        Name: data.Name,
        Description: data.Description,
        image: data.imageUrl || "https://placehold.co/600x400",
        quantity: 0,
        price: data.Price_ht,
        Id_Product: data.Id_Product,
      };
    }
    await fetchProducerName(productId);
    await fetchComments(productId);
  } catch (error) {
  }
};

const fetchProducerName = async (productId: number): Promise<void> => {
  try {
    const giveResponse = await axios.get(`http://127.0.0.1:8000/give/${productId}`);
    producerId.value = giveResponse.data.Id_Producers;
    const userResponse = await axios.get(`http://127.0.0.1:8000/user_by_producer?producer_id=${producerId.value}`);
    producer.value = `${userResponse.data.F_Name} ${userResponse.data.Name}`;
  } catch (error) {
    producer.value = "Inconnu";
  }
};

const fetchComments = async (productId: number) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/get_notice_by_id?product=${productId}`);
    comments.value = response.data;
    calculateAverageRating();
  } catch (error) {
  }
};

const calculateAverageRating = () => {
  if (comments.value.length === 0) {
    averageRating.value = 0;
    return;
  }
  const total = comments.value.reduce((sum, comment) => sum + comment.Note, 0);
  averageRating.value = parseFloat((total / comments.value.length).toFixed(1));
};

const incrementQuantity = async () => {
  if (product.value.quantity === 0) {
    selectedProducts.value.add(product.value.Name);
  }
  product.value.quantity++;
  localStorage.setItem(`product_${product.value.Id_Product}_quantity`, product.value.quantity.toString());

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
    localStorage.setItem(`product_${product.value.Id_Product}_quantity`, product.value.quantity.toString());

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
      selectedProducts.value.delete(product.value.Name);
    }
  }
};

const removeProduct = async (productId: number) => {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    return;
  }

  try {
    await axios.delete(`http://127.0.0.1:8000/linede/${orderId}/${productId}`);
    localStorage.removeItem(`product_${productId}_quantity`);
    store.commit("DECREMENT_CART_ITEM_COUNT");
  } catch (error) {
  }
};

const emitSelectedProducts = () => {
  const selectedCount = selectedProducts.value.size;
};

const getUserFromToken = async (): Promise<any> => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:8000/users_by_token?token=${token}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

const getCustomerById = async (customerId: number): Promise<any> => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/customers_by_id?customers=${customerId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

const addOrUpdateCart = async (productId: number, quantity: number) => {
  const user = await getUserFromToken();
  if (!user) {
    router.push("/Login");
    return;
  }

  const customerId = user.Id_Users;
  const customer = await getCustomerById(customerId);
  if (!customer) {
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
    }
  } else {
    try {
      await axios.post("http://127.0.0.1:8000/linede/orders", {
        Id_Orders: orderId,
        Id_Product: productId,
        qte: quantity,
      });
    } catch (error) {
    }
  }
};

const checkExistingLine = async (orderId: number, productId: number): Promise<any> => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/linede/${orderId}`);
    const data = response.data;
    if (Array.isArray(data)) {
      return data.find((line: any) => line.Id_Product === productId) || null;
    } else if (data && data.Id_Product === productId) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

const toggleCommentForm = () => {
  showCommentForm.value = !showCommentForm.value;
};

const submitComment = async () => {
  const user = await getUserFromToken();
  if (!user) {
    router.push("/Login");
    return;
  }

  const customerId = user.Id_Users;

  const payload = {
    Title: newComment.value.Title,
    Notice: newComment.value.Notice,
    Notice_date: new Date().toISOString().split("T")[0],
    Note: newComment.value.Note,
  };

  try {
    await axios.post(`http://127.0.0.1:8000/given/?id_customer=${customerId}&product=${product.value.Id_Product}`, payload);
    location.reload();
  } catch (error) {
  }
};

watch(route, () => {
  const productId = parseInt(route.params.id, 10);
  fetchProduct(productId);
});

onMounted(() => {
  const productId = parseInt(route.params.id, 10);
  fetchProduct(productId);
});
</script>

<style scoped>
.star-rating {
  font-size: 24px;
}

.star {
  color: #ffd700;
}
</style>
