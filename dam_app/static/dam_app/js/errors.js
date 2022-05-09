
function reportError() {
  draw('report');
}

function handleReportError(drawEvent){
  let overlay = drawEvent.overlay;
  $('#status').html("Reporting error...");
  const geoJSON = getPolyCoordinates(overlay);
  console.log(geoJSON);
  
  $.ajax({
    method:'POST',
    url: "/report",
    dataType: "json",
    contentType: 'application/json',
    data: JSON.stringify(geoJSON),
    success: function(resp){
      console.log("OK", resp);
      overlay.setOptions({fillColor: "#FFFFFF"});
      $('#status').html("Error reported.");
    },
    error: function(resp){
      overlay.setOptions({fillColor: "#FF0000"});
      console.error("Didn't receive OK response" , resp);
      $('#status').html("Prolem when reporting DAM error!");
    }
  });
}
