import Falcor from 'falcor/dist/falcor.browser.min'
import BaseSvc from './BaseSvc'

export default class FalcorSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    config.dataSources.forEach((dataSource) => {

      this[dataSource.name] = new Falcor.Model({
        source: new Falcor.HttpDataSource(dataSource.apiUrl)
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'FalcorSvc'
  }
}
