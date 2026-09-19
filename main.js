// Регистрация на координатни системи с Proj4
proj4.defs("EPSG:7801", "+proj=lcc +lat_0=42.6678756833333 +lon_0=25.5 +lat_1=42 +lat_2=43.3333333333333 +x_0=500000 +y_0=4725824.3591 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
ol.proj.proj4.register(proj4);

proj4.defs("EPSG:7800", "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
ol.proj.proj4.register(proj4);

// Създаване на изглед
const view = new ol.View({
  center: [2799918, 5269874],
  zoom: 7
});

// Създаване на карта
const map = new ol.Map({
  target: 'map',
  view: view
});

// Добавяне на базови слоеве в картата
const osmMap = new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: true
});



const googleSat = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
  }),
  visible: false,
  title: 'googleSat'
});

// Групиране на базовите слоеве в група
const baseLayerGroup = new ol.layer.Group({
  layers: [osmMap, googleSat]
});

map.addLayer(baseLayerGroup);

// Превключване на слоевете за базовите карти
const baseLayerElements = document.querySelectorAll('.basemaps > input[type=radio]');
for (let baseLayerElement of baseLayerElements) {
  baseLayerElement.addEventListener('change', function () {
    let baseLayerElementValue = this.value;
    baseLayerGroup.getLayers().forEach(function (element) {
      let baseLayerTitle = element.get('title');
      element.setVisible(baseLayerTitle === baseLayerElementValue);
    });
  });
}

// Добавяне на слоеве от Geoserver
const district = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://geos.ssp-bg.com/geoserver/Bulgaria/wms',
    params: { 'VERSION': '1.1.0', 'tiled': true, 'LAYERS': 'Bulgaria:Oblasti' },
    serverType: 'geoserver'
  }),
  visible: true
});

const mun = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://geos.ssp-bg.com/geoserver/Bulgaria/wms',
    params: { 'VERSION': '1.1.0', 'tiled': true, 'LAYERS': 'Bulgaria:Munisipalities' },
    serverType: 'geoserver'
  }),
  visible: true
});

const rivers = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://geos.ssp-bg.com/geoserver/Bulgaria/wms',
    params: { 'VERSION': '1.1.0', 'tiled': true, 'LAYERS': 'Bulgaria:Reki' },
    serverType: 'geoserver'
  }),
  visible: true
});

const settlments = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://geos.ssp-bg.com/geoserver/Bulgaria/wms',
    params: { 'VERSION': '1.1.0', 'tiled': true, 'LAYERS': 'Bulgaria:Settlement' },
    serverType: 'geoserver'
  }),
  visible: true
});

// Групиране на основните слоеве
const layersGroup = new ol.layer.Group({
  layers: [mun, rivers, district, settlments]
});

map.addLayer(layersGroup);

// Включване и изключване на слоеве
const LayerElements = document.querySelectorAll('.mymaps > input[type=checkbox]');
for (let LayerElement of LayerElements) {
  LayerElement.addEventListener('change', function () {
    let LayerElementId = this.id;
    let LayerElementCheck = this.checked;
    layersGroup.getLayers().forEach(function (element, index) {
      if (index === parseInt(LayerElementId)) {
        element.setVisible(LayerElementCheck);
      }
    });
  });
}

// Добавяне на координатна мрежа (Graticule)
const myGraticule = new ol.layer.Graticule({
  showLabels: true
});
map.addLayer(myGraticule);

// Добавяне на графичен мащаб (ScaleLine)
// Добавяне на ScaleLine с графична линия и мащаб
const scaleBar = new ol.control.ScaleLine({
  units: 'metric',
  bar: true,       // Активира графичната линия
  steps: 4,        // Брой деления
  text: true,      // Показва числения мащаб (1:X)
  minWidth: 140
});
map.addControl(scaleBar);

// Добавяне на позиция на курсора (MousePosition)
const mouseCoordinates = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(0),
  projection: 'EPSG:7801'
});
map.addControl(mouseCoordinates);

// Избор на проекция за координатите на мишката
const projectionSelect = document.getElementById('Myprojection');
if (projectionSelect) {
  projectionSelect.addEventListener('change', function (event) {
    mouseCoordinates.setProjection(event.target.value);
  });
}

// Изтегляне на векторни данни в GeoJSON формат от GeoServer
const downloadBtn = document.getElementById('download0');
if (downloadBtn) {
  downloadBtn.addEventListener('click', function () {
    const url = "https://geos.ssp-bg.com/geoserver/Bulgaria/ows" +
                "?service=WFS&version=1.0.0&request=GetFeature" +
                "&typeName=Bulgaria%3AMunisipalities&outputFormat=application%2Fjson";

    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = "Obshtini.geojson";
        link.click();
      });
  });
}
