<template>
  <div class="price-viewer">
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
              <Button @click="getData" label="Buscar" />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div id="map-container" class="map-container"></div>
  </div>
</template>



<script>
import Card from 'primevue/card';
import AutoComplete from 'primevue/autocomplete';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from 'axios';

// Define map variables outside of Vue component
let leafletMap = null;

export default {
  name: "GridHeatMap",
  components: {
    Card,
    AutoComplete,
    Dropdown,
    Button
  },
  data() {
    return {
      imodata: [],
      gridLayer: null,
      maxValue: 0,
      minValue: 0,
      cellsData: new Map(),
      cellSize: 0.005, // Size of grid cells in degrees (adjust as needed)
      data: [],
      selectedCity: null,
      cities: [
        { name: 'New York', code: 'NY', lat: 40.7128, lng: -74.0060 },
        { name: 'Rome', code: 'RM', lat: 41.9028, lng: 12.4964 },
        { name: 'London', code: 'LDN', lat: 51.5074, lng: -0.1278 },
        { name: 'Istanbul', code: 'IST', lat: 41.0082, lng: 28.9784 },
        { name: 'Paris', code: 'PRS', lat: 48.8566, lng: 2.3522 },
        { name: 'Cascavel', code: 'CV', lat: -24.9555, lng: -53.4552 }
      ],
      filteredCities: [],
      selectedType: { name: 'Tudo', value: 'all' },
      propertyTypes: [
        { name: 'Tudo', value: 'all' },
        { name: 'Apartamentos', value: 'apartments' },
        { name: 'Casas', value: 'houses' },
        { name: 'Barracões', value: 'warehouses' },
        { name: 'Lotes', value: 'lots' }
      ],     
    };
  },
  mounted() {
    this.initializeMap();
    this.createGrid();
  },
  methods: {
    initializeMap() {
      leafletMap = L.map("map-container", {
        zoomControl: true,
        zoom: 1,
        fadeAnimation: true
      }).setView([-24.9518266,-53.4853865], 12);
      
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap);
    },
    searchCity(event) {
      let query = event.query.toLowerCase();
      this.filteredCities = this.cities.filter(city => 
        city.name.toLowerCase().includes(query)
      );
    },
    createGrid() {
      if (this.gridLayer) {
        leafletMap.removeLayer(this.gridLayer);
      }

      // Create grid cells
      const cells = this.calculateGridCells();
      
      this.gridLayer = L.featureGroup();
      
      cells.forEach(cell => {
        const bounds = [
          [cell.minLat, cell.minLon],
          [cell.maxLat, cell.maxLon]
        ];
        
        const color = this.getColorForValue(cell.avgTx);
        const rectangle = L.rectangle(bounds, {
          color: "#000",
          weight: 1,
          fillColor: color,
          fillOpacity: 0.5
        });
        
        rectangle.bindPopup(`Average TX: ${cell.avgTx.toFixed(3)}<br>Points: ${cell.count}`);
        this.gridLayer.addLayer(rectangle);
      });
      
      this.gridLayer.addTo(leafletMap);
    },

    calculateGridCells() {
        if (this.data.length === 0) return [];
        
        // Only clear if we're processing new data points
        if (this.cellsData.size === 0) {
            this.data.forEach(point => {
            const cellX = Math.floor(point.lon / this.cellSize);
            const cellY = Math.floor(point.lat / this.cellSize);
            const key = `${cellX},${cellY}`;
            
            if (!this.cellsData.has(key)) {
                this.cellsData.set(key, {
                minLon: cellX * this.cellSize,
                maxLon: (cellX + 1) * this.cellSize,
                minLat: cellY * this.cellSize,
                maxLat: (cellY + 1) * this.cellSize,
                sum: 0,
                count: 0,
                cellX,
                cellY
                });
            }
            
            const cell = this.cellsData.get(key);
            cell.sum += point.tx;
            cell.count += 1;
            });
        }

        return Array.from(this.cellsData.values())
            .map(cell => ({
            ...cell,
            avgTx: cell.count > 0 ? cell.sum / cell.count : cell.sum
            }));
        },

    getColorForValue(value) {
      // Calculate mean and standard deviation
      const mean = this.data.reduce((sum, d) => sum + d.tx, 0) / this.data.length;
      const variance = this.data.reduce((sum, d) => sum + Math.pow(d.tx - mean, 2), 0) / this.data.length;
      const stdDev = Math.sqrt(variance);

      // Set limits at 2 standard deviations from mean
      this.minValue = Math.max(0, mean - (1 * stdDev)); // Trunk to 0 if negative
      this.maxValue = mean + (1 * stdDev);

      // Clamp value between min and max
      const clampedValue = Math.min(Math.max(value, this.minValue), this.maxValue);
      
      // Normalize the clamped value
      const normalized = (clampedValue - this.minValue) / (this.maxValue - this.minValue);
      
      // RGB interpolation from blue to red
      const r = Math.round(normalized * 255);
      const b = Math.round((1 - normalized) * 255);
      return `rgb(${r}, 0, ${b})`;
    },

    async getData() {
        try {
            const response = await axios.get('http://localhost:8000');
            this.imodata = response.data;
            this.data = this.imodata
            .filter(item => item.Latitude && item.Longitude && item.Area)
            .map(item => ({
                lat: item.Latitude,
                lon: item.Longitude,
                tx: item.Price/item.Area
            }));
            this.cellsData.clear(); // Clear existing cells before creating new grid
            this.createGrid();
            for (let i = 0; i < 5; i++) {
                this.fillMissingCells();
                await new Promise(resolve => setTimeout(resolve, 200)); // 1 second delay
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        },
    fillMissingCells() {
        let hasNewCells = false;
        const existingCells = new Map(this.cellsData);
        
        // Find min/max coordinates to determine grid boundaries
        const allCells = Array.from(existingCells.values());
        const minX = Math.min(...allCells.map(c => c.cellX));
        const maxX = Math.max(...allCells.map(c => c.cellX));
        const minY = Math.min(...allCells.map(c => c.cellY));
        const maxY = Math.max(...allCells.map(c => c.cellY));

        // Check each possible cell position
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
              const key = `${x},${y}`;
              
              // Skip if cell already exists
              if (existingCells.has(key)) continue;

              // Check neighbors (up, down, left, right)
              const neighbors = [
                  existingCells.get(`${x},${y+1}`),
                  existingCells.get(`${x},${y-1}`),
                  existingCells.get(`${x+1},${y}`),
                  existingCells.get(`${x-1},${y}`)
              ].filter(Boolean);

              // If we have at least 2 neighbors, create new cell
              if (neighbors.length >= 3) {
                  const avgTx = neighbors.reduce((sum, cell) => {
                  const cellValue = cell.count > 0 ? cell.sum / cell.count : cell.sum;
                  return sum + cellValue;
                  }, 0) / neighbors.length;
                  
                  this.cellsData.set(key, {
                  minLon: x * this.cellSize,
                  maxLon: (x + 1) * this.cellSize,
                  minLat: y * this.cellSize,
                  maxLat: (y + 1) * this.cellSize,
                  sum: avgTx,  // Store the average as the sum for interpolated cells
                  count: 0,    // Use count 0 to identify interpolated cells
                  cellX: x,
                  cellY: y
                  });
                  hasNewCells = true;
              }
            }
        }

        // If new cells were added, update the grid
        if (hasNewCells) {
            this.createGrid();
        }
        },
  beforeUnmount() {
    if (leafletMap) {
      leafletMap.remove();
    }
  }
},
};
</script>

<style scoped>
.floating-card {
  position: absolute;
  top: 1rem;
  left: calc(25% - 2rem);
  right: 1rem;
  z-index: 1000;
  width: calc(50% - 2rem);
}

.map-container {
  height: calc(100vh - 100px);
  width: 100%;
  position: relative;
}
/* Search container styles */
.search-container {
  padding: 1rem;
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

:deep(.p-card) {
  margin: 0;
  padding: 0;
  border: none;
}


:deep(.p-card-body) {
  padding: 0;
  margin: 0;
  border: none;
}

.price-viewer {
  position: relative;
  height: 100%;
}
</style> 