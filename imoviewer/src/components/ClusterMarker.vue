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
  import "leaflet.markercluster/dist/leaflet.markercluster"
  import "../../public/MarkerCluster.css"
  import "../../public/MarkerCluster.Default.css"
  import axios from 'axios'

  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });


  
  export default {
  name: "ClusterMarker",
  data() {
    return {
      map: null,
      imodata: [],
      group: null,
      data:       [{"lat":-25.0597949,"lon":-53.3775221, "tx":1       },
                  {"lat":-24.974903,"lon":-53.5071357 , "tx":0.94697 },
                  {"lat":-24.9700817,"lon":-53.4457271, "tx":0.860882},
                  {"lat":-24.9395051,"lon":-53.4486732, "tx":0.824725},
                  {"lat":-24.9756196,"lon":-53.4748901, "tx":0.816116},
                  {"lat":-25.9455332,"lon":-53.7277565, "tx":0.80062 },
                  {"lat":-24.9752228,"lon":-53.4816508, "tx":0.791322},
                  {"lat":-24.9269993,"lon":-53.4410647, "tx":0.774793},
                  {"lat":-24.9729866,"lon":-53.5076899, "tx":0.755854},
                  {"lat":-24.9603557,"lon":-53.5045996, "tx":0.680096},
                  {"lat":-24.9725358,"lon":-53.4705584, "tx":0.602617},
                  {"lat":-24.9209976,"lon":-53.4213395, "tx":0.544607},
                  {"lat":-24.9593145,"lon":-53.4743218, "tx":0.516529},
                  {"lat":-24.9271047,"lon":-53.462293 , "tx":0.513085},
                  {"lat":-24.9780928,"lon":-53.4651462, "tx":0.50792 },
                  {"lat":-24.9965931,"lon":-53.461171 , "tx":0.50792 },
                  {"lat":-24.9967086,"lon":-53.4597261, "tx":0.499311},
                  {"lat":-24.9394109,"lon":-53.4714975, "tx":0.482094},
                  {"lat":-24.9758704,"lon":-53.4358302, "tx":0.438705},
                  {"lat":-24.9716516,"lon":-53.4181271, "tx":0.430441},
                  {"lat":-24.9703903,"lon":-53.4371392, "tx":0.421832},
                  {"lat":-24.9743758,"lon":-53.4541515, "tx":0.411501},
                  {"lat":-24.9380555,"lon":-53.4492587, "tx":0.327135},
                  {"lat":-24.9283238,"lon":-53.4596223, "tx":0.283058},
                  {"lat":-24.9518266,"lon":-53.4853865, "tx":0.25826 }]
    };
  },
  mounted() {
    this.map = L.map("mapContainer", {zoomControl: true,zoom:1,zoomAnimation:false,fadeAnimation:true,markerZoomAnimation:true}).setView([-24.9518266,-53.4853865], 12);
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    this.group = L.markerClusterGroup();
    this.remapScreen();


  },

  onBeforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },

  methods: {

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
    },

    remapScreen() {
      this.group.clearLayers();
      this.group = L.markerClusterGroup();
      this.data.forEach((d) => {
          // const color = choseColor(d.tx);
          const marker = L.marker([d.lat, d.lon]);
          marker.title = d.tx; // hijack the L.Layer object to pass data
          this.group.addLayer(marker);
      });
      this.group.addTo(this.map);
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