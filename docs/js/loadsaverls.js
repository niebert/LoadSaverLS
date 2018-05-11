/* ---------------------------------------
 Exported Module Variable: LoadSaverLS
 Package:  loadsaverls
 Version:  0.0.1
 Homepage: https://github.com/niebert/LoadSaverLS#readme
 Author:   Engelbert Niehaus - build on Eli Greys FileSaver.js
 License:  MIT
// Inheritance: 'LoadSaverLS' inherits from 'InheritTest'
 Require Module with:
    const LoadSaverLS = require('loadsaverls');
    var  vLoadSaverLS = new LoadSaverLS(document);
 JSHint: installation with 'npm install jshint -g'
 ------------------------------------------ */

/*jshint  laxcomma: true, asi: true, maxerr: 150 */
/*global alert, confirm, console, prompt */
/* Blob.js
 * A Blob implementation.
 * 2014-07-24
 *
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/dsamarin
 * License: MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */

/*global self, unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js */

(function (view) {
	"use strict";

	view.URL = view.URL || view.webkitURL;

	if (view.Blob && view.URL) {
		try {
			new Blob;
			return;
		} catch (e) {}
	}

	// Internally we use a BlobBuilder implementation to base Blob off of
	// in order to support older browsers that only have BlobBuilder
	var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
		var
			  get_class = function(object) {
				return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
			}
			, FakeBlobBuilder = function BlobBuilder() {
				this.data = [];
			}
			, FakeBlob = function Blob(data, type, encoding) {
				this.data = data;
				this.size = data.length;
				this.type = type;
				this.encoding = encoding;
			}
			, FBB_proto = FakeBlobBuilder.prototype
			, FB_proto = FakeBlob.prototype
			, FileReaderSync = view.FileReaderSync
			, FileException = function(type) {
				this.code = this[this.name = type];
			}
			, file_ex_codes = (
				  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
				+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
			).split(" ")
			, file_ex_code = file_ex_codes.length
			, real_URL = view.URL || view.webkitURL || view
			, real_create_object_URL = real_URL.createObjectURL
			, real_revoke_object_URL = real_URL.revokeObjectURL
			, URL = real_URL
			, btoa = view.btoa
			, atob = view.atob

			, ArrayBuffer = view.ArrayBuffer
			, Uint8Array = view.Uint8Array

			, origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
		;
		FakeBlob.fake = FB_proto.fake = true;
		while (file_ex_code--) {
			FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
		}
		// Polyfill URL
		if (!real_URL.createObjectURL) {
			URL = view.URL = function(uri) {
				var
					  uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
					, uri_origin
				;
				uri_info.href = uri;
				if (!("origin" in uri_info)) {
					if (uri_info.protocol.toLowerCase() === "data:") {
						uri_info.origin = null;
					} else {
						uri_origin = uri.match(origin);
						uri_info.origin = uri_origin && uri_origin[1];
					}
				}
				return uri_info;
			};
		}
		URL.createObjectURL = function(blob) {
			var
				  type = blob.type
				, data_URI_header
			;
			if (type === null) {
				type = "application/octet-stream";
			}
			if (blob instanceof FakeBlob) {
				data_URI_header = "data:" + type;
				if (blob.encoding === "base64") {
					return data_URI_header + ";base64," + blob.data;
				} else if (blob.encoding === "URI") {
					return data_URI_header + "," + decodeURIComponent(blob.data);
				} if (btoa) {
					return data_URI_header + ";base64," + btoa(blob.data);
				} else {
					return data_URI_header + "," + encodeURIComponent(blob.data);
				}
			} else if (real_create_object_URL) {
				return real_create_object_URL.call(real_URL, blob);
			}
		};
		URL.revokeObjectURL = function(object_URL) {
			if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
				real_revoke_object_URL.call(real_URL, object_URL);
			}
		};
		FBB_proto.append = function(data/*, endings*/) {
			var bb = this.data;
			// decode data to a binary string
			if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
				var
					  str = ""
					, buf = new Uint8Array(data)
					, i = 0
					, buf_len = buf.length
				;
				for (; i < buf_len; i++) {
					str += String.fromCharCode(buf[i]);
				}
				bb.push(str);
			} else if (get_class(data) === "Blob" || get_class(data) === "File") {
				if (FileReaderSync) {
					var fr = new FileReaderSync;
					bb.push(fr.readAsBinaryString(data));
				} else {
					// async FileReader won't work as BlobBuilder is sync
					throw new FileException("NOT_READABLE_ERR");
				}
			} else if (data instanceof FakeBlob) {
				if (data.encoding === "base64" && atob) {
					bb.push(atob(data.data));
				} else if (data.encoding === "URI") {
					bb.push(decodeURIComponent(data.data));
				} else if (data.encoding === "raw") {
					bb.push(data.data);
				}
			} else {
				if (typeof data !== "string") {
					data += ""; // convert unsupported types to strings
				}
				// decode UTF-16 to binary string
				bb.push(unescape(encodeURIComponent(data)));
			}
		};
		FBB_proto.getBlob = function(type) {
			if (!arguments.length) {
				type = null;
			}
			return new FakeBlob(this.data.join(""), type, "raw");
		};
		FBB_proto.toString = function() {
			return "[object BlobBuilder]";
		};
		FB_proto.slice = function(start, end, type) {
			var args = arguments.length;
			if (args < 3) {
				type = null;
			}
			return new FakeBlob(
				  this.data.slice(start, args > 1 ? end : this.data.length)
				, type
				, this.encoding
			);
		};
		FB_proto.toString = function() {
			return "[object Blob]";
		};
		FB_proto.close = function() {
			this.size = 0;
			delete this.data;
		};
		return FakeBlobBuilder;
	}(view));

	view.Blob = function(blobParts, options) {
		var type = options ? (options.type || "") : "";
		var builder = new BlobBuilder();
		if (blobParts) {
			for (var i = 0, len = blobParts.length; i < len; i++) {
				if (Uint8Array && blobParts[i] instanceof Uint8Array) {
					builder.append(blobParts[i].buffer);
				}
				else {
					builder.append(blobParts[i]);
				}
			}
		}
		var blob = builder.getBlob(type);
		if (!blob.slice && blob.webkitSlice) {
			blob.slice = blob.webkitSlice;
		}
		return blob;
	};

	var getPrototypeOf = Object.getPrototypeOf || function(object) {
		return object.__proto__;
	};
	view.Blob.prototype = getPrototypeOf(new view.Blob());
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content || this));
/* canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2016-05-26
 * 
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: MIT
 *   See https://github.com/eligrey/canvas-toBlob.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */

