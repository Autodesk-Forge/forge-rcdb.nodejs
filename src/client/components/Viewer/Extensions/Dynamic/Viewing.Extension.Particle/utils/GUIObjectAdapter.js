
export default class GUIObjectAdapter {
  constructor (obj, mapping) {
    this.mapping = mapping

    this.object = obj

    for (const key in this.mapping) {
      const getter = this.mapping[key].getter

      this[key] = this.object[getter]()
    }
  }

  update () {
    for (const key in this.mapping) {
      if (this.mapping[key].setter) {
        const setter = this.mapping[key].setter

        this.object[setter](this[key])
      }
    }
  }
}
