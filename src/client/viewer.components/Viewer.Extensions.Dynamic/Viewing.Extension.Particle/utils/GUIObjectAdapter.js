
export default class GUIObjectAdapter {

  constructor (obj, mapping) {

    this.mapping = mapping

    this.object = obj

    for (let key in this.mapping) {

      let getter = this.mapping[key].getter

      this[key] = this.object[getter]()
    }
  }

  update() {

    for (let key in this.mapping) {

      if(this.mapping[key].setter) {

        let setter = this.mapping[key].setter
  
        this.object[setter](this[key])
      }
    }
  }
}