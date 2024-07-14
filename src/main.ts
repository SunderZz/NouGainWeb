import "mdb-vue-ui-kit/css/mdb.min.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store.js";

const app = createApp(App);
app.use(router.router);
app.use(store.store);
app.mount("#app");
