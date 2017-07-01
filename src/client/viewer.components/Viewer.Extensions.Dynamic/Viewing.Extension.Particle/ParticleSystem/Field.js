import BaseObject from './BaseObject'
import Vector from './Vector'

export default class Field extends BaseObject {

  constructor (id, type) {

    super(id, type)
  }

  computeAcceleration (particle) {

    return new Vector()
  }
}

