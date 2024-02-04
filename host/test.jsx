var doc = app.documents[0]
var name = doc.name.split('_')[0] 

var saveOpts = new JPEGSaveOptions();
    saveOpts.emdedColorProfile = true;
    saveOpts.formatOptions = FormatOptions.STANDARDBASELINE;
    saveOpts.quality = 12 
    doc.saveAs(File(doc.path.absoluteURI + getSeparator() + name), saveOpts, true)


    function getSeparator(){
      if (Folder.fs == "Macintosh") {
        return '/'
      } else {
        return '\\'
      }
    }