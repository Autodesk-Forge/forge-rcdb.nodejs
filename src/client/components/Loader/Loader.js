
export default class Loader {

  constructor (container, opts = {autoLoad: true}) {

    this.background = document.createElement('div')

    this.background.className = 'loader-background'

    if (!opts.autoLoad) {

      this.background.classList.add('disabled')
    }

    container.appendChild(this.background)


    this.loader = document.createElement('div')

    this.background.appendChild(this.loader)

    this.loader.className = 'loader'
  }

  hide () {

    this.background.style.transitionProperty = 'background'

    this.background.classList.add('disabled')
  }

  show () {

    this.background.style.transitionProperty = 'none'

    this.background.classList.remove('disabled')
  }
}


