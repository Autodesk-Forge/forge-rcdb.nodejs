/**
 * Makes the current URL query parameters easily accessible as a JS object
 */
var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

/**
 * Returns the URL of the plasma server the client should use
 */
var getASMPlasmaUrl = function() {
  return window.asmNeonUrls[Math.floor(Math.random() * window.asmNeonUrls.length)];
};

/**
 * Loads a HFDM template from the given url and registers it in the PropertyFactory
 *
 * @param {PropertyFactory} propertyFactory
 * @param {String} url
 * @return {Promise} To determine when registering is finished and whether it succeeded or not
 */
var registerTemplateFromJSON = function(propertyFactory, url) {
    return new Promise(function(resolve, reject) {
        fetch(url)
        .then(res => res.json())
        .then(template => {
          try {
            propertyFactory.register(template);
            resolve();
          } catch(err) {
            reject(err);
          }
        });
    });
};

/**
 * Loads multiple HFDM templates from the given url array and registers them in the PropertyFactory
 *
 * @param {PropertyFactory} propertyFactory
 * @param {Array.<String>} urls
 * @return {Promise} To determine when registering is finished and whether it succeeded or not
 */
var registerTemplatesFromJSON = function(propertyFactory, urls) {
  var registerPromises = [];
  for(var i = 0; i < urls.length; ++i)
    registerPromises.push(registerTemplateFromJSON(propertyFactory, urls[i]));
  return Promise.all(registerPromises);
};

/**
 * Registers all the core templates in the given PropertyFactory
 */
var registerAllCoreTemplates = function(propertyFactory) {
  var coreTemplates = [
    '/templates/autodesk/commitgraph/autodesk.commitgraph@branch-1.0.0.template.json',
    '/templates/autodesk/compute/autodesk.compute@collaboratorResource-1.0.0.template.json',
    '/templates/autodesk/compute/autodesk.compute@context-1.0.0.template.json',
    '/templates/autodesk/compute/autodesk.compute@managedResource-1.0.0.template.json',
    '/templates/autodesk/compute/autodesk.compute@node-1.0.0.template.json',
    '/templates/autodesk/compute/autodesk.compute@resource-2.0.0.template.json',
    '/templates/autodesk/compute/autodesk.compute@resource.context-3.0.0.template.json',
    '/templates/autodesk/compute/autodesk.compute@resource.state-2.0.0.template.json',
    '/templates/autodesk/data/autodesk.data@binarymetadata-1.0.0.template.json',
    '/templates/autodesk/data/autodesk.data@error-1.0.0.template.json',
    '/templates/autodesk/data/autodesk.data@oss-1.0.0.template.json',
    '/templates/autodesk/data/autodesk.data@reference-1.0.0.template.json',
    '/templates/autodesk/data/autodesk.data@uri-1.0.0.template.json',
    '/templates/autodesk/data/autodesk.data@user-1.0.0.template.json',
    '/templates/autodesk/data/autodesk.data@user-1.1.0.template.json',
    '/templates/autodesk/math/autodesk.math@matrix22d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@matrix22f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@matrix33d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@matrix33f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@matrix44d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@matrix44f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@point2d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@point2f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@point3d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@point3f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@point4d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@point4f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@quaterniond-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@quaternionf-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@vector2d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@vector2f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@vector3d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@vector3f-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@vector4d-1.0.0.template.json',
    '/templates/autodesk/math/autodesk.math@vector4f-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@basegeometry-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@basetopology-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@bcurve-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@body-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@bsurface-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@circle-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@coedge-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@cone-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@cylinder-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@edge-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@ellipse-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@ellipticalcone-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@ellipticalcylinder-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@face-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@line-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@loop-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@lump-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@model-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@paramrange-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@plane-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@point-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@shell-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@sphere-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@torus-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@vertex-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@wire-1.0.0.template.json',
    '/templates/autodesk/soliddef/autodesk.soliddef@wirebody-1.0.0.template.json',
    '/templates/autodesk/task/autodesk.core@task.observer-1.0.0.template.json',
    '/templates/autodesk/task/autodesk.core@task.subject-2.0.0.template.json',
    '/templates/autodesk/task/autodesk.core@task.subjectentry-1.0.0.template.json',
    '/templates/autodesk/time/autodesk.time@dateTime-1.0.0.template.json'
  ];
  return registerTemplatesFromJSON(propertyFactory, coreTemplates)
  .then(function() {
    console.log('Sucessfully registered all core templates');
  }, function(err) {
    console.log('Failed to register core templates: ' + err);
  });
};
