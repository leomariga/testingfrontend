<template>
  <div class="layout-wrapper">
    <!-- Permanent Navigation Sidebar -->
    <div class="layout-sidebar" 
         :class="{ 'collapsed': !isExpanded }"
         @mouseenter="handleMouseEnter"
         @mouseleave="handleMouseLeave">
      <div class="sidebar-header">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <h2>Dashboard</h2>
      </div>
      
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.to" 
          :to="item.to"
          class="nav-item"
          :class="{ active: currentRoute === item.name }"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/my-account" class="nav-item">
          <i class="pi pi-user"></i>
          <span>My Account</span>
        </router-link>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="layout-main" :class="{ 'collapsed': !isExpanded }">
      <!-- Top Header Bar -->
      <div class="layout-topbar">
        <h2 class="page-title">{{ currentRoute }}</h2>
        <div class="topbar-right">
          <PrimeButton icon="pi pi-cog" class="p-button-text" />
        </div>
      </div>

      <!-- Content Area -->
      <div class="layout-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PrimeButton from 'primevue/button'

export default {
  name: 'App',
  components: {
    PrimeButton
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const currentRoute = computed(() => route.name || '')

    // Generate menu items from router configuration
    const menuItems = computed(() => 
      router.options.routes
        .filter(route => route.path !== '/' && route.name && route.meta?.show_in_sidebar) // Filter out root path and unnamed routes
        .map(route => ({
          label: route.name,
          icon: route.meta?.icon || 'pi pi-circle-fill', // Use route meta icon or default
          to: route.path,
          name: route.name
        }))
    )

    const isExpanded = ref(false)
    
    const handleMouseEnter = () => {
      isExpanded.value = true
    }
    
    const handleMouseLeave = () => {
      isExpanded.value = false
    }

    return {
      menuItems,
      currentRoute,
      isExpanded,
      handleMouseEnter,
      handleMouseLeave
    }
  }
}
</script>

<style>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  background-color: var(--surface-ground);
}

.layout-sidebar {
  width: 260px;
  min-height: 100vh;
  background-color: var(--surface-overlay);
  border-right: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.layout-sidebar.collapsed {
  width: 60px;
  overflow: hidden;
}

.layout-sidebar.collapsed .sidebar-header h2,
.layout-sidebar.collapsed .nav-item span {
  opacity: 0;
  visibility: hidden;
}

.layout-sidebar:hover {
  width: 260px;
}

.layout-sidebar:hover .sidebar-header h2,
.layout-sidebar:hover .nav-item span {
  opacity: 1;
  visibility: visible;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.sidebar-header .logo {
  height: 32px;
  width: auto;
}

.sidebar-header h2 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.25rem;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.sidebar-nav {
  padding: 1rem 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.2s;
  gap: 0.75rem;
  white-space: nowrap;
  position: relative;
}

.nav-item span {
  position: absolute;
  left: 3.5rem;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.nav-item i {
  font-size: 1.25rem;
  width: 1.25rem;
  text-align: center;
  margin-left: -0.25rem;
}

.layout-sidebar.collapsed .nav-item {
  padding: 0.875rem 1.2rem;
}

.layout-sidebar.collapsed .nav-item span {
  opacity: 0;
  visibility: hidden;
}

.layout-sidebar:hover .nav-item {
  padding: 0.875rem 1.5rem;
}

.layout-sidebar:hover .nav-item span {
  opacity: 1;
  visibility: visible;
}

.nav-item:hover {
  background-color: var(--surface-hover);
  color: var(--primary-color);
}

.nav-item.active {
  background-color: var(--primary-50);
  color: var(--primary-color);
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid var(--surface-border);
}

.sidebar-footer .nav-item {
  margin: 0;
  padding: 0.875rem 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-color);
}

.user-info i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.layout-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.layout-main.collapsed {
  margin-left: 60px;
}

.layout-topbar {
  background-color: var(--surface-card);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,.05);
}

.topbar-right {
  display: flex;
  gap: 0.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
  font-weight: 600;
}

.layout-content {
  padding: 2rem;
  flex: 1;
}

/* Add these styles for a more polished look */
:root {
  --sidebar-width: 260px;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

.p-button.p-button-text {
  color: var(--text-color);
}

.p-button.p-button-text:hover {
  background: var(--surface-hover);
  color: var(--primary-color);
}
</style>
