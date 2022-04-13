$(document).ready(function () {
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
        // alert(resp); //will alert ok
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

  // Get Map
  const mapID = document.getElementsByClassName("folium-map leaflet-container")[0].id
  let Map = eval(mapID);
  // Add click listener
  Map.on(L.Draw.Event.CREATED, function(e) {
    const layer = e.layer, type = e.layerType;
    const coords = layer.toGeoJSON();
    console.log(coords);
    
  });
  
  
  
  var ee = require('@google/earthengine');
  
  Map = classify(Map, ee);
});
