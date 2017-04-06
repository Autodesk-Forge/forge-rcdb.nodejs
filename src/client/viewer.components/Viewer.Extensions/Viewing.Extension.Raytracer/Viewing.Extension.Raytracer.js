/////////////////////////////////////////////////////////////////
// Raytracer Viewer Extension
// By Philippe Leefsma, Autodesk Inc, April 2017
//
/////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import EventTool from 'Viewer.EventTool'
import Toolkit from 'Viewer.Toolkit'

// you can intersect the whole scene using viewer.impl.rayIntersect,
// or you can do it per model via model.rayIntersect,
// or per mesh via VBIntersector.rayCast.
// The first two approaches take advantage of the spatial index acceleration structure.

class RaytracerExtension extends ExtensionBase {

	/////////////////////////////////////////////////////////////////
	// Class constructor
  //
	/////////////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    console.log('Viewing.Extension.Raytracer loaded')

		return true
	}

  /////////////////////////////////////////////////////////
	// Extension Id
  //
  /////////////////////////////////////////////////////////
	static get ExtensionId () {

		return 'Viewing.Extension.Raytracer'
	}

  /////////////////////////////////////////////////////////
	// Unload callback
  //
  /////////////////////////////////////////////////////////
	unload () {

    console.log('Viewing.Extension.Raytracer loaded')

		return true
	}
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  RaytracerExtension.ExtensionId,
  RaytracerExtension)

export default 'Viewing.Extension.Raytracer'
