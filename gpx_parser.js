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
GPXParser = {
    _gpxObj:{},
    loadFromURL: function(gpx, options) {
	if (gpx) {
	    this.addGPX(gpx, options, options.async);
	}
    },
    
    onLoad: function() {
	// call back which is called once the gpx file is downloaded and
	// parsed.   This  should be overridden to do something useful!
	alert("GPXParser.onLoad()!");
    },

    loadXML: function(url, cb, options, async) {
	// Perform download of data from url.  Calls callback function
	// cb on success.
	if (async == undefined) async = this.options.async;
	if (options == undefined) options = this.options;
	
	var req = new window.XMLHttpRequest();
	req.open('GET', url, async);
	try {
	    req.overrideMimeType('text/xml'); // unsupported by IE
	} catch(e) {}
	req.onreadystatechange = function() {
	    if (req.readyState != 4) return;
	    if(req.status == 200) cb(req.responseXML, options);
	};
	req.send(null);
    },
    
    addGPX: function(url, options, async) {
	// Download the GPX file from url.  Calls _addGPX() to parse it.
		var _this = this;
	var cb = function(gpx, options) { _this._addGPX(gpx, options) };
	this.loadXML(url, cb, options, async);
    },
    
    _addGPX: function(gpxStr, options) {
	// parse the gpx data in the string gpxStr and assign it to
	//   an object variable.
	// calls this.onLoad callback function once the data is parsed.
	var gpxData = this.parseGPX(gpxStr, options);
	this.onLoad();
    },
    
    parseGPX: function(xml, options) {
	var j, i, el, layers = [];
	var named = false;
	gpxObj = {
	    'tracks':[],
	    'routes':[],
	    'waypts':[]
	}
	
	el = xml.getElementsByTagName('trkseg');
	for (i = 0; i < el.length; i++) {
	    var trksegObj = this.parse_trkseg(el[i], xml, options, 'trkpt');
	    gpxObj['tracks'].push(trksegObj);
	}
	
	el = xml.getElementsByTagName('rte');
	for (i = 0; i < el.length; i++) {
	    var rteObj = this.parse_trkseg(el[i], xml, options, 'rtept');
	    gpxObj['routes'].push(rteObj);
	}
	
	el = xml.getElementsByTagName('wpt');
	for (i = 0; i < el.length; i++) {
	    var wayptObj = this.parse_wpt(el[i], xml, options);
	    gpxObj['waypoints'].push(wayptObj);
	}
	
	this._gpxObj = gpxObj;
	return gpxObj;
    },
    
    parse_name: function(xml, layer) {
	var i, el, name, descr="";
	el = xml.getElementsByTagName('name');
	if (el.length) name = el[0].childNodes[0].nodeValue;
	el = xml.getElementsByTagName('desc');
	for (i = 0; i < el.length; i++) {
	    for (var j = 0; j < el[i].childNodes.length; j++)
		descr = descr + el[i].childNodes[j].nodeValue;
	}
	if (!name) return;
	var txt = "<h2>" + name + "</h2>" + descr;
	if (layer && layer._popup === undefined) layer.bindPopup(txt);
	return txt;
    },
    
    parse_trkseg: function(line, xml, options, tag) {
	var el = line.getElementsByTagName(tag);
	if (!el.length) return [];
	var trackpts = [];
	for (var i = 0; i < el.length; i++) {
	    var trackpt = {}
	    trackpt.lat = el[i].getAttribute('lat');
	    trackpt.lon = el[i].getAttribute('lon');
	    for (var j in el[i].childNodes) {
		var e = el[i].childNodes[j];
		if (!e.tagName) continue;
		trackpt[e.tagName] = e.textContent;
	    }
	    trackpts.push(trackpt);
	}
	return(trackpts);
    },

    parse_wpt: function(e, xml, options) {
	var m = new L.Marker(new L.LatLng(e.getAttribute('lat'),
					  e.getAttribute('lon')), options);
	//this.fire('addpoint', {point:m});
	return m;
    },

    toString: function() {
	// Returns a string representation of the loaded gpx object.
	//
	var ntrackpts = 0;
	var nroutepts = 0;
	var nwaypts = 0;
	var gpxObj = this._gpxObj;
	var keys = "";
	for (var key in gpxObj) {
	    keys = keys + ", " + key;
	}
	for (var i = 0;i<gpxObj.tracks.length;i++) {
	    ntrackpts += gpxObj.tracks[i].length;
	}
	for (var i = 0;i<gpxObj.routes.length;i++) {
	    nroutepts += gpxObj.routes[i].length;
	}
	nwaypts = gpxObj.waypts.length;
	keys = keys + "\nntrackpts = "+ntrackpts;
	keys = keys + "\nnroutepts = "+nroutepts;
	keys = keys + "\nnwaypts = "+nwaypts;
	return(keys)
    }
};
