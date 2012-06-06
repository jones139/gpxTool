  // Global Variables
  var pointsLayers = [];

  var map = new L.Map('map');
  var popup = new L.Popup();
  var polyline;
  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  osmAttrib = 'Map data &copy; 2011 OpenStreetMap contributors',
  osmLayer = new L.TileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});
  //var london = new L.LatLng(51.505, -0.09); // geographical point (longitude and latitude)
  //map.setView(london, 13).addLayer(osmLayer);
  var hartlepool = new L.LatLng(54.687, -1.21); // geographical point (longitude and latitude)
  map.setView(hartlepool, 13).addLayer(osmLayer);

  //////////////////////////////////////////////////////////////
  // Set the event handlers that will respond to user actions
  map.on('click', onMapClick);
  jQuery('.cancel').live("click", function(){alert("cancel"); marker.closePopup(popup);});
  jQuery('.markerDelete').live('click',deleteMarker);
  jQuery('.markerUp').live('click',moveMarkerUp);
  jQuery('.markerDown').live('click',moveMarkerDown);
  jQuery('.markerTitle').live('change',changeMarkerTitle);

  ////////////////////////////////////////////////////////////////
  // download the gpx data.
  // copies the data into a hidden form and submits it
  // the resulting data includes the headers to force a download
  ////////////////////////////////////////////////////////////////
  jQuery('#downloadButton').click(
         function() {
            alert("downloadButton: "+jQuery('#gpxText').val());
            jQuery('#formDataTextArea').val(jQuery('#gpxText').val());
            jQuery('#uploadForm').submit();
         });

  ///////////////////////////////////////////////////
  function onMapClick(e) {
  var latlngStr = '(' + e.latlng.lat.toFixed(3) + ', ' + e.latlng.lng.toFixed(3) + ')';
  popup.setLatLng(e.latlng);
  popup.setContent(
                   "<button id='addMarker'>Add Route Point</button>"
                   );
  map.openPopup(popup);
  jQuery('#addMarker').click({latlng:e.latlng},addMarker);
  jQuery('.cancel').click(function(){alert('cancel'); map.closePopup(popup);});
  }

  ///////////////////////////////////////////////////////
  function addMarker(e) {
     var marker = new L.Marker(e.data.latlng,{clickable:true, draggable:true});
     var i = pointsLayers.push(marker);
     marker.title = "Marker "+i;
     displayPoints();
     map.closePopup(popup);
     //listMarkers();
  }

  /////////////////////////////////////////////////////////
  function deleteMarker(e) {
     targetID = jQuery(e.target).attr("name");
     //alert ("target ID = " +targetID);
     map.removeLayer(pointsLayers[targetID]);
     pointsLayers.splice(targetID,1);
     displayPoints();
     //listMarkers();
  }

  /////////////////////////////////////////////////////////
  function moveMarkerUp(e) {
     targetID = parseInt(jQuery(e.target).attr("name"));
     //alert ("target ID = " +targetID);
     // do not try to move a marker off the top of the list.
     if ( targetID > 0 ) {
        var tmpMkr = pointsLayers[targetID-1];
        pointsLayers[targetID-1] = pointsLayers[targetID];
        pointsLayers[targetID] = tmpMkr;
        displayPoints();
        //listMarkers();
     }
  }

  /////////////////////////////////////////////////////////
  function moveMarkerDown(e) {
     // The parseInt here is VERY important.  Otherwise it does
     // string arithmetic so that when targetID is 1, it copies into
     //  11, not 2....took ages to find that bug...
     targetID = parseInt(jQuery(e.target).attr("name"));
     //alert ("target ID = " +targetID);
     // do not try to move a marker off the top of the list.
     if ( targetID < pointsLayers.length-1 ) {
        var tmpMkr = pointsLayers[targetID];
        pointsLayers[targetID] = pointsLayers[targetID+1];
        pointsLayers[targetID+1] = tmpMkr;
        //listMarkers();
        displayPoints();
     }
  }

  /////////////////////////////////////////////////////////
  function changeMarkerTitle(e) {
     var targetID = parseInt(jQuery(e.target).attr("name"));
     var newTitle = jQuery(e.target).attr("value");
     //alert ("changeMarkerTitle - newTitle = "+newTitle);
     pointsLayers[targetID].title = newTitle;
     //listMarkers();
     displayPoints();
  }


  ///////////////////////////////////////////////////////
  function onMarkerDragEnd(e) {
      displayPoints();
  }
  
  ///////////////////////////////////////////////////////
  function displayPoints() {
  // first delete all markers from the map
     for (mkr in pointsLayers) {
       map.removeLayer(mkr);
     }
  // And from the table
     jQuery("#routePtsOl").children().remove();


  // Now add the markers to the map, and build the table of points
     i = pointsLayers.length;
     latlngArr = [];
     var cum_dist = 0;  // cumulative distance for the route.
     for (i = 0;i<pointsLayers.length; i++) {
            marker = pointsLayers[i];
	    latlngArr.push(marker.getLatLng());
            map.addLayer(marker);
            var content = "Marker " + i +
                   "<button id='deleteMarker'>Delete Marker</button>";
            marker.bindPopup(content);
            marker.on('dragend',onMarkerDragEnd);
	    var dist1_2 = 0;
	    if (i>0) {
	       dist1_2 = calcDist(pointsLayers[i-1].getLatLng(),
		                       pointsLayers[i].getLatLng());
               cum_dist = cum_dist + dist1_2;
            }

            content = '<li><input size= 10 class="markerTitle" '
              +'name="'+i+'" value="'+marker.title+'"</input> '
              +dist1_2.toFixed(1) + ' km (' + cum_dist.toFixed(1)+' km) '
              +'<button class="markerDelete" name='+i+'>Delete</button>'
              +'<button class="markerUp" name='+i+'>Up</button>'
              +'<button class="markerDown" name='+i+'>Down</button>'
              +'</li>'
            jQuery('#routePtsOl').append(content);

	   makeGPXData();
     }

     // Add the line joining the points.
     if (latlngArr.length > 1) {
       msg="LatLngArr\n";
       for (i=0;i<latlngArr.length;i++) {
	 msg = msg + latlngArr[i].lat + "," + latlngArr[i].lng + "\n";
       }
       //alert(msg);
       if (typeof(polyline) != "undefined") {
          map.removeLayer(polyline);
       }
       polyline = new L.Polyline(latlngArr,{color:'red'});
       map.addLayer(polyline);				       
     }


  }


