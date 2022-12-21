import { createApp } from "vue";
// import './style.css'
import App from "./App.vue";
import router from "./router";
import { setupStore } from "./store";

const app = createApp(App);
setupStore(app); //这个放最前面初始化

app.use(router).mount("#app");
