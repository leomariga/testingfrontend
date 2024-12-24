import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";

// LightBootstrap plugin
import LightBootstrap from "./light-bootstrap-main";

// router setup
import routes from "./routes/routes";

import "./registerServiceWorker";

// configure router
const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "nav-item active",
  scrollBehavior: (to) => {
    if (to.hash) {
      return { el: to.hash }
    } else {
      return { top: 0 }
    }
  },
});

const app = createApp(App);
app.use(router);
app.use(LightBootstrap);
app.mount("#app");