/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

////////////////////////////////////////////////////////////////
// calcDist - calculate the distance (in km) between two LatLng Points.
// DESC:  Uses the haversine formula to calculate the distance
//        (http://www.movable-type.co.uk/scripts/latlong.html)
// HIST:  18sep2011  GJ ORIGINAL VERSION
//
function calcDist(ll1,ll2) {
  var R = 6371; // km
  var lat1 = ll1.lat;
  var lon1 = ll1.lng;
  var lat2 = ll2.lat;
  var lon2 = ll2.lng;
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  var lat1 = lat1.toRad();
  var lat2 = lat2.toRad();

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}



////////////////////////////////////////////////////////////////
// NAME: rtept2XML(rpno)
// DESC: Returns a string containing an XML (GPX) representation
//       of the specified route point.
// HIST: 31dec2007  GJ  ORIGINAL VERSION
//       17sep2011  GJ  Updated to use an array of Leaflet Markers.
//
function rtept2XML(rpno) {
    var op = '';
    var lat;
    var lng;
    var pos;
    pos = pointsLayers[rpno].getLatLng();
    lat = pos.lat;
    lng = pos.lng;
    op += '   <rtept' 
    op += ' lat=\"'+lat+'\" ';
    op += ' lon=\"'+lng+'\" ';
    op += '>';
    op += '\n';
    op += '     <name>'+pointsLayers[rpno].title+'</name>\n';
    op += '   </rtept>';
    return(op);
}

////////////////////////////////////////////////////////////////
// NAME: makeGPXData()
// DESC: creates a GPX data set from the pointsLayers[] markers
//       and puts it in the GPXData text box at the bottom of the page
// HIST: 31dec2007  GJ  ORIGINAL VERSION
//       17sep2011  GJ  Updated for leaflet version of editor.
//
function makeGPXData() {
   var gpxlines = new Array();  // one element per line in GPX file.

   gpxlines.push("<?xml version=\"1.0\"?>");
   gpxlines.push("<gpx version=\"1.1\"");
   gpxlines.push("     creator=\"Graham Jones\">");
   gpxlines.push("<rte>");
   gpxlines.push("    <name>Route Created by Graham's Leaflet Based Route Editor</name>");
   for ( var i = 0; i<pointsLayers.length;i++) {
      gpxlines.push(rtept2XML(i));
   }
   gpxlines.push("</rte>");
   gpxlines.push("</gpx>");
   jQuery(gpxText).val(gpxlines.join('\n'));
   //document.cookie = cookieName+'='+escape(document.GPXdata.GPXdata.value);
}


  ///////////////////////////////////////////////////////
  function listMarkers() {
     msg="<h2>Debug</h2>";
     msg = msg + "pointsLayers.length="+pointsLayers.length+"\n<br/>";					
     for (var mkr in pointsLayers) {
       msg = msg + " - " + mkr + "\n<br/>";
     }
     jQuery("#debug").html(msg);
  }
