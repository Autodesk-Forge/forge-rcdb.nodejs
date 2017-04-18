import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import mongo from 'mongodb'
import _ from 'lodash'

export default class ModelSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super (config)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return (this._config.name + '-ModelSvc') || 'ModelSvc'
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
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
          this._config.models, query)

        return resolve (model)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  getModels (opts = {}) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const models = await dbSvc.getItems(
          this._config.models,
          opts)

        return resolve (models)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
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
          this._config.models,
          Object.assign({}, opts, query))

        const thumbnails = modelIds.map((id) => {

          const mongoId = new mongo.ObjectId(id)

          return _.find(models, { _id: mongoId }).thumbnail
        })

        return resolve (thumbnails)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  download (modelId, path) {

    return new Promise(async(resolve, reject) => {

      try {

        //TODO NOT IMPLEMENTED

        return resolve()

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // returns states sequence
  //
  ///////////////////////////////////////////////////////////////////
  getSequence (modelId) {

    return new Promise(async(resolve, reject)=> {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = {
          fieldQuery:{
            _id: new mongo.ObjectId(modelId)
          },
          pageQuery:{
            sequence: 1
          }
        }

        const model = await dbSvc.findOne(
          this._config.models,
          query)

        return resolve (model.sequence)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // set states sequence
  //
  ///////////////////////////////////////////////////////////////////
  setSequence (modelId, sequence) {

    return new Promise(async(resolve, reject)=> {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = {
          _id: new mongo.ObjectId(modelId)
        }

        const opts = {
          $set: {
            sequence: sequence
          }
        }

        await dbSvc.updateItem(
          this._config.models,
          query, opts)

        return resolve (sequence)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // returns states
  //
  ///////////////////////////////////////////////////////////////////
  getStates (modelId) {

    return new Promise(async(resolve, reject)=> {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const query = {
          fieldQuery:{
            _id: new mongo.ObjectId(modelId)
          },
          pageQuery:{
            states: 1
          }
        }

        const model = await dbSvc.findOne(
          this._config.models,
          query)

        return resolve (model.states)

      } catch (ex) {

        return reject (ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // adds new state
  //
  ///////////////////////////////////////////////////////////////////
  addState (modelId, state) {

    return new Promise(async(resolve, reject)=> {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.models)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId),
          },
          {
            $push: {
              'sequence': state.guid,
              'states': state
            }
          }, (err) => {

            return err
              ? reject(err)
              : resolve (state)
          })

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // remove state
  //
  ///////////////////////////////////////////////////////////////////
  removeState (modelId, stateId) {

    return new Promise(async(resolve, reject)=> {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.models)

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId)
          },
          {
            '$pull': {
            'sequence': stateId,
            'states': {guid: stateId}
          }
          },
          { multi: true }, (err) => {

            if (err) {

              console.log(err)
              return reject(err)
            }

            return resolve (stateId)
          })

      } catch(ex){

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // returns config sequence by Id
  //
  /////////////////////////////////////////////////////////
  getConfigSequence (modelId, sequenceId) {

    return new Promise(async(resolve, reject)=> {

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
          this._config.models,
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

    return new Promise(async(resolve, reject)=> {

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
          this._config.models,
          query)

        return resolve (model.sequences || [])

      } catch(ex){

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
          this._config.models)

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

            if (err) {

              return reject(err)
            }

            return resolve (sequence)
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
          this._config.models)

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

            if (err) {

              return reject(err)
            }

            return resolve (sequence)
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
          this._config.models)

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

            if (err) {

              console.log(err)
              return reject(err)
            }

            return resolve (sequenceId)
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
          this._config.models)

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
  addConfigSequenceState (modelId, sequenceId, state) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const collection = await dbSvc.getCollection(
          this._config.models)

        const states = Array.isArray(state)
          ? state : [state]

        collection.update(
          {
            '_id': new mongo.ObjectID(modelId),
            'sequences.id': sequenceId
          },
          {
            $push: {
              'sequences.$.stateIds': state.id,
              'states': state
            }

            //$push: {
            //  $each: states.map((item) => {
            //    return {
            //      'sequences.$.stateIds': item.id,
            //      'states': item
            //    }
            //  })
            //}
          }, (err) => {

            return err
              ? reject(err)
              : resolve (state)
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
          this._config.models)

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

            if (err) {

              return reject(err)
            }

            return resolve (sequenceId)
          })

      } catch (ex) {

        return reject(ex)
      }
    })
  }
}
