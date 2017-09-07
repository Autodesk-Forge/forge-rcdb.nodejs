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
  getCurrentUser (session) {

    return new Promise(async(resolve, reject) => {

      try {

        const forgeSvc = ServiceManager.getService(
          'ForgeSvc')

        const forgeUser = await forgeSvc.getUser(session)

        if (forgeUser) {

          const user = await this.getByUserId(
            forgeUser.userId)

          return resolve(user)
        }

        return resolve(null)

      } catch(ex) {

        console.log(ex)
        return reject(ex)
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

        console.log(ex)
        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  save (user) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbSvc = ServiceManager.getService(
          this._config.dbName)

        // Autodesk accounts have unlimited uploads
        const uploadLimit =
          !user.emailId.endsWith('@autodesk.com')
            ? this._config.uploadLimit
            : -1

        const item = Object.assign({}, {
          $setOnInsert: {
            created: new Date(),
            uploadLimit
          },
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
            }
          })

        return resolve(models)

      } catch (ex) {

        return reject(ex)
      }
    })
  }
}
