<template>
  <ul><button @click="getData">GetData</button></ul>
  <ul>
    <li v-for="idata in imodata" :key="idata.ID">
      {{ idata.Area }}, {{ idata.Price }}
    </li>
  </ul>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      imodata: null
    }
  },
  methods: {
    async getData() {
      axios.get('http://localhost:8000').then(response => (this.imodata = response.data))

    }
  }
}
</script>