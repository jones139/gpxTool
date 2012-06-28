var RE = {};
// Global Variables
RE.pointsLayers = [];

RE.map = new L.Map('map');
RE.popup = new L.Popup();
RE.polyline;
RE.osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
RE.osmAttrib = 'Map data &copy; 2011 OpenStreetMap contributors',
RE.osmLayer = new L.TileLayer(RE.osmUrl, {maxZoom: 18, attribution: RE.osmAttrib});
var hartlepool = new L.LatLng(54.687, -1.21); // geographical point (longitude and latitude)
RE.map.setView(hartlepool, 13).addLayer(RE.osmLayer);


///////////////////////////////////////////////////
RE.onMapClick = function (e) {
    var latlngStr = '(' + e.latlng.lat.toFixed(3) + ', ' + e.latlng.lng.toFixed(3) + ')';
    RE.popup.setLatLng(e.latlng);
    RE.popup.setContent(
        "<button id='addMarker'>Add Route Point</button>"
    );
    RE.map.openPopup(RE.popup);
    jQuery('#addMarker').click({latlng:e.latlng},RE.addMarker);
    jQuery('.cancel').click(function(){alert('cancel'); RE.map.closePopup(RE.popup);});
}

///////////////////////////////////////////////////////
RE.addMarker = function (e) {
    var marker = new L.Marker(e.data.latlng,{clickable:true, draggable:true});
    var i = RE.pointsLayers.push(marker);
    marker.title = "Marker "+i;
    RE.displayPoints();
    RE.map.closePopup(RE.popup);
  }

/////////////////////////////////////////////////////////
RE.deleteMarker = function (e) {
    var targetID = jQuery(e.target).attr("name");
     //alert ("target ID = " +targetID);
    RE.map.removeLayer(RE.pointsLayers[targetID]);
    RE.pointsLayers.splice(targetID,1);
    RE.displayPoints();
  }

/////////////////////////////////////////////////////////
RE.moveMarkerUp = function (e) {
    var tmpMkr;
    var targetID = parseInt(jQuery(e.target).attr("name"));
     // do not try to move a marker off the top of the list.
    if ( targetID > 0 ) {
        tmpMkr = RE.pointsLayers[targetID-1];
        RE.pointsLayers[targetID-1] = RE.pointsLayers[targetID];
        RE.pointsLayers[targetID] = tmpMkr;
        RE.displayPoints();
        //listMarkers();
    }
}

/////////////////////////////////////////////////////////
RE.moveMarkerDown = function (e) {
    // The parseInt here is VERY important.  Otherwise it does
    // string arithmetic so that when targetID is 1, it copies into
    //  11, not 2....took ages to find that bug...
    var tmpMkr;
    var targetID = parseInt(jQuery(e.target).attr("name"));
    // do not try to move a marker off the top of the list.
    if ( targetID < RE.pointsLayers.length-1 ) {
        tmpMkr = RE.pointsLayers[targetID];
        RE.pointsLayers[targetID] = RE.pointsLayers[targetID+1];
        RE.pointsLayers[targetID+1] = tmpMkr;
        //listMarkers();
        RE.displayPoints();
     }
  }

/////////////////////////////////////////////////////////
RE.changeMarkerTitle = function (e) {
    var targetID = parseInt(jQuery(e.target).attr("name"));
    var newTitle = jQuery(e.target).attr("value");
    RE.pointsLayers[targetID].title = newTitle;
    //listMarkers();
    RE.displayPoints();
  }


///////////////////////////////////////////////////////
RE.onMarkerDragEnd = function (e) {
    RE.displayPoints();
}
  
