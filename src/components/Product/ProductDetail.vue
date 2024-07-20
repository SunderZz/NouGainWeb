<template>
  <MDBContainer fluid class="mt-4 d-flex flex-column flex-grow-1">
    <div v-if="!productActive" class="text-center">
      <h2>Le produit choisi est indisponible.</h2>
      <MDBBtn @click="goHome" color="primary">Retour à l'accueil</MDBBtn>
    </div>
    <div v-else>
      <MDBRow class="mb-4 flex-grow-1">
        <MDBCol md="6">
          <MDBCard class="h-100">
            <img
              :src="product.image"
              class="card-img-top product-image"
              alt="Product image"
            />
          </MDBCard>
        </MDBCol>
        <MDBCol md="6">
          <div class="d-flex flex-column justify-content-between h-100">
            <div>
              <h2>{{ product.Name }}</h2>
              <p>{{ product.Description }}</p>
              <p>
                <strong>Producteur :</strong>
                <router-link :to="'/AgriculteurDetail/' + userId">{{
                  producer
                }}</router-link>
              </p>
            </div>
            <div v-if="userIsCustomer" class="d-flex flex-column">
              <p>Ajouter au panier :</p>
              <div class="d-flex align-items-center">
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
          <h2>{{ product.price }} €</h2>
          <p>{{ product.Description }}</p>
        </MDBCol>
      </MDBRow>

      <MDBRow class="flex-grow-1">
        <MDBCol>
          <h2>Avis (Note globale : {{ averageRating }})</h2>
          <ul>
            <li v-for="(comment, index) in comments" :key="index">
              <strong>{{ comment.userName }} : {{ comment.Title }}</strong> -
              <small class="text-muted">{{ comment.Notice_date }}</small>
              <p>
                {{ comment.Notice }} <span>({{ comment.Note }}/10)</span>
              </p>
            </li>
          </ul>
          <MDBBtn @click="toggleCommentForm" color="primary"
            >Poster un commentaire</MDBBtn
          >
          <form
            v-if="showCommentForm"
            @submit.prevent="submitComment"
            class="mt-3"
          >
            <MDBInput
              v-model="newComment.Title"
              label="Titre"
              type="text"
              class="mb-3"
              required
            />
            <MDBInput
              v-model="newComment.Notice"
              label="Commentaire"
              type="textarea"
              class="mb-3"
              required
            />
            <MDBInput
              v-model="newComment.Note"
              label="Note (1-10)"
              type="number"
              min="1"
              max="10"
              class="mb-3"
              required
            />
            <MDBBtn type="submit" color="success">Envoyer</MDBBtn>
          </form>
        </MDBCol>
      </MDBRow>
    </div>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBBtn,
  MDBInput,
} from "mdb-vue-ui-kit";

interface Product {
  Name: string;
  Description: string;
  image: string;
  quantity: number;
  price: number;
  Id_Product: number;
  Active: boolean;
}

interface Comment {
  Title: string;
  Notice: string;
  Notice_date: string;
  Note: number;
  Id_Notice: number;
  userName?: string;
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
  Active: false,
});

const producer = ref<string>("");
const producerId = ref<number | null>(null);
const userId = ref<number | null>(null);
const comments = ref<Comment[]>([]);
const selectedProducts = ref<Set<string>>(new Set());
const averageRating = ref<number>(0);
const showCommentForm = ref<boolean>(false);
const productActive = ref<boolean>(true);
const userIsCustomer = ref<boolean>(false);

const newComment = ref<Comment>({
  Title: "",
  Notice: "",
  Notice_date: new Date().toISOString().split("T")[0],
  Note: 1,
});

const fetchProductImage = async (productId: number): Promise<string> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/produit_image?produit_image_id=${productId}&field_name=Id_Product`,
      { responseType: "blob" }
    );
    if (response.data) {
      return URL.createObjectURL(response.data);
    }
  } catch (error) {
  }
  return "https://via.placeholder.com/300";
};

const fetchProduct = async (productId: number) => {
  try {
    const storedProduct = store.getters.getProductById(productId);
    if (storedProduct) {
      product.value = storedProduct;
      productActive.value = storedProduct.Active;
    } else {
      const response = await axios.get(
        `http://127.0.0.1:8000/products_by_id/?id=${productId}`
      );
      const data = response.data;
      const image = await fetchProductImage(data.Id_Product);
      product.value = {
        Name: data.Name,
        Description: data.Description,
        image: image,
        quantity: 0,
        price: data.Price_ht,
        Id_Product: data.Id_Product,
        Active: data.Active,
      };
      productActive.value = data.Active;
    }
    if (productActive.value) {
      await fetchProducerName(productId);
      await fetchComments(productId);
    }
  } catch (error) {
    productActive.value = false;
  }
};

