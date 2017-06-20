
const Vector3dEntityFactory = (BaseEntity, entityParams) =>
  class extends BaseEntity {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (params) {

    super (params)

    this.entityManager = params.entityManager

    this.eventSink = entityParams.eventSink

    this.viewer = entityParams.viewer

    this.eventSink.emit(
      'entity.created',
      params)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModify (context) {

    const property = this.getProperty()

    const x = property.get('x').value
    const y = property.get('y').value
    const z = property.get('z').value

    switch (property._id) {

      case 'position':

        const position = new THREE.Vector3(x, y, z)

        this.viewer.navigation.setPosition(position)

        break

      case 'target':

        const target = new THREE.Vector3(x, y, z)

        this.viewer.navigation.setTarget(target)

        break

      case 'up':

        const up = new THREE.Vector3(x, y, z)

        this.viewer.navigation.setCameraUpVector(up)

        break
    }

    this.log(property)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  log (property) {

    const x = property.get('x').value.toFixed(2)
    const y = property.get('y').value.toFixed(2)
    const z = property.get('z').value.toFixed(2)

    console.log(`${property._id}: [${x}, ${y}, ${z}]`)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRemove() {

  }
}

export default Vector3dEntityFactory
