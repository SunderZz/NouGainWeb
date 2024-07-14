<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow>
      <MDBCol v-if="products.length === 0" class="text-center">
        <h3>Votre panier est vide</h3>
        <a tag="router-link" href="#/ProductList">
          <MDBBtn color="primary" class="mt-3">Aller à la boutique</MDBBtn>
        </a>
      </MDBCol>
      <MDBCol v-else md="7">
        <div class="product-list">
          <div
            v-for="(product, index) in products"
            :key="index"
            class="product-item d-flex mb-3"
          >
            <img
              :src="product.image"
              alt="Product image"
              class="product-img me-3"
            />
            <div class="flex-grow-1">
              <h5>{{ product.Name }}</h5>
              <p>{{ product.Description }}</p>
            </div>
            <div class="d-flex flex-column align-items-end">
              {{
                product.quantity > 0
                  ? (product.Price_ht * product.quantity).toFixed(2)
                  : product.Price_ht.toFixed(2)
              }}
              €
              <div class="d-flex align-items-center">
                <MDBBtn
                  color="danger"
                  @click="decrementQuantity(product, index)"
                  >-</MDBBtn
                >
                <span class="mx-2">{{ product.quantity }}</span>
                <MDBBtn color="primary" @click="incrementQuantity(product)"
                  >+</MDBBtn
                >
                <MDBBtn
                  color="danger"
                  @click="removeProduct(product.Id_Product, index)"
                  >Supprimer</MDBBtn
                >
              </div>
            </div>
          </div>
        </div>
      </MDBCol>

      <MDBCol v-if="products.length > 0" md="5">
        <div class="mb-4">
          <h3>Informations personnelles</h3>
          <MDBInput
            v-model="personalInfo.firstName"
            label="Prénom"
            type="text"
            class="mb-3"
            disabled
          />
          <MDBInput
            v-model="personalInfo.lastName"
            label="Nom"
            type="text"
            class="mb-3"
            disabled
          />
          <MDBInput
            v-model="personalInfo.email"
            label="Email"
            type="email"
            class="mb-3"
            disabled
          />
        </div>

        <div>
          <h3>Informations de livraison</h3>
          <MDBCheckbox
            v-model="deliveryInfo.homeDelivery"
            label="Livraison à domicile"
            class="mb-3"
            @change="toggleDeliveryMethod('home')"
          />
          <MDBCheckbox
            v-model="deliveryInfo.relayPoint"
            label="Récuperer chez le producteur"
            class="mb-3"
            @change="toggleDeliveryMethod('relay')"
            :disabled="products.length > 1"
          />

          <div v-if="deliveryInfo.homeDelivery">
            <MDBInput
              v-model="deliveryForm.address"
              label="Adresse"
              type="text"
              class="mb-3"
              :disabled="isDeliveryFieldsDisabled"
            />
            <MDBInput
              v-model="deliveryForm.phone"
              label="Téléphone"
              type="text"
              class="mb-3"
              :disabled="isDeliveryFieldsDisabled"
            />
            <MDBInput
              v-model="deliveryForm.postalCode"
              label="Code Postal"
              type="text"
              class="mb-3"
              :disabled="isDeliveryFieldsDisabled"
            />
            <MDBInput
              v-model="deliveryForm.city"
              label="Ville"
              type="text"
              class="mb-3"
              :disabled="isDeliveryFieldsDisabled"
            />
          </div>
        </div>
      </MDBCol>
    </MDBRow>

    <MDBRow v-if="products.length > 0" class="mt-4">
      <MDBCol md="4" class="text-center mb-3">
        <MDBBtn color="danger" @click="emptyCart">Vider le panier</MDBBtn>
      </MDBCol>
      <MDBCol md="4" class="text-center mb-3">
        <a tag="router-link" href="#/ProductList">
          <MDBBtn color="warning">Continuer les courses</MDBBtn>
        </a>
      </MDBCol>
      <MDBCol md="4" class="text-center mb-3">
        <MDBBtn color="success" :disabled="!isDeliverySelected" @click="validatePayment"
          >Valider le paiement</MDBBtn
        >
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBCheckbox,
} from "mdb-vue-ui-kit";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

