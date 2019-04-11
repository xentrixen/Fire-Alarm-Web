import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login.vue'
import store from './store';

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
      meta: {
        requiresVisitor: true
      }
    },
    {
      path: '/',
      component: () => import('./views/Dashboard.vue'),
      children: [
        {
          path: 'citizen',
          name: 'Citizen',
          component: () => import('./views/Citizen.vue'),
          meta: {
            requiresAuthenticated: true
          }
        },
        {
          path: 'fire-stations',
          name: 'Fire Stations',
          component: () => import('./views/FireStation.vue'),
          meta: {
            requiresAuthenticated: true
          }
        },
        {
          path: 'login-history',
          name: 'Login History',
          component: () => import('./views/LoginHistory.vue'),
          meta: {
            requiresAuthenticated: true
          }
        }
      ],
    },
  ]
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuthenticated)) {
    if(!store.getters.loggedIn) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else if(to.matched.some(record => record.meta.requiresVisitor)) {
    if(store.getters.loggedIn) {
      next({ name: 'Citizen' })
    } else {
      next()
    }
  } else {
    if(store.getters.loggedIn) {
      next({ name: 'Citizen' })
    } else {
      next({ name: 'Login' })
    }
  }
})

export default router