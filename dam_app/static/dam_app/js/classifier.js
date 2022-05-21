const classifierCode = (geometry, from, to) => `
var cart_classifier = ee.FeatureCollection("users/arunetckumar/cart_classifier_3"),
    Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");

var geometry =  ee.Geometry(${geometry});

// Load using this
var classifier_string = cart_classifier.first().get('classifier');

var classifier = ee.Classifier.decisionTree(classifier_string);

var BANDS = ['B2', 'B3', 'B4', 'B8'];

var ic = Sentinel2A
      .filterDate('${from}', '${to}')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
      .select(BANDS)
      .median();

// var input = ic.median().select(BANDS);

var classified = ic.classify(classifier);

print (classified);

var palette = [
  '0000FF', // Water
  '008000', // Veg
  'A52A2A' // Land
]

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
