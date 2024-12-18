<!-- MapViewer.vue -->
<template>
    <div>
      <ul><button @click="getData">Get API data</button></ul>
    </div>
    <div id="mapContainer"></div>
  </template>
  
  <script>

  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import "@meteo-concept/leaflet-inflatable-markers-group"
    import axios from 'axios'
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });


  
  export default {
  name: "ClusterMarker2",
  data() {
    return {
      map: null,
      imodata: [],
      group: null,
      data:  [{"lat":-25.0597949,"lon":-53.3775221, "tx":250000},
              {"lat":-24.974903,"lon":-53.5071357 , "tx":250000},
              {"lat":-24.9700817,"lon":-53.4457271, "tx":250000},
              {"lat":-24.9395051,"lon":-53.4486732, "tx":250000},
              {"lat":-24.9756196,"lon":-53.4748901, "tx":250000},
              {"lat":-25.9455332,"lon":-53.7277565, "tx":250000},
              {"lat":-24.9752228,"lon":-53.4816508, "tx":250000},
              {"lat":-24.9269993,"lon":-53.4410647, "tx":250000},
              {"lat":-24.9729866,"lon":-53.5076899, "tx":250000},
              {"lat":-24.9603557,"lon":-53.5045996, "tx":250000},
              {"lat":-24.9725358,"lon":-53.4705584, "tx":250000},
              {"lat":-24.9209976,"lon":-53.4213395, "tx":250000},
              {"lat":-24.9593145,"lon":-53.4743218, "tx":250000},
              {"lat":-24.9271047,"lon":-53.462293 , "tx":250000},
              {"lat":-24.9780928,"lon":-53.4651462, "tx":250000},
              {"lat":-24.9965931,"lon":-53.461171 , "tx":250000},
              {"lat":-24.9967086,"lon":-53.4597261, "tx":250000},
              {"lat":-24.9394109,"lon":-53.4714975, "tx":250000},
              {"lat":-24.9758704,"lon":-53.4358302, "tx":250000},
              {"lat":-24.9716516,"lon":-53.4181271, "tx":250000},
              {"lat":-24.9703903,"lon":-53.4371392, "tx":250000},
              {"lat":-24.9743758,"lon":-53.4541515, "tx":250000},
              {"lat":-24.9380555,"lon":-53.4492587, "tx":250000},
              {"lat":-24.9283238,"lon":-53.4596223, "tx":250000},
              {"lat":-24.9518266,"lon":-53.4853865, "tx":250000}]
    };
  },
  mounted() {
    this.map = L.map("mapContainer").setView([-24.9518266,-53.4853865], 12);
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.group = L.layerGroup().addTo(this.map);
    this.remapScreen()
  },
  onBeforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    choseColor(value) {
          if (value < 100000) {
                return "#5BB6D1";
          } else if (value < 200000) {
                return "#649E56";
          } else if (value < 500000) {
                return "#DFDF00";
          } else if (value < 1000000) {
                return "#DF85DB";
          } else {
                return "#FF5050";
          }
    },

    remapScreen() {
      this.group.clearLayers();
      this.group = L.inflatableMarkersGroup({
        iconCreateFunction: (icon) => {
          const chosen = icon.baseMarker;
          const color = this.choseColor(chosen.myValue);
          return L.divIcon(
              {
                  html: '<div style="background-color:'+color+';"></div>',
                  iconSize: [
                        12,
                        12
                      ],
                  className: "myIcon deflated"
              }
            );
          }
      });
      this.data.forEach( (d) => {
        const color = this.choseColor(d.tx);
        const marker = L.marker([d.lat, d.lon],
            {
               icon: L.divIcon(
                   {
                       html: '<div style="background:'+color+';">' + d.tx.toFixed(3) + '</div>',
                       iconSize:[70, 22], // this value is necessary for this plugin
                       iconAnchor:[14, 8],
                       className:'myIcon inflated',
                   }
                )
            },
        );
        marker.myValue = d.tx; // hijack the L.Layer object to pass data
        this.group.addLayer(marker);
      });
      this.group.addTo(this.map);
    },

    async getData() {
      axios.get('http://localhost:8000').then(response => {
        this.imodata = response.data
        console.log("Conteúdo atualizado de data:", this.imodata);
        // Transforma imodata para o formato desejado e atualiza 'data'
        this.data.splice(0, this.data.length,
        ...this.data = this.imodata.map(item => ({
                    lat: item.Latitude,
                    lon: item.Longitude,
                    tx: item.Price
                  })));
        console.log("Conteúdo atualizado de data:", this.data);
        this.remapScreen()
      })
    }

  }
};
</script>

<style scoped>
  #mapContainer {
    width: 100vw;
    height: 85vh;
  }

  .myIcon div {
    border: solid black 1px;
  }

  .myIcon.deflated div {
    border-radius: 100%;
    opacity: 70%;
    height: 100%;
    width: 100%;
  }

  .myIcon.inflated {
    /* we need to give an explicit size to the icons to find which icons
        conflict with each other but we actually want them to be auto-sized */
    width: auto !important;
    height: auto !important;
  }

  .myIcon.inflated div {
    border-radius: 6px;
    text-align: center;
    padding: 1px;
  }
</style>