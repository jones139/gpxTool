// searchGpxDialog - list gpx files on the server.
//
define(["dojo","dijit/Dialog",
	"dijit/form/Form",
	"dijit/form/Button",
	"dojo/dom-construct"
	],
       function(dojo,dialog,form,button,domConstruct) {
	   var d = new dijit.Dialog({title:'List GPX Files'});
	   var f = new dijit.form.Form({id:'searchGpxForm',
				       method:'get',
				       enctype:'multipart/form-data'});
	   var cancelButton = new dijit.form.Button({
					     label:"Cancel"
					 });
	   var okButton = new dijit.form.Button({
					     label:"Search"
					 });
	   f.containerNode.appendChild(cancelButton.domNode);
	   f.containerNode.appendChild(okButton.domNode);
	   //f.containerNode.appendChild(ul);
	   d.setContent(f);

	   var makeList = function(res) {
	       console.log("makeList starting...");
	       console.log(res);
	       var div = domConstruct.create("div",{
						 style:{
						     height:'200px',
						     width:'400px',
						     overflow:'scroll'
						 }
					     },
					    f.containerNode);
	       var ul = domConstruct.create("ul",null,div);  
	       var key;
	       for (key in res) {
		   console.log(key);
		   li = domConstruct.create("li",{
						innerHTML:key+' : '+res[key].title
					    },
					    ul);
		   //ul.appendChild(li);
	       }
	       //div.appendChild(ul);
	       //f.containerNode.appendChild(div);
	       console.log("makeList complete");
	   };

	   var doSearch = function() {
	       //alert("doSearch");
	       dojo.xhr.get({
				form : "searchGpxForm",
				handleAs : "text",
				url : "api/listGPX.php",
				load : function(response,ioArgs) {
				    console.log("success!");
				    //console.log(response,ioArgs);
				    var responseObj = JSON.parse(response);
				    makeList(responseObj);
				    console.log("back in load()");
				    return response;
				},
				error : function(response,ioArgs) {
				    console.log("error");
				    console.log(repsonse,ioArgs);
				    alert("Search Failed....");
				    return response;
				}
			    });
	   };

	   dojo.connect(okButton,"onClick", doSearch);
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