interface Product {
  Id_Product: number;
  Name: string;
  Description: string;
  Price_ht: number;
  image: string;
  quantity: number;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryInfo {
  homeDelivery: boolean;
  relayPoint: boolean;
}

interface DeliveryForm {
  address: string;
  phone: string;
  postalCode: string;
  city: string;
}

interface ProducerAddress {
  Adresse: string;
  Phone: string;
  Creation: string;
  Modification: string | null;
  Latitude: number | null;
  Longitude: number | null;
}

const store = useStore();
const router = useRouter();

const products = ref<Product[]>([]);

const personalInfo = ref<PersonalInfo>({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});

const deliveryInfo = ref<DeliveryInfo>({
  homeDelivery: false,
  relayPoint: false,
});

const deliveryForm = ref<DeliveryForm>({
  address: "",
  phone: "",
  postalCode: "",
  city: "",
});

const producerAddress = ref<ProducerAddress>({
  Adresse: "",
  Phone: "",
  Creation: "",
  Modification: null,
  Latitude: null,
  Longitude: null,
});

const userAddress = ref<string>("");

const isDeliverySelected = computed(() => {
  return deliveryInfo.value.homeDelivery || deliveryInfo.value.relayPoint;
});

const isDeliveryFieldsDisabled = computed(() => {
  return true;
});

const fetchPersonalInfo = async (): Promise<void> => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return;
  }

  try {
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );

    personalInfo.value.firstName = userResponse.data.F_Name;
    personalInfo.value.lastName = userResponse.data.Name;
    personalInfo.value.email = userResponse.data.Mail;
  } catch (error) {
  }
};

const fetchCartProducts = async (): Promise<void> => {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:8000/linede/${orderId}`);
    let lineItems = response.data;

    if (!Array.isArray(lineItems)) {
      lineItems = [lineItems];
    }

    const productRequests = lineItems.map(async (item: any) => {
      const productResponse = await axios.get(
        `http://127.0.0.1:8000/products_by_id/?id=${item.Id_Product}`
      );
      return { ...productResponse.data, quantity: item.qte };
    });

    products.value = await Promise.all(productRequests);
  } catch (error) {
  }
};

const incrementQuantity = async (product: Product): Promise<void> => {
  product.quantity++;
  localStorage.setItem(
    `product_${product.Id_Product}_quantity`,
    product.quantity.toString()
  );
  await addOrUpdateCart(product.Id_Product, product.quantity);

  store.commit("ADD_TO_CART", product);
  store.commit("UPDATE_PRODUCT_QUANTITY", {
    productId: product.Id_Product,
    quantity: product.quantity,
  });
};

const decrementQuantity = async (product: Product, index: number): Promise<void> => {
  if (product.quantity > 0) {
    product.quantity--;
    localStorage.setItem(
      `product_${product.Id_Product}_quantity`,
      product.quantity.toString()
    );
    await addOrUpdateCart(product.Id_Product, product.quantity);

    if (product.quantity === 0) {
      await removeProduct(product.Id_Product, index);
      store.commit("REMOVE_FROM_CART", product.Id_Product);
    } else {
      store.commit("UPDATE_CART", {
        productId: product.Id_Product,
        quantity: product.quantity,
      });
      store.commit("UPDATE_PRODUCT_QUANTITY", {
        productId: product.Id_Product,
        quantity: product.quantity,
      });
    }
  }
};

const removeProduct = async (productId: number, index: number): Promise<void> => {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    return;
  }

  try {
    await axios.delete(`http://127.0.0.1:8000/linede/${orderId}/${productId}`);
    products.value.splice(index, 1);
    localStorage.removeItem(`product_${productId}_quantity`);
    store.commit("DECREMENT_CART_ITEM_COUNT");
  } catch (error) {
  }
};

const addOrUpdateCart = async (productId: number, quantity: number): Promise<void> => {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    return;
  }

  try {
    await axios.put(`http://127.0.0.1:8000/linede/${orderId}/${productId}`, {
      Id_Orders: orderId,
      Id_Product: productId,
      qte: quantity,
    });
  } catch (error) {
  }
};

const emptyCart = async (): Promise<void> => {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:8000/linede/${orderId}`);
    const lineItems = Array.isArray(response.data)
      ? response.data
      : [response.data];

    for (const lineItem of lineItems) {
      await axios.delete(
        `http://127.0.0.1:8000/linede/${orderId}/${lineItem.Id_Product}`
      );
    }

    products.value.forEach((product: Product) => {
      localStorage.removeItem(`product_${product.Id_Product}_quantity`);
    });

    products.value = [];
    localStorage.removeItem("orderId");
    store.commit("RESET_CART_ITEM_COUNT");
  } catch (error) {
  }
};

