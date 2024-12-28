<template>
  <div class="price-viewer">
    <SearchCard 
      @search="getData"
      @city-changed="handleCityChange"
      buttonLabel="Ver no mapa"
    />
    <div id="map" class="map-container"></div>
  </div>
</template>

<script>
import SearchCard from '@/components/SearchCard.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import axios from 'axios'

// Define map variables outside of Vue component
let leafletMap = null;
let markerGroup = null;

// Custom marker icon configuration
const createCustomIcon = (price) => {
  const formattedPrice = Number(price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-content">
        <div class="marker-price">
          ${formattedPrice}
          <div class="marker-pointer"></div>
        </div>
      </div>
    `,
    iconSize: [120, 48],
    iconAnchor: [60, 24],
    popupAnchor: [0, -24]
  });
};

export default {
  name: 'PriceViewer',
  components: {
    SearchCard
  },
  data() {
    return {
      imodata: [],
      data: []
    }
  },
  mounted() {
    this.initMap();
  },
  onBeforeUnmount() {
    if (leafletMap) {
      leafletMap.remove();
    }
  },
  methods: {
    async getData() {
      try {
        const response = await axios.get('http://localhost:8000');
        this.imodata = response.data;
        this.data = this.imodata.map(item => ({
          lat: item.Latitude,
          lon: item.Longitude,
          price: item.Price,
          details: {
            address: item.Address || 'Não especificado',
            area: item.Area || 'Não especificada',
            rooms: item.Rooms || 'Não especificado'
          }
        }));
        
        if (leafletMap) {
          this.remapScreen();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    handleCityChange(newCity) {
      if (newCity?.lat && newCity?.lng && leafletMap) {
        leafletMap.setView([newCity.lat, newCity.lng], 13);
      }
    },
    initMap() {
      const defaultLocation = [-24.9555, -53.4552];
      
      // Use the global variable instead of this.map
      leafletMap = L.map('map', {
        closePopupOnClick: true
      }).setView(defaultLocation, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);

      // Use the global variable instead of this.group
      markerGroup = L.markerClusterGroup({
        maxClusterRadius: 30,
        spiderfyDistanceMultiplier: 1.5,
        disableClusteringAtZoom: 16,
        spiderfyOnMaxZoom: true,
        chunkedLoading: true,
        removeOutsideVisibleBounds: true,
        animateAddingMarkers: false,
        zoomToBoundsOnClick: true,
        showCoverageOnHover: false,
      });

      leafletMap.on('zoomstart', () => {
        leafletMap.closePopup();
        if (markerGroup) {
          markerGroup.eachLayer((layer) => {
            if (layer.closePopup) {
              layer.closePopup();
            }
          });
        }
      });

      leafletMap.on('movestart', () => {
        leafletMap.closePopup();
      });

      leafletMap.addLayer(markerGroup);
    },
    remapScreen() {
      if (!leafletMap || !markerGroup) return;

      markerGroup.clearLayers();
      leafletMap.closePopup();

      if (this.data.length > 0) {
        const markers = this.data.map((d) => {
          const marker = L.marker([d.lat, d.lon], {
            icon: createCustomIcon(d.price)
          });
          
          const popupContent = `
            <div class="property-popup">
              <div class="property-price">R$ ${Number(d.price).toLocaleString('pt-BR')}</div>
              <div class="property-details">
                <p><i class="pi pi-home"></i> ${d.details.address}</p>
                <p><i class="pi pi-chart-bar"></i> ${d.details.area} m²</p>
                <p><i class="pi pi-building"></i> ${d.details.rooms} quartos</p>
              </div>
            </div>
          `;

          const popup = L.popup({
            closeButton: true,
            closeOnClick: true,
            autoClose: true,
            className: 'property-popup-wrapper',
            offset: [0, -24]
          }).setContent(popupContent);

          marker.on('click', (e) => {
            leafletMap.closePopup();
            markerGroup.eachLayer((layer) => {
              if (layer.closePopup) {
                layer.closePopup();
              }
            });
            
            popup.setLatLng(e.target.getLatLng()).openOn(leafletMap);
          });

          marker.on('remove', () => {
            leafletMap.closePopup();
          });

          return marker;
        });

        markerGroup.addLayers(markers);
      }
    }
  },
  watch: {
    selectedCity(city) {
      if (city?.lat && city?.lng && leafletMap) {
        leafletMap.setView([city.lat, city.lng], 13);
      }
    }
  }
}
</script>
<style>
.price-viewer {
  position: relative;
  height: 100%;
}

.map-container {
  height: calc(100vh - 100px);
  width: 100%;
}

/* Custom marker styles */
.custom-marker {
  background: transparent;
}

.marker-content {
  position: relative;
  transform: translateY(-24px);
}

.marker-price {
  background: white;
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  padding: 4px 12px;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.85rem;
  line-height: 1.2;
  white-space: nowrap;
  position: relative;
  display: inline-block;
}

/* Shadow under the price box only */
.marker-price::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  z-index: -1;
}

/* Talk balloon pointer - now separate from shadow */
.marker-pointer {
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  width: 16px;
  height: 8px;
  overflow: hidden;
}

.marker-pointer::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid var(--primary-color);
  transform: translateX(-50%) rotate(45deg);
  top: -8px;
  left: 50%;
}

/* Remove unused styles */
.marker-pin {
  display: none;
}

/* Property popup styles */
.property-popup {
  padding: 10px;
  min-width: 200px;
}

.property-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 10px;
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 5px;
}

.property-details p {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-details i {
  color: var(--primary-color);
}

/* Cluster customization */
.marker-cluster {
  background-color: var(--primary-color) !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.marker-cluster div {
  background-color: rgba(255, 255, 255, 0.9) !important;
  color: var(--primary-color) !important;
  width: 30px !important;
  height: 30px !important;
  margin: 0 !important;
  font-size: 14px !important;
  font-weight: bold;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
}

/* Make sure the cluster is visible on all map backgrounds */
.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: var(--primary-color) !important;
  width: 40px !important;
  height: 40px !important;
}

.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgba(255, 255, 255, 0.9) !important;
  color: var(--primary-color) !important;
  width: 30px !important;
  height: 30px !important;
  margin: 0 !important;
}
</style>
