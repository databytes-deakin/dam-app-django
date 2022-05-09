// https://github.com/DAM-Project/machine-learning/blob/main/sentinel-water-detection/model-development/js/sentinelWaterDetectionPolygonApp.js
// TODO: set this up in S3 and link to as a CDN <script src=""></script>

// var map;
let mapId;
let eeTileSource;
let overlay;
let cart_classifier;
let Sentinel2A;
let classifier_string;
let classifier;
let BANDS;
let ic;

function classify(ee, geometry, fromDate, toDate) {
  $('#status').html("Working...");
  if(!cart_classifier){
    cart_classifier = ee.FeatureCollection("users/arunetckumar/cart_classifier_3")
    Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");
  }
  
  // Load using this
  if(!classifier_string)
    classifier_string = cart_classifier.first().get('classifier');
  
  if(!classifier)
    classifier = ee.Classifier.decisionTree(classifier_string);

  
  BANDS = ['B2', 'B3', 'B4', 'B8'];
  if(!ic){
    ic = Sentinel2A
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
      .select(BANDS);
  }
  ic = ic.filterDate(fromDate, toDate)
  
  const classified = ic.median().classify(classifier);

  let skinny = ee.Kernel.gaussian({
    radius: 25,
    sigma: 15,
    units: 'meters',
    normalize: true
  });
  
  let fat = ee.Kernel.gaussian({
    radius: 25,
    sigma: 20,
    units: 'meters',
    normalize: true
  });
  
  let skinnyBlur = classified.convolve(skinny);
  let fatBlur = classified.convolve(fat);
  
  let edges = ee.Algorithms.CannyEdgeDetector(fatBlur, 0.2, 0).multiply(ee.Image(5)).add(ee.Image(1)).convolve(fat);

  const palette = [
    '3f608f', // Water
    '3a9e78', // Veg
    '69854980' // Land
  ]

  let mult = edges.multiply(skinnyBlur);
  
  const final = mult.clip(geometry);
  
  console.log('Add to map');
  
  mapId = final.getMap({palette: palette, min: 0, max: 1});
  eeTileSource = new ee.layers.EarthEngineTileSource(mapId);
  overlay = new ee.layers.ImageOverlay(eeTileSource);
  
  map.overlayMapTypes.push(overlay);
  
  map.overlayMapTypes.addListener('tilesloaded', function() {
    console.log("Map loaded");
    $('#status').html("Ready.");
  });
  
  return {};
}
