
import ClientAPI from 'ClientAPI'

/////////////////////////////////////////////////////////
// DataManagement Client API to invoke REST API Exposed
// by our server (not Forge)
/////////////////////////////////////////////////////////
export default class DataManagementAPI extends ClientAPI {

  constructor (opts) {

    super (opts.apiUrl)
  }

  /////////////////////////////////////////////////////////
  // GET /hubs
  //
  /////////////////////////////////////////////////////////
  getHubs () {

    const url = `/hubs`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getHubHeader (hub) {

    switch (hub.attributes.extension.type) {

      case 'hubs:autodesk.a360:PersonalHub':
        return 'Hub'

      case 'hubs:autodesk.bim360:Account':
        return 'BIM Hub'

      case 'hubs:autodesk.core:Hub':
      default :
        return 'Team Hub'
    }
  }

  /////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects
  //
  /////////////////////////////////////////////////////////
  getProjects (hubId) {

    const url = `/hubs/${hubId}/projects`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId
  //
  /////////////////////////////////////////////////////////
  getProject (hubId, projectId) {

    const url = `/hubs/${hubId}/projects/${projectId}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId/topFolders
  //
  /////////////////////////////////////////////////////////
  getProjectTopFolders (hubId, projectId) {

    const url =
      `/hubs/${hubId}/projects/${projectId}/topFolders`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/folders/:folderId
  //
  /////////////////////////////////////////////////////////
  getFolder (projectId, folderId) {

    const url =
      `/projects/${projectId}/folders/${folderId}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/folders/:folderId
  //
  /////////////////////////////////////////////////////////
  getFolderContent (projectId, folderId) {

    const url =
      `/projects/${projectId}/folders/${folderId}/content`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId
  //
  /////////////////////////////////////////////////////////
  getItem (projectId, itemId) {

    const url = `/projects/${projectId}/items/${itemId}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // DELETE /projects/:projectId/items/:itemId
  //
  /////////////////////////////////////////////////////////
  deleteItem (projectId, itemId) {

    const url = `/projects/${projectId}/items/${itemId}`

    return this.ajax({
      type: 'DELETE',
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/versions
  //
  /////////////////////////////////////////////////////////
  getItemVersions (projectId, itemId) {

    const url =
      `/projects/${projectId}/items/${itemId}/versions`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/tip
  //
  /////////////////////////////////////////////////////////
  getItemTip (projectId, itemId) {

    const url =
      `/projects/${projectId}/items/${itemId}/tip`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/versions/:versionId
  //
  /////////////////////////////////////////////////////////
  getVersion (projectId, versionId) {

    const encodedVersionId = encodeURIComponent(versionId)

    const url =
      `/projects/${projectId}/versions/${encodedVersionId}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/relationships/refs
  //
  /////////////////////////////////////////////////////////
  getItemRelationshipsRefs (projectId, itemId) {

    const url =
      `/projects/${projectId}/items/${itemId}/relationships/refs`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET /projects/:projectId/versions/:versionId/relationships/refs
  //
  /////////////////////////////////////////////////////////
  getVersionRelationshipsRefs (projectId, versionId) {

    const encodedVersionId = encodeURIComponent(versionId)

    const url =
      `/projects/${projectId}/versions/` +
      `${encodedVersionId}/relationships/refs`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // POST /projects/:projectId/items/:itemId/relationships
  //
  /////////////////////////////////////////////////////////
  postItemRelationshipRef (
    projectId, itemId, refVersionId) {

    const url =
      `/projects/${projectId}/items/${itemId}/relationships/refs`

    const data = {
      payload: JSON.stringify({
        refVersionId
      })
    }

    return this.ajax({
      rawBody: true,
      type: 'POST',
      data,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // POST /projects/:projectId/versions/:versionId/relationships
  //
  /////////////////////////////////////////////////////////
  postVersionRelationshipRef (
    projectId, versionId, refVersionId) {

    const encodedVersionId = encodeURIComponent(versionId)

    const url =
      `/projects/${projectId}/versions/` +
      `${encodedVersionId}/relationships/refs`

    const data = {
      payload: JSON.stringify({
        refVersionId
      })
    }

    return this.ajax({
      rawBody: true,
      type: 'POST',
      data,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // POST /projects/:projectId/folders
  //
  /////////////////////////////////////////////////////////
  postFolder (projectId, parentFolderId, folderName) {

    const url = `/projects/${projectId}/folders`

    const data = {
      payload: JSON.stringify({
        parentFolderId,
        folderName
      })
    }

    return this.ajax({
      rawBody: true,
      type: 'POST',
      data,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // parse an objectId to return {bucketKey, objectKey} pair
  //
  /////////////////////////////////////////////////////////
  parseObjectId (objectId) {

    const parts = objectId.split('/')

    const bucketKey = parts[0].split(':').pop()

    const objectKey = parts[1]

    return {
      bucketKey,
      objectKey
    }
  }

  /////////////////////////////////////////////////////////
  // Download object from version
  //
  /////////////////////////////////////////////////////////
  download (version) {

    // retrieves bucketKey/objectKey from storage Id

    const objectId = this.parseObjectId(
      version.relationships.storage.data.id)

    const uri =
      `/buckets/${objectId.bucketKey}/objects/${objectId.objectKey}`

    const link = document.createElement('a')

    link.download = version.attributes.displayName
    link.href = uri

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getVersionURN (version, useStorage = false) {

    if (!useStorage) {

      if (version.relationships.derivatives) {
        
        return version.relationships.derivatives.data.id
      }
    }

    if (version.relationships.storage) {

      const urn = window.btoa(
        version.relationships.storage.data.id)

      return urn.replace(new RegExp('=', 'g'), '')
    }

    return null
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  upload (projectId, folderId, file, opts = {}) {

    const url = `/projects/${projectId}/folders/${folderId}`

    const options = Object.assign({}, {
      tag: 'model'
    }, opts)

    return super.upload (url, file, options)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteItem (projectId, itemId) {

    const url = `/projects/${projectId}/items/${itemId}`

    return this.ajax({
      type: 'DELETE',
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteVersion (projectId, versionId) {

    const url = `/projects/${projectId}/versions/${versionId}`

    return this.ajax({
      type: 'DELETE',
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  searchFolder (projectId, folderId, filter) {

    const url =
      `/projects/${projectId}/folders/${folderId}/` +
      `search/${filter}`

    return this.ajax({
      rawBody: true,
      url
    })
  }
}

