import ParticleEmitter from './ParticleEmitter'
import MagneticField from './MagneticField'
import EventsEmitter from './EventsEmitter'
import Particle from './Particle'
import Vector from './Vector'

export default class ParticleSystem extends EventsEmitter {
  /// ////////////////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////////////////
  constructor (maxParticles) {
    super()

    this._maxParticles = maxParticles
    this._dof = new Vector(1, 1, 1)
    this._emittedParticles = 0
    this._particleIdx = 0
    this._recycleBin = []
    this._particles = []
    this._emitters = []
    this._fields = []
  }

  /// ////////////////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////////////////
  setMaxParticles (maxParticles) {
    this._maxParticles = maxParticles
  }

  getMaxParticles () {
    return this._maxParticles
  }

  /// ////////////////////////////////////////////////////////////////
  // Returns object by id
  //
  /// ////////////////////////////////////////////////////////////////
  getObjectById (id) {
    for (var emitter of this._emitters) {
      if (emitter.getId() === id) {
        return emitter
      }
    }

    for (var field of this._fields) {
      if (field.getId() === id) {
        return field
      }
    }

    return null
  }

  /// ////////////////////////////////////////////////////////////////
  // Returns emitter by id
  //
  /// ////////////////////////////////////////////////////////////////
  getEmitter (id) {
    for (var emitter of this._emitters) {
      if (emitter.getId() === id) {
        return emitter
      }
    }

    return null
  }

  /// ////////////////////////////////////////////////////////////////
  // Returns magnetic field by id
  //
  /// ////////////////////////////////////////////////////////////////
  getMagneticField (id) {
    for (var field of this._fields) {
      if (field.getId() === id) {
        return field
      }
    }

    return null
  }

  /// ////////////////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////////////////
  setDof (x, y, z) {
    this._dof = new Vector(x, y, z)
  }

  /// ////////////////////////////////////////////////////////////////
  // clean up all objects
  //
  /// ////////////////////////////////////////////////////////////////
  destroy () {
    this._recycleBin = []

    this._particles = []
  }

  /// ////////////////////////////////////////////////////////////////
  // Adds emitter object
  //
  /// ////////////////////////////////////////////////////////////////
  addEmitter (id) {
    var emitter = new ParticleEmitter(id)

    this._emitters.push(emitter)

    return emitter
  }

  /// ////////////////////////////////////////////////////////////////
  // Adds magnetic field object
  //
  /// ////////////////////////////////////////////////////////////////
  addMagneticField (id) {
    var field = new MagneticField(id)

    this._fields.push(field)

    return field
  }

  /// ////////////////////////////////////////////////////////////////
  // updates simulation
  //
  /// ////////////////////////////////////////////////////////////////
  step (dt) {
    this.addNewParticles(dt)
    this.filterParticles(dt)
  }

  /// ////////////////////////////////////////////////////////////////
  // add new particles step
  //
  /// ////////////////////////////////////////////////////////////////
  addNewParticles (dt) {
    this._emitters.forEach((emitter) => {
      for (var i = 0; i < emitter.emitNumber(dt); ++i) {
        var particle = this.popRecycle()

        if (particle) {
          emitter.emitParticle(particle)
        }
      }
    })
  }

  /// ////////////////////////////////////////////////////////////////
  // push a particle to recycle bin
  //
  /// ////////////////////////////////////////////////////////////////
  pushRecycle (particle) {
    --this._emittedParticles

    particle._recycled = true

    this._recycleBin.push(particle)
  }

  /// ////////////////////////////////////////////////////////////////
  // pop a particle from recycle bin
  //
  /// ////////////////////////////////////////////////////////////////
  popRecycle () {
    if (this._emittedParticles > this._maxParticles - 1) {
      return null
    }

    ++this._emittedParticles

    var particle = this._recycleBin.pop()

    if (particle) {
      particle.reset()

      return particle
    }

    particle = new Particle(this._dof)

    this._particles.push(particle)

    return particle
  }

  /// ////////////////////////////////////////////////////////////////
  // filter particles using lifeTime
  //
  /// ////////////////////////////////////////////////////////////////
  filterParticle (particle) {
    if (particle._recycled) {
      return true
    }

    if (particle._lifeTime < 0) {
      this.pushRecycle(particle)

      return true
    }

    return false
  }

  /// ////////////////////////////////////////////////////////////////
  // filter particles step
  //
  /// ////////////////////////////////////////////////////////////////
  filterParticles (dt) {
    this._particles.forEach((particle) => {
      if (!this.filterParticle(particle)) {
        particle.submitToFields(this._fields)

        particle.step(dt)
      }
    })
  }

  /// ////////////////////////////////////////////////////////////////
  // initialize particle index
  //
  /// ////////////////////////////////////////////////////////////////
  initParticleLoop () {
    this._particleIdx = 0
  }

  /// ////////////////////////////////////////////////////////////////
  // initialize particule index
  //
  /// ////////////////////////////////////////////////////////////////
  nextParticle () {
    if (this._particleIdx < this._particles.length) {
      return this._particles[this._particleIdx++]
    }

    return { ptr: 0 } // compatibility with asm.js/wasm
  }
}
