/////////////////////////////////////////////////////////
// Viewing.Extension.Physics.Core
// by Philippe Leefsma, July 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'
import Stopwatch from 'Stopwatch'

class PhysicsCoreExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.runAnimation = this.runAnimation.bind(this)

    this.stopwatch = new Stopwatch()

    this.world = this.createWorld()
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Physics.Core'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    console.log('Viewing.Extension.Physics.Core loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Physics.Core unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadPhysicModel (model) {

    const dbIds = await Toolkit.getLeafNodes(model)

    const parseArray = (str, factor, separator = ';') => {

      return str.split(separator).map((element) => {

        return parseFloat(element) * factor
      })
    }

    const tasks = dbIds.map(async(dbId, idx) => {

      const vLinear = await Toolkit.getProperty (
        model, dbId, 'vInit', '0;0;0')

      const mass = (idx < dbIds.length - 1) ? 1.0 : 0

      return this.createRigidBody(dbId, {
        vLinear: parseArray(vLinear.displayValue, 3),
        vAngular: [0,0,0],
        mass
      })
    })

    this.rigidBodies = await Promise.all(tasks)

    this.rigidBodies.forEach((rigidBody) => {

      this.world.addRigidBody(rigidBody)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createWorld () {

    const collisionConfiguration =
      new Ammo.btDefaultCollisionConfiguration

    const world = new Ammo.btDiscreteDynamicsWorld(
      new Ammo.btCollisionDispatcher(collisionConfiguration),
      new Ammo.btDbvtBroadphase,
      new Ammo.btSequentialImpulseConstraintSolver,
      collisionConfiguration)

    world.setGravity(new Ammo.btVector3(0, 0, -9.8))

    return world
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createCollisionShape(dbId, scale) {

    const hull = new Ammo.btConvexHullShape()

    const vertices = this.getComponentVertices(dbId)

    vertices.forEach((vertex) => {
      hull.addPoint(
        new Ammo.btVector3(
          vertex.x * scale.x,
          vertex.y * scale.y,
          vertex.z * scale.z))
    })

    return hull
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentTransform (dbId) {

    const fragIds = Toolkit.getLeafFragIds(
      this.viewer.model, dbId)

    const renderProxy = this.viewer.impl.getRenderProxy(
      this.viewer.model, fragIds[0])

    const quaternion = new THREE.Quaternion()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()

    const matrix = renderProxy.matrixWorld

    matrix.decompose(
      position,
      quaternion,
      scale)

    return {
      quaternion,
      position,
      scale
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentVertices (dbId) {

    const vertexArray = []

    const fragIds = Toolkit.getLeafFragIds(
      this.viewer.model, dbId)

    fragIds.forEach((fragId) => {

      const renderProxy =
        this.viewer.impl.getRenderProxy(
          this.viewer.model, fragId)

      const geometry = renderProxy.geometry

      const attributes = geometry.attributes

      const positions = geometry.vb
        ? geometry.vb
        : attributes.position.array

      const indices = attributes.index.array || geometry.ib

      const stride = geometry.vb ? geometry.vbstride : 3

      const offsets = [{
        count: indices.length,
        index: 0,
        start: 0
      }]

      for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {

        var start = offsets[oi].start
        var count = offsets[oi].count
        var index = offsets[oi].index

        for (var i = start, il = start + count; i < il; i += 3) {

          const a = index + indices[i]
          const b = index + indices[i + 1]
          const c = index + indices[i + 2]

          const vA = new THREE.Vector3()
          const vB = new THREE.Vector3()
          const vC = new THREE.Vector3()

          vA.fromArray(positions, a * stride)
          vB.fromArray(positions, b * stride)
          vC.fromArray(positions, c * stride)

          vertexArray.push(vA)
          vertexArray.push(vB)
          vertexArray.push(vC)
        }
      }
    })

    return vertexArray
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createRigidBody (dbId, props) {

    const compTransform = this.getComponentTransform(dbId)

    const {position, quaternion, scale } = compTransform

    const localInertia = new Ammo.btVector3(0, 0, 0)

    const shape = this.createCollisionShape(
      dbId, compTransform.scale)

    shape.calculateLocalInertia(
      props.mass, localInertia)

    const transform = new Ammo.btTransform

    transform.setIdentity()

    transform.setOrigin(
      new Ammo.btVector3(
        position.x,
        position.y,
        position.z))

    transform.setRotation(
      new Ammo.btQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w))

    const motionState =
      new Ammo.btDefaultMotionState(
        transform)

    const rbInfo =
      new Ammo.btRigidBodyConstructionInfo(
        props.mass,
        motionState,
        shape,
        localInertia)

    const body = new Ammo.btRigidBody(rbInfo)

    body.setLinearVelocity(
      new Ammo.btVector3(
        props.vLinear[0],
        props.vLinear[1],
        props.vLinear[2]))

    body.setAngularVelocity(
      new Ammo.btVector3(
        props.vAngular[0],
        props.vAngular[1],
        props.vAngular[2]))

    body.offset = compTransform.position

    body.dbId = dbId

    return body
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateComponentTransform (dbId, rigidBody) {

    const transform = rigidBody.getCenterOfMassTransform()

    const rotation = transform.getRotation()

    const position = transform.getOrigin()

    const offset = rigidBody.offset

    const fragIds = Toolkit.getLeafFragIds(
      this.viewer.model, dbId)

    //const quaternion = new THREE.Quaternion(
    //  rotation.x(),
    //  rotation.y(),
    //  rotation.z(),
    //  rotation.w())

    //quaternion.normalize()

    //const center = this.getComponentPosition(fragIds)

    //this.rotateComponent(fragIds, quaternion, center)

    const fragList = this.viewer.model.getFragmentList()

    fragIds.forEach((fragId) => {

      const translation = new THREE.Vector3(
        position.x() - offset.x,
        position.y() - offset.y,
        position.z() - offset.z)

      const rotationQ = new THREE.Quaternion(
        rotation.x(),
        rotation.y(),
        rotation.z(),
        rotation.w())

      const scale = new THREE.Vector3(1,1,1)

      fragList.updateAnimTransform(
        fragId, scale, rotationQ, translation)

      //FragmentList.prototype.getAnimTransform = function (fragId, scale, rotationQ, translation)

      //const fragProxy =
      //  this.viewer.impl.getFragmentProxy(
      //    this.viewer.model, fragId)
      //
      //fragProxy.getAnimTransform()

      //fragProxy.position.x = position.x() - offset.x
      //fragProxy.position.y = position.y() - offset.y
      //fragProxy.position.z = position.z() - offset.z

      //fragProxy.position.x += (position.x() - center.x)
      //fragProxy.position.y += (position.y() - center.y)
      //fragProxy.position.z += (position.z() - center.z)
      //
      //fragProxy.updateAnimTransform()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  geWorldBoundingBox (fragIds, fragList) {

    const fragbBox = new THREE.Box3()
    const nodebBox = new THREE.Box3()

    fragIds.forEach((fragId) => {

      fragList.getWorldBounds(fragId, fragbBox)
      nodebBox.union(fragbBox)
    })

    return nodebBox
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getOffsetQuaternion(q, qNext) {

    const euler = new THREE.Euler()

    euler.setFromQuaternion(q)

    const eulerNext = new THREE.Euler()

    eulerNext.setFromQuaternion(qNext)

    const eulerOffset = new THREE.Euler(
      (eulerNext.x - euler.x)%(2 * Math.PI),
      (eulerNext.y - euler.y)%(2 * Math.PI),
      (eulerNext.z - euler.z)%(2 * Math.PI))

    const qOffset = new THREE.Quaternion()

    qOffset.setFromEuler(eulerOffset)

    return qOffset
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentPosition (fragIds) {

    const bBox = this.geWorldBoundingBox(
      fragIds, this.viewer.model.getFragmentList())

    const center = new THREE.Vector3(
      (bBox.min.x + bBox.max.x) / 2,
      (bBox.min.y + bBox.max.y) / 2,
      (bBox.min.z + bBox.max.z) / 2)

    return center
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  rotateComponent (fragIds, quaternion, center) {

    fragIds.forEach((fragId) => {

      const fragProxy =
        this.viewer.impl.getFragmentProxy(
          this.viewer.model, fragId)

      fragProxy.getAnimTransform()

      const qOoffset = this.getOffsetQuaternion(
        fragProxy.quaternion,
        quaternion)

      const position = new THREE.Vector3(
        fragProxy.position.x - center.x,
        fragProxy.position.y - center.y,
        fragProxy.position.z - center.z)

      position.applyQuaternion(qOoffset)

      position.add(center)

      fragProxy.position = position

      fragProxy.quaternion.multiplyQuaternions(
        qOoffset, fragProxy.quaternion)

      fragProxy.updateAnimTransform()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  toggeAnimation () {

    this.running = !this.running

    if (this.running) {

      this.runAnimation ()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  runAnimation () {

    if (this.running) {

      const dt = this.stopwatch.getElapsedMs()

      this.world.stepSimulation(dt * 0.001, 10)

      this.rigidBodies.forEach((rigidBody) => {

        this.updateComponentTransform(
          rigidBody.dbId,
          rigidBody)
      })

      this.viewer.impl.sceneUpdated(true)

      this.animId = window.requestAnimationFrame(
        this.runAnimation)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async test () {

    const dbIds = await Toolkit.getLeafNodes(this.viewer.model)

    const q = new THREE.Quaternion()

    q.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      10 * Math.PI / 180)

    this.rotateComponent(dbIds[0], q)

    this.viewer.impl.sceneUpdated(true)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  PhysicsCoreExtension.ExtensionId,
  PhysicsCoreExtension)

export default PhysicsCoreExtension.ExtensionId




