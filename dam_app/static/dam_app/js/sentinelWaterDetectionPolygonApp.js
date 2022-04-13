// https://github.com/DAM-Project/machine-learning/blob/main/sentinel-water-detection/model-development/js/sentinelWaterDetectionPolygonApp.js
// TODO: set this up in S3 and link to as a CDN <script src=""></script>
function classify(Map, ee){
  console.log('Classifier invoked');
  
  console.log('Init cart_classifier');
  const cart_classifier = ee.FeatureCollection("users/arunetckumar/cart_classifier_3"),
      Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR");

  
    console.log('Retrieve classifier');
  // Load using this
  const classifier_string = cart_classifier.first().get('classifier');

  console.log('Load classifier');
  
  const classifier = ee.Classifier.decisionTree(classifier_string);

  
  console.log('Filter Satellite data');
  
  const BANDS = ['B2', 'B3', 'B4', 'B8'];

  const ic = Sentinel2A
        .filterDate('2016-07-01', '2020-12-01')
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
        .select(BANDS)
        .median();

  // var input = ic.median().select(BANDS);
  console.log('Classify');

  const classified = ic.classify(classifier);

  console.log(classified);

  const palette = [
    '0000FF', // Water
    '008000', // Veg
    'A52A2A' // Land
  ]

  console.log('Add Layers');
  Map.addLayer(classified.clip(geometry), {palette: palette, min: 0, max: 2}, 'classification CART')

  // // Export a GeoTIFF.
  // Export.image.toDrive({
  //   image: classified,
  //   description: 'classifiedImage',
  //   scale: 10,
  //   region: geometry
  // });

  const legend = ui.Panel({style: {position: 'middle-right', padding: '8px 15px'}});

  console.log('Make Row');
  const makeRow = function(color, name) {
    const colorBox = ui.Label({
      style: {color: '#ffffff',
        backgroundColor: color,
        padding: '10px',
        margin: '0 0 4px 0',
      }
    });
    const description = ui.Label({
      value: name,
      style: {
        margin: '0px 0 4px 6px',
      }
    }); 
    return ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')}
  )};

  const title = ui.Label({
    value: 'Legend',
    style: {fontWeight: 'bold',
      fontSize: '16px',
      margin: '0px 0 4px 0px'}});
  
  console.log('Populate Legend');
  legend.add(title);
  legend.add(makeRow('brown','Urban'))
  legend.add(makeRow('blue','Water'))
  legend.add(makeRow('green','Vegetation'))

  console.log('Add Legend');
  Map.add(legend);
  
  return Map;
}
