<template>
  <div class="price-viewer">
    <SearchCard 
      @search="getData"
      @city-changed="handleCityChange"
      buttonLabel="Ver histórico"
    />
    <ColorRangeSlider
      v-if="data.length > 0"
      :default-min="minValue"
      :default-max="maxValue"
      :absolute-min="absoluteMin"
      :absolute-max="absoluteMax"
      @range-changed="handleRangeChange"
    />
    <DateRangeSlider
      v-if="data.length > 0"
      @range-changed="handleDateRangeChange"
    />
    <div id="map-container" class="map-container"></div>
  </div>
</template>

<script>
import SearchCard from '@/components/SearchCard.vue'
import ColorRangeSlider from '@/components/ColorRangeSlider.vue'
import DateRangeSlider from '@/components/DateRangeSlider.vue'
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import axios from 'axios'

// Define map variables outside of Vue component
let leafletMap = null;

export default {
  name: "GridHeatMap",
  components: {
    SearchCard,
    ColorRangeSlider,
    DateRangeSlider
  },
  data() {
    return {
      imodata: [],
      gridLayer: null,
      maxValue: 0,
      minValue: 0,
      cellsData: new Map(),
      cellSize: 0.005,
      data: [],
      absoluteMin: 0,
      absoluteMax: 0
    }
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

      const cells = this.calculateGridCells();
      this.gridLayer = L.featureGroup();
      
      // Add legend first
      this.addLegend();
      
      cells.forEach(cell => {
        const bounds = [
          [cell.minLat, cell.minLon],
          [cell.maxLat, cell.maxLon]
        ];
        
        const color = this.getColorForValue(cell.avgTx);
        
        const rectangle = L.rectangle(bounds, {
          color: "#333",
          weight: 0.5,
          fillColor: color,
          fillOpacity: 0.7,
          className: 'grid-cell'
        });
        
        const formattedAvg = cell.avgTx.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        
        rectangle.bindPopup(`
          <div style="font-family: Arial, sans-serif;">
            <strong>Preço médio/m²:</strong> ${formattedAvg}<br>
            <strong>Amostras:</strong> ${cell.count}<br>
            ${cell.count === 0 ? '<em>(Valor interpolado)</em>' : ''}
          </div>
        `);
        
        this.gridLayer.addLayer(rectangle);
      });
      
      this.gridLayer.addTo(leafletMap);
    },

    addLegend() {
      const existingLegend = document.querySelector('.legend');
      if (existingLegend) {
        existingLegend.remove();
      }

      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'legend');
        const grades = [
          this.minValue,
          this.minValue + (this.maxValue - this.minValue) * 0.25,
          this.minValue + (this.maxValue - this.minValue) * 0.5,
          this.minValue + (this.maxValue - this.minValue) * 0.75,
          this.maxValue
        ];

        div.innerHTML = '<h4>Preço/m²</h4>';
        
        for (let i = 0; i < grades.length; i++) {
          const color = this.interpolateViridis(i *0.25);
          const formattedValue = grades[i].toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
          
          div.innerHTML += `
            <i style="background: ${color}"></i>
            ${formattedValue}<br>
          `;
        }

        return div;
      };
      legend.addTo(leafletMap);
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
      const clampedValue = Math.min(Math.max(value, this.minValue), this.maxValue)
      const normalized = (clampedValue - this.minValue) / (this.maxValue - this.minValue)
      return this.interpolateViridis(normalized)
    },

    interpolateViridis(t) {
      const c0 = [68, 1, 84];    // Dark purple
      const c1 = [65, 182, 196]; // Turquoise
      const c2 = [253, 231, 37]; // Yellow

      let r, g, b;
      if (t < 0.5) {
        const x = t * 2;
        r = c0[0] + (c1[0] - c0[0]) * x;
        g = c0[1] + (c1[1] - c0[1]) * x;
        b = c0[2] + (c1[2] - c0[2]) * x;
      } else {
        const x = (t - 0.5) * 2;
        r = c1[0] + (c2[0] - c1[0]) * x;
        g = c1[1] + (c2[1] - c1[1]) * x;
        b = c1[2] + (c2[2] - c1[2]) * x;
      }
      
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
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

        // Calculate initial min/max values after data is loaded
        const values = this.data.map(d => d.tx);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        this.absoluteMin = Math.max(0, mean - (2 * stdDev));
        this.absoluteMax = mean + (2 * stdDev);
        this.minValue = Math.max(0, mean - stdDev);
        this.maxValue = mean + stdDev;

        this.cellsData.clear();
        this.createGrid();
        
        // Use Promise.all for multiple async operations
        for (let i = 0; i < 5; i++) {
          this.fillMissingCells();
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    handleCityChange(newCity) {
      if (newCity?.lat && newCity?.lng && leafletMap) {
        leafletMap.setView([newCity.lat, newCity.lng], 13);
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
    handleRangeChange({ min, max }) {
      this.minValue = min
      this.maxValue = max
      this.createGrid() // Redraw the grid with new colors
    },
    handleDateRangeChange() {
      // Filter data based on date range
      // You'll need to add date filtering logic here
    },
  beforeUnmount() {
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }
    // Clear any remaining timeouts
    this.cellsData.clear();
  }
},
};
</script>

<style scoped>
.map-container {
  height: calc(100vh - 100px);
  width: 100%;
  position: relative;
}

.price-viewer {
  position: relative;
  height: 100%;
}

:deep(.legend) {
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.4);
  line-height: 1.5;
}

:deep(.legend h4) {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: bold;
}

:deep(.legend i) {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.7;
}
</style> 