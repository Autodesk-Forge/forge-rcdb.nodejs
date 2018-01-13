import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import mongo from 'mongodb'

export default class UserSvc extends BaseSvc {

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
  name () {

    return 'UserSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getUploadLimit (forgeUser) {

    const emailId = forgeUser.emailId

    const matches = 
      this._config.whiteList.filter((email) => {
        return emailId.match(new RegExp(email))
      })
      
    return (matches.length === 0) 
      ? this._config.uploadLimit
      : undefined
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getCurrentUser (session) {

    return new Promise(async(resolve, reject) => {

      try {

        const forgeSvc = ServiceManager.getService(
          'ForgeSvc')

        const forgeUser = await forgeSvc.getUser(session)

        if (forgeUser) {

          const uploadLimit = this.getUploadLimit(forgeUser)
            
          const user = Object.assign({}, forgeUser, {
            uploadLimit
          })

          return resolve(user)

          //const dbUser = await this.getByUserId(
          //  forgeUser.userId)
          //
          //const adskUser = Object.assign({},
          //  forgeUser, dbUser)
          //
          //return resolve(adskUser)
        }

        return resolve(null)

      } catch(ex) {

        return resolve(null)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getByUserId (userId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const user = await dbSvc.findOne (
          this._config.collection, {
            fieldQuery: {
              userId
            }
          })

        return resolve(user)

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  save (forgeUser) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const uploadLimit = this.getUploadLimit(forgeUser)

        // Autodesk accounts have unlimited uploads
        const insertInfo = Object.assign({}, 
          { created: new Date() }, 
          { uploadLimit })

        const item = Object.assign({}, {
          $setOnInsert: insertInfo,
          $set: user
        })

        const res = await dbSvc.upsert (
          this._config.collection, item, {
            userId: user.userId
          })

        return resolve(res)

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getActiveModels (collectionName, userId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        const models = await dbSvc.getItems(
          collectionName, {
            fieldQuery: {
              owner: userId
            },
            pageQuery: {
              model: 1,
              name: 1
            }
          })

        return resolve(models)

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  isModelOwner (collectionName, modelId, userId) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        await dbSvc.findOne(
          collectionName, {
            fieldQuery: {
              _id: new mongo.ObjectId(modelId),
              owner: userId
            },
            pageQuery: {
              model: 1,
              name: 1
            }
          })

        return resolve(true)

      } catch (ex) {

        return ((ex.statusCode === 404)
          ? resolve(false)
          : reject(ex))
      }
    })
  }
}
