
import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import Forge from 'forge-apis'
import request from 'request'
import util from 'util'

export default class DMSvc extends BaseSvc {

  static get SERVICE_BASE_URL () {

    return 'https://developer.api.autodesk.com/data/v1'
  }

  /////////////////////////////////////////////////////////////////
  // DataManagement Service
  //
  /////////////////////////////////////////////////////////////////
  constructor(config) {

    super(config)

    this._projectsAPI = new Forge.ProjectsApi()
    this._versionsAPI = new Forge.VersionsApi()
    this._foldersAPI = new Forge.FoldersApi()
    this._itemsAPI = new Forge.ItemsApi()
    this._hubsAPI = new Forge.HubsApi()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'DMSvc'
  }

  /////////////////////////////////////////////////////////////////
  // Returns current user profile
  //
  /////////////////////////////////////////////////////////////////
  getUser (token) {

    const url = 'https://developer.api.autodesk.com' +
      '/userprofile/v1/users/@me'

    return requestAsync({
      token: token.access_token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns list of Hubs
  //
  /////////////////////////////////////////////////////////////////
  getHubs (token, opts = {}) {

    return this._hubsAPI.getHubs (
      opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns list of Projects for specific Hub
  //
  /////////////////////////////////////////////////////////////////
  getProjects (token, hubId, opts = {}) {

    return this._projectsAPI.getHubProjects (
      hubId, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Project content
  //
  /////////////////////////////////////////////////////////////////
  getProject (token, hubId, projectId) {

    return this._projectsAPI.getProject(
      hubId, projectId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Folder
  //
  /////////////////////////////////////////////////////////////////
  getFolder (token, projectId, folderId) {

    return this._foldersAPI.getFolder(
      projectId, folderId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Folder content
  //
  /////////////////////////////////////////////////////////////////
  getFolderContent (token, projectId, folderId, opts = {}) {

    return this._foldersAPI.getFolderContents(
      projectId, folderId, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Item details
  //
  /////////////////////////////////////////////////////////////////
  getItem (token, projectId, itemId) {

    return this._itemsAPI.getItem(
      projectId, itemId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Item tip version (most recent)
  //
  /////////////////////////////////////////////////////////////////
  getItemTip (token, projectId, itemId) {

    return this._itemsAPI.getItemTip(
      projectId, itemId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Versions for specific Item
  //
  /////////////////////////////////////////////////////////////////
  getItemVersions (token, projectId, itemId, opts = {}) {

    return this._itemsAPI.getItemVersions(
      projectId, itemId, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Delete Item
  //
  /////////////////////////////////////////////////////////////////
  deleteItem (token, projectId, itemId) {

    return new Promise(async(resolve, reject) => {

      try {

        const versionsRes = await this._itemsAPI.getItemVersions(
          projectId, itemId, {autoRefresh:false}, token)

        const deleteTasks = versionsRes.body.data.map((version) => {

          return this.deleteVersion(
            token, projectId, version.id)
        })

        return Promise.all(deleteTasks)

      } catch (ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Version for specific versionId
  //
  /////////////////////////////////////////////////////////////////
  getVersion (token, projectId, versionId) {

    return this._versionsAPI.getVersion(
      projectId, versionId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Delete Version
  //
  /////////////////////////////////////////////////////////////////
  deleteVersion (token, projectId, versionId) {

    return new Promise(async(resolve, reject) => {

      try {

        const versionsRes = await this._versionsAPI.getVersion(
          projectId, versionId, {autoRefresh:false}, token)

        const version = versionsRes.body.data

        if (version.relationships.storage) {

          const ossSvc = ServiceManager.getService('OssSvc')

          const objectId = ossSvc.parseObjectId(
            version.relationships.storage.data.id)

          const res = await ossSvc.deleteObject (
            token,
            objectId.bucketKey,
            objectId.objectKey)

          resolve (res)
        }

        return reject('no storage')

      } catch (ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Storage location on OSS for DM
  //
  /////////////////////////////////////////////////////////////////
  createStorage (token, projectId, folderId, filename) {

    const payload = this.createStoragePayload (
      folderId, filename)

    return this._projectsAPI.postStorage(
      projectId, JSON.stringify(payload),
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Item
  //
  /////////////////////////////////////////////////////////////////
  createItem (
    token, projectId, folderId, objectId, filename, displayName = null) {

    const payload = this.createItemPayload(
      folderId, objectId, filename, displayName)

    return this._itemsAPI.postItem(
      projectId, JSON.stringify(payload),
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Version
  //
  /////////////////////////////////////////////////////////////////
  createVersion (
    token, projectId, itemId, objectId, filename) {

    const payload = this.createVersionPayload(
      itemId, objectId, filename)

    return this._versionsAPI.postVersion(
      projectId, JSON.stringify(payload),
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Get Item relationship References
  //
  /////////////////////////////////////////////////////////////////
  getItemRelationshipsRefs (
    token, projectId, itemId, opts = {}) {

    return this._itemsAPI.getItemRelationshipsRefs(
      projectId, itemId, opts,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Create Item relationship reference
  //
  /////////////////////////////////////////////////////////////////
  createItemRelationshipRef (
    token, projectId, targetItemId, refVersionId) {

    const payload = this.createItemRelationshipRefPayload(
      refVersionId)

    return this._itemsAPI.postItemRelationshipsRef(
      projectId, targetItemId, JSON.stringify(payload),
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Get Version relationship references
  //
  /////////////////////////////////////////////////////////////////
  getVersionRelationshipsRefs (
    token, projectId, versionId, opts = {}) {

    return this._versionsAPI.getVersionRelationshipsRefs(
      projectId, versionId, opts,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Create Version relationship reference
  //
  /////////////////////////////////////////////////////////////////
  createVersionRelationshipRef (
    token, projectId, targetVersionId, refVersionId) {

    const payload = this.createVersionRelationshipRefPayload(
      refVersionId)

    return this._versionsAPI.postVersionRelationshipsRef(
      projectId, targetVersionId, JSON.stringify(payload),
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Create new folder
  //
  /////////////////////////////////////////////////////////////////
  createFolder (
    token, projectId, parentFolderId, folderName) {

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/folders`

    const payload = this.createFolderPayload(
      parentFolderId,
      folderName)

    const headers = {
      'Content-Type': 'application/vnd.api+json',
      'Authorization': 'Bearer ' + token.access_token
    }

    return requestAsync({
      method: 'POST',
      body: payload,
      json: true,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Search folder
  //
  /////////////////////////////////////////////////////////////////
  searchFolder (token, projectId, folderId, filter) {

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/folders/${folderId}/search?` +
      filter

    const headers = {
      'Authorization': 'Bearer ' + token.access_token
    }

    return requestAsync({
      method: 'GET',
      json: true,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Upload file to create new item or new version
  //
  /////////////////////////////////////////////////////////////////
  upload (token, projectId, folderId, file) {

    return new Promise(async(resolve, reject) => {

      try {

        var displayName = file.originalname

        var storageRes = await this.createStorage(
          token, projectId, folderId, displayName)

        var ossSvc = ServiceManager.getService('OssSvc')

        var objectId = ossSvc.parseObjectId(storageRes.body.data.id)

        var object = await ossSvc.uploadObject(
          token,
          objectId.bucketKey,
          objectId.objectKey,
          file)

        // look for items with the same displayName
        var items = await this.findItemsWithAttributes(
          token,
          projectId,
          folderId, {
            displayName
          })

        if(items.length > 0) {

          const item = items[0]

          const versionRes = await this.createVersion(
            token,
            projectId,
            item.id,
            storageRes.body.data.id,
            displayName)

          const response = {
            version: versionRes.body.data,
            storage: versionRes.body.data,
            item: item,
            object
          }

          resolve(response)

        } else {

          const itemRes = await this.createItem(
            token, projectId, folderId,
            storageRes.body.data.id,
            displayName)

          const versions = await this.getItemVersions(
            token, projectId, itemRes.body.data.id)

          const response = {
            version: versions.data[0],
            storage: storageRes.body.data,
            item: itemRes.body.data,
            object
          }

          resolve(response)
        }

      } catch (ex) {

        console.log(ex)
        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Items matching search criteria
  //
  /////////////////////////////////////////////////////////////////
  findItemsWithAttributes (
    token, projectId, folderId, attributes, recursive = false) {

    return new Promise(async(resolve, reject) => {

      try {

        var folderItems = await this.getFolderContent(
          token, projectId, folderId)

        var tasks = folderItems.body.data.map((folderItem) => {

          if(folderItem.type === 'items') {

            var match = true

            for (var key in attributes) {

              if(attributes[key] !== folderItem.attributes[key]){

                match = false
              }
            }

            if(match) {

              return Promise.resolve(folderItem)

            } else {

              return Promise.resolve(null)
            }

          } else if (folderItem.type === 'folders' && recursive) {

            return findItemsWithAttributes (
              token,
              projectId,
              folderItem.id,
              recursive)

          } else {

            return Promise.resolve(null)
          }
        })

        var items = await Promise.all(tasks)

        items = items.filter((item) => {
          return item !== null
        })

        resolve(items)

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Creates storage payload
  //
  /////////////////////////////////////////////////////////////////
  createStoragePayload (folderId, filename) {

    return {
      data: {
        type: 'objects',
        attributes: {
          name: filename
        },
        relationships: {
          target: {
            data: {
              type: 'folders',
              id: folderId
            }
          }
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates item payload
  //
  /////////////////////////////////////////////////////////////////
  createItemPayload (folderId, objectId, displayName) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
          type: 'items',
          attributes: {
            displayName: displayName,
            extension: {
              type: 'items:autodesk.core:File',
              version: '1.0'
            }
          },
          relationships: {
            tip: {
              data: {
                type: 'versions', id: '1'
              }
            },
            parent: {
              data: {
                type: 'folders',
                id: folderId
              }
            }
          }
      },
      included: [ {
        type: 'versions',
        id: '1',
        attributes: {
          name: displayName,
          extension: {
            type: 'versions:autodesk.core:File',
            version: '1.0'
          }
        },
        relationships: {
          storage: {
            data: {
              type: 'objects',
              id: objectId
            }
          }
        }
      }]
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates version payload
  //
  /////////////////////////////////////////////////////////////////
  createVersionPayload (itemId, objectId, displayName) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'versions',
        attributes: {
          name: displayName,
          extension: {
            type: 'versions:autodesk.core:File',
            version: '1.0'
          }
        },
        relationships: {
          item: {
            data: {
              type: 'items',
              id: itemId
            }
          },
          storage: {
            data: {
              type: 'objects',
              id: objectId
            }
          }
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates item relationship payload
  //
  /////////////////////////////////////////////////////////////////
  createItemRelationshipRefPayload (refVersionId) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'versions',
        id: refVersionId,
        meta: {
          extension: {
            type: 'auxiliary:autodesk.core:Attachment',
            version: '1.0'
          }
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates version relationship payload
  //
  /////////////////////////////////////////////////////////////////
  createVersionRelationshipRefPayload (refVersionId) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'versions',
        id: refVersionId,
        meta: {
          extension: {
            type: 'auxiliary:autodesk.core:Attachment',
            version: '1.0'
          }
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates new folder payload
  //
  /////////////////////////////////////////////////////////////////
  createFolderPayload (parentFolderId, folderName) {

    return {
      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'folders',
        attributes: {
          name: folderName,
          extension: {
            type: 'folders:autodesk.core:Folder',
            version: '1.0'
          }
        },
        relationships: {
          parent: {
            data: {
              type: 'folders',
              id: parentFolderId
            }
          }
        }
      }
    }
  }
}

/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise( function(resolve, reject) {

    request({

      url: params.url,
      method: params.method || 'GET',
      headers: params.headers || {
        'Authorization': 'Bearer ' + params.token
      },
      json: params.json,
      body: params.body

    }, function (err, response, body) {

      try {

        if (err) {

          console.log('error: ' + params.url)
          console.log(err)

          return reject(err)
        }

        if (body && body.errors) {

          console.log('body error: ' + params.url)
          console.log(body.errors)

          var error = Array.isArray(body.errors) ?
            body.errors[0] :
            body.errors

          return reject(error)
        }

        if (response && [200, 201, 202].indexOf(
            response.statusCode) < 0) {

          console.log('status error: ' +
            response.statusCode)

          console.log(response.statusMessage)

          return reject(response.statusMessage)
        }

        return resolve(body)

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}
