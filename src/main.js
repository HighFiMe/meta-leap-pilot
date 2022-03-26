import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import Vuex from "vuex";
import store from "./store";
import VueToastify from "vue-toastify";

Vue.use(VueToastify);

Vue.config.productionTip = false;
Vue.use(Vuex);

new Vue({
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
