var drawingManager;
let drawEvent;
let mode = null; // possible values are [null, predict, report]

let geometry;
let to;
let from;


$(document).ready(() => {
  $('#status').html("Authenticating...");
  
  authenticate();
  
  initMap();
  
  
  google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
    drawEvent = event;
    drawingManager.setOptions({drawingMode: null});
    if(mode === null) {
      $('#status').html("Ready.");
    }
    else if(mode === 'predict'){
      $('#status').html("Loading...");
      predict(drawEvent);
      $('#status').html("Classification complete. Tiles will begin loading");
      mode = null;
    }
    else if(mode === 'report'){
      $('#status').html("Report error mode");
      handleReportError(drawEvent);
      mode = null;
    }
    else{
      $('#status').html("Unsupported Drawing Mode!");
    }
  });
});

function getRectCoordinates(rect) {
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

function getPolyCoordinates(poly) {
  const bounds = poly.getPath().getArray();
  const coords = bounds.map((coord) => [coord.lng(), coord.lat()]);
  return { "type": "Polygon", "coordinates": [coords]};
}

function predict(drawEvent) {
  var poly = drawEvent.overlay;
  
  $('#status').html("Initialising...");
  
  ee.initialize();
  
  $('#status').html('Classifing...');
  
  console.log(getPolyCoordinates(poly));
  // console.log(getRectCoordinates(rectangle));
  
  var fromDate = new Date($('#startDate').val());
  var fromDay = fromDate.getDate();
  var fromMonth = fromDate.getMonth() + 1;
  var fromYear = fromDate.getFullYear();
  
  var toDate = new Date($('#endDate').val());
  var toDay = toDate.getDate();
  var toMonth = toDate.getMonth() + 1;
  var toYear = toDate.getFullYear();
  
  poly.setVisible(false);
  
  geometry = ee.Geometry(getPolyCoordinates(poly));
  to = [toYear, toMonth, toDay].join('-');
  from = [fromYear, fromMonth, fromDay,].join('-');
  classify(
    ee,
    geometry,
    from,
    to);
}

function draw(m = 'predict') {
  mode = m;
  drawingManager.setOptions({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: false
  });
}

// Setup Google Oauth https://developers.google.com/earth-engine/cloud/earthengine_cloud_project_setup
function authenticate() {
  ee.data.authenticateViaOauth(
    "193616559408-1hjmtni7oi3vm0g6ri421ccjumuflfef.apps.googleusercontent.com"
  , () => {
    $('#status').html("Authentication via OAuth was a success!");
  }, (e) => {
    $('#status').html('Authentication via OAuth: ' + e);
  }, null, () => {
      $('#status').html('Authenticating by popup...');
    ee.data.authenticateViaPopup(() => {
      $('#status').html('Authenticated by popup - success!');
    }, (e) => {
      $('#status').html('Authentication error: ' + e);
    });
  });
}

function copySourceToClipboard() {
  // TODO: This is a better solution, but it should be implemented using GitHub's
  // API instead of a plain GET request. (cors etc.)
  // $.ajax({
  //   method:'GET',
  //   url: "https://raw.githubusercontent.com/DAM-Project/machine-learning/main/sentinel-water-detection/model-development/js/sentinelWaterDetectionPolygonApp.js",
  //   dataType: "text/plain",
  //   contentType: 'text/plain',
  //   success: function(resp){
  //     console.log("OK", resp);
  //     $('#status').html("Copied to clipboard!");
  //   },
  //   error: function(resp){
  //     console.error("Didn't receive OK response" , resp);
  //     $('#status').html("Prolem fetching classifier source!");
  //   }
  // });
  if(!geometry || !to || !from)
  {
    console.error('Classifier must run before coping code to clipboard');
    return;
  }
  navigator.clipboard.writeText(classifierCode(geometry.toGeoJSONString(), from, to)).then(function() {
    $('#status').html("Copied to clipboard!");
  }, function(err) {
    console.error('Could not copy text: ', err);
  });
}

function initMap() {
  // Basic options for the Google Map.
  var mapOptions = {
    center: new google.maps.LatLng(-37.83, 145.4),
    zoom: 16,
    streetViewControl: false,
  };

  // Create the base Google Map, set up a drawing manager and listen for updates
  // to the training area rectangle.
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  drawingManager = new google.maps.drawing.DrawingManager({drawingMode: null});
  
  drawingManager.setMap(map);
}

function clearOverlays() {
  map.overlayMapTypes.clear();
  $('#status').html('Cleared.');
}

function changeOpacity(val) {
  map.overlayMapTypes.forEach((type) => type.setOpacity(val/100));
}
