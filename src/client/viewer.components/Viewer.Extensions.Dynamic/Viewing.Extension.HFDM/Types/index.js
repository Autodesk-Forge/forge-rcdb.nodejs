import Vector2dJSON from './Templates/autodesk.math@vector2d-1.0.0.template.json'
import Vector2dEntityFactory from './Entities/Vector2d'

module.exports = {
  Vector2d: {
    typeId: 'autodesk.math:vector2d-1.0.0',
    Entity: Vector2dEntityFactory,
    json: Vector2dJSON,
    name: 'Vector2d'
  }
}
