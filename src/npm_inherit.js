


//--------------------------------------
//---Super Class------------------------
// Inheritance: 'LoadSaverLS' inherits from 'InheritTest'
LoadSaverLS.prototype = new InheritTest();
// Constructor for instances of 'LoadSaverLS' has to updated.
// Otherwise constructor of 'InheritTest' is called
LoadSaverLS.prototype.constructor=LoadSaverLS;
// see http://phrogz.net/js/classes/OOPinJS2.html for explanation
//--------------------------------------