const toggleDeliveryMethod = async (method: string): Promise<void> => {
  if (method === "home") {
    deliveryInfo.value.relayPoint = false;
    await fetchUserAddress();
  } else if (method === "relay") {
    deliveryInfo.value.homeDelivery = false;
    if (products.value.length === 1) {
      const productId = products.value[0].Id_Product;
      const producerId = await getProducerId(productId);
      const producerInfo = await getProducerInfo(producerId);
      const addressId = await getAddressId(producerInfo.Id_Users);      
      await fetchProducerAddress(addressId);
    } else {
      deliveryInfo.value.relayPoint = false;
    }
  }
};

const fetchUserAddress = async (): Promise<void> => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No auth token found");

  try {
    const response = await axios.get("http://127.0.0.1:8000/users_by_token", {
      params: { token },
    });
    const user = response.data;
    
    const addressResponse = await axios.get(
      `http://127.0.0.1:8000/adresses_types_by_user/${user.Id_Users}`
    );
    
    const adresse_id = addressResponse.data;

    const adresseInformations = await axios.get(
      `http://127.0.0.1:8000/adresse_of_user?adresse_id=${adresse_id.Id_Users_adresses}`
    );
    
    const userAddressData = adresseInformations.data[0];
    
    const locatedResponse = await axios.get(
      `http://127.0.0.1:8000/located/${adresse_id.Id_Users_adresses}`
    );
    const located = locatedResponse.data;

    const codePostalResponse = await axios.get(
      `http://127.0.0.1:8000/code_postal_informations/?code_postal=${located.Id_Code_Postal}`
    );
    const codePostal = codePostalResponse.data;

    const gotResponse = await axios.get(
      `http://127.0.0.1:8000/got/${codePostal.Id_Code_Postal}`
    );
    const got = gotResponse.data;

    const cityResponse = await axios.get(
      `http://127.0.0.1:8000/city_with_id/?city=${got.Id_City}`
    );
    const city = cityResponse.data;

    deliveryForm.value.address = userAddressData.Adresse;
    deliveryForm.value.phone = userAddressData.Phone;
    deliveryForm.value.postalCode = codePostal.code_postal;
    deliveryForm.value.city = city.Name;
    
    userAddress.value = userAddressData.Adresse;
  } catch (error) {
  }
};

const getProducerId = async (productId: number): Promise<number> => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/give/${productId}`);
    return response.data.Id_Producers;
  } catch (error) {
    throw error;
  }
};

const getProducerInfo = async (producerId: number): Promise<any> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/producers_user?producers=${producerId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAddressId = async (userId: number): Promise<number> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/adresses_types_by_user/${userId}`
    );
    return response.data.Id_Users_adresses;
  } catch (error) {
    throw error;
  }
};

const fetchProducerAddress = async (addressId: number): Promise<void> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/adresse_of_user?adresse_id=${addressId}`
    );
    const producerAddressData = response.data[0];
    
    deliveryForm.value.address = producerAddressData.Adresse;
    deliveryForm.value.phone = producerAddressData.Phone;
    deliveryForm.value.postalCode = producerAddressData.code_postal;
    deliveryForm.value.city = producerAddressData.city;
    producerAddress.value = producerAddressData;
    
  } catch (error) {
  }
};

const validatePayment = async (): Promise<void> => {
  const orderId = localStorage.getItem("orderId");
  const token = localStorage.getItem("authToken");

  if (!orderId || !token) {
    return;
  }

  try {
    const userResponse = await axios.get("http://127.0.0.1:8000/users_by_token", {
      params: { token },
    });
    const userId = userResponse.data.Id_Users;

    const customerResponse = await axios.get(`http://127.0.0.1:8000/customers_by_id`, {
      params: { customers: userId },
    });
    const idCasual = customerResponse.data.Id_Casual;

    let preferenceShip = deliveryInfo.value.homeDelivery
      ? userAddress.value
      : producerAddress.value.Adresse;

    const orderData = {
      Command_Date: new Date().getDate,
      Status: false,
      Preference_Ship: preferenceShip,
      Ship_Date: null,
      Id_Casual: idCasual,
    };

    await axios.put(`http://127.0.0.1:8000/orders/${orderId}`, orderData);
    router.push({
      path: "/ValidateCart",
      query: { orderId, preferenceShip },
    });
  } catch (error) {
  }
};

onMounted((): void => {
  fetchPersonalInfo();
  fetchCartProducts();
});
</script>

<style scoped>
.product-list {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
}

.product-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.text-center {
  text-align: center;
}

html, body, #app, .container, .mt-4 {
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
}

.mt-4 {
  flex: 1;
}
</style>
