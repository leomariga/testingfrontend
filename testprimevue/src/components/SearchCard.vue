<template>
  <div class="floating-card">
    <Card>
      <template #content>
        <div class="search-wrapper">
          <div class="search-container">
            <AutoComplete
              v-model="selectedCity"
              :suggestions="filteredCities"
              @complete="searchCity"
              optionLabel="name"
              placeholder="Pesquise uma cidade"
              dropdown
              :showClear="true"
              class="full-width-autocomplete"
            />
            <Dropdown
              v-model="selectedType"
              :options="propertyTypes"
              optionLabel="name"
              class="property-type-dropdown"
            />
            <Button @click="handleSearch" :label="buttonLabel" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import Card from 'primevue/card'
import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

export default {
  name: 'SearchCard',
  components: {
    Card,
    AutoComplete,
    Dropdown,
    Button
  },
  props: {
    buttonLabel: {
      type: String,
      default: 'Buscar'
    }
  },
  emits: ['search', 'city-changed', 'type-changed'],
  data() {
    return {
      selectedCity: null,
      selectedType: { name: 'Tudo', value: 'all' },
      filteredCities: [],
      cities: [
        { name: 'New York', code: 'NY', lat: 40.7128, lng: -74.0060 },
        { name: 'Rome', code: 'RM', lat: 41.9028, lng: 12.4964 },
        { name: 'London', code: 'LDN', lat: 51.5074, lng: -0.1278 },
        { name: 'Istanbul', code: 'IST', lat: 41.0082, lng: 28.9784 },
        { name: 'Paris', code: 'PRS', lat: 48.8566, lng: 2.3522 },
        { name: 'Cascavel', code: 'CV', lat: -24.9555, lng: -53.4552 }
      ],
      propertyTypes: [
        { name: 'Tudo', value: 'all' },
        { name: 'Apartamentos', value: 'apartments' },
        { name: 'Casas', value: 'houses' },
        { name: 'Barracões', value: 'warehouses' },
        { name: 'Lotes', value: 'lots' }
      ]
    }
  },
  methods: {
    searchCity(event) {
      let query = event.query.toLowerCase()
      this.filteredCities = this.cities.filter(city => 
        city.name.toLowerCase().includes(query)
      )
    },
    handleSearch() {
      this.$emit('search', {
        city: this.selectedCity,
        type: this.selectedType
      })
    }
  },
  watch: {
    selectedCity(newCity) {
      this.$emit('city-changed', newCity)
    },
    selectedType(newType) {
      this.$emit('type-changed', newType)
    }
  }
}
</script>

<style>
.floating-card {
  position: absolute;
  top: 1rem;
  left: calc(25% - 2rem);
  right: 1rem;
  z-index: 1000;
  width: calc(50% - 2rem);
}

.search-container {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.full-width-autocomplete {
  flex: 1;
}

:deep(.full-width-autocomplete) {
  position: relative;
  width: 100%;
}

:deep(.full-width-autocomplete .p-autocomplete) {
  width: 100%;
}

:deep(.full-width-autocomplete input) {
  width: 100%;
  box-sizing: border-box;
}

:deep(.p-autocomplete-panel) {
  width: calc(100% - 2rem) !important;
  left: 1rem !important;
}

:deep(.p-card-content) {
  padding: 1rem;
}

:deep(.property-type-dropdown) {
  width: auto;
  min-width: 150px;
}
</style> 