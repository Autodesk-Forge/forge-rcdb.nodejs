import Vector from './Vector'

export default class BaseObject {

  constructor (id, type) {
    
    this._offset        = new Vector()
    this._position      = new Vector()
    this._selectable    = true
    this._transformable = true
    this._type          = type
    this._id            = id
  }

  setPosition (x, y, z) {

    this._position = new Vector(
      x + this._offset._x,
      y + this._offset._y,
      z + this._offset._z)
  }

  getPosition () {

    return this._position
  }

  setOffset (x, y, z) {

    this._offset = new Vector(x, y, z)
  }

  getOffset () {

    return this._offset
  }

  setTransformable (transformable) {

    this._transformable = transformable
  }

  getTransformable () {

    return this._transformable
  }

  setSelectable (selectable) {

    this._selectable = selectable
  }

  getSelectable () {

    return this._selectable
  }

  getType() {

    return this._type
  }

  getId() {

    return this._id
  }
}
