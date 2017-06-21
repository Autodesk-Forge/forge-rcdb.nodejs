
import BaseHandler from './Handler.Base'

export default class CameraPositionHandler extends BaseHandler {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    this.viewer = viewer

    this.onCameraChanged = _.throttle(
      this.onCameraChanged.bind(this), 500)

    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModify (context) {

    const nav = this.viewer.navigation

    const position = this.getPropertyAsVector(
      'position')

    const target = this.getPropertyAsVector(
      'target')

    const up = this.getPropertyAsVector(
      'up')

    nav.setPosition(position)
    nav.setCameraUpVector(up)
    nav.setTarget(target)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRemove() {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onCameraChanged (event) {

    const nav = this.viewer.navigation

    const position = nav.getPosition()

    const up = nav.getCameraUpVector()

    const target = nav.getTarget()

    this.setPropertyFromVector('position', position)
    this.setPropertyFromVector('target', target)
    this.setPropertyFromVector('up', up)

    this.workspace.commit()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setPropertyFromVector (name, v) {

    this.property.get(`${name}.x`).value = v.x
    this.property.get(`${name}.y`).value = v.y
    this.property.get(`${name}.z`).value = v.z
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getPropertyAsVector (name) {

    const x = this.property.get(`${name}.x`).value
    const y = this.property.get(`${name}.y`).value
    const z = this.property.get(`${name}.z`).value

    return new THREE.Vector3(x, y, z)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  log () {

    const x = this.property.get('x').value.toFixed(2)
    const y = this.property.get('y').value.toFixed(2)
    const z = this.property.get('z').value.toFixed(2)

    console.log(`${this.property._id}: [${x}, ${y}, ${z}]`)
  }
}


