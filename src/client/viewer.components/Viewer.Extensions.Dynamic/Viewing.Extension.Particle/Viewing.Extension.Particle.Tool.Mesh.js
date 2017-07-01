import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'
import Stopwatch from 'Stopwatch'

const vertexShader = `

  // switch on high precision floats
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform vec3 offset;

  void main() {

    vec3 newPosition = position + offset;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(newPosition, 1.0);
  }
`

const fragmentShader = `

  #ifdef GL_ES
  precision highp float;
  #endif

  uniform vec4 color;

  void main() {

    gl_FragColor = color;
  }
`

export default class ParticleToolMesh extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, particleSystem, options = {}){

    super()

    this.viewer = viewer

    viewer.toolController.registerTool(this)

    this.particleSystem = particleSystem

    this.stopwatch = new Stopwatch()

    this.nbParticleTypes = 50

    this.particleMaterials =
      this.createRandomMaterials(
        this.nbParticleTypes)

    this.activateShaders (true)

    this.options = options

    this.shaders = 'ON'

    this.active = false
  }

  /////////////////////////////////////////////////////////////////
  // Tool names
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ["Viewing.Particle.Tool.Mesh"]
  }

  /////////////////////////////////////////////////////////////////
  // Tool name
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return "Viewing.Particle.Tool.Mesh"
  }

  /////////////////////////////////////////////////////////////////
  // Activate Tool
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    if (!this.active) {

      console.log(this.getName() + ' activated')

      this.stopwatch.getElapsedMs()

      this.active = true

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

      console.log(this.getName() + ' deactivated')

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

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  clearParticles () {

    this.particleSystem.initParticleLoop()

    while (true) {

      var particle = this.particleSystem.nextParticle()

      if (!particle.ptr) {
        break
      }

      this.destroyParticle(particle)
    }

    this.viewer.impl.invalidate(true)
  }

  /////////////////////////////////////////////////////////////////
  // Creates a bunch of materials with random colors
  //
  /////////////////////////////////////////////////////////////////
  createRandomMaterials (nb) {

    var materials = []

    for (var i = 0; i < nb; ++i) {

      var clr = Math.random() * 16777215

      materials.push(this.createMaterial({
        shading: THREE.FlatShading,
        name: Toolkit.guid(),
        shininess: 50,
        specular: clr,
        color: clr
      }))
    }

    return materials
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  destroyParticle (particle) {

    this.viewer.impl.scene.remove(
      particle.mesh)

    particle.mesh = null
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

    this.updateChunk ()

    // invalidate (needsClear, needsRender, overlayDirty)
    this.viewer.impl.invalidate(true, false, false)

    this.emit('fps.tick')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateChunk () {

    this.particleSystem.initParticleLoop()

    let particle

    let tick = () => {

      var start = new Date().getTime()

      while (true) {

        particle = this.particleSystem.nextParticle()

        if (!particle.ptr) {

          break

        } else if ((new Date().getTime() - start) > 50) {

          // Yield execution to rendering logic
          setTimeout(tick, 25)

          break

        } else {

          this.updateParticle(particle)
        }
      }
    }

    setTimeout(tick, 25)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateParticleShadersOff (particle) {

    if (!particle.mesh) {

      var type = this.randomInt(0, this.nbParticleTypes)

      particle.mesh = this.createMesh(
        particle.getRadius(),
        this.particleMaterials[type])

        this.viewer.impl.scene.add(particle.mesh)
    }

    particle.mesh.visible = !particle.getRecycled()

    if (this.filterParticle(particle)) {

      particle.setLifeTime(-1)

    } else if (particle.mesh.visible) {

      var pos = particle.getPosition()

      particle.mesh.position.x = pos.getX()
      particle.mesh.position.y = pos.getY()
      particle.mesh.position.z = pos.getZ()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateParticleShadersOn (particle) {

    if (!particle.mesh) {

      particle.shader = {
        uniforms: {
          offset: {
            type: 'v3',
            value: new THREE.Vector3(0,0,0)
          },
          color: {
            type: 'v4',
            value: new THREE.Vector4(
              Math.random(),
              Math.random(),
              Math.random(), 1)
          }
        },
        vertexShader,
        fragmentShader
      }

      var shaderMaterial = new THREE.ShaderMaterial(
        particle.shader)

      particle.mesh = this.createMesh(
        particle.getRadius(),
        shaderMaterial)

      this.viewer.impl.scene.add(particle.mesh)
    }

    particle.mesh.visible = !particle.getRecycled()

    if (this.filterParticle(particle)) {

      particle.setLifeTime(-1)

    } else if (particle.mesh.visible) {

      var pos = particle.getPosition()

      var offset = particle.shader.uniforms.offset.value

      offset.x = pos.getX()
      offset.y = pos.getY()
      offset.z = pos.getZ()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  activateShaders (activate) {

    this.updateParticle = (activate ?
      this.updateParticleShadersOn :
      this.updateParticleShadersOff)

    this.clearParticles()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createMaterial (props) {

    var material = new THREE.MeshPhongMaterial(props)

    this.viewer.impl.matman().addMaterial(
      props.name,
      material,
      true)

    return material
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createMesh (size, material) {

    var geometry = new THREE.SphereGeometry(
      size, 4, 4)

    var mesh = new THREE.Mesh(
      geometry,
      material)

    return mesh
  }

  /////////////////////////////////////////////////////////////////
  // Random int in [min, max[
  //
  /////////////////////////////////////////////////////////////////
  randomInt(min, max) {

    return Math.floor(Math.random() * (max - min)) + min
  }
}