(function(view) {
"use strict";
var
	  Uint8Array = view.Uint8Array
	, HTMLCanvasElement = view.HTMLCanvasElement
	, canvas_proto = HTMLCanvasElement && HTMLCanvasElement.prototype
	, is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i
	, to_data_url = "toDataURL"
	, base64_ranks
	, decode_base64 = function(base64) {
		var
			  len = base64.length
			, buffer = new Uint8Array(len / 4 * 3 | 0)
			, i = 0
			, outptr = 0
			, last = [0, 0]
			, state = 0
			, save = 0
			, rank
			, code
			, undef
		;
		while (len--) {
			code = base64.charCodeAt(i++);
			rank = base64_ranks[code-43];
			if (rank !== 255 && rank !== undef) {
				last[1] = last[0];
				last[0] = code;
				save = (save << 6) | rank;
				state++;
				if (state === 4) {
					buffer[outptr++] = save >>> 16;
					if (last[1] !== 61 /* padding character */) {
						buffer[outptr++] = save >>> 8;
					}
					if (last[0] !== 61 /* padding character */) {
						buffer[outptr++] = save;
					}
					state = 0;
				}
			}
		}
		// 2/3 chance there's going to be some null bytes at the end, but that
		// doesn't really matter with most image formats.
		// If it somehow matters for you, truncate the buffer up outptr.
		return buffer;
	}
;
if (Uint8Array) {
	base64_ranks = new Uint8Array([
		  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1
		, -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9
		, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
		, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
		, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
	]);
}
if (HTMLCanvasElement && (!canvas_proto.toBlob || !canvas_proto.toBlobHD)) {
	if (!canvas_proto.toBlob)
	canvas_proto.toBlob = function(callback, type /*, ...args*/) {
		  if (!type) {
			type = "image/png";
		} if (this.mozGetAsFile) {
			callback(this.mozGetAsFile("canvas", type));
			return;
		} if (this.msToBlob && /^\s*image\/png\s*(?:$|;)/i.test(type)) {
			callback(this.msToBlob());
			return;
		}

		var
			  args = Array.prototype.slice.call(arguments, 1)
			, dataURI = this[to_data_url].apply(this, args)
			, header_end = dataURI.indexOf(",")
			, data = dataURI.substring(header_end + 1)
			, is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))
			, blob
		;
		if (Blob.fake) {
			// no reason to decode a data: URI that's just going to become a data URI again
			blob = new Blob
			if (is_base64) {
				blob.encoding = "base64";
			} else {
				blob.encoding = "URI";
			}
			blob.data = data;
			blob.size = data.length;
		} else if (Uint8Array) {
			if (is_base64) {
				blob = new Blob([decode_base64(data)], {type: type});
			} else {
				blob = new Blob([decodeURIComponent(data)], {type: type});
			}
		}
		callback(blob);
	};

	if (!canvas_proto.toBlobHD && canvas_proto.toDataURLHD) {
		canvas_proto.toBlobHD = function() {
			to_data_url = "toDataURLHD";
			var blob = this.toBlob();
			to_data_url = "toDataURL";
			return blob;
		}
	} else {
		canvas_proto.toBlobHD = canvas_proto.toBlob;
	}
}
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content || this));

