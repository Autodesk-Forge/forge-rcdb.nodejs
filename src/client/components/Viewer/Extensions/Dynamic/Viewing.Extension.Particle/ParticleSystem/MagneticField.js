
import Field from './Field'

export default class MagneticField extends Field {
  constructor (id) {
    super(id, 1)

    this._force = 0
  }

  applyForce (particle) {
    const particlePos = particle._position

    const fieldPos = this._position

    const dX = fieldPos._x - particlePos._x
    const dY = fieldPos._y - particlePos._y
    const dZ = fieldPos._z - particlePos._z

    const force = particle._charge * this._force / Math.pow((
      dX * dX +
      dY * dY +
      dZ * dZ), 1.5)

    if (Math.abs(force) > 0.001) {
      const particleAcc = particle._acceleration

      particleAcc._x += dX * force
      particleAcc._y += dY * force
      particleAcc._z += dZ * force
    }
  }

  setForce (force) {
    this._force = force
  }

  getForce () {
    return this._force
  }
}
