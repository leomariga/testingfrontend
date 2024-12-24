<template>
  <table class="table">
    <thead>
      <slot name="columns">
        <tr>
          <th v-for="column in columns" :key="column">{{column}}</th>
        </tr>
      </slot>
    </thead>
    <tbody>
      <tr v-for="(item, index) in data" :key="index">
        <slot :row="item">
          <td v-for="column in getVisibleColumns(item)" :key="column">{{itemValue(item, column)}}</td>
        </slot>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'l-table',
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },
  methods: {
    hasValue(item, column) {
      return item[column.toLowerCase()] !== undefined
    },
    itemValue(item, column) {
      return item[column.toLowerCase()]
    },
    getVisibleColumns(item) {
      if (!this.columns) return []
      return this.columns.filter(column => this.hasValue(item, column))
    }
  }
})
</script>

<style>
</style>
