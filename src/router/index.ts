import HeightDynamic from "@/components/HeightDynamic.vue";
import HeightFixed from "@/components/HeightFixed.vue";
import Navs from "@/Navs.vue";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: Navs,
  },
  {
    path: "/height-dynamic",
    component: HeightDynamic,
  },
  {
    path: "/height-fixed",
    component: HeightFixed,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
