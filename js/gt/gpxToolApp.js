//
// define the gpxToolApp application controller.
//
define(["dojo/dom","dojo/on","gt/uploadDialog","gt/searchGpxDialog"],
       function(dom,on,uploadDialog,searchGpxDialog) {
	   
	   var loadGPXCallback = function(vals) {
	       console.log("loadGPXCallback");
	       console.log(vals);
	       alert("loading gpx file number "+vals);
	   }


	   var initUI = function() {
	       on(dom.byId("uploadButton"), "click", function() {
		      uploadDialog.show();
		  }
		 );
	       on(dom.byId("searchButton"), "click", function() {
		      searchGpxDialog.show(loadGPXCallback);
		  }
		 );
	   };
	   
	   return {
	       init : function() {
		   initUI();
	       }
	   };
});

