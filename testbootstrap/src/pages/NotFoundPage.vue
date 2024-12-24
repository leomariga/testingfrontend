<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <card>
            <template #header>
              <h4 class="card-title">404 Not Found</h4>
              <p class="card-category">The page you're looking for doesn't exist.</p>
            </template>
            <router-link to="/admin/overview" class="btn btn-primary">
              Go to Dashboard
            </router-link>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Card from '@/components/Cards/Card.vue'

export default defineComponent({
  name: 'NotFoundPage',
  components: {
    Card
  }
})
</script>
