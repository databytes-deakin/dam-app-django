// https://github.com/DAM-Project/machine-learning/blob/main/sentinel-water-detection/model-development/js/sentinelWaterDetectionPolygonApp.js
// TODO: set this up in S3 and link to as a CDN <script src=""></script>

// var map;

function getCoordinates(rect) {
  var bounds = rect.getBounds();
  const NE_lat = bounds.getNorthEast().lat();
  const NE_lng = bounds.getNorthEast().lng();
  const SW_lat = bounds.getSouthWest().lat();
  const SW_lng = bounds.getSouthWest().lng();
  
  return { "type": "Polygon", "coordinates": [[
    [SW_lng, SW_lat],
    [SW_lng, NE_lat],
    [NE_lng, NE_lat],
    [NE_lng, SW_lat],
  ]]};
}

function classify(ee, geometry){
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
  
  console.log('Add to map');
  
  var mapId = final.getMap({palette: palette, min: 0, max: 2});
  console.log('eeTileSource');
  var eeTileSource = new ee.layers.EarthEngineTileSource(mapId);
  console.log('overlay');
  var overlay = new ee.layers.ImageOverlay(eeTileSource);
  console.log('AddTile');

  // Show a count of the number of map tiles remaining.
  overlay.addTileCallback(function(event) {
    console.log(event.count + ' tiles remaining.')
  });

  console.log('overlaytype');
  // Show the EE map on the Google Map.
  map.overlayMapTypes.push(overlay);

  return {};
}


$(document).ready(() => {
  
  console.log('GEE init...');
  
  // Setup Google Oauth https://developers.google.com/earth-engine/cloud/earthengine_cloud_project_setup
  console.log("Authenticating...");
  ee.data.authenticateViaOauth(
    "193616559408-1hjmtni7oi3vm0g6ri421ccjumuflfef.apps.googleusercontent.com"
  , () => {
    console.log("Authentication via OAuth was a success!");
  }, (e) => {
    console.error('Authentication via OAuth: ' + e);
  }, null, () => {
    console.log('Authenticating by popup...');
    ee.data.authenticateViaPopup(() => {
      console.log('Authenticated by popup - success!');
    }, (e) => {
      console.error('Authentication error: ' + e);
    });
  });
  
  console.log('Finished Auth.');
  
  // Basic options for the Google Map.
  var mapOptions = {
    center: new google.maps.LatLng(-37.81, 144.06),
    zoom: 15,
    streetViewControl: false
  };

  // Create the base Google Map, set up a drawing manager and listen for updates
  // to the training area rectangle.
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
    drawingControl: false
  });
  drawingManager.setMap(map);

  var rectangle = null;

  google.maps.event.addListener(
    drawingManager, 'overlaycomplete', function(event) {
      rectangle = event.overlay;
      drawingManager.setOptions({drawingMode: null});
      
      console.log();
      console.log('Draw.Event.CREATED');
      
      console.log("Initialising...");
      
      ee.initialize();
      
      console.log('Classify!');
      
      console.log(getCoordinates(rectangle));
      
      classify(ee, ee.Geometry(getCoordinates(rectangle)));
      
      console.log('Classifier complete');
    }
  );
});
