import { createRouter, createWebHashHistory } from "vue-router";
import axios from "axios";

const routes = [
  { path: "/", name: "home", component: () => import("../views/Home.vue") },
  {
    path: "/ProductList",
    name: "liste_produit",
    component: () => import("../views/ProductList.vue"),
  },
  {
    path: "/ProductDetail/:id",
    name: "produit_detail",
    component: () => import("../views/ProductDetail.vue"),
  },
  {
    path: "/ProfilAgriculteur",
    name: "profil_agriculteur",
    component: () => import("../views/ProfilAgriculteur.vue"),
  },
  {
    path: "/AddProduct",
    name: "add_product",
    component: () => import("../views/AddProductPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/Setting",
    name: "setting",
    component: () => import("../views/SettingPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/SettingAgriculteur",
    name: "setting_agriculteur",
    component: () => import("../views/SettingAgriculteurPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ProfilCustomer",
    name: "profil_customer",
    component: () => import("../views/ProfilCustomer.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/OrderHistory",
    name: "order_history",
    component: () => import("../views/OrderHistoryPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/AgriculteurList",
    name: "list_agriculteur",
    component: () => import("../views/AgriculteurListPage.vue"),
  },
  {
    path: "/AgriculteurDetail/:id",
    name: "agriculteur_detail",
    component: () => import("../views/AgriculteurDetailPage.vue"),
  },
  {
    path: "/Agriculteur",
    name: "agriculteur",
    component: () => import("../views/AgriculteurPage.vue"),
  },
  {
    path: "/Recipes",
    name: "recipes",
    component: () => import("../views/RecipesPage.vue"),
  },
  {
    path: "/RecipesDetail/:id",
    name: "recipes_detail",
    component: () => import("../views/RecipesDetailPage.vue"),
  },
  {
    path: "/Cart",
    name: "cart",
    component: () => import("../views/CartPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ValidateCart",
    name: "validate_cart",
    component: () => import("../views/ValidateCart.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ValidatePayement",
    name: "validate_payment",
    component: () => import("../views/ValidatePaiementPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/Login",
    name: "login",
    component: () => import("../views/LoginPage.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/ForgotPassword",
    name: "forgot_password",
    component: () => import("../views/ForgotPasswordPage.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/CreateAccount",
    name: "create_account",
    component: () => import("../views/CreateAccountPage.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/AdminHome",
    name: "admin_home",
    component: () => import("../views/AdminHomePage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/AdminProducteurs",
    name: "admin_producteurs",
    component: () => import("../views/AdminProducteursPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/AdminProducts",
    name: "admin_products",
    component: () => import("../views/AdminProductsPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/AdminRecipes",
    name: "admin_recipes",
    component: () => import("../views/AdminRecipesPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/AdminConfigRecipes/:id",
    name: "admin_config_recipes",
    component: () => import("../views/AdminConfigRecipesPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/AdminCreateRecipePage",
    name: "admin_create_recipes",
    component: () => import("../views/AdminCreateRecipe.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/AdminConfigProducteurs/:id",
    name: "admin_config_producteurs",
    component: () => import("../views/AdminConfigProducteursPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/AdminConfigProducts/:id",
    name: "admin_config_products",
    component: () => import("../views/AdminConfigProductsPage.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const isAdmin = async (token: string) => {
  try {
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );
    const userId = userResponse.data.Id_Users;

    const adminResponse = await axios.get(
      `http://127.0.0.1:8000/admin/${userId}`
    );
    return adminResponse.status === 200;
  } catch (error) {

    return false;
  }
};

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("authToken");
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next({ name: "login" });
    } else {
      if (to.matched.some((record) => record.meta.requiresAdmin)) {
        const isUserAdmin = await isAdmin(token);
        if (isUserAdmin) {
          next();
        } else {
          next({ name: "home" });
        }
      } else {
        next();
      }
    }
  } else if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (token) {
      next({ name: "home" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default {
  router,
};
