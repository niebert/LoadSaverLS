var fs = require('fs');
var concat = require('concat-files');

function save_file(pFilename,pContent, pMessage) {
  var vMessage = pMessage || "File '"+pFilename+"' was saved!";
  fs.writeFile(pFilename, pContent, function(err) {
      if(err) {
          return console.log(err);
      };
      console.log(vMessage);
  });

};

function concat_libs(pFilename,pLibArray) {
  console.log("Create Library '"+pFilename+"'");
  concat(pLibArray, pFilename, function(err) {
      if (err) {
        console.log("ERROR: generating '"+pFilename+"'\n"+err);
        throw err
      };
      console.log("File: '"+pFilename+"' generated for libraries successfully!\n  Libs:\n     "+pLibArray.join("\n     "));
  });
};

module.exports = {
  "save_file":save_file,
  "concat_libs":concat_libs
};
