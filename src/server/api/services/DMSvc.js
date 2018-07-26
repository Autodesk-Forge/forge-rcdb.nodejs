
import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import Forge from 'forge-apis'
import request from 'request'

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
  // Returns hub info
  //
  /////////////////////////////////////////////////////////////////
  async getHubs (getToken, opts = {}) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._hubsAPI.getHubs (
      opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns list of Hubs
  //
  /////////////////////////////////////////////////////////////////
  async getHub (getToken, hubId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._hubsAPI.getHub (
      hubId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns list of Projects for specific Hub
  //
  /////////////////////////////////////////////////////////////////
  async getProjects (getToken, hubId, opts = {}) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._projectsAPI.getHubProjects (
      hubId, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Project content
  //
  /////////////////////////////////////////////////////////////////
  async getProject (getToken, hubId, projectId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._projectsAPI.getProject(
      hubId, projectId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Project Top Folders
  // If the user has access to the project’s root folder,
  // it only returns details of the root folder.
  // If the user does not have access to the root folder,
  // it returns details of all the highest level folders in
  // the folder hierarchy the user has access to.
  //
  /////////////////////////////////////////////////////////////////
  async getProjectTopFolders (getToken, hubId, projectId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._projectsAPI.getProjectTopFolders(
      hubId, projectId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Folder
  //
  /////////////////////////////////////////////////////////////////
  async getFolder (getToken, projectId, folderId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._foldersAPI.getFolder(
      projectId, folderId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Folder content
  //
  /////////////////////////////////////////////////////////////////
  async getFolderContent (getToken, projectId, folderId, opts = {}) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._foldersAPI.getFolderContents(
      projectId, folderId, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Item details
  //
  /////////////////////////////////////////////////////////////////
  async getItem (getToken, projectId, itemId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._itemsAPI.getItem(
      projectId, itemId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Item tip version (most recent)
  //
  /////////////////////////////////////////////////////////////////
  async getItemTip (getToken, projectId, itemId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._itemsAPI.getItemTip(
      projectId, itemId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Versions for specific Item
  //
  /////////////////////////////////////////////////////////////////
  async getItemVersions (getToken, projectId, itemId, opts = {}) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._itemsAPI.getItemVersions(
      projectId, itemId, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Delete Item
  //
  /////////////////////////////////////////////////////////////////
  async deleteItem (getToken, projectId, itemId, opts = {}) {

    return new Promise(async(resolve, reject) => {

      try {

        const token = (typeof getToken == 'function')
          ? await getToken()
          : getToken

        const versionsRes = await this._itemsAPI.getItemVersions(
          projectId, itemId, opts, {autoRefresh:false}, token)

        const deleteTasks = versionsRes.body.data.map((version) => {

          return this.deleteVersion(
            token, projectId, version.id)
        })

        return Promise.all(deleteTasks)

      } catch (ex) {

        console.log(ex)
        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Version for specific versionId
  //
  /////////////////////////////////////////////////////////////////
  async getVersion (getToken, projectId, versionId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._versionsAPI.getVersion(
      projectId, versionId, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Delete Version
  //
  /////////////////////////////////////////////////////////////////
  async deleteVersion (getToken, projectId, versionId) {

    try {

      const token = (typeof getToken == 'function')
        ? await getToken()
        : getToken

      const versionsRes =
        await this._versionsAPI.getVersion(
          projectId, versionId,
          {autoRefresh:false}, token)

      const payload = this.createDeleteVersionPayload(
        versionsRes.body.data.relationships.item.data.id)

      //return this._versionsAPI.postVersion(
      //  projectId, JSON.stringify(payload),
      //  {autoRefresh:false}, token)

      const url =
        `${DMSvc.SERVICE_BASE_URL}/projects/` +
        `${projectId}/versions`

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

    } catch (ex) {

      Promise.reject (ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Storage location on OSS for DM
  //
  /////////////////////////////////////////////////////////////////
  async createStorage (getToken, projectId, folderId, filename) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    const payload = this.createStoragePayload (
      folderId, filename)

    //return this._projectsAPI.postStorage(
    //  projectId, JSON.stringify(payload),
    //  {autoRefresh:false}, token)

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/storage`

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
  // Creates new Item
  //
  /////////////////////////////////////////////////////////////////
  async createItem (
    getToken, projectId, folderId, objectId,
    displayName, isBIM = false) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    const payload = this.createItemPayload(
      folderId, objectId, displayName, isBIM)

    //return this._itemsAPI.postItem(
    //  projectId, JSON.stringify(payload),
    //  {autoRefresh:false}, token)

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/items`

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
  // Creates new Version
  //
  /////////////////////////////////////////////////////////////////
  async createVersion (getToken,
    projectId, itemId, objectId, displayName, isBIM) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    const payload = this.createVersionPayload(
      itemId, objectId, displayName, isBIM)

    //return this._versionsAPI.postVersion(
    //  projectId, JSON.stringify(payload),
    //  {autoRefresh:false}, token)

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/versions`

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
  // Get Item relationship References
  //
  /////////////////////////////////////////////////////////////////
  async getItemRelationshipsRefs (
    getToken, projectId, itemId, opts = {}) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._itemsAPI.getItemRelationshipsRefs(
      projectId, itemId, opts,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Create Item relationship reference
  //
  /////////////////////////////////////////////////////////////////
  async createItemRelationshipRef (
    getToken, projectId, targetItemId, refVersionId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    const payload = this.createItemRelationshipRefPayload(
      refVersionId)

    //return this._itemsAPI.postItemRelationshipsRef(
    //  projectId, targetItemId, JSON.stringify(payload),
    //  {autoRefresh:false}, token)

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/items/${targetItemId}/` +
      `relationships/refs`

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
  // Get Version relationship references
  //
  /////////////////////////////////////////////////////////////////
  async getVersionRelationshipsRefs (
    getToken, projectId, versionId, opts = {}) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    return this._versionsAPI.getVersionRelationshipsRefs(
      projectId, versionId, opts,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Create Version relationship reference
  //
  /////////////////////////////////////////////////////////////////
  async createVersionRelationshipRef (
    getToken, projectId, targetVersionId, refVersionId) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

    const payload = this.createVersionRelationshipRefPayload(
      refVersionId)

    //return this._versionsAPI.postVersionRelationshipsRef(
    //  projectId, targetVersionId, JSON.stringify(payload),
    //  {autoRefresh:false}, token)

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/versions/${targetVersionId}/` +
      `relationships/refs`

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
  // Create new folder
  //
  /////////////////////////////////////////////////////////////////
  async createFolder (
    getToken, projectId, parentFolderId, folderName) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

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
  async searchFolder (getToken, projectId, folderId, filter) {

    const token = (typeof getToken == 'function')
      ? await getToken()
      : getToken

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

  /////////////////////////////////////////////////////////
  // Upload file and create new item or new version
  //
  /////////////////////////////////////////////////////////
  upload (getToken, projectId, folderId, file, opts) {

    return new Promise(async(resolve, reject) => {

      try {

        const displayName = file.originalname

        const storageRes = await this.createStorage(
          getToken, projectId, folderId, displayName)

        const ossSvc = ServiceManager.getService(
          'OssSvc')

        const objectId = ossSvc.parseObjectId(
          storageRes.body.data.id)

        const dmOpts = Object.assign({}, opts, {
          onComplete: async(upload) => {

            try {

              // look for items with the same displayName
              const items =
                await this.findItemsWithAttributes(
                  getToken,
                  projectId,
                  folderId, {
                    displayName
                  })

              if (items.length > 0) {

                const item = items[0]

                const versionRes = await this.createVersion(
                  getToken, projectId, item.id,
                  storageRes.body.data.id,
                  displayName,
                  opts.isBIM)

                const response = {
                  version: versionRes.body.data,
                  storage: versionRes.body.data,
                  item: item,
                  upload
                }

                opts.onComplete(response)

              } else {

                const itemRes = await this.createItem(
                  getToken, projectId, folderId,
                  storageRes.body.data.id,
                  displayName,
                  opts.isBIM)

                const versions = await this.getItemVersions(
                  getToken, projectId, itemRes.body.data.id)

                const response = {
                  version: versions.body.data[0],
                  storage: storageRes.body.data,
                  item: itemRes.body.data,
                  upload
                }

                opts.onComplete(response)
              }

            } catch (ex) {

              opts.onError(ex)
            }
          }
        })

        const uploadRes =
          await ossSvc.uploadObjectChunked (
          getToken,
          objectId.bucketKey,
          objectId.objectKey,
          file, dmOpts)

        resolve(uploadRes)

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Items matching search criteria
  //
  /////////////////////////////////////////////////////////////////
  findItemsWithAttributes (
    getToken, projectId, folderId, attributes, recursive = false) {

    return new Promise(async(resolve, reject) => {

      try {

        const token = (typeof getToken == 'function')
          ? await getToken()
          : getToken

        const folderItems = await this.getFolderContent(
          token, projectId, folderId)

        const tasks = folderItems.body.data.map((folderItem) => {

          if (folderItem.type === 'items') {

            var match = true

            for (var key in attributes) {

              if(attributes[key] !== folderItem.attributes[key]){

                match = false
              }
            }

            if (match) {

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

        const items = await Promise.all(tasks)

        const filteredItems = items.filter((item) => {
          return item !== null
        })

        resolve(filteredItems)

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

    const payload = {
      jsonapi: {
        version: '1.0'
      },
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

    return payload
  }

  /////////////////////////////////////////////////////////////////
  // Creates item payload
  //
  /////////////////////////////////////////////////////////////////
  createItemPayload (folderId, objectId, displayName, isBIM) {

    const fileType = isBIM
      ? 'autodesk.bim360:File'
      : 'autodesk.core:File'

    const payload = {
      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'items',
        attributes: {
          displayName: displayName,
          extension: {
            type: `items:${fileType}`,
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
            type: `versions:${fileType}`,
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

    return payload
  }

  /////////////////////////////////////////////////////////////////
  // Creates version payload
  //
  /////////////////////////////////////////////////////////////////
  createVersionPayload (itemId, objectId, displayName, isBIM) {

    const fileType = isBIM
      ? 'autodesk.bim360:File'
      : 'autodesk.core:File'

    const payload = {
      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'versions',
        attributes: {
          name: displayName,
          extension: {
            type: `versions:${fileType}`,
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

    return payload
  }

  /////////////////////////////////////////////////////////////////
  // Creates delete version payload
  //
  /////////////////////////////////////////////////////////////////
  createDeleteVersionPayload (itemId) {

    const payload = {
      jsonapi: {
        version: '1.0'
      },
      data:{
        type: 'versions',
        attributes:{
          name: 'max-delete.max',
          extension:{
            type: 'versions:autodesk.core:Deleted',
            version: '1.0'
          }
        },
        relationships:{
          item:{
            data:{
              type: 'items',
              id: itemId
            }
          }
        }
      }
    }

    return payload
  }

  /////////////////////////////////////////////////////////////////
  // Creates item relationship payload
  //
  /////////////////////////////////////////////////////////////////
  createItemRelationshipRefPayload (refVersionId) {

    const payload = {
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

    return payload
  }

  /////////////////////////////////////////////////////////////////
  // Creates version relationship payload
  //
  /////////////////////////////////////////////////////////////////
  createVersionRelationshipRefPayload (refVersionId) {

    const  payload = {
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

    return payload
  }

  /////////////////////////////////////////////////////////////////
  // Creates new folder payload
  //
  /////////////////////////////////////////////////////////////////
  createFolderPayload (parentFolderId, folderName) {

    const  payload = {
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

    return payload
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
      agentOptions: {
        secureProtocol: 'TLSv1_2_method' // 'TLSv1.2'
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

        return resolve({body})

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}
