// uploadDialog - code to display the gpx file upload dialog
// using dojo/dijit
//
define(["dojo","dijit/Dialog",
	"dijit/form/Form",
	"dijit/form/Button","dojo/io/iframe",
	"dojox/form/FileInput"],
       function() {
	   var d = new dijit.Dialog({title:'Upload GPX File'});
	   var f = new dijit.form.Form({id:'uploadForm',
				       method:'post',
				       enctype:'multipart/form-data'});
	   var cancelButton = new dijit.form.Button({
					     label:"Cancel"
					 });
	   var okButton = new dijit.form.Button({
					     label:"Upload File"
					 });
	   var fileInput = new dojox.form.FileInput(
	       {label:"", 
		cancelText:"Clear",
		name:"file",
		multiple:false, 
		uploadOnSelect:false 
	       });
	   f.containerNode.appendChild(fileInput.domNode);
	   f.containerNode.appendChild(cancelButton.domNode);
	   f.containerNode.appendChild(okButton.domNode);
	   d.setContent(f);

	   var doUpload = function() {
	       //alert("doUpload");
	       dojo.io.iframe.send({
				       form : "uploadForm",
				       handleAs : "text",
				       url : "api/uploadGPX.php",
				       load : function(response,ioArgs) {
					   console.log("success!");
					   console.log(response,ioArgs);
					   var responseObj = JSON.parse(response);
					   var jobNo = responseObj.jobNo;
					   if (jobNo == -1) {
					       alert("Upload Failed - don't know why...are you sure you tried to upload a gpx file?");
					   } else {
					       alert("Upload Successful - GPX Number is " + jobNo);
					       fileInput.reset();
					       d.hide();
					   }
					   return response;
				       },
				       error : function(response,ioArgs) {
					   console.log("error");
					   console.log(repsonse,ioArgs);
					   alert("Upload Failed - make sure the file is really a GPX file?");
					   return response;
				       }
				   });
	       };

	   dojo.connect(okButton,"onClick", doUpload);
	   var handle = dojo.connect(cancelButton,"onClick",
				     function() {
					 //alert("onClick!");
					 d.hide();
					 //dojo.disconnect(handle);
				     });


	   return {
	       show : function() { d.show();},
	       hide : function() { d.hide();}
	   };
       });

