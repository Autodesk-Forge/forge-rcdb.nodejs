/// //////////////////////////////////////////////////////
// Viewing.Extension.Physics.Core
// by Philippe Leefsma, July 2017
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'
import find from 'lodash/find'
import Stopwatch from 'Stopwatch'

class PhysicsCoreExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options = {}) {
    super(viewer, options)

    this.softBodyHelpers = new Ammo.btSoftBodyHelpers()

    this.update = this.update.bind(this)

    this.timeSkew = options.timeSkew || 1.0

    this.gravity = options.gravity || -9.8

    this.stopwatch = new Stopwatch()

    this.world = this.createWorld(
      this.gravity)
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.Physics.Core'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    console.log('Viewing.Extension.Physics.Core loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.Physics.Core unloaded')

    this.runAnimation(false)

    super.unload()

    this.off()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async loadPhysicModel (model) {
    const componentStates =
      await this.getComponentStates(model)

    this.rigidBodies = componentStates.map(
      (componentState) => {
        const body = this.createComponentRigidBody(
          componentState)

        this.setRigidBodyState(body, componentState)

        return body
      })

    this.rigidBodies.forEach((rigidBody) => {
      this.world.addRigidBody(rigidBody)
    })

    this.softBodies = []
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  addRigidBody (rigidBody) {
    this.world.addRigidBody(rigidBody)

    this.rigidBodies.push(rigidBody)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getRigidBody (dbId) {
    return find(this.rigidBodies, (body) => {
      return dbId === body.initialState.dbId
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  addSoftBody (softBody) {
    this.world.addSoftBody(softBody, 1, -1)

    this.softBodies.push(softBody)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createWorld (g) {
    const collisionConfiguration =
      new Ammo.btSoftBodyRigidBodyCollisionConfiguration()

    const dispatcher =
      new Ammo.btCollisionDispatcher(
        collisionConfiguration)

    const broadphase = new Ammo.btDbvtBroadphase()

    const solver =
      new Ammo.btSequentialImpulseConstraintSolver()

    const softBodySolver =
      new Ammo.btDefaultSoftBodySolver()

    const world = new Ammo.btSoftRigidDynamicsWorld(
      dispatcher, broadphase, solver,
      collisionConfiguration,
      softBodySolver)

    const gravity = new Ammo.btVector3(0, 0, g)

    world.setGravity(gravity)

    return world
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setGravity (gravity) {
    this.gravity = gravity

    this.world.setGravity(
      new Ammo.btVector3(
        0, 0, this.gravity))
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setTimeSkew (timeSkew) {
    this.timeSkew = timeSkew
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createCollisionShape (dbId, transform) {
    const vertices = this.getComponentVertices(dbId)

    const { position, quaternion, scale } = transform

    const hull = new Ammo.btConvexHullShape()

    vertices.forEach((vertex) => {
      hull.addPoint(
        new Ammo.btVector3(
          vertex.x * scale.x,
          vertex.y * scale.y,
          vertex.z * scale.z))
    })

    return hull
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getFragmentTransform (fragId) {
    const renderProxy = this.viewer.impl.getRenderProxy(
      this.viewer.model, fragId)

    const quaternion = new THREE.Quaternion()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()

    renderProxy.matrixWorld.decompose(
      position,
      quaternion,
      scale)

    return {
      quaternion,
      position,
      scale
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
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

      const stride = geometry.vb ? geometry.vbstride : 3

      const positions = geometry.vb
        ? geometry.vb
        : attributes.position.array

      const indices = attributes.index.array || geometry.ib

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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async getComponentStates (model) {
    const parseArray = (str, separator = ';') => {
      return str.split(separator).map((element) => {
        return parseFloat(element)
      })
    }

    const dbIds = await Toolkit.getLeafNodes(model)

    const tasks = dbIds.map(async (dbId) => {
      const vLinear = await Toolkit.getProperty(
        model, dbId, 'vInit', '0;0;0')

      const mass = await Toolkit.getProperty(
        model, dbId, 'LMVMass', 1.0)

      const fragIds = Toolkit.getLeafFragIds(
        this.viewer.model, dbId)

      const transform =
        this.getFragmentTransform(fragIds[0])

      return {
        vLinear: parseArray(vLinear.displayValue),
        mass: mass.displayValue,
        vAngular: [0, 0, 0],
        transform,
        fragIds,
        dbId
      }
    })

    return await Promise.all(tasks)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createComponentRigidBody (state) {
    const inertia = new Ammo.btVector3(0, 0, 0)

    const shape = this.createCollisionShape(
      state.dbId, state.transform)

    shape.calculateLocalInertia(
      state.mass, inertia)

    const transform = new Ammo.btTransform()

    transform.setIdentity()

    const motionState =
      new Ammo.btDefaultMotionState(
        transform)

    const rbInfo =
      new Ammo.btRigidBodyConstructionInfo(
        state.mass,
        motionState,
        shape,
        inertia)

    const fragProxies = state.fragIds.map((fragId) => {
      const fragProxy =
        this.viewer.impl.getFragmentProxy(
          this.viewer.model, fragId)

      fragProxy.getAnimTransform()

      return fragProxy
    })

    const body = new Ammo.btRigidBody(rbInfo)

    body.grounded = (state.mass === 0.0)

    body.fragProxies = fragProxies

    body.initialState = state

    body.dbId = state.dbId

    body.type = 'COMPONENT'

    return body
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setRigidBodyState (body, state) {
    const transform = new Ammo.btTransform()

    transform.setIdentity()

    transform.setOrigin(
      new Ammo.btVector3(
        state.transform.position.x,
        state.transform.position.y,
        state.transform.position.z))

    transform.setRotation(
      new Ammo.btQuaternion(
        state.transform.quaternion.x,
        state.transform.quaternion.y,
        state.transform.quaternion.z,
        state.transform.quaternion.w))

    const motionState =
      new Ammo.btDefaultMotionState(
        transform)

    body.setMotionState(motionState)

    body.setLinearVelocity(
      new Ammo.btVector3(
        state.vLinear[0],
        state.vLinear[1],
        state.vLinear[2]))

    body.setAngularVelocity(
      new Ammo.btVector3(
        state.vAngular[0],
        state.vAngular[1],
        state.vAngular[2]))
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setRigidBodyTransform (body, state) {
    const transform = new Ammo.btTransform()

    transform.setIdentity()

    transform.setOrigin(
      new Ammo.btVector3(
        state.position.x,
        state.position.y,
        state.position.z))

    transform.setRotation(
      new Ammo.btQuaternion(
        state.quaternion.x,
        state.quaternion.y,
        state.quaternion.z,
        state.quaternion.w))

    const motionState =
      new Ammo.btDefaultMotionState(
        transform)

    body.setMotionState(motionState)

    body.setActivationState(4)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  groundRigidBody (body, grounded) {
    const inertia = new Ammo.btVector3(0, 0, 0)

    if (grounded) {
      body.setMassProps(0.0, inertia)

      body.grounded = true
    } else {
      const mass = body.initialState.mass

      body.setMassProps(mass, inertia)

      body.grounded = (mass === 0)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getRigidBodyVelocity (body) {
    const vAngular = body.getAngularVelocity()

    const vLinear = body.getLinearVelocity()

    return {
      angular: {
        x: vAngular.x(),
        y: vAngular.y(),
        z: vAngular.z()
      },
      linear: {
        x: vLinear.x(),
        y: vLinear.y(),
        z: vLinear.z()
      }
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setRigidBodyVelocity (body, velocity) {
    body.setAngularVelocity(
      new Ammo.btVector3(
        velocity.angular.x,
        velocity.angular.y,
        velocity.angular.z))

    body.setLinearVelocity(
      new Ammo.btVector3(
        velocity.linear.x,
        velocity.linear.y,
        velocity.linear.z))

    body.setActivationState(4)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  updateComponentTransform (body) {
    const transform = body.getCenterOfMassTransform()

    const rotation = transform.getRotation()

    const origin = transform.getOrigin()

    const position = new THREE.Vector3(
      origin.x(),
      origin.y(),
      origin.z())

    const offset = new THREE.Vector3(
      body.initialState.transform.position.x,
      body.initialState.transform.position.y,
      body.initialState.transform.position.z)

    body.fragProxies.forEach((fragProxy) => {
      fragProxy.quaternion =
        new THREE.Quaternion(
          rotation.x(),
          rotation.y(),
          rotation.z(),
          rotation.w())

      offset.applyQuaternion(fragProxy.quaternion)

      fragProxy.position.x = position.x - offset.x
      fragProxy.position.y = position.y - offset.y
      fragProxy.position.z = position.z - offset.z

      fragProxy.updateAnimTransform()
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  updateMeshTransform (body) {
    const transform = body.getCenterOfMassTransform()

    const rotation = transform.getRotation()

    const origin = transform.getOrigin()

    const mesh = body.mesh

    mesh.position.set(
      origin.x(),
      origin.y(),
      origin.z())

    mesh.quaternion.set(
      rotation.x(),
      rotation.y(),
      rotation.z(),
      rotation.w())
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  runAnimation (run) {
    window.cancelAnimationFrame(this.animId)

    this.running = run

    if (run) {
      this.update()
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  update () {
    if (this.running) {
      const dt = this.stopwatch.getElapsedMs()

      const skew = this.timeSkew * 500

      this.world.stepSimulation(
        dt * Math.sqrt(skew),
        Math.sqrt(skew))

      this.rigidBodies.forEach((body) => {
        if (!body.grounded) {
          switch (body.type) {
            case 'COMPONENT':
              this.updateComponentTransform(body)
              break

            case 'MESH':
              this.updateMeshTransform(body)
              break
          }
        }
      })

      this.softBodies.forEach((body) => {

      })

      this.viewer.impl.sceneUpdated(true)

      this.animId =
        window.requestAnimationFrame(
          this.update)

      this.emit('simulation.step')
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  reset () {
    this.rigidBodies.forEach((body) => {
      if (!body.grounded) {
        this.setRigidBodyState(
          body, body.initialState)

        if (!this.running) {
          this.updateComponentTransform(body)
        }

        body.setActivationState(4)
      }
    })

    this.viewer.impl.sceneUpdated(true)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  activateAllRigidBodies () {
    this.rigidBodies.forEach((body) => {
      body.setActivationState(4)
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createSoftBody (state) {

    // const btVector3	h=s*0.5;
    // const btVector3	c []={	p+h*btVector3(-1,-1,-1),
    //  p+h*btVector3(+1,-1,-1),
    //  p+h*btVector3(-1,+1,-1),
    //  p+h*btVector3(+1,+1,-1),
    //  p+h*btVector3(-1,-1,+1),
    //  p+h*btVector3(+1,-1,+1),
    //  p+h*btVector3(-1,+1,+1),
    //  p+h*btVector3(+1,+1,+1)};

    // const btSoftBody = Ammo.btSoftBodyHelpers.CreateFromConvexHull(pdemo->m_softBodyWorldInfo,c,8)

    // psb->generateBendingConstraints(2);
    // pdemo->getSoftDynamicsWorld()->addSoftBody(psb);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  PhysicsCoreExtension.ExtensionId,
  PhysicsCoreExtension)

export default PhysicsCoreExtension.ExtensionId
