
export default class Vector {

  constructor (x = 0, y = 0, z = 0) {
    this._x = x
    this._y = y
    this._z = z
  }

  getX () { return this._x }
  getY () { return this._y }
  getZ () { return this._z }

  magnitude () {

    return Math.sqrt(
      this._x * this._x +
      this._y * this._y +
      this._z * this._z)
  }

  asUnitVector () {

    var m = this.magnitude()

    return new Vector(
      this._x / m,
      this._y / m,
      this._z / m)
  }

  scaled (scaleFactor) {

    var m = this.magnitude()

    return new Vector(
      this._x * scaleFactor / m,
      this._y * scaleFactor / m,
      this._z * scaleFactor / m)
  }

  multiply (scaleFactor) {

    this._x *= scaleFactor
    this._y *= scaleFactor
    this._z *= scaleFactor

    return this
  }

  add (vector) {

    this._x += vector._x
    this._y += vector._y
    this._z += vector._z

    return this
  }

  vectorTo (vector) {

    return new Vector(
      vector._x - this._x,
      vector._y - this._y,
      vector._z - this._z
    )
  }

  withinSphere (center, radius) {

    var magnitudeSqr =
      (this._x - center._x) * (this._x - center._x) +
      (this._y - center._y) * (this._y - center._y) +
      (this._z - center._z) * (this._z - center._z)

    return magnitudeSqr < radius * radius
  }

  withinBox (center, size) {

    //TODO

    return true
  }

  copy () {

    return new Vector(this._x, this._y, this._z)
  }

  static fromArray (data) {

    return new Vector(data[0], data[1], data[2])
  }
}
