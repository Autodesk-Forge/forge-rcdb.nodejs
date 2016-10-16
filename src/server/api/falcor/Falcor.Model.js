import ServiceManager from '../services/SvcManager'
import FalcorRouter from 'falcor-router'
import Falcor from 'falcor-express'

export default Falcor.dataSourceRoute((req, res) => {

  // create a Virtual JSON resource
  return new FalcorRouter([
    {
      route: 'length',
      get: async function(pathSet) {

        var itemsRequest = this.itemsListCache

        if (!items) {

          var modelSvc = ServiceManager.getService(
            'forge-rcdb' + '-ModelSvc')

          itemsRequest = modelSvc.getModels()

          this.itemsListCache = itemsRequest
        }

        var items = await itemsRequest

        return {
          path: [ 'length' ],
          value: items.length
        }
      }
    },{

      route: '[{integers:indices}]',
      get: async function (pathSet) {

        var itemsRequest = this.itemsListCache

        if (!items) {

          var modelSvc = ServiceManager.getService(
            'forge-rcdb' + '-ModelSvc')

          var pageQuery = {
            thumbnail: 1,
            name: 1,
            urn: 1,
            env: 1
          }

          itemsRequest = modelSvc.getModels({
            fieldQuery:{},
            pageQuery: pageQuery
          })

          this.itemsListCache = itemsRequest

          this.itemCache = this.itemCache || {}

          var items = await itemsRequest

          items.forEach((item) => {
            this.itemCache[item._id] = Promise.resolve(item)
          })
        }

        return pathSet.indices.map(index => {
          return {
            path: [ index ],
            value: {
              $type: 'ref',
              value: ["byId", items[ index ]]
            }
          }
        })
      }
    }, {

      route: 'byId[{keys:ids}]["_id", "urn"]',
      get: async function (pathSet) {

        var attributes = pathSet[2]

        return _.flatten(await Promise.all(

          pathSet.keys.map(pathSet.ids, async (id) => {

          var itemRequest = this.itemCache && this.itemCache[id]

          if (!itemRequest) {

            var modelSvc = ServiceManager.getService(
              'forge-rcdb' + '-ModelSvc')

            var pageQuery = {
              path: 1,
              name: 1,
              urn: 1,
              env: 1
            }

            itemRequest = modelSvc.getById(id, {pageQuery})

            this.itemCache = this.itemCache || {}

            this.itemCache[id] = itemRequest;
          }

          var item = await itemRequest

          return attributes.map((attribute) => {
            return {
              path: [ 'byId', id, attribute],
              value: item[ attribute ]
            }
          })
        })
       ))
      }
    }
  ])
})
