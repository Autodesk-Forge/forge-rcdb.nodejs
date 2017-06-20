import Vector3dJSON from './Templates/autodesk.math@vector3d-1.0.0.template.json'
import Vector3dEntityFactory from './Entities/Vector3d'

module.exports = {
  Vector3d: {
    typeId: 'autodesk.math:vector3d-1.0.0',
    Entity: Vector3dEntityFactory,
    json: Vector3dJSON,
    name: 'Vector3d'
  }
}
