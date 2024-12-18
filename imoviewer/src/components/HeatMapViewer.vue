<!-- MapViewer.vue -->
<template>
    <div>
      <h1>{{ title }}</h1>
      <p>{{ content }}</p>
    </div>
    <div id="mapContainer"></div>
  </template>
  
  <script>

  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import "../../public/leaflet-heat.js"
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });


  
  export default {
  name: "LeafletMap",
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    const plugin = document.createElement("script");
    plugin.setAttribute(
      "src",
      "../../public/leaflet-heat.js"
    );
    plugin.async = true;
    document.head.appendChild(plugin);
    this.map = L.map("mapContainer").setView([-24.9518266,-53.4853865], 12);
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    //use a mix of renderers
    var customPane = this.map.createPane("customPane");
    L.canvas({ pane: "customPane" });
    customPane.style.zIndex = 399; // put just behind the standard overlay pane which is at 400
    // L.marker([50, 14]).addTo(this.map);

    // L.marker([53, 20]).addTo(this.map);
    // L.marker([49.5, 19.5]).addTo(this.map);
    // L.marker([49, 25]).addTo(this.map);
    L.heatLayer(
      [
      [-25.0597949,-53.3775221,1],
      [-24.974903,-53.5071357,0.94697],
      [-24.9700817,-53.4457271,0.860882],
      [-24.9395051,-53.4486732,0.824725],
      [-24.9756196,-53.4748901,0.816116],
      [-25.9455332,-53.7277565,0.80062],
      [-24.9752228,-53.4816508,0.791322],
      [-24.9269993,-53.4410647,0.774793],
      [-24.9729866,-53.5076899,0.755854],
      [-24.9603557,-53.5045996,0.680096],
      [-24.9725358,-53.4705584,0.602617],
      [-24.9209976,-53.4213395,0.544607],
      [-24.9593145,-53.4743218,0.516529],
      [-24.9271047,-53.462293,0.513085],
      [-24.9780928,-53.4651462,0.50792],
      [-24.9965931,-53.461171,0.50792],
      [-24.9967086,-53.4597261,0.499311],
      [-24.9394109,-53.4714975,0.482094],
      [-24.9758704,-53.4358302,0.438705],
      [-24.9716516,-53.4181271,0.430441],
      [-24.9703903,-53.4371392,0.421832],
      [-24.9743758,-53.4541515,0.411501],
      [-24.9380555,-53.4492587,0.327135],
      [-24.9283238,-53.4596223,0.283058],
      [-24.9518266,-53.4853865,0.258264]
      ],
      {
        radius: 15,
        blur: 0,
        maxZoom: 1,
        fillOpacity: 1,
        gradient: { 0: "blue", 1: "red" },
      }
    ).addTo(this.map);
  },
  onBeforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style scoped>
#mapContainer {
  width: 100vw;
  height: 100vh;
}
</style>