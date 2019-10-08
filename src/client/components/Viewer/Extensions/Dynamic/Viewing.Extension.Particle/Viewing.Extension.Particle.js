/// //////////////////////////////////////////////////////////////////
// Viewing.Extension.Particle
// by Philippe Leefsma, March 2016
//
/// //////////////////////////////////////////////////////////////////
import ParticleToolPointCloud from './Viewing.Extension.Particle.Tool.PointCloud'
import ParticleToolMesh from './Viewing.Extension.Particle.Tool.Mesh'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import TranslateTool from './Viewing.Tool.Particle.Translate'
import ParticlePanel from './Viewing.Extension.Particle.Panel'
import ExtensionBase from 'Viewer.ExtensionBase'
import ParticleSystem from './ParticleSystem'
import Toolkit from 'Viewer.Toolkit'
import FPS from './utils/FPSMeter'
import dat from 'dat.gui'

class ParticleExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.options = options

    this.viewer = viewer

    this.particlePanel = null

    this.transformTool = new TranslateTool(
      this.viewer)

    this.objectMaterials =
      this.createObjectMaterials()

    this.maxParticles = this.options.maxParticles || 0

    this.particleSystem = new ParticleSystem.Instance(
      this.maxParticles)

    this.particleToolPointCloud = new ParticleToolPointCloud(
      this.viewer, this.particleSystem, options)

    this.particleToolMesh = new ParticleToolMesh(
      this.viewer, this.particleSystem, options)

    this.activeParticleTool = this.particleToolMesh

    this.tool = 'Point Cloud'
  }

  /// //////////////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.Particle'
  }

  /// //////////////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////////////
  load () {
    console.log('Viewing.Extension.Particle loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelRootLoaded () {
    this.options.loader.show(false)
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onGeometryLoaded () {
    this.loadScene().then(() => {
      this.viewer.setProgressiveRendering(false)

      $(this.viewer.container).append(
        '<div id="particle-toolbar"> </div>')

      $('#particle-toolbar').css({
        position: 'absolute',
        left: '10px',
        top: '90px'
      })

      var fps = new FPSMeter(
        document.getElementById('particle-toolbar'), {
          maxFps: 20, // expected
          smoothing: 10,
          show: 'fps',
          decimals: 1,
          left: '0px',
          top: '-80px',
          theme: 'transparent',
          heat: 1,
          graph: 1,
          toggleOn: null,
          history: 32
        })

      this.onTxChange =
        this.onTxChange.bind(this)

      this.transformTool.on('transform.TxChange',
        this.onTxChange)

      this.transformTool.on('transform.select',
        (event) => {
          return this.onSelect(event)
        })

      this.particleToolMesh.on('fps.tick', () => {
        fps.tick()
      })

      this.particleToolPointCloud.on('fps.tick', () => {
        fps.tick()
      })

      this.transformTool.activate()

      this.activeParticleTool = this.particleToolPointCloud

      if (this.options.autoStart) {
        this.particleToolPointCloud.activate()
      }

      this.loadPanel()
    })
  }

  /// //////////////////////////////////////////////////////////////
  // load control panel
  //
  /// //////////////////////////////////////////////////////////////
  loadPanel () {
    this.particlePanel = new ParticlePanel(
      this, this.viewer, null)

    this.particlePanel.on('objectModified', (event) => {
      this.onObjectModified(event)
    })

    this.particlePanel.on('maxParticles.changed', (value) => {
      this.particleToolPointCloud.setMaxParticles(value)

      this.particleToolMesh.setMaxParticles(value)

      this.particleSystem.setMaxParticles(value)

      if (value > 0) {
        if (!this.activeParticleTool.active) {
          this.activeParticleTool.activate()
        } else {
          this.activeParticleTool.clearParticles()
        }
      } else {
        this.activeParticleTool.deactivate()
      }
    })

    this.particlePanel.on('tool.changed', (value) => {
      switch (value) {
        case 'Mesh':
          this.activeParticleTool = this.particleToolMesh
          this.particleToolPointCloud.deactivate()
          this.particleToolMesh.activate()
          break

        case 'Point Cloud':
          this.activeParticleTool = this.particleToolPointCloud
          this.particleToolPointCloud.activate()
          this.particleToolMesh.deactivate()
          break
      }

      this.particlePanel.loadToolGUI(this.activeParticleTool)
    })

    this.particlePanel.on('shaders.changed', (value) => {
      this.particleToolMesh.activateShaders(value === 'ON')
    })

    this.particlePanel.setVisible(true)

    this.particlePanel.loadToolGUI(
      this.activeParticleTool)
  }

  /// //////////////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.Particle unloaded')

    $('#particle-toolbar').remove()

    if (this.particlePanel) {
      this.particlePanel.setVisible(false)
    }

    if (this.viewer.activeParticleTool) {
      this.viewer.activeParticleTool.deactivate()
    }

    this.transformTool.off()

    this.transformTool.deactivate()

    this.particleToolMesh.particleSystem.destroy()
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onTxChange (txChange) {
    txChange.dbIds.forEach((dbId) => {
      this.updateObjectPosition(dbId)
    })
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onSelect (select) {
    if (select.dbIds.length) {
      var obj = this.particleSystem.getObjectById(
        select.dbIds[0])

      if (this.particlePanel) {
        this.particlePanel.setSelected(obj)
      }

      if (obj) {
        return {
          transformable: obj.getTransformable(),
          selectable: obj.getSelectable()
        }
      }

      return { selectable: false }
    } else {
      if (this.particlePanel) {
        this.particlePanel.setSelected(null)
      }
    }
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onObjectModified (event) {
    switch (event.property) {
      case 'charge':
      case 'force':

        // red material < 0
        // blue material >= 0
        var matIdx = event.value < 0 ? 0 : 1

        var material = this.objectMaterials[matIdx]

        Toolkit.setMaterial(
          this.viewer.model,
          event.object.getId(),
          material)

        break
    }
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  createMaterial (props) {
    var material = new THREE.MeshPhongMaterial(props)

    this.viewer.impl.matman().addMaterial(
      props.name,
      material,
      true)

    return material
  }

  /// //////////////////////////////////////////////////////////////
  // Creates object materials
  //
  /// //////////////////////////////////////////////////////////////
  createObjectMaterials () {
    var materials = [

      this.createMaterial({
        shading: THREE.FlatShading,
        name: Toolkit.guid(),
        shininess: 80,
        specular: parseInt('B80000', 16),
        color: parseInt('B80000', 16)
      }),

      this.createMaterial({
        shading: THREE.FlatShading,
        name: Toolkit.guid(),
        shininess: 80,
        specular: parseInt('0000B8', 16),
        color: parseInt('0000B8', 16)
      })
    ]

    return materials
  }

  /// //////////////////////////////////////////////////////////////
  // Update object position
  //
  /// //////////////////////////////////////////////////////////////
  async updateObjectPosition (dbId) {
    var bbox = await Toolkit.getWorldBoundingBox(
      this.viewer.model, dbId)

    var obj = this.particleSystem.getObjectById(dbId)

    obj.setPosition(
      (bbox.min.x + bbox.max.x) / 2,
      (bbox.min.y + bbox.max.y) / 2,
      (bbox.min.z + bbox.max.z) / 2)
  }

  /// //////////////////////////////////////////////////////////////
  // Load Scene settings from properties
  //
  /// //////////////////////////////////////////////////////////////
  loadScene () {
    return new Promise((resolve, reject) => {
      this.viewer.search('particle.scene', async (dbIds) => {
        if (dbIds.length != 1) { return reject('Invalid Particle scene') }

        try {
          var propSettings = await Toolkit.getProperty(
            this.viewer.model, dbIds[0], 'particle.settings')

          var settings = JSON.parse(
            propSettings.displayValue)

          this.particleSystem.setDof(
            settings.dof[0],
            settings.dof[1],
            settings.dof[2])

          this.bounds = []

          for (var i = 1; i <= settings.bounds; ++i) {
            var propBounds = await Toolkit.getProperty(
              this.viewer.model, dbIds[0], 'particle.bound' + i)

            this.bounds.push(this.parseBound(propBounds))
          }

          this.particleToolPointCloud.bounds = this.bounds

          this.particleToolMesh.bounds = this.bounds

          var tasks = [
            this.loadEmitters(),
            this.loadObjects(),
            this.loadFields()
          ]

          return resolve(Promise.all(tasks))
        } catch (ex) {
          return reject(ex)
        }
      })
    })
  }

  /// //////////////////////////////////////////////////////////////
  // Parses scene bounds
  //
  /// //////////////////////////////////////////////////////////////
  parseBound (propBound) {
    var bound = JSON.parse(propBound.displayValue)

    switch (bound.type) {
      case 'box':

        return {

          center: new ParticleSystem.Vector(
            bound.center[0],
            bound.center[1],
            bound.center[2]),

          size: new ParticleSystem.Vector(
            bound.size[0],
            bound.size[1],
            bound.size[2]),

          type: 'box'
        }

      case 'sphere':

        return {

          center: new ParticleSystem.Vector(
            bound.center[0],
            bound.center[1],
            bound.center[2]),

          min: bound.min,
          max: bound.max,
          type: 'sphere'
        }
    }
  }

  /// //////////////////////////////////////////////////////////////
  // Loads scene objects
  //
  /// //////////////////////////////////////////////////////////////
  loadObject (dbId) {
    return new Promise(async (resolve, reject) => {
      try {
        var propSettings = await Toolkit.getProperty(
          this.viewer.model, dbId, 'particle.settings')

        var settings = JSON.parse(
          propSettings.displayValue)

        var color = parseInt(settings.clr, 16)

        var material = this.createMaterial({
          transparent: settings.transparent,
          opacity: settings.opacity,
          shading: THREE.FlatShading,
          name: Toolkit.guid(),
          shininess: 30,
          specular: color,
          color: color
        })

        Toolkit.setMaterial(
          this.viewer.model, dbId, material)

        return resolve()
      } catch (ex) {
        // throwing Invalid DbId
        // return reject(ex)
        return resolve()
      }
    })
  }

  loadObjects () {
    return new Promise((resolve, reject) => {
      this.viewer.search('particle.object', (dbIds) => {
        var tasks = dbIds.map((dbId) => {
          return this.loadObject(dbId)
        })

        return resolve(Promise.all(tasks))
      })
    })
  }

  /// //////////////////////////////////////////////////////////////
  // Load scene emitters
  //
  /// //////////////////////////////////////////////////////////////
  loadEmitter (dbId) {
    return new Promise(async (resolve, reject) => {
      try {
        var bbox = await Toolkit.getWorldBoundingBox(
          this.viewer.model, dbId)

        var emitter = this.particleSystem.addEmitter(dbId)

        var propSettings = await Toolkit.getProperty(
          this.viewer.model, dbId, 'particle.settings')

        var settings = JSON.parse(
          propSettings.displayValue)

        emitter.setTransformable(settings.transfo)
        emitter.setEmissionRate(settings.rate)
        emitter.setSelectable(settings.select)
        emitter.setVelocity(settings.velocity)
        emitter.setCharge(settings.charge)
        emitter.setSpread(settings.spread)

        var offset = new ParticleSystem.Vector(
          settings.dir[0],
          settings.dir[1],
          settings.dir[2])

        var magnitude = offset.magnitude()

        emitter.setOffset(
          offset.getX() * 0.5 / magnitude,
          offset.getY() * 0.5 / magnitude,
          offset.getZ() * 0.5 / magnitude)

        emitter.setPosition(
          (bbox.min.x + bbox.max.x) / 2,
          (bbox.min.y + bbox.max.y) / 2,
          (bbox.min.z + bbox.max.z) / 2)

        var matIdx = emitter.charge < 0 ? 0 : 1

        var material = this.objectMaterials[matIdx]

        Toolkit.setMaterial(
          this.viewer.model,
          dbId, material)

        return resolve()
      } catch (ex) {
        console.log(ex)

        // throwing Invalid DbId
        // return reject(ex)
        return resolve()
      }
    })
  }

  loadEmitters () {
    return new Promise((resolve, reject) => {
      this.viewer.search('particle.emitter', (dbIds) => {
        var tasks = dbIds.map((dbId) => {
          return this.loadEmitter(dbId)
        })

        return resolve(Promise.all(tasks))
      })
    })
  }

  /// //////////////////////////////////////////////////////////////
  // Load scene fields
  //
  /// //////////////////////////////////////////////////////////////
  loadField (dbId) {
    return new Promise(async (resolve, reject) => {
      try {
        var bbox = await Toolkit.getWorldBoundingBox(
          this.viewer.model, dbId)

        var field = this.particleSystem.addMagneticField(dbId)

        var propSettings = await Toolkit.getProperty(
          this.viewer.model, dbId,
          'particle.settings')

        var settings = JSON.parse(
          propSettings.displayValue)

        field.setTransformable(settings.transfo)
        field.setSelectable(settings.select)
        field.setForce(settings.force)

        field.setPosition(
          (bbox.min.x + bbox.max.x) / 2,
          (bbox.min.y + bbox.max.y) / 2,
          (bbox.min.z + bbox.max.z) / 2)

        var matIdx = settings.force < 0 ? 0 : 1

        var material = this.objectMaterials[matIdx]

        Toolkit.setMaterial(
          this.viewer.model,
          dbId, material)

        return resolve()
      } catch (ex) {
        // throwing Invalid DbId
        // return reject(ex)
        return resolve()
      }
    })
  }

  loadFields () {
    return new Promise((resolve, reject) => {
      this.viewer.search('particle.field', (dbIds) => {
        var tasks = dbIds.map((dbId) => {
          return this.loadField(dbId)
        })

        return resolve(Promise.all(tasks))
      })
    })
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ParticleExtension.ExtensionId,
  ParticleExtension)
