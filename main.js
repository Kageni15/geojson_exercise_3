var map = L.map("map").setView([-0.1, 36.5], 7);

let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let Esri_WorldImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

let CartoDB_Positron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }
);

let baseMaps = {
  OpenStreetMap: osm,
  "ESRI World Imagery": Esri_WorldImagery,
  CartoDB: CartoDB_Positron,
};

let rain_data;

let colors = ["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"];

let breaks = [0, 20, 40, 60, 80, Infinity];

const rain_dist_color = (d) => {
  for (let i = 0; i < breaks.length; i++) {
    if (d >= breaks[i] && d < breaks[i + 1]) {
      return colors[i];
    }
  }
};

const rain_style = (feature) => {
  return {
    fillColor: rain_dist_color(feature.properties.RAINFALL_),
    color: "black",
    opacity: 1,
    fillOpacity: 0.7,
    weight: 0.5,
  };
};

fetch("data/kenya_rainfall_distribution.geojson")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    rain_data = L.geoJSON(data, {
      style: rain_style,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
        <div>
        Rainfall: ${feature.properties.RAINFALL_} <br>
        Area: ${feature.properties.AREA.toFixed(2)} Km<sup>2</sup>
        </div>`);
      },
    }).addTo(map);
  });

// Create legend entries
let legendEntries = [];
for (let i = 0; i < colors.length; i++) {
  let label = (i === 0 ? "> " : "> ") + breaks[i];
  legendEntries.push({
    label: label,
    type: "rectangle",
    radius: 8,
    color: "#000",
    fillColor: colors[i],
    fillOpacity: 0.8,
    weight: 1,
  });
}

// Add legend to map
L.control
  .legend({
    position: "bottomleft",
    legends: legendEntries,
  })
  .addTo(map);

let layerControl = L.control.layers(baseMaps).addTo(map);
