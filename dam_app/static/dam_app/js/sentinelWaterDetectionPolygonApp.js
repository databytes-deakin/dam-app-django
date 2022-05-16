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

async function classify(ee, geometry, fromDate, toDate) {
  $('#status').html("Working...");
  if(!cart_classifier){
    cart_classifier = ee.FeatureCollection("users/arunetckumar/cart_classifier_3")
    Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");
  }
  
  // Load using this
  if(!classifier_string)
    classifier_string = await cart_classifier.first().get('classifier');
  
  if(!classifier)
    classifier = await ee.Classifier.decisionTree(classifier_string);

  if(!ic){
    BANDS = ['B2', 'B3', 'B4', 'B8'];
    ic = await Sentinel2A
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
      .select(BANDS);
  }
  ic = await ic.filterDate(fromDate, toDate)
  
  $('#status').html("Preprocessing done, beginning classifier...");
  
  const classified = await ic.median().classify(classifier);

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
  
  let skinnyBlur = await classified.convolve(skinny);
  let fatBlur = await classified.convolve(fat);
  
  let edges = await ee.Algorithms.CannyEdgeDetector(fatBlur, 0.2, 0).multiply(ee.Image(5)).add(ee.Image(1)).convolve(fat);

  const palette = [
    '3f608f', // Water
    '3a9e78', // Veg
    '69854980' // Land
  ]

  let mult = await edges.multiply(skinnyBlur);
  
  const final = await mult.clip(geometry);
  
  mapId = await final.getMap({palette: palette, min: 0, max: 1});
  eeTileSource = new ee.layers.EarthEngineTileSource(mapId);
  overlay = new ee.layers.ImageOverlay(eeTileSource);
  
  await map.overlayMapTypes.push(overlay);
  return {};
}
