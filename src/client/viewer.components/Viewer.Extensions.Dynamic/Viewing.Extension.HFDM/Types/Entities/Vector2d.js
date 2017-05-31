
const Vector2dEntityFactory = (BaseEntity) =>
  class extends BaseEntity {

  constructor (params) {

    super (params)

    this.entityManager = params.entityManager

    console.log(params)
  }

  onModify (context) {

    const property = this.getProperty()

    console.log('X: ' + property.get('x').value + ' Y: ' + property.get('y').value)
    console.log(property._id)
  }

  onRemove() {

  }
}

export default Vector2dEntityFactory