const fetchProducerName = async (productId: number): Promise<void> => {
  try {
    const giveResponse = await axios.get(
      `http://127.0.0.1:8000/give/${productId}`
    );
    producerId.value = giveResponse.data.Id_Producers;
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/user_by_producer?producer_id=${producerId.value}`
    );
    userId.value = userResponse.data.Id_Users;
    producer.value = `${userResponse.data.F_Name} ${userResponse.data.Name}`;
  } catch (error) {
    producer.value = "Inconnu";
  }
};

const fetchComments = async (productId: number) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/get_notice_by_id?product=${productId}`
    );
    const commentsData = response.data;

    for (const comment of commentsData) {
      const giveResponse = await axios.get(
        `http://127.0.0.1:8000/Give_1/${comment.Id_Notice}`
      );
      const customerId = giveResponse.data.Id_Casual;
      const customerResponse = await axios.get(
        `http://127.0.0.1:8000/customers_by_id?customers=${customerId}`
      );
      const userId = customerResponse.data.Id_Users;
      const userResponse = await axios.get(
        `http://127.0.0.1:8000/users/${userId}`
      );
      const userName = userResponse.data.F_Name;

      comments.value.push({ ...comment, userName });
    }

    calculateAverageRating();
  } catch (error) {}
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
  localStorage.setItem(
    `product_${product.value.Id_Product}_quantity`,
    product.value.quantity.toString()
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
      product.value.quantity.toString()
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
  } catch (error) {}
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
    const response = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );
    return response.data;
  } catch (error) {
    return null;
  }
};

const getCustomerById = async (customerId: number): Promise<any> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/user_by_id?customers=${customerId}`
    );
    return response.data;
  } catch (error) {
    return null;
  }
};

const addOrUpdateCart = async (
  productId: number,
  quantity: number
): Promise<void> => {
  const user = await getUserFromToken();
  if (!user) {
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

      orderId = response.data.Id_Orders;

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
    } catch (error) {}
  } else {
    try {
      await axios.post("http://127.0.0.1:8000/linede/orders", {
        Id_Orders: orderId,
        Id_Product: productId,
        qte: quantity,
      });
    } catch (error) {}
  }
};

const checkExistingLine = async (
  orderId: number,
  productId: number
): Promise<any> => {
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

  const customerResponse = await axios.get(
    `http://127.0.0.1:8000/user_by_id?customers=${customerId}`
  );
  const idCasual = customerResponse.data.Id_Casual;

  const payload = {
    Title: newComment.value.Title,
    Notice: newComment.value.Notice,
    Notice_date: new Date().toISOString().split("T")[0],
    Note: newComment.value.Note,
  };

  try {
    await axios.post(
      `http://127.0.0.1:8000/given/?id_customer=${idCasual}&product=${product.value.Id_Product}`,
      payload
    );
    location.reload();
  } catch (error) {}
};

const goHome = () => {
  router.push("/");
};

const isUserCustomer = async (): Promise<boolean> => {
  const user = await getUserFromToken();
  if (!user) {
    return false;
  }

  const customerId = user.Id_Users;
  const customer = await getCustomerById(customerId);
  return !!customer;
};

watch(route, () => {
  const productId = parseInt(route.params.id, 10);
  fetchProduct(productId);
});

onMounted(async () => {
  const productId = parseInt(route.params.id, 10);
  await fetchProduct(productId);
  userIsCustomer.value = await isUserCustomer();
});
</script>

<style scoped>
.custom-btn,
.custom-logout-btn {
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-logout-btn {
  background-color: red;
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

.product-image {
  width: 100%;
  height: 300px;
  object-fit: contain;
}
</style>
