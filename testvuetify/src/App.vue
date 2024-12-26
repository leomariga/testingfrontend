<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
      elevation="2"
      color="grey-lighten-4"
      width="256"
    >

      <!-- Company Logo Section -->
      <div class="px-4 py-4 d-flex align-center">
        <v-avatar size="40" color="primary" class="mr-4">
          <v-icon color="white" size="large">mdi-home-city-outline</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">Proptracker</div>
          <div class="text-caption text-medium-emphasis">IA imobiliária</div>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- Navigation Items -->
      <v-list class="py-2">
        <!-- Main Navigation -->
        <v-list-subheader class="font-weight-bold">Pesquisa imobiliária</v-list-subheader>
        <v-list-item
          v-for="route in navigationRoutes"
          :key="route.name"
          :to="route.path"
          :value="route.name"
          color="primary"
          rounded="lg"
          class="mb-1"
        >
          <template v-slot:prepend>
            <v-icon :icon="route.meta.icon"></v-icon>
          </template>

          <v-list-item-title>{{ route.name }}</v-list-item-title>
        </v-list-item>

        <!-- System Section -->
        <v-list-subheader class="font-weight-bold mt-4">Sistema</v-list-subheader>
        <v-list-item
          value="help"
          color="primary"
          rounded="lg"
          class="mb-1"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-help-circle"></v-icon>
          </template>
          <v-list-item-title>Ajuda</v-list-item-title>
        </v-list-item>

        <v-list-item
          value="logout"
          color="error"
          rounded="lg"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-logout"></v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Footer -->
      <template v-slot:append>
        <div class="pa-4">
          <v-divider class="mb-2"></v-divider>
          <div class="text-caption text-medium-emphasis">
            Version 1.0.0
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    drawer: true,
  }),
  computed: {
    navigationRoutes() {
      return this.$router.options.routes.filter(route => route.meta?.showInNav)
    }
  }
}
</script>

<style scoped>
.v-list-item--active {
  background: rgb(var(--v-theme-primary-lighten-4));
}

.v-navigation-drawer :deep(.v-list-item__prepend) {
  width: 36px;
}
</style>
