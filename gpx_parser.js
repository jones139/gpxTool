// GPXparser - bsaed heavily on the Leaflet
//             GPX plugin (https://github.com/shramov/leaflet-plugins)
//             Returns an object containing:
//                 tracks[]
//                        trackpts[]
//                           Each trackpt is {lat,lon,ele,time,hdop}
//                 waypts[]
//                     Each waypt is {lat,long,ele,name,time, hdop}
//
//  Graham Jones 07jun2012  Original Version based on leaflet-plugins
//
"use strict";
var GPXParser = {
    gpxObj : {},
    loadFromURL: function (gpx, options) {
	if (gpx) {
	    this.addGPX(gpx, options, options.async);
	}
    },

    onLoad: function () {
	// call back which is called once the gpx file is downloaded and
	// parsed.   This  should be overridden to do something useful!
	alert("GPXParser.onLoad()!");
    },

    loadXML: function (url, cb, options, async) {
	// Perform download of data from url.  Calls callback function
	// cb on success.
	var req;
	if (async === undefined) { async = this.options.async; }
	if (options === undefined) { options = this.options; }
	
	req = new window.XMLHttpRequest();
	req.open('GET', url, async);
	try {
	    req.overrideMimeType('text/xml'); // unsupported by IE
	} catch(e) {}
	req.onreadystatechange = function() {
	    if (req.readyState !== 4) { return; }
	    if(req.status === 200) { cb(req.responseXML, options); }
	};
	req.send(null);
    },
    
    addGPX: function (url, options, async) {
	// Download the GPX file from url.  Calls _addGPX() to parse it.
	var _this = this;
	var cb = function(gpx, options) { _this._addGPX(gpx, options); };
	this.loadXML(url, cb, options, async);
    },
    
    _addGPX: function(gpxStr, options) {
	// parse the gpx data in the string gpxStr and assign it to
	//   an object variable.
	// calls this.onLoad callback function once the data is parsed.
	var gpxData = this.parseGPX(gpxStr, options);
	this.onLoad();
    },
    
    parseGPX: function (xml, options) {
	var j, i, el, layers = [];
	var named = false;
	var trksegObj, rteObj,wayptObj;
	this.gpxObj = {
	    'tracks':[],
	    'routes':[],
	    'waypts':[]
	};
	
	el = xml.getElementsByTagName('trkseg');
	for (i = 0; i < el.length; i = i + 1) {
	    trksegObj = this.parse_trkseg(el[i], xml, options, 'trkpt');
	    this.gpxObj.tracks.push(trksegObj);
	}
	
	el = xml.getElementsByTagName('rte');
	for (i = 0; i < el.length; i = i + 1) {
	    rteObj = this.parse_trkseg(el[i], xml, options, 'rtept');
	    this.gpxObj.routes.push(rteObj);
	}
	
	el = xml.getElementsByTagName('wpt');
	for (i = 0; i < el.length; i = i + 1) {
	    wayptObj = this.parse_wpt(el[i], xml, options);
	    this.gpxObj.waypoints.push(wayptObj);
	}
	
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
	return txt;
    },
    
    parse_trkseg: function (line, xml, options, tag) {
	var el,i,j,e,trackpt,trackpts;
	el = line.getElementsByTagName(tag);
	if (!el.length) { return []; }
	trackpts = [];
	for (i = 0; i < el.length; i = i + 1) {
	    trackpt = {};
	    trackpt.lat = el[i].getAttribute('lat');
	    trackpt.lon = el[i].getAttribute('lon');
	    //for (j in el[i].childNodes) {
	    for (j=0; j<el[i].childNodes.length; j = j + 1) {
		e = el[i].childNodes[j];
		if (!e.tagName) { continue; }
		trackpt[e.tagName] = e.textContent;
	    }
	    trackpts.push (trackpt);
	}
	return(trackpts);
    },

    parse_wpt: function (e, xml, options) {
	var m = new L.Marker(new L.LatLng(e.getAttribute('lat'),
					  e.getAttribute('lon')), options);
	//this.fire('addpoint', {point:m});
	return m;
    },

    toString: function () {
	// Returns a string representation of the loaded gpx object.
	//
	var ntrackpts = 0;
	var nroutepts = 0;
	var nwaypts = 0;
	var key,keys = "";
	var i;
	for (key in this.gpxObj) {
	    if (this.gpxObj.hasOwnProperty(key)) {
		keys = keys + ", " + key;
	    }
	}
	for (i = 0;i<this.gpxObj.tracks.length;i = i + 1) {
	    ntrackpts += this.gpxObj.tracks[i].length;
	}
	for (i = 0;i<this.gpxObj.routes.length;i = i + 1) {
	    nroutepts += this.gpxObj.routes[i].length;
	}
	nwaypts = this.gpxObj.waypts.length;
	keys = keys + "\nntrackpts = "+ntrackpts;
	keys = keys + "\nnroutepts = "+nroutepts;
	keys = keys + "\nnwaypts = "+nwaypts;
	return(keys);
    }
};