function getDate() {
	var vNow = new Date();
	var vMonth = vNow.getMonth()+1;
	return vNow.getDate()+"."+vMonth+"."+vNow.getFullYear();
}

function outTime(pNr) {
	var vOut = pNr;
	if (pNr == 0) {
		vOut = "00"
	} if (pNr<10) {
		vOut = "0"+pNr;
	};
	return vOut
}

function getDateTime() {
	var vNow = new Date();
	var vSep = "/"; // set separator for date
	var vOut = vNow.getFullYear() + vSep +outTime(vNow.getMonth()+1) + vSep + outTime(vNow.getDate());
  vOut += " "; // Separator between Date and Time
	vSep = ":"; // set separator for time
	vOut += vNow.getHours() + vSep + outTime(vNow.getMinutes()) + vSep + outTime(vNow.getSeconds());
	return vOut;
}

function getTimeIndex() {
	var d = new Date();
  return d.getTime();
};
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}
/* ---------------------------------------
 Exported Module Variable: LoadSaverLS
 Package:  loadsaverls
 Version:  0.0.1
 Homepage: https://github.com/niebert/LoadSaverLS#readme
 Author:   Engelbert Niehaus - build on Eli Greys FileSaver.js
 License:  MIT
// Inheritance: 'LoadSaverLS' inherits from 'InheritTest'
 Require Module with:
    const LoadSaverLS = require('loadsaverls');
    var  vLoadSaverLS = new LoadSaverLS(document);
 JSHint: installation with 'npm install jshint -g'
 ------------------------------------------ */

/*jshint  laxcomma: true, asi: true, maxerr: 150 */
/*global alert, confirm, console, prompt */
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
/* ---------------------------------------
 Exported Module Variable: LoadSaverLS
 Package:  loadsaverls
 Version:  0.0.1
 Homepage: https://github.com/niebert/LoadSaverLS#readme
 Author:   Engelbert Niehaus - build on Eli Greys FileSaver.js
 License:  MIT
// Inheritance: 'LoadSaverLS' inherits from 'InheritTest'
 Require Module with:
    const LoadSaverLS = require('loadsaverls');
    var  vLoadSaverLS = new LoadSaverLS(document);
 JSHint: installation with 'npm install jshint -g'
 ------------------------------------------ */

/*jshint  laxcomma: true, asi: true, maxerr: 150 */
/*global alert, confirm, console, prompt */
