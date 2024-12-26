import { createRouter, createWebHistory } from 'vue-router'
import NewSearch from '../views/NewSearch.vue'
import PriceViewer from '../views/PriceViewer.vue'
import History from '../views/History.vue'
import Settings from '../views/Settings.vue'
import MyAccount from '../views/MyAccount.vue'
import Help from '../views/Help.vue'

const routes = [
  {
    path: '/new-search',
    name: 'NewSearch',
    component: NewSearch,
    meta: {
      icon: 'pi pi-search'
    }
  },
  {
    path: '/price-viewer',
    name: 'PriceViewer',
    component: PriceViewer,
    meta: {
      icon: 'pi pi-chart-line'
    }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: {
      icon: 'pi pi-history'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      icon: 'pi pi-cog'
    }
  },
  {
    path: '/my-account',
    name: 'MyAccount',
    component: MyAccount,
    meta: {
      icon: 'pi pi-user'
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: {
      icon: 'pi pi-question-circle'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 