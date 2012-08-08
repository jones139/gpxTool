//
// define the gpxToolApp application controller.
//
define(["dojo/dom",
	"dojo/on",
	"dojo/dom-construct",
	"gt/uploadDialog",
	"gt/searchGpxDialog",
	"gt/gpxFile"],
       function(dom,on,domConstruct,uploadDialog,searchGpxDialog) {
	   var gpxFileArr = [];

	   var loadGPXCallback = function(vals) {
	       console.log("loadGPXCallback");
	       var n = gpxFileArr.push(new gt.gpxFile()) - 1;
	       gpxFileArr[n].loadFromServer(vals,
		       function(gpxFileObj){
			   console.log("gpxFile.cb");
			   var html = gpxFileArr[gpxFileArr.length-1].getGpxInfoHtml();
			   console.log(html);
			   domConstruct.create("div", {innerHTML:html},dom.byId("gpxInfoDiv"));
			   //dom.byId("gpxInfoDiv").appendChild(html);
		       });
	   };

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

