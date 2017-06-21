
const EntityClassFactory = (BaseEntity, handlerMng) =>
  class extends BaseEntity {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (params) {

    super (params)

    this.handler = handlerMng.getHandler(
      params.property._id)

    this.handler.onCreate(params.property)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModify (context) {

    this.handler.onModify(context)

    const path = context[0]._path.split('.')

    if (path.length > 2) {

      const parentHandlerId = path[path.length-3]

      const parentHandler = handlerMng.getHandler(
        parentHandlerId)

      parentHandler.onModify(context)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRemove() {

    this.handler.onRemove()
  }
}

export default EntityClassFactory
