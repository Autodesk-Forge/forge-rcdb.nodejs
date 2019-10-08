
/**
 * @author mrdoob / http://mrdoob.com/
 */

export default function LineSegments (geometry, material) {
  THREE.Line.call(this, geometry, material)

  this.type = 'LineSegments'
}

LineSegments.prototype = Object.assign(Object.create(THREE.Line.prototype), {

  constructor: LineSegments,

  isLineSegments: true

})
