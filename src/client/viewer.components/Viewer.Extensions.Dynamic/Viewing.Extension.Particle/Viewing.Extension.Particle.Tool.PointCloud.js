import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'
import Stopwatch from 'Stopwatch'

const vertexShader = `

  // switch on high precision floats
  #ifdef GL_ES
  precision highp float;
  #endif

  varying vec3 vColor;
  uniform vec3 offset;

  void main() {

    vColor = color;

    gl_PointSize = 4.0;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`

const fragmentShader = `

  #ifdef GL_ES
  precision highp float;
  #endif

  varying vec3 vColor;

  void main() {

    gl_FragColor = vec4(vColor, 1);
  }
`

const vertexshader = `
  attribute vec3 ca;
  varying vec3 vColor;
  void main() {
    vColor = ca;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 viewDir = normalize( -mvPosition.xyz );
    gl_PointSize = 4.0;
    vec4 newPos = mvPosition;
    gl_Position = projectionMatrix * newPos;
  }
`

const fragmentshader = `
  uniform vec3 color;
  uniform sampler2D texture;
  varying vec3 vColor;
  void main() {
    vec4 color = vec4(color*vColor, 1.0 ) * texture2D(texture, gl_PointCoord);
    if ( color.w < 0.5 ) discard;
    gl_FragColor = color;
  }
`

//this.sprite = THREE.ImageUtils.loadTexture('/img/disc.png');
//
//let geometry = new THREE.Geometry();
//let colors: any[] = [];
//let nodes = this._dataModel.sensorNodes;
//let sensorInfo = this._dataModel.sensorInfo;
//for (let i = 0; i < nodes.length; i++) {
//  let vertex = new THREE.Vector3();
//  // logger.log('addSensorMarkers', sensorInfo[nodes[i]]);
//  let myInfo: any;
//  if (sensorInfo[nodes[i]].source === 'bim') {
//    // logger.log('addSensorMarkers done', sensorInfo[nodes[i]]);
//    myInfo = sensorInfo[nodes[i]];
//    let box = this.getBounds(Number(myInfo.nodeid));
//    vertex.x = box.center().x;
//    vertex.y = box.center().y;
//    vertex.z = box.center().z;
//    geometry.vertices.push( vertex );
//    let col = new THREE.Color( 0x78c679 );
//    // col.setHSL( Math.random(), 0.75, 0.7);
//    (<any>this.material).attributes.ca.value.push(col);
//  }  else if (sensorInfo[nodes[i]].source === 'dasher') {
//    myInfo = sensorInfo[nodes[i]];
//    if (myInfo.id) {
//      vertex.x = myInfo.location[0];
//      vertex.y = myInfo.location[1];
//      vertex.z = myInfo.location[2];
//      geometry.vertices.push( vertex );
//      let col = new THREE.Color( 0x78c679 );
//      // col.setHSL( Math.random(), 0.75, 0.7);
//      (<any>this.material).attributes.ca.value.push(col);
//    }
//  }
//}

export default class ParticleToolPointCloud extends EventsEmitter {

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

    this.shader = {
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
      //transparent:true,
      uniforms: {},
      fragmentShader,
      vertexShader
    }

    this.options = options

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

    if (this.pointCloud) {

      this.viewer.impl.scene.remove(this.pointCloud)
    }

    const shaderMaterial = new THREE.ShaderMaterial(
      this.shader)

    this.pointCloud = this.createPointCloud(
      maxParticles,
      shaderMaterial)

    this.viewer.impl.scene.add(this.pointCloud)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  clearParticles () {

    if (this.pointCloud) {

      this.viewer.impl.scene.remove(this.pointCloud)
    }

    this.viewer.impl.invalidate(true)
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

    // invalidate (needsClear, needsRender, overlayDirty)
    this.viewer.impl.invalidate(true, false, false)
    //this.viewer.impl.invalidate(false, false, true)

    this.emit('fps.tick')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  updateParticle (particle, index) {

    var positions = this.bufferGeometry.attributes.position.array

    if(particle.getRecycled()) {

      positions[3 * index]     = -5000.0
      positions[3 * index + 1] = -5000.0
      positions[3 * index + 2] = -5000.0

    } else if (this.filterParticle(particle)) {

      particle.setLifeTime(-1)

      positions[3 * index]     = -5000.0
      positions[3 * index + 1] = -5000.0
      positions[3 * index + 2] = -5000.0

    } else {

      const pos = particle.getPosition()

      //console.log(index + ': ' + pos.getX() + ', ' + pos.getX() + ', ' + pos.getX())

      positions[3 * index]     = pos.getX()
      positions[3 * index + 1] = pos.getY()
      positions[3 * index + 2] = pos.getZ()
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createPointCloud (maxPoints, material) {

    this.bufferGeometry = new THREE.BufferGeometry()

    this.bufferGeometry.dynamic = true

    this.bufferGeometry.addAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array(maxPoints * 3), 3))

    this.bufferGeometry.addAttribute(
      'color',
      new THREE.BufferAttribute(
        new Float32Array(maxPoints * 3), 3))

    var colors = this.bufferGeometry.attributes.color.array

    for(let i = 0; i < maxPoints; ++i) {

      colors[3 * i] = Math.random()
      colors[3 * i + 1] = Math.random()
      colors[3 * i + 2] = Math.random()
    }

    return new THREE.PointCloud(
      this.bufferGeometry,
      material)
  }

  /////////////////////////////////////////////////////////////////
  // Random int in [min, max[
  //
  /////////////////////////////////////////////////////////////////
  randomInt(min, max) {

    return Math.floor(Math.random() * (max - min)) + min
  }
}
