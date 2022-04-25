var drawingManager;

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
    center: new google.maps.LatLng(-37.8, 144),
    zoom: 13,
    streetViewControl: false,
  };

  // Create the base Google Map, set up a drawing manager and listen for updates
  // to the training area rectangle.
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  drawingManager = new google.maps.drawing.DrawingManager({drawingMode: null});
  // drawRect();
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, 'overlaycomplete', predict);

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
  
  function predict(event) {
    var rectangle = event.overlay;
    map.overlayMapTypes.pop();
    map.overlayMapTypes.pop();
    drawingManager.setOptions({drawingMode: null});
    
    console.log("Initialising...");
    
    ee.initialize();
    
    console.log('Classify!');
    
    console.log(getCoordinates(rectangle));
    
    classify(ee, ee.Geometry(getCoordinates(rectangle)));
  }  
});

function drawRect() {
  drawingManager.setOptions({
    drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
    drawingControl: false
  });
}
