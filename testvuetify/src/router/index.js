/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { createRouter, createWebHistory } from 'vue-router'
import PriceViewer from '@/views/PriceViewer.vue'
import History from '@/views/History.vue' 
import NewSearch from '@/views/NewSearch.vue'
import Settings from '@/views/Settings.vue'
import Help from '@/views/Help.vue'
import MyAccount from '@/views/MyAccount.vue'

const routes = [
  {
    path: '/',
    name: 'Mapa de preços',
    component: PriceViewer,
    meta: {
      icon: 'mdi-view-dashboard',
      showInNav: true
    }
  },
  {
    path: '/history',
    name: 'Histórico',
    component: History,
    meta: {
      icon: 'mdi-grid',
      showInNav: true
    }
  },
  {
    path: '/new-search',
    name: 'Nova pesquisa',
    component: NewSearch,
    meta: {
      icon: 'mdi-home-search',
      showInNav: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      icon: 'mdi-cog',
      showInNav: true
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: {
      showInNav: false
    }
  },
  {
    path: '/myaccount',
    name: 'MyAccount',
    component: MyAccount,
    meta: {
      icon: 'mdi-account-cog',
      showInNav: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
