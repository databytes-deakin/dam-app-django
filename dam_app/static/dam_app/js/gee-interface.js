

$(document).ready(() => {
  console.log("Document ready");
  // AJAX post to classifier
  function post(data){
    $.ajax({
      method:'POST',
      url: "/classify/",
      dataType: "json",
      contentType: 'application/json',
      data: data,
      success: function(resp){
        console.log("RETURNED FROM CLASSIFIER")
        // console.warn(resp);
      },
      error: function(resp){
        console.error("Didn't receive OK response");
        console.error(resp);
      }
    });
  }
  
  // Setup AJAX's csrf token for all requests
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      // TODO: confirm - may be security vulns.
      xhr.setRequestHeader("X-CSRFToken", '{{ csrf_token|safe }}');
      xhr.setRequestHeader("content-type", "application/json");
    }
  });

  console.log('GEE init...');
  // Get Map
  const mapID = document.getElementsByClassName("folium-map leaflet-container")[0].id
  let Map = eval(mapID);
  
  // Setup Google Oauth https://developers.google.com/earth-engine/cloud/earthengine_cloud_project_setup
  // dam-service@pragmatic-aegis-348001.iam.gserviceaccount.com
  console.log("Authenticating...");
  ee.data.authenticateViaOauth(
    "193616559408-1hjmtni7oi3vm0g6ri421ccjumuflfef.apps.googleusercontent.com"
  , () => {
  // ee.data.authenticateViaOauth('111607998598840374850', () => {
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
  
  // Add click listener
  Map.on(L.Draw.Event.CREATED, async (e) => {
    console.log('Draw.Event.CREATED');
    const layer = e.layer;
    const type = e.layerType;
    const coords = JSON.stringify(layer.toGeoJSON());
    layer.on('click', () => {
      console.log('OnClick start');
      console.log("coords", coords);
      
      console.log("Initialising...");
      ee.initialize();
      console.log('Classify!');
      console.log(layer);
      Map = classify(Map, ee, layer);
      console.log('Classifier complete');
    });
    drawnItems.addLayer(layer);
  });
});
