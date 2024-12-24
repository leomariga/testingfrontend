<template>
  <card>
    <template #header>
      <slot name="header"></slot>
    </template>
    <div class="chart-container">
      <canvas :id="chartId" class="ct-chart"></canvas>
    </div>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </card>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Card from './Card.vue'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'ChartCard',
  components: {
    Card
  },
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartType: {
      type: String,
      default: 'Line'
    },
    chartOptions: {
      type: Object,
      default: () => ({})
    },
    responsiveOptions: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartId = ref(`chart-${Math.random().toString(36).substring(2, 15)}`)
    let chart = null

    const createChart = () => {
      const canvas = document.getElementById(chartId.value)
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (chart) {
        chart.destroy()
      }
      
      chart = new Chart(ctx, {
        type: props.chartType.toLowerCase(),
        data: props.chartData,
        options: {
          ...props.chartOptions,
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }

    onMounted(() => {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        createChart()
      }, 0)
    })

    onBeforeUnmount(() => {
      if (chart) {
        chart.destroy()
      }
    })

    // Watch for data changes to update the chart
    watch(() => props.chartData, (newVal) => {
      if (chart) {
        chart.data = newVal
        chart.update()
      }
    }, { deep: true })

    return {
      chartId
    }
  }
})
</script>

<style>
.chart-container {
  position: relative;
  height: 300px;
  margin: 20px 0;
}

.ct-chart {
  height: 100%;
  width: 100%;
}
</style>
