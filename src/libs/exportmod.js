function LoadSaverLS (pDocument) {
  this.aLinkParam = new LinkParam();
  this.aDoc = pDocument;
  this.aJSON = {};
  this.aDefaultJSON = {};

  this.init = function (pJSON,pDefaultJSON,pSchema,pTemplates,pOptions) {
    this.aLinkParam.init(this.aDoc);
    this.aJSON = pJSON || {};
    this.aDefaultJSON = pDefaultJSON;
    this.loadParamStorage(pJSON);
  };

  this.initDoc = function (pDoc) {
    this.aDoc = pDoc;
  };

  this.loadParamStorage = function (pInitJSON,pLSID) {
    var vLSID = pLSID || "jsondata";
    var vJSON = null;
    var vJSONstring = "";
    console.log("loadParamStorage(pInitJSON,'"+vLSID+"')");
    //console.log("Start JSON:\n"+JSON.stringify(vJSON,null,3));
    //-------------------------------------------------------
    // LOCAL STORAGE: Check JSON Data is available in LocalStorage
    var vLSID = "jsondata";
    this.loadLS(vLSID);
    //console.log("loadParamStorage(pInitJSON,'"+vLSID+"' - JSON:\n"+(JSON.stringify(vJSON,null,3)).substr(0,120)+"...");
    //-------------------------------------------------------
    // LINK PARAMETER: Evaluation link parameter in JSON Path
    if (this.aLinkParam.exists("jsondata")) {
       console.log("LinkParameter provides 'jsondata'  with value");
       vJSONstring = this.aLinkParam.getValue("jsondata");
       try {
         vJSON = JSON.parse(vJSONstring);
       } catch (e) {
         alert("ERROR (JSON in LinkParam): "+e);
       };
       if (vJSON) {
         console.log("LinkParam: JSON set to this.aJSON");
         this.aJSON = vJSON;
       };
     } else {
       console.log("LinkParam do not contain 'jsondata'");
     };
     //-------------------------------------------------------
     // JSON DEFINED: Evaluation link parameter or local storage have defined vJSON
     if (this.aJSON) {
        console.log("this.aJSON data is defined for the JSONEditor4Code");
     } else {
       console.log("src/exportmod.js:56 - Define missing this.aJSON will be initialized pInitJSON");
       this.aJSON = pInitJSON;
     };
     console.log("Loaded JSON:\n"+JSON.stringify(vJSON,null,3));
  }

  this.submit2callback = function(pLink) {
    var vJSONstring = JSON.stringify(this.getValue());
    var vLink = pLink || "receiver.html"; // is a default HTML as callback
    // to check the LinkParam communication between HTML documents
    if (this.aLinkParam.exists("callback")) {
      vLink = this.aLinkParam.getValue("callback");
      console.log("Callback defined in LinkParam:\n  "+vLink);
    };
    this.aLinkParam.setValue("jsondata",vJSONstring);
    this.aLinkParam.deleteValue("callback");
    // send current JSON data back to callback URL
    document.location.href = vLink + this.aLinkParam.getParam4URL();
  };

  /*
  el-method is used to replace calls
  document.getElementById
  */
  this.el = function (pID) {
    return this.aDoc.getElementById(pID);
  };


    this.loadLS = function (pLSID) {
      var vLSID = pLSID || "jsondatra"; //this.aJSON.data.classname;
      var vJSONstring = "";
      if (typeof(Storage) != "undefined") {
          // Store
          if (typeof(localStorage.getItem(vLSID)) !== undefined) {
            console.log("LocalStorage: '"+vLSID+"' try loading from Local Storage");
            var vJSONstring = localStorage.getItem(vLSID);
            if (!vJSONstring) {
              console.log("LocalStorage: '"+vLSID+"' undefined in Local Storage.\nSave default as JSON");
              vJSONstring = JSON.stringify(this.getValue());
              console.log("LocalStorage: loadLS('"+vLSID+"') - init with JSONstring='"+vJSONstring.substr(0,120)+"...'");
              localStorage.setItem(vLSID, vJSONstring);
            } else {
              console.log("parse JSON '"+vLSID+"') from LocalStorage JSONstring='"+vJSONstring.substr(0,120)+"...'");
              try {
                  this.aJSON = JSON.parse(vJSONstring);
              } catch(e) {
                  alert("ERROR: "+ e)
              };
            };
          } else {
            console.log("JSON-Data '"+vLSID+"' is undefined in Local Storage.\nSave default as JSON");
            localStorage.setItem(vLSID, JSON.stringify(this.aEditor.getValue()));
          };
      }	 else {
          console.log("WARNING: Sorry, your browser does not support Local Storage of JSON Database. Use Firefox ...");
      };
    }

    this.saveLS = function (pLSID) {
      var vLSID = pLSID || "jsondata";
      console.log("saveJS('"+vLSID+"')-Call");
      var vJSON = this.getValue();
      if (typeof(Storage) != "undefined") {
          // Store
          if (typeof(vJSON) != undefined) {
            console.log("LocalStorage: '"+vLSID+"' is defined, JSONDB in  Local Storage");
            if (vJSON) {
              //console.log("pJSONDB '"+vLSID+"' is saved to Local Storage");
              var vJSONstring = JSON.stringify(vJSON)
              console.log("LocalStorage: saveLS('"+vLSID+"') JSONstring='"+vJSONstring.substr(0,120)+"...' DONE");
              localStorage.setItem(vLSID,vJSONstring);
            } else {
              console.log("vJSON with JSON is NOT defined");
            }
          } else {
            console.log("JSON Data '"+vLSID+"' is undefined");
          };
        }	 else {
          console.log("WARNING: Sorry, your browser does not support Local Storage of JSON Database. Use Firefox ...");
        }
    }

    this.loadJSON = function () {
      var vThis = this;
      var fileToLoad = this.el(this.aOptions.filejson_id).files[0]; //for input type=file
      if (fileToLoad) {
        console.log("loader4JSON() - File '"+fileToLoad.name+"' exists.");
        $('#load_filename').html(fileToLoad.name); // this.value.replace(/.*[\/\\]/, '')
        var fileReader = new FileReader();
        // set the onload handler
        fileReader.onload = function(fileLoadedEvent){
            var vTextFromFileLoaded = fileLoadedEvent.target.result;
            //document.getElementById("inputTextToSave").value = textFromFileLoaded;
            //alert("textFromFileLoaded="+textFromFileLoaded);
            try {
              vThis.aEtditor.setValue(JSON.parse(vTextFromFileLoaded));
              alert("File JSON '"+fileToLoad.name+"' loaded successfully!");
              vThis.validate_errors();
            } catch(e) {
              vThis.aEditor.setValue([]); // Init with an empty class
              alert(e); // error in the above string (in this case, yes)!
            };
          };
        //onload handler set now start loading the file
        fileReader.readAsText(fileToLoad, "UTF-8");
      } else {
        alert("File is missing");
      };
      this.saveLS("jsondata");
    }

    this.saveJSON = function () {
      // Get the value from the editor
      //alert("saveJSON()-Call");
      var vJSON = this.aEditor.getValue();
      this.saveLS("jsondata");
      var vFile = class2filename(this.aJSON.data.classname,"_uml.json");
     // set modified date in reposinfo.modified
      this.update_modified();
      var vContent = JSON.stringify(vJSON,null,4);
      saveFile2HDD(vFile,vContent);
      console.log("JSON output '"+vFile+"':\n"+vContent);
      alert("JSON File: '"+vFile+"' saved!");
    }

}
