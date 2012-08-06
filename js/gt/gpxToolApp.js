//
// define the gpxToolApp application controller.
//
define(["dojo/dom","dojo/on","gt/uploadDialog","gt/searchGpxDialog"],
       function(dom,on,uploadDialog,searchGpxDialog) {

	   var showUploadDialog = function() {
		   uploadDialog.show();
	       };

	   var initUI = function() {
	       on(dom.byId("uploadButton"), "click", showUploadDialog);
	       on(dom.byId("searchButton"), "click", function() {
		      searchGpxDialog.show()
		  }
		 );
	   };
	   
	   return {
	       init : function() {
		   initUI();
		   //uploadDialog.show();
	       }
	   };
});