///////////////////////////////////////////////////////
RE.displayPoints = function () {
    var i,mkr,latlngArr,cumDist,content,dist1_2,msg;
    // first delete all markers from the map
    for (mkr in RE.pointsLayers) {
	RE.map.removeLayer(mkr);
    }
    // And from the table
    jQuery("#routePtsOl").children().remove();
    
    // Now add the markers to the map, and build the table of points
    i = RE.pointsLayers.length;
    latlngArr = [];
    cumDist = 0;  // cumulative distance for the route.
    for (i = 0;i<RE.pointsLayers.length; i++) {
        mkr = RE.pointsLayers[i];
	latlngArr.push(mkr.getLatLng());
        RE.map.addLayer(mkr);
        content = "Marker " + i +
            "<button id='deleteMarker'>Delete Marker</button>";
        mkr.bindPopup(content);
        mkr.on('dragend',RE.onMarkerDragEnd);
	dist1_2 = 0;
	if (i>0) {
	    dist1_2 = RE.calcDist(RE.pointsLayers[i-1].getLatLng(),
		                  RE.pointsLayers[i].getLatLng());
            cumDist = cumDist + dist1_2;
        }
	
        content = '<li><input size= 10 class="markerTitle" '
            +'name="'+i+'" value="'+mkr.title+'"</input> '
            +dist1_2.toFixed(1) + ' km (' + cumDist.toFixed(1)+' km) '
            +'<button class="markerDelete" name='+i+'>Delete</button>'
            +'<button class="markerUp" name='+i+'>Up</button>'
            +'<button class="markerDown" name='+i+'>Down</button>'
            +'</li>'
        jQuery('#routePtsOl').append(content);
	RE.makeGPXData();
    }
    
    // Add the line joining the points.
    if (latlngArr.length > 1) {
	msg="LatLngArr\n";
	for (i=0;i<latlngArr.length;i++) {
	    msg = msg + latlngArr[i].lat + "," + latlngArr[i].lng + "\n";
	}
	//alert(msg);
	if (typeof(RE.polyline) != "undefined") {
            RE.map.removeLayer(RE.polyline);
	}
	  RE.polyline = new L.Polyline(latlngArr,{color:'red'});
	RE.map.addLayer(RE.polyline);				       
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
RE.calcDist = function (ll1,ll2) {
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
RE.rtept2XML = function (rpno) {
    var op = '';
    var lat;
    var lng;
    var pos;
    pos = RE.pointsLayers[rpno].getLatLng();
    lat = pos.lat;
    lng = pos.lng;
    op += '   <rtept' 
    op += ' lat=\"'+lat+'\" ';
    op += ' lon=\"'+lng+'\" ';
    op += '>';
    op += '\n';
    op += '     <name>'+RE.pointsLayers[rpno].title+'</name>\n';
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
RE.makeGPXData = function () {
    var gpxlines = new Array();  // one element per line in GPX file.

    gpxlines.push("<?xml version=\"1.0\"?>");
    gpxlines.push("<gpx version=\"1.1\"");
    gpxlines.push("     creator=\"Graham Jones\">");
    gpxlines.push("<rte>");
    gpxlines.push("    <name>Route Created by Grahams Leaflet Based Route Editor</name>");
    for ( var i = 0; i<RE.pointsLayers.length;i++) {
	gpxlines.push(RE.rtept2XML(i));
   }
    gpxlines.push("</rte>");
    gpxlines.push("</gpx>");
    jQuery(gpxText).val(gpxlines.join('\n'));
   //document.cookie = cookieName+'='+escape(document.GPXdata.GPXdata.value);
}


///////////////////////////////////////////////////////
RE.listMarkers = function () {
    msg="<h2>Debug</h2>";
    msg = msg + "pointsLayers.length="+RE.pointsLayers.length+"\n<br/>";					
     for (var mkr in RE.pointsLayers) {
       msg = msg + " - " + mkr + "\n<br/>";
     }
    jQuery("#debug").html(msg);
}

//////////////////////////////////////////////////////////////
// Set the event handlers that will respond to user actions
RE.map.on('click', RE.onMapClick);
//jQuery('.cancel').live("click", function(){alert("cancel"); RE.marker.closePopup(popup);});
jQuery('.markerDelete').live('click',RE.deleteMarker);
jQuery('.markerUp').live('click',RE.moveMarkerUp);
jQuery('.markerDown').live('click',RE.moveMarkerDown);
jQuery('.markerTitle').live('change',RE.changeMarkerTitle);

////////////////////////////////////////////////////////////////
// download the gpx data.
// copies the data into a hidden form and submits it
// the resulting data includes the headers to force a download
////////////////////////////////////////////////////////////////
jQuery('#downloadButton').click(
    function() {
        alert("downloadButton: "+jQuery('#gpxText').val());
	jQuery('#hiddenForm').attr('action','api/downloadFile.php');
        jQuery('#hiddenFormDataTextArea').val(jQuery('#gpxText').val());
        jQuery('#hiddenFormTitleText').val(jQuery('#gpxTitle').val());
        jQuery('#hiddenFormGpxNo').val(jQuery('#gpxNo').val());
        jQuery('#hiddenForm').submit();
    });

jQuery('#putButton').click(
    function() {
        alert("downloadButton: "+jQuery('#gpxText').val());
	jQuery('#hiddenForm').attr('action','api/uploadGPX.php');
        jQuery('#hiddenFormDataTextArea').val(jQuery('#gpxText').val());
        jQuery('#hiddenFormTitleText').val(jQuery('#gpxTitle').val());
        jQuery('#hiddenFormGpxNo').val(jQuery('#gpxNo').val());
        jQuery('#hiddenForm').submit();
    });

jQuery('#getButton').click(
    function() {
        alert("getButton: ");
	var $dialog = $('<div></div>')
	    .html("GPX File Number: <input id='dialogGPXFileNumber' size=3></input><br/><button id='dialogOkButton'>OK</button>")
	    .dialog({
		autoOpen: false,
		title: 'Basic Dialog'
	    });
	$dialog('#dialogOkButton').click( function () { alert("ok clicked");});

	$dialog.dialog('open');
    });

