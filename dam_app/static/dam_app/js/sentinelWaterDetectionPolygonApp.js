// https://github.com/DAM-Project/machine-learning/blob/main/sentinel-water-detection/model-development/js/sentinelWaterDetectionPolygonApp.js
// TODO: set this up in S3 and link to as a CDN <script src=""></script>
function classify(Map, ee, geometry){
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
  ];

  console.log('Details');
  const final = classified.clip(geometry);
  // console.log(final.toArray());
  
  console.log('Returned clipped classification');
  ee.batch.Export.image.toAsset({
    image: final,
    description: 'imageToAssetExample',
    assetId: 'projects/dam-ee-markblashki1-test/assets/testAsset',
    region: geometry,
  });
  return {};
}
