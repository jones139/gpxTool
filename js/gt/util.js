// some utility functions for gpx files.
//
define(["dojo",
       ],function() {
	   /** Converts numeric degrees to radians */
	   if (typeof(Number.prototype.toRad) === "undefined") {
	       Number.prototype.toRad = function() {
		   return this * Math.PI / 180;
	       }
	   }
	   return {
	       ////////////////////////////////////////////////////////////////
	       // calcDist - calculate the distance (in km) between two LatLng Points.
	       // DESC:  Uses the haversine formula to calculate the distance
	       //        (http://www.movable-type.co.uk/scripts/latlong.html)
	       // HIST:  18sep2011  GJ ORIGINAL VERSION
	       //
	       calcDist : function (ll1,ll2) {
		   //console.log("gt.calcDist: "+ll1+":"+ll2);
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
	   }
    }
);

