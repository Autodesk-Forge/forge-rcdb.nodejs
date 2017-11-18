import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'
import Stopwatch from 'Stopwatch'

export default class ParticleToolPointCloud extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, particleSystem, options = {}){

    super()

    viewer.toolController.registerTool(this)

    this.particleSystem = particleSystem

    this.stopwatch = new Stopwatch()

    this.options = options

    this.viewer = viewer

    this.active = false
  }

  /////////////////////////////////////////////////////////////////
  // Tool names
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ["Viewing.Particle.Tool.PointCloud"]
  }

  /////////////////////////////////////////////////////////////////
  // Tool name
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return "Viewing.Particle.Tool.PointCloud"
  }

  /////////////////////////////////////////////////////////////////
  // Activate Tool
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    if (!this.active) {

      this.stopwatch.getElapsedMs()

      this.active = true

      if (!this.pointCloud) {

        this.createPointCloud()
      }

      this.viewer.toolController.activateTool(
        this.getName())

      this.emit('activate')
    }
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tool
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    if (this.active) {

      this.active = false

      this.viewer.toolController.deactivateTool(
        this.getName())

      this.clearParticles()

      this.emit('deactivate')
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setMaxParticles (maxParticles) {

    this.maxParticles = maxParticles

    if (this.geometry) {

      for(var i= 0; i<this.geometry.vertices.length; ++i) {

        this.geometry.vertices[i].x = -5000
        this.geometry.vertices[i].y = -5000
        this.geometry.vertices[i].z = -5000
      }

      this.geometry.verticesNeedUpdate = true

      this.viewer.impl.invalidate(true, false, false)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  clearParticles () {

    for(var i= 0; i<this.geometry.vertices.length; ++i) {

      this.geometry.vertices[i].x = -5000
      this.geometry.vertices[i].y = -5000
      this.geometry.vertices[i].z = -5000
    }

    this.geometry.verticesNeedUpdate = true

    this.viewer.impl.invalidate(true, false, false)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  filterParticle (particle) {

    var result = false

    this.bounds.forEach((bound)=>{

      switch(bound.type){

        case 'sphere':

          if(bound.max){
            if(!particle.getPosition().withinSphere(
                bound.center, bound.max)) {
              result = true
            }
          }

          if(bound.min){
            if(particle.getPosition().withinSphere(
                bound.center, bound.min)) {
              result = true
            }
          }

          break

        case 'box':

          if(!particle.getPosition().withinBox(
              bound.center, bound.size)) {
            result = true
          }

          break
      }
    })

    return result
  }

  /////////////////////////////////////////////////////////////////
  // Update loop without shaders
  //
  /////////////////////////////////////////////////////////////////
  update () {

    this.particleSystem.step(
      this.stopwatch.getElapsedMs() * 0.001)

    this.particleSystem.initParticleLoop()

    let index = -1

    let particle

    while (true) {

      particle = this.particleSystem.nextParticle()

      ++index

      if (!particle.ptr) {

        break
      }

      this.updateParticle(particle, index)
    }

    this.geometry.verticesNeedUpdate = true

    // invalidate (needsClear, needsRender, overlayDirty)
    this.viewer.impl.invalidate(true, false, false)

    this.emit('fps.tick')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  updateParticle (particle, index) {

    var vertex = this.geometry.vertices[index]

    if (particle.getRecycled()) {

      vertex.x = -5000.0
      vertex.y = -5000.0
      vertex.z = -5000.0

    } else if (this.filterParticle(particle)) {

      particle.setLifeTime(-1)

      vertex.x = -5000.0
      vertex.y = -5000.0
      vertex.z = -5000.0

    } else {

      const pos = particle.getPosition()

      vertex.x = pos.getX()
      vertex.y = pos.getY()
      vertex.z = pos.getZ()

      //var color = this.shader.uniforms.color.value
      //
      //color.x = Math.random()
      //color.y = Math.random()
      //color.z = Math.random()
    }
  }

  /////////////////////////////////////////////////////////////
  // Creates 1M vertices PointCloud supported by Forge Viewer
  //
  /////////////////////////////////////////////////////////////
  createPointCloud (maxPoints = 1000000) {

    // Vertex Shader code
    const vertexShader = `
      attribute vec4 color;
      varying vec4 vColor;
      void main() {
        vec4 vPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * vPosition;
        gl_PointSize = 4.0;
        vColor = color;
      }
    `

    // Fragment Shader code
    const fragmentShader = `
      #ifdef GL_ES
      precision highp float;
      #endif
      varying vec4 vColor;
      void main() {
        gl_FragColor = vColor;
      }
    `

    // Shader material parameters
    this.shader = {
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      fragmentShader,
      vertexShader,
      attributes:{
        color: {
          type: 'v4',
          value: []
        }
      }
    }

    // Initialize geometry vertices
    // and shader attribute colors
    this.geometry = new THREE.Geometry()

    for(var i = 0; i < maxPoints; ++i) {

      this.geometry.vertices.push(
        new THREE.Vector3(-5000, -5000, -5000))

      this.shader.attributes.color.value.push(
        new THREE.Vector4(
          Math.random(),
          Math.random(),
          Math.random(),
          1.0)
      )
    }

    // creates shader material
    const shaderMaterial =
      new THREE.ShaderMaterial(
        this.shader)

    // creates THREE.PointCloud
    this.pointCloud = new THREE.PointCloud(
      this.geometry, shaderMaterial)

    // adds to the viewer scene
    this.viewer.impl.scene.add(this.pointCloud)

    // triggers refresh
    this.viewer.impl.invalidate(true)
  }
}
