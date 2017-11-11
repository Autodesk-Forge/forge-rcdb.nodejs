import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import find from 'lodash/find'
import mongo from 'mongodb'
import _ from 'lodash'

export default class ModelSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return (this._config.name + '-ModelSvc') || 'ModelSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getById (modelId, opts = {}) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = Object.assign({}, opts, {
          fieldQuery: {
            _id: new mongo.ObjectId (modelId)
          }
        })

        const model = await dbSvc.findOne(
          this._config.collection, query)

        return resolve (model)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getModel (opts = {}) {

    try {

      const dbSvc = ServiceManager.getService(
        this._config.dbName)

      return dbSvc.findOne(
        this._config.collection,
        opts)

    } catch (ex) {

      return Promise.reject (ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getModels (opts = {}) {

    try {

      const dbSvc = ServiceManager.getService(
        this._config.dbName)

      return dbSvc.getItems(
        this._config.collection,
        opts)

    } catch (ex) {

      return Promise.reject (ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getThumbnails (modelIds, opts = {}) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = {
          fieldQuery:{
           $or: modelIds.map((id) => {
             return { _id: new mongo.ObjectId(id) }
           })
          },
          pageQuery: {
            thumbnail: 1
          }
        }

        const models = await dbSvc.getItems(
          this._config.collection,
          Object.assign({}, opts, query))

        const thumbnails = modelIds.map((id) => {

          const mongoId = new mongo.ObjectId(id)

          return find(models, { _id: mongoId }).thumbnail
        })

        return resolve (thumbnails)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  register (modelInfo) {

    try {

      const dbSvc = ServiceManager.getService(
        this._config.dbName)

      return dbSvc.insert(
        this._config.collection,
        modelInfo)

    } catch (ex) {

      return Promise.reject (ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteModel (modelId) {

    try {

      const dbSvc = ServiceManager.getService(
        this._config.dbName)

      return dbSvc.removeItems(this._config.collection, {
        _id: new mongo.ObjectId(modelId)
      })

    } catch (ex) {

      return Promise.reject (ex)
    }
  }

  /////////////////////////////////////////////////////////
  // returns config sequence by Id
  //
  /////////////////////////////////////////////////////////
  getConfigSequence (modelId, sequenceId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = {
          fieldQuery:{
            _id: new mongo.ObjectId(modelId)
          },
          pageQuery:{
            sequences: 1
          }
        }

        const model = await dbSvc.findOne(
          this._config.collection,
          query)

        return resolve (model.sequences || [])

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // returns config sequences
  //
  /////////////////////////////////////////////////////////
  getConfigSequences (modelId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = {
          fieldQuery:{
            _id: new mongo.ObjectId(modelId)
          },
          pageQuery:{
            sequences: 1
          }
        }

        const model = await dbSvc.findOne(
          this._config.collection,
          query)

        return resolve (model.sequences || [])

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // add new config sequence
  //
  /////////////////////////////////////////////////////////
  addConfigSequence (modelId, sequence) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId)
          },
          {
            $push: {
              'sequences': sequence
            }
          },
          (err) => {

            return err
              ? reject(err)
              : resolve (sequence)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // update existing config sequence
  //
  /////////////////////////////////////////////////////////
  updateConfigSequence (modelId, sequence) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId),
            'sequences.id': sequence.id
          },
          {
            $set: {
              'sequences.$.stateIds': sequence.stateIds
            }
          },
          (err) => {

            return err
              ? reject(err)
              : resolve (sequence)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // delete config sequence
  //
  /////////////////////////////////////////////////////////
  deleteConfigSequence (modelId, sequenceId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        const states =
          await this.getConfigSequenceStates (
            modelId, sequenceId)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId)
          },
          { '$pull': {
              'sequences': {id: sequenceId},
              'states': {$in: states}
            }
          },
          { multi: true }, (err) => {

            return err
              ? reject(err)
              : resolve (sequenceId)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // get states from specific sequence
  //
  /////////////////////////////////////////////////////////
  getConfigSequenceStates (modelId, sequenceId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.aggregate([

          {
            $match: {
              '_id': new mongo.ObjectId(modelId)
            }
          },
          {
            $project: {
              states: 1,
              sequences: 1
            }
          },
          {
            $unwind: '$sequences'
          },
          {
            $match: {
              'sequences.id': sequenceId
            }
          },

        ], function (err, result) {

          if (err) {

            return reject(err)
          }

          if(!result || !result.length){

            return reject({error: 'Not Found'})
          }

          const sequence = result[0].sequences

          const stateMap = {};

          result[0].states.forEach((state) => {

            if (sequence.stateIds.indexOf(state.id) > -1){

              stateMap[state.id] = state
            }
          })

          const states = sequence.stateIds.map((id) => {
            return stateMap[id]
          })

          return resolve(states)
        })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // add state or array of states to specific sequence
  //
  /////////////////////////////////////////////////////////
  addConfigSequenceStates (modelId, sequenceId, states) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        const statesArray = Array.isArray(states)
          ? states : [states]

        const stateIds = statesArray.map((item) => {
          return item.id
        })

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId),
            'sequences.id': sequenceId
          },
          {
            $push: {
              'sequences.$.stateIds': {
                $each: stateIds
              },
              'states': {
                $each: statesArray
              }
            }
          }, (err) => {

            return err
              ? reject(err)
              : resolve (states)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // delete config sequence state
  //
  /////////////////////////////////////////////////////////
  deleteConfigSequenceState (modelId, sequenceId, stateId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId),
            'sequences.id': sequenceId
          },
          {
            '$pull': {
              'sequences.$.stateIds': stateId,
              'states': {id: stateId}
            }
          },
          { multi: true }, (err) => {

            return err
              ? reject(err)
              : resolve (sequenceId)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Get all meta properties for model (debug only)
  //
  /////////////////////////////////////////////////////////
  getModelMetaProperties (modelId) {

    return new Promise(async(resolve, reject)=> {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = {
          fieldQuery:{
            _id: new mongo.ObjectId(modelId)
          },
          pageQuery:{
            metaProperties: 1
          }
        }

        const model = await dbSvc.findOne(
          this._config.collection,
          query)

        return resolve (model.metaProperties || [])

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Get meta properties for specific dbId
  //
  /////////////////////////////////////////////////////////
  getNodeMetaProperties (modelId, dbId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.aggregate([

          {
            $match: {
              '_id': new mongo.ObjectId(modelId)
            }
          },
          {
            $project: {
              metaProperties: 1
            }
          },
          {
            "$unwind": "$metaProperties"
          },
          {
            $match: {
              'metaProperties.dbId': dbId
            }
          },

        ], (err, result) => {

          const properties = result
            ? result.map((e) => { return e.metaProperties})
            : []

          return err
            ? reject(err)
            : resolve(properties)
        })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Get single meta property
  //
  /////////////////////////////////////////////////////////
  getNodeMetaProperty (modelId, metaId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.aggregate([

          {
            $match: {
              '_id': new mongo.ObjectId(modelId)
            }
          },
          {
            $project: {
              metaProperties: 1
            }
          },
          {
            "$unwind": "$metaProperties"
          },
          {
            $match: {
              'metaProperties.id': metaId
            }
          },

        ], (err, result) => {

          const properties = result
            ? result.map((e) => { return e.metaProperties})
            : []

          if (err) {

            return reject(err)
          }

          if (!properties.length) {

            return reject({
              statusCode: 404,
              msg: 'Not Found'
            })
          }

          resolve(properties[0])
        })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // add meta property
  //
  /////////////////////////////////////////////////////////
  addNodeMetaProperty (modelId, metaProperty) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId)
          },
          {
            $push: {
              'metaProperties': metaProperty
            }
          }, (err) => {

            return err
              ? reject(err)
              : resolve (metaProperty)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // update existing config sequence
  //
  /////////////////////////////////////////////////////////
  updateNodeMetaProperty (modelId, metaProperty) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId),
            'metaProperties.id': metaProperty.id
          },
          {
            $set: {
              'metaProperties.$': metaProperty
            }
          }, (err) => {

            return err
              ? reject(err)
              : resolve (metaProperty)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // delete node meta property
  //
  /////////////////////////////////////////////////////////
  deleteNodeMetaProperty (modelId, metaId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId)
          },
          {
            '$pull': {
              'metaProperties': {id: metaId}
            }
          },
          { multi: true }, (err) => {

            return err
              ? reject(err)
              : resolve (metaId)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // search meta properties
  //
  /////////////////////////////////////////////////////////
  searchMetaProperties (modelId, searchParams) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.collection)

        const text = searchParams.text

        collection.aggregate([

          {
            $match: {
              '_id': new mongo.ObjectId(modelId)
            }
          },
          {
            $project: {
              metaProperties: 1
            }
          },
          {
            "$unwind": "$metaProperties"
          },
          {
            $match: {
              'metaProperties.displayValue': {
                $regex: new RegExp(text)
              }
            }
          },

        ], (err, result) => {

          const properties = result
            ? result.map((e) => { return e.metaProperties})
            : []

          return err
            ? reject(err)
            : resolve(properties)
        })

      } catch (ex) {

        return reject(ex)
      }
    })
  }
}
