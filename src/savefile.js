
function save_file(pFilename,pContent, pMessage) {
  var vMessage = pMessage || "File '"+pFilename+"' was saved!"
  fs.writeFile(pFilename, pContent, function(err) {
      if(err) {
          return console.log(err);
      };
      console.log(vMessage);
  });

};

module.exports = save_file;
