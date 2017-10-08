/**
 * Created by leefsmp on 07.10.17.
 */
(function(){

  'use strict';

  function MyExternalExtension(viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options)
  }

  MyExternalExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype)
  MyExternalExtension.prototype.constructor = MyExternalExtension

  var proto = MyExternalExtension.prototype

  proto.load = function () {

    console.log('External Extension loaded!')

    return true
  }

  proto.unload = function () {

    console.log('External Extension unloaded!')

    return true
  }

  proto.sayHello = function (name) {

    console.log('Hi ' + name + '!')

    return true
  }

  Autodesk.Viewing.theExtensionManager.registerExtension(
    'MyExternal.Extension.Id',
    MyExternalExtension)
})()
