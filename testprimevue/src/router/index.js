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
    name: 'Pesquisa imobiliária',
    component: NewSearch,
    meta: {
      show_in_sidebar: true,
      icon: 'pi pi-search'
    }
  },
  {
    path: '/price-viewer',
    name: 'Mapa de preços',
    component: PriceViewer,
    meta: {
      show_in_sidebar: true,
      icon: 'pi pi-chart-line'
    }
  },
  {
    path: '/history',
    name: 'Histórico de preços',
    component: History,
    meta: {
      show_in_sidebar: true,
      icon: 'pi pi-history'
    }
  },
  {
    path: '/settings',
    name: 'Configurações',
    component: Settings,
    meta: {
      show_in_sidebar: false,
      icon: 'pi pi-cog'
    }
  },
  {
    path: '/my-account',
    name: 'Minha conta',
    component: MyAccount,
    meta: {
      show_in_sidebar: false,
      icon: 'pi pi-user'
    }
  },
  {
    path: '/help',
    name: 'Ajuda',
    component: Help,
    meta: {
      show_in_sidebar: true,  
      icon: 'pi pi-question-circle'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 