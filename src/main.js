import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import Vuex from "vuex";
import store from "./store";
import VueToastify from "vue-toastify";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
//import MyCollection from './components/MyCollection'

Vue.use(VueToastify);

Vue.config.productionTip = false;
Vue.use(Vuex);
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component("MyCollection", require('./components/MyCollection').default)


new Vue({
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
