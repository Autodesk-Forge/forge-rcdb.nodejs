import BaseObject from './BaseObject'
import Vector from './Vector'

export default class ParticleEmitter extends BaseObject {
  constructor (id) {
    super(id, 0)

    this._spread = 2 * Math.PI / 180
    this._emissionRate = 500
    this._velocity = 10
    this._charge = 1
  }

  emitNumber (dt) {
    return Math.floor(this._emissionRate * dt)
  }

  emitParticle (particle) {
    var angle1 = this._spread * (2 * Math.random() - 1)
    var angle2 = this._spread * (2 * Math.random() - 1)

    particle._velocity._x = this._velocity *
      Math.cos(angle1) * Math.cos(angle2)

    particle._velocity._y = this._velocity *
      Math.sin(angle1) * Math.cos(angle2)

    particle._velocity._z = this._velocity *
      Math.sin(angle2)

    particle._position._x = this._position._x
    particle._position._y = this._position._y
    particle._position._z = this._position._z

    particle._charge = this._charge
  }

  setEmissionRate (emissionRate) {
    this._emissionRate = emissionRate
  }

  getEmissionRate () {
    return this._emissionRate
  }

  setVelocity (velocity) {
    this._velocity = velocity
  }

  getVelocity () {
    return this._velocity
  }

  setSpread (spread) {
    this._spread = spread
  }

  getSpread () {
    return this._spread
  }

  setCharge (charge) {
    this._charge = charge
  }

  getCharge () {
    return this._charge
  }
}
