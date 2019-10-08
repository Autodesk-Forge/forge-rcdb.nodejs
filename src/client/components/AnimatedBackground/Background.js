import { findDOMNode } from 'react-dom'
import './background.scss'
import React from 'react'
import FSS from './fss'

/// //////////////////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////////////////
class AnimatedBackground extends React.Component {
  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  render () {
    return (

      <div ref={(ref) => { this.backgroundContainer = ref }}>

        <div
          ref={(ref) => { this.backgroundOutput = ref }}
          className='animated-background-output'
        />

      </div>
    )
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  componentDidUpdate () {

  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  componentDidMount () {
    this.animation = this.loadAnimation(
      findDOMNode(this.backgroundContainer),
      findDOMNode(this.backgroundOutput))

    this.animation.start()

    this.animation.resize()
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  componentWillUnmount () {

  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  loadAnimation (container, output) {
    var _animId = 0

    var _thisAnimation = this

    // ------------------------------
    // Mesh Properties
    // ------------------------------
    var MESH = {
      width: 1.25,
      height: 1.25,
      depth: 2,
      segments: 20,
      slices: 20,
      xRange: 0.2,
      yRange: 0.2,
      zRange: 1.0,
      ambient: '#3566CC',
      diffuse: '#deff3b',
      speed: 0.0009
    }

    // ------------------------------
    // Light Properties
    // ------------------------------
    var LIGHT = {
      count: 1,
      xyScalar: 1,
      zOffset: 150,
      ambient: '#657FD4',
      diffuse: '#009944',
      speed: 1,
      gravity: 300,
      dampening: 0.95,
      minLimit: 10,
      maxLimit: null,
      minDistance: 20,
      maxDistance: 400,
      draw: false,
      bounds: FSS.Vector3.create(),
      step: FSS.Vector3.create(
        Math.randomInRange(0.2, 2.0),
        Math.randomInRange(0.2, 2.0),
        Math.randomInRange(0.2, 2.0)
      )
    }

    // ------------------------------
    // Render Properties
    // ------------------------------
    var WEBGL = 'webgl'
    var CANVAS = 'canvas'
    var SVG = 'svg'
    var RENDER = {
      renderer: CANVAS
    }

    // ------------------------------
    // Export Properties
    // ------------------------------

    // ------------------------------
    // UI Properties
    // ------------------------------
    var UI = {
      show: true
    }

    // ------------------------------
    // Global Properties
    // ------------------------------
    var now; var start = Date.now()
    var center = FSS.Vector3.create()
    var attractor = FSS.Vector3.create()

    attractor = [-804, -315, 286]

    var renderer, scene, mesh, geometry, material
    var webglRenderer, canvasRenderer, svgRenderer

    // ------------------------------
    // Methods
    // ------------------------------
    function initialize () {
      createRenderer()
      createScene()
      createMesh()
      createLights()
      addEventListeners()
      resize(container.offsetWidth, container.offsetHeight)
    }

    function createRenderer () {
      webglRenderer = new FSS.WebGLRenderer()
      canvasRenderer = new FSS.CanvasRenderer()
      svgRenderer = new FSS.SVGRenderer()
      setRenderer(RENDER.renderer)
    }

    function setRenderer (index) {
      if (renderer) {
        output.removeChild(renderer.element)
      }
      switch (index) {
        case WEBGL:
          renderer = webglRenderer
          break
        case CANVAS:
          renderer = canvasRenderer
          break
        case SVG:
          renderer = svgRenderer
          break
      }

      renderer.setSize(
        container.offsetWidth,
        container.offsetHeight)

      output.appendChild(renderer.element)
    }

    function createScene () {
      scene = new FSS.Scene()
    }

    function createMesh () {
      scene.remove(mesh)

      renderer.clear()

      geometry = new FSS.Plane(
        MESH.width * renderer.width,
        MESH.height * renderer.height,
        MESH.segments,
        MESH.slices)

      material = new FSS.Material(
        MESH.ambient,
        MESH.diffuse)

      mesh = new FSS.Mesh(geometry, material)

      scene.add(mesh)

      // Augment vertices for animation
      var v, vertex
      for (v = geometry.vertices.length - 1; v >= 0; v--) {
        vertex = geometry.vertices[v]
        vertex.anchor = FSS.Vector3.clone(vertex.position)
        vertex.step = FSS.Vector3.create(
          Math.randomInRange(0.2, 2.0),
          Math.randomInRange(0.2, 2.0),
          Math.randomInRange(0.2, 2.0)
        )
        vertex.time = Math.randomInRange(0, Math.PIM2)
      }
    }

    function createLights () {
      var l, light
      for (l = scene.lights.length - 1; l >= 0; l--) {
        light = scene.lights[l]
        scene.remove(light)
      }
      renderer.clear()
      for (l = 0; l < LIGHT.count; l++) {
        light = new FSS.Light(LIGHT.ambient, LIGHT.diffuse)
        light.ambientHex = light.ambient.format()
        light.diffuseHex = light.diffuse.format()
        scene.add(light)

        // Augment light for animation
        light.mass = Math.randomInRange(0.5, 1)
        light.velocity = FSS.Vector3.create()
        light.acceleration = FSS.Vector3.create()
        light.force = FSS.Vector3.create()

        // Ring SVG Circle
        light.ring = document.createElementNS(FSS.SVGNS, 'circle')
        light.ring.setAttributeNS(null, 'stroke', light.ambientHex)
        light.ring.setAttributeNS(null, 'stroke-width', '0.5')
        light.ring.setAttributeNS(null, 'fill', 'none')
        light.ring.setAttributeNS(null, 'r', '10')

        // Core SVG Circle
        light.core = document.createElementNS(FSS.SVGNS, 'circle')
        light.core.setAttributeNS(null, 'fill', light.diffuseHex)
        light.core.setAttributeNS(null, 'r', '4')

        // Set Initial Position
        light.position = [-804, -315, 286]
      }
    }

    function resize (width, height) {
      renderer.setSize(width, height)
      FSS.Vector3.set(center, renderer.halfWidth, renderer.halfHeight)
      createMesh()
    }

    _thisAnimation.start = function () {
      now = Date.now() - start
      update()
      render()
      _animId = requestAnimationFrame(_thisAnimation.start)
    }

    _thisAnimation.stop = function () {
      cancelAnimationFrame(_animId)
    }

    _thisAnimation.resize = function () {
      resize(
        container.offsetWidth,
        container.offsetHeight)
    }

    function update () {
      var ox; var oy; var oz; var l; var light; var v; var vertex; var offset = MESH.depth / 2

      // Update Bounds
      FSS.Vector3.copy(LIGHT.bounds, center)
      FSS.Vector3.multiplyScalar(LIGHT.bounds, LIGHT.xyScalar)

      // Update Attractor
      // FSS.Vector3.setZ(attractor, LIGHT.zOffset);

      // Animate Lights
      for (l = scene.lights.length - 1; l >= 0; l--) {
        light = scene.lights[l]

        // Reset the z position of the light

        FSS.Vector3.setZ(light.position, LIGHT.zOffset)

        // Calculate the force Luke!
        var D = Math.clamp(FSS.Vector3.distanceSquared(light.position, attractor), LIGHT.minDistance, LIGHT.maxDistance)
        var F = LIGHT.gravity * light.mass / D
        FSS.Vector3.subtractVectors(light.force, attractor, light.position)
        FSS.Vector3.normalise(light.force)
        FSS.Vector3.multiplyScalar(light.force, F)

        // Update the light position
        FSS.Vector3.set(light.acceleration)
        FSS.Vector3.add(light.acceleration, light.force)
        FSS.Vector3.add(light.velocity, light.acceleration)
        FSS.Vector3.multiplyScalar(light.velocity, LIGHT.dampening)
        FSS.Vector3.limit(light.velocity, LIGHT.minLimit, LIGHT.maxLimit)
        FSS.Vector3.add(light.position, light.velocity)
      }

      // Animate Vertices
      for (v = geometry.vertices.length - 1; v >= 0; v--) {
        vertex = geometry.vertices[v]
        ox = Math.sin(vertex.time + vertex.step[0] * now * MESH.speed)
        oy = Math.cos(vertex.time + vertex.step[1] * now * MESH.speed)
        oz = Math.sin(vertex.time + vertex.step[2] * now * MESH.speed)
        FSS.Vector3.set(vertex.position,
          MESH.xRange * geometry.segmentWidth * ox,
          MESH.yRange * geometry.sliceHeight * oy,
          MESH.zRange * offset * oz - offset)
        FSS.Vector3.add(vertex.position, vertex.anchor)
      }

      // Set the Geometry to dirty
      geometry.dirty = true
    }

    function render () {
      renderer.render(scene)
    }

    function addEventListeners () {
      window.addEventListener('resize', onWindowResize)
      container.addEventListener('click', onMouseClick)
      container.addEventListener('mousemove', onMouseMove)
    }

    // ------------------------------
    // Callbacks
    // ------------------------------
    function onMouseClick (event) {
      FSS.Vector3.set(attractor, event.x, renderer.height - event.y)
      FSS.Vector3.subtract(attractor, center)
    }

    function onMouseMove (event) {
      FSS.Vector3.set(attractor, event.x, renderer.height - event.y)
      FSS.Vector3.subtract(attractor, center)
    }

    function onWindowResize (event) {
      resize(container.offsetWidth, container.offsetHeight)
      render()
    }

    // Let there be light!
    initialize()

    return _thisAnimation
  }
}

export default AnimatedBackground
