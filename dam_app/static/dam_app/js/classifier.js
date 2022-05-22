const classifierCode = (geometry, from, to, doGaussBlur) => `
var geometry = ee.Geometry(${geometry});
var from = "${from}";
var to = "${to}";
var classifierAsset = "users/arunetckumar/cart_classifier_3";
var satelliteImages = "COPERNICUS/S2_SR";
var doGaussBlur = ${doGaussBlur ? "true" : "false"};

// ============= Variable definitions, don't add or remove any. ============= \\

var cart_classifier = ee.FeatureCollection(classifierAsset),
    Sentinel2A = ee.ImageCollection(satelliteImages);

// Load using this
var classifier_string = cart_classifier.first().get('classifier');

var classifier = ee.Classifier.decisionTree(classifier_string);

var BANDS = ['B2', 'B3', 'B4', 'B8'];

var ic = Sentinel2A
  .filterDate(from, to)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
  .select(BANDS)
  .median();

// var input = ic.median().select(BANDS);

var classified = ic.classify(classifier);

print (classified);

var palette = [
  '3f608f', // Water
  '3a9e78', // Veg
  '698549' // Land
]

var final = classified.clip(geometry);

if(doGaussBlur === true){
  var skinny = ee.Kernel.gaussian({
    radius: 12.5,
    sigma: 15,
    units: 'meters',
    normalize: true
  });
  
  var fat = ee.Kernel.gaussian({
    radius: 25,
    sigma: 20,
    units: 'meters',
    normalize: true
  });
  
  var skinnyBlur = final.convolve(skinny);
  var fatBlur = final.convolve(fat);
  
  var edges = ee.Algorithms.CannyEdgeDetector(fatBlur, 0.2, 0).multiply(ee.Image(5)).add(ee.Image(1)).convolve(fat);
  
  final = edges.multiply(skinnyBlur);
}

Map.addLayer(classified.clip(geometry), {palette: palette, min: 0, max: 2}, 'classification CART')

// // Export a GeoTIFF.
Export.image.toDrive({
  image: classified,
  description: 'classifiedImage',
  scale: 10,
  region: geometry
});

var legend = ui.Panel({style: {position: 'middle-right', padding: '8px 15px'}});

var makeRow = function(color, name) {
  var colorBox = ui.Label({
    style: {color: '#ffffff',
      backgroundColor: color,
      padding: '10px',
      margin: '0 0 4px 0',
    }
  });
  var description = ui.Label({
    value: name,
    style: {
      margin: '0px 0 4px 6px',
    }
  }); 
  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')}
)};

var title = ui.Label({
  value: 'Legend',
  style: {fontWeight: 'bold',
    fontSize: '16px',
    margin: '0px 0 4px 0px'}});
    
legend.add(title);
legend.add(makeRow('brown','Urban'))
legend.add(makeRow('blue','Water'))
legend.add(makeRow('green','Vegetation'))

Map.add(legend);
`
