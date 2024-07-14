<template>
  <div style="text-align: center">
    <h1
      class="mb-3"
      style="
        display: inline-block;
        color: grey;
        width: 20vw;
        color: #ffff02;
        padding: 5px;
      "
    >
      Produit en promotion
    </h1>
  </div>

  <div class="carousel-container" v-if="items9.length > 0">
    <div class="carousel">
      <div
        class="carousel-item"
        v-for="(item, index) in items9"
        :key="item.id"
        :class="{ active: index === currentIndex }"
        @click="goToDetail(item.id)"
      >
        <img :src="item.src" :alt="item.alt" class="d-block w-100" />
      </div>
    </div>
    <button class="carousel-control prev" @click="prev">‹</button>
    <button class="carousel-control next" @click="next">›</button>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  setup() {
    const items9 = ref([]);
    const currentIndex = ref(0);
    const router = useRouter();

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/products_discount/"
        );
        const products = response.data;

        items9.value = products.map((product) => ({
          id: product.Id_Product,
          src: product.imageUrl || "https://placehold.co/600x400",
          alt: product.Name,
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
      }
    };

    const goToDetail = (id) => {
      router.push(`/ProductDetail/${id}`);
    };

    const prev = () => {
      currentIndex.value =
        (currentIndex.value - 1 + items9.value.length) % items9.value.length;
    };

    const next = () => {
      currentIndex.value = (currentIndex.value + 1) % items9.value.length;
    };

    onMounted(() => {
      fetchProducts();
    });

    return {
      items9,
      currentIndex,
      goToDetail,
      prev,
      next,
    };
  },
};
</script>

<style>
.carousel-container {
  width: 50%;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.carousel {
  display: flex;
  transition: transform 0.5s ease-in-out;
}
.carousel-item {
  min-width: 100%;
  transition: opacity 0.5s ease-in-out;
  opacity: 0;
  cursor: pointer;
}
.carousel-item.active {
  opacity: 1;
}
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}
.carousel-control.prev {
  left: 10px;
}
.carousel-control.next {
  right: 10px;
}
</style>
