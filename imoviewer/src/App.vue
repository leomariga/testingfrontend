<template>
  <div>
    <button @click="activeComp = 'TestAPI'">Test API</button>
    <button @click="activeComp = 'HeatMapViewer'">Heatmap</button>
    <button @click="activeComp = ''">GridHeatMap</button>
    <button @click="activeComp = 'ClusterMarker'">ClusterMarker</button>
    <button @click="activeComp = 'ClusterMarker2'">ClusterMarker2</button>
    <component :is="activeComp"></component>
  </div>
</template>

<script>
import HeatMapViewer from './components/HeatMapViewer.vue';
import ClusterMarker2 from './components/ClusterMarker2.vue';
import ClusterMarker from './components/ClusterMarker.vue';
import TestAPI from './components/TestAPI.vue';
export default {
  name: 'App',
  components: {
    HeatMapViewer,
    ClusterMarker2,
    ClusterMarker,
    TestAPI,
  },
  data() {
      return {
        activeComp: ''
      }
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
