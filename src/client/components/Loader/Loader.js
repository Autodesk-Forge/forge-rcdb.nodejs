
export default class Loader {
  constructor (container, opts = { autoLoad: false }) {
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

  show (show) {
    if (show) {
      this.background.style.transitionProperty = 'none'

      this.background.classList.remove('disabled')
    } else {
      this.background.style.transitionProperty = 'background'

      this.background.classList.add('disabled')
    }
  }
}
