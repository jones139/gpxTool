define(['dojo/number','dojo/_base/declare','dojo/_base/lang','gt/util'], function(dojoNumber,declare,lang,gtUtil){
    declare("gt.gpxFile", null, {
	// static members
	serverURL: "api/getGPX.php",
	gpxObj : {
	    'tracks':[],
	    'routes':[],
	    'waypts':[]
	},
	someData: [1, 2, 3, 4], // doesn't do what I want: ends up being static
	numItem : 5, // one per bar
	strItem : "string", // one per bar

	testfn: function() {
	    console.log("testfn");
	},

    parseGPX: function (xml, cb) {
	var j, i, el, layers = [];
	var named = false;
	var trksegObj, rteObj,wayptObj;
	console.log("parseGPX");
	el = xml.getElementsByTagName('trkseg');
	console.log("looping through trksegs");
	for (i = 0; i < el.length; i = i + 1) {
	    trksegObj = this.parse_trkseg(el[i], xml, 'trkpt');
	    this.gpxObj.tracks.push(trksegObj);
	}
	
	el = xml.getElementsByTagName('rte');
	console.log("looping through rtes");
	for (i = 0; i < el.length; i = i + 1) {
	    rteObj = this.parse_trkseg(el[i], xml, 'rtept');
	    this.gpxObj.routes.push(rteObj);
	}
	
	el = xml.getElementsByTagName('wpt');
	console.log("looping through wpts");
	for (i = 0; i < el.length; i = i + 1) {
	    wayptObj = this.parse_wpt(el[i], xml);
	    this.gpxObj.waypoints.push(wayptObj);
	}
	// call the user supplied callback function to show we have finished.
	cb(this.gpxObj);
	return this.gpxObj;
    },
    
    parse_name: function (xml, layer) {
	var i,j, el, name, descr="",txt;
	el = xml.getElementsByTagName('name');
	if (el.length) { name = el[0].childNodes[0].nodeValue; }
	el = xml.getElementsByTagName('desc');
	for (i = 0; i < el.length; i = i + 1) {
	    for (j = 0; j < el[i].childNodes.length; j = j + 1) {
		descr = descr + el[i].childNodes[j].nodeValue;
	    }
	}
	if (!name) { return; }
	txt = "<h2>" + name + "</h2>" + descr;
	if (layer && layer._popup === undefined) { layer.bindPopup(txt); }
	return (txt);
    },
    
    parse_trkseg: function (line, xml, tag) {
	var el,i,j,e,trackpt,trackpts,dist,cumDist;
	el = line.getElementsByTagName(tag);
	if (!el.length) { return []; }
	trackpts = [];
	cumDist = 0.;
	for (i = 0; i < el.length; i = i + 1) {
	    trackpt = {};
	    trackpt.lat = parseFloat(el[i].getAttribute('lat'));
	    trackpt.lng = parseFloat(el[i].getAttribute('lon'));
	    for (j=0; j<el[i].childNodes.length; j = j + 1) {
		e = el[i].childNodes[j];
		if (!e.tagName) { continue; }
		trackpt[e.tagName] = e.textContent;
	    }
	    // calculate distance (in km) from the previous trackpoint to this one (unles this is the first!).
	    if (i==0) {
		trackpt.dist = 0;
	    } else {
		trackpt.dist = gtUtil.calcDist(trackpts[i-1],trackpt);
	    }
	    cumDist = cumDist + trackpt.dist;
	    trackpt.cumDist = cumDist;
	    trackpts.push (trackpt);
	}
	return(trackpts);
    },

    parse_wpt: function (e, xml) {
	//var m = new L.Marker(new L.LatLng(e.getAttribute('lat'),
	//				  e.getAttribute('lon')), options);
	//this.fire('addpoint', {point:m});
	return m;
    },

    loadFromServer : function(gpxNo,cb) {
	console.log("gpxFile.loadFromServer");
	var getURL = this.serverURL+"?gpxNo="+gpxNo;
	console.log(getURL);
	dojo.xhr.get({
	    handleAs : "xml",
	    url : getURL,
	    // lang.hitch is there to make 'this' provide the correct scope.
	    // without it you get console errors about this.parseGPX not being a function.
	    load : lang.hitch(this,function(response,ioArgs) {
		console.log("gpxFile.loadFromServer.success!");
		this.parseGPX(response,cb);
		return response;
	    }),
	    error : lang.hitch(this,function(response,ioArgs) {
		console.log("gpxFile.loadFromServer.error");
		//console.log(repsonse,ioArgs);
		alert("Failed to fetch the GPX file...don't know why!....");
		return response;
	    })
	});
    },

    getGpxInfoHtml : function() {
	console.log("getGpxInfoHtml");
	var html = "<div><ul><br/>";
	html = html + "<li> No. Route Points: "+this.gpxObj.routes.length+".</li><br/>";
	html = html + "<li> No. Way Points: "+this.gpxObj.waypts.length+".</li><br/>";
	var ntrkpts = 0;
	var n;
	var cumDist = 0;
	for (trkseg in this.gpxObj.tracks) {
	    n = this.gpxObj.tracks[trkseg].length
	    ntrkpts += n;
	    cumDist = cumDist + this.gpxObj.tracks[trkseg][n-1].cumDist;
	}
	html = html + "<li> No. Track Points: "+ntrkpts+" in "+this.gpxObj.tracks.length+" segments.  Total Distance = "+dojoNumber.format(cumDist,"{places:1}")+" km</li><br/>";
	html = html + "</ul></div><br/>";
	return(html);
    },
			
    constructor: function(){
	console.log("gpxFile constructor");
    }
  });
});