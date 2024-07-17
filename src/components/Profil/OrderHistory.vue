<template>
    <MDBContainer fluid class="mt-4">
      <h2 class="text-center mb-4">Historique de commande</h2>
      <MDBRow>
        <MDBCol v-for="order in orders" :key="order.Id_Orders" md="12" class="mb-4">
          <MDBCard class="p-3 order-card">
            <h5>N° de Commande #{{ order.Id_Orders }}</h5>
            <p><strong>Date de la commande:</strong> {{ order.Command_Date }}</p>
            <p><strong>Adresse de livraison:</strong> {{ order.Preference_Ship }}</p>
            <p><strong>Date de livraison estimé au:</strong> {{ order.Ship_Date }}</p>
            <p><strong>Prix de la commande:</strong> {{ order.Payment.Amount }} €</p>
            <p><strong>Produits:</strong></p>
            <ul class="product-list">
              <li v-for="product in order.Payment.Bills.split(',')" :key="product">{{ product.trim() }}</li>
            </ul>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import axios from "axios";
  import { MDBContainer, MDBRow, MDBCol, MDBCard } from "mdb-vue-ui-kit";
  
  interface Order {
    Id_Orders: number;
    Command_date: string;
    Preference_Ship: string;
    Ship_Date: string;
    Payment: {
      Amount: number;
      Bills: string;
    };
  }
  
  const orders = ref<Order[]>([]);
  
  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");
  
      const userResponse = await axios.get("http://127.0.0.1:8000/users_by_token", {
        params: { token },
      });
      const user = userResponse.data;
  
      const customerResponse = await axios.get(
        `http://127.0.0.1:8000/user_by_id?customers=${userResponse.data.Id_Users}`
      );
      const customerId = customerResponse.data.Id_Casual;
  
      const ordersResponse = await axios.get(
        `http://127.0.0.1:8000/orders_by_customers/?id_casual=${customerId}`
      );
      const orderList = ordersResponse.data;
  
      const orderDetails = await Promise.all(orderList.map(async (order: any) => {
        const paymentResponse = await axios.get(
          `http://127.0.0.1:8000/payment/${order.Id_Orders}`
        );
        
        return { ...order, Payment: paymentResponse.data };
      }));
  
      orders.value = orderDetails;
    } catch (error) {
    }
  };
  
  onMounted(() => {
    fetchOrderHistory();
  });
  </script>
  
  <style scoped>
  .order-card {
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    background-color: #f8f9fa;
  }
  
  .order-card:hover {
    transform: translateY(-5px);
  }
  
  .product-list {
    list-style-type: none;
    padding: 0;
  }
  
  .product-list li {
    margin-left: 1em;
    position: relative;
  }
  
  .product-list li::before {
    content: "•";
    color: #007bff;
    position: absolute;
    left: -1em;
  }
  </style>
  