<template>
  <div>
    <ul><button @click="getData">Get API data</button> max: {{ this.maxValue }} min: {{ this.minValue }} <button @click="fillMissingCells">Fill Missing Cells</button></ul>
    <div id="mapContainer"></div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from 'axios';

export default {
  name: "GridHeatMap",
  data() {
    return {
      map: null,
      imodata: [],
      gridLayer: null,
      maxValue: 0,
      minValue: 0,
      cellsData: new Map(),
      cellSize: 0.005, // Size of grid cells in degrees (adjust as needed)
      data: [{"lat":-25.0597949,"lon":-53.3775221, "tx":150000},
              {"lat":-24.974903,"lon":-53.5071357 , "tx":350000},
              {"lat":-24.9700817,"lon":-53.4457271, "tx":550000},
              {"lat":-24.9395051,"lon":-53.4486732, "tx":650000},
              {"lat":-24.9756196,"lon":-53.4748901, "tx":2350000},
              {"lat":-25.9455332,"lon":-53.7277565, "tx":350000},
              {"lat":-24.9752228,"lon":-53.4816508, "tx":50000},
              {"lat":-24.9269993,"lon":-53.4410647, "tx":10},
              {"lat":-24.9729866,"lon":-53.5076899, "tx":1000},
              {"lat":-24.9603557,"lon":-53.5045996, "tx":10},
              {"lat":-24.9725358,"lon":-53.4705584, "tx":1000},
              {"lat":-24.9209976,"lon":-53.4213395, "tx":20000},
              {"lat":-24.9593145,"lon":-53.4743218, "tx":2400},
              {"lat":-24.9271047,"lon":-53.462293 , "tx":250000},
              {"lat":-24.9780928,"lon":-53.4651462, "tx":25400},
              {"lat":-24.9965931,"lon":-53.461171 , "tx":2450000},
              {"lat":-24.9967086,"lon":-53.4597261, "tx":2505000},
              {"lat":-24.9394109,"lon":-53.4714975, "tx":40000},
              {"lat":-24.9758704,"lon":-53.4358302, "tx":250000},
              {"lat":-24.9716516,"lon":-53.4181271, "tx":6000},
              {"lat":-24.9703903,"lon":-53.4371392, "tx":24000},
              {"lat":-24.9743758,"lon":-53.4541515, "tx":2520000},
              {"lat":-24.9380555,"lon":-53.4492587, "tx":2000},
              {"lat":-24.9283238,"lon":-53.4596223, "tx":230000},
              {"lat":-24.9518266,"lon":-53.4853865, "tx":10000}]
    };
  },
  mounted() {
    this.initializeMap();
    this.createGrid();
  },
  methods: {
    initializeMap() {
      this.map = L.map("mapContainer", {
        zoomControl: true,
        zoom: 1,
        fadeAnimation: true
      }).setView([-24.9518266,-53.4853865], 12);
      
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
    },

    createGrid() {
      if (this.gridLayer) {
        this.map.removeLayer(this.gridLayer);
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
      
      this.gridLayer.addTo(this.map);
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
    if (this.map) {
      this.map.remove();
    }
  }
},
};
</script>

<style scoped>
#mapContainer {
  width: 100vw;
  height: 85vh;
}
</style> 