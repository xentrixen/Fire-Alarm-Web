import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vuetify from 'vuetify'
import VueOnToast from 'vue-on-toast'
import themeConfig from './themeConfig'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vue-on-toast/dist/vue-on-toast.css'
import 'vuetify/dist/vuetify.min.css'
import './axios'
import './validatorConfig'

Vue.use(Vuetify, themeConfig)
Vue.use(VueOnToast)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
