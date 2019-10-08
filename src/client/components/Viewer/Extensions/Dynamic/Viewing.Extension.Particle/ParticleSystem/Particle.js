import Vector from './Vector'

export default class Particle {
  constructor (dof) {
    this._velocity = new Vector()
    this._position = new Vector()
    this._acceleration = new Vector()
    this._recycled = false
    this._radius = 0.03
    this._dof = dof
    this._lifeTime = 30
    this._charge = 1
    this.ptr = 1 // compat with wasm
  }

  reset () {
    this._recycled = false
    this._lifeTime = 30
  }

  submitToFields (fields) {
    this._acceleration._x = 0
    this._acceleration._y = 0
    this._acceleration._z = 0

    fields.forEach((field) => {
      field.applyForce(this)
    })
  }

  step (dt) {
    this._lifeTime -= dt

    this._velocity._x += this._acceleration._x * dt
    this._velocity._y += this._acceleration._y * dt
    this._velocity._z += this._acceleration._z * dt

    this._position._x += this._velocity._x * this._dof._x * dt
    this._position._y += this._velocity._y * this._dof._y * dt
    this._position._z += this._velocity._z * this._dof._z * dt
  }

  getRecycled () {
    return this._recycled
  }

  getLifeTime () {
    return this._lifeTime
  }

  setLifeTime (lifeTime) {
    this._lifeTime = lifeTime
  }

  getAcceleration () {
    return this._acceleration
  }

  getPosition () {
    return this._position
  }

  getCharge () {
    return this._charge
  }

  getRadius () {
    return this._radius
  }
}
