<template>
  <li class="nav-item">
    <router-link
      :to="to"
      custom
      v-slot="{ href, navigate, isActive }"
    >
      <a 
        :href="href" 
        @click="navigate" 
        class="nav-link"
        :class="{ active: isActive }"
      >
        <slot>
          <i :class="icon"></i>
          <p>{{name}}</p>
        </slot>
      </a>
    </router-link>
  </li>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'sidebar-link',
  props: {
    name: String,
    icon: String,
    to: {
      type: [String, Object],
      required: true
    }
  }
})
</script>

<style>
.nav-item .nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
}
</style>
