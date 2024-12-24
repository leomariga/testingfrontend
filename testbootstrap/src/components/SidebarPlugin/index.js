import Sidebar from './SideBar.vue'
import SidebarLink from './SidebarLink.vue'

const SidebarStore = {
  showSidebar: false,
  sidebarLinks: [],
  displaySidebar(value) {
    this.showSidebar = value
  }
}

const SidebarPlugin = {
  install(app) {
    // Make SidebarStore available globally
    app.config.globalProperties.$sidebar = SidebarStore

    // Register components
    app.component('side-bar', Sidebar)
    app.component('sidebar-link', SidebarLink)
  }
}

export default SidebarPlugin
export { SidebarStore }
