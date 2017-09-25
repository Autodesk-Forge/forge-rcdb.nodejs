//
// Copyright (c) Autodesk, Inc. All rights reserved
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//
// Forge Extractor
// by Philippe Leefsma (original version by Cyrille Fauvel)
//
import flattenDeep from 'lodash/flattenDeep'
import BaseSvc from './BaseSvc'
import archiver from 'archiver'
import Forge from 'forge-apis'
import request from 'request'
import mkdirp from 'mkdirp'
import Zip from 'node-zip'
import Zlib from 'zlib'
import path from 'path'
import _ from 'lodash'
import fs from 'fs'

export default class ExtractorSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    this.derivativesAPI = new Forge.DerivativesApi()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name () {

    return 'ExtractorSvc'
  }

  /////////////////////////////////////////////////////////
  // Create directory async
  //
  /////////////////////////////////////////////////////////
  mkdirpAsync (dir) {

    return new Promise((resolve, reject) => {
      mkdirp(dir, (error) => {
        return error
          ? reject (error)
          : resolve()
      })
    })
  }

  /////////////////////////////////////////////////////////
  // download all URN resources to target directory
  // (unzipped)
  //
  /////////////////////////////////////////////////////////
	download (getToken, urn, directory) {

		return new Promise (async (resolve, reject) => {

      // make sure target dir exists
      await this.mkdirpAsync (directory)

      // get token, can be object token or an async
      // function that returns the token
      const token = ((typeof getToken == 'function')
        ? await getToken()
        : getToken)

      // get URN top level manifest
      const manifest =
        await this.derivativesAPI.getManifest (
          urn, {}, {autoRefresh:false}, token)

      // harvest derivatives
      const derivatives = await this.getDerivatives (
        getToken, manifest.body)

      // format derivative resources
      const nestedDerivatives = derivatives.map((item) => {

          return item.files.map((file) => {

            const localPath = path.resolve(
                directory, item.localPath)

            return {
              basePath: item.basePath,
              guid: item.guid,
              mime: item.mime,
              fileName: file,
              urn: item.urn,
              localPath
            }
          })
        })

      // flatten resources
      const derivativesList = flattenDeep(
        nestedDerivatives)

      // creates async download tasks for each
      // derivative file
      const downloadTasks = derivativesList.map(
        (derivative) => {

        return new Promise(async(resolve) => {

          const urn = path.join(
            derivative.basePath,
            derivative.fileName)

          const data = await this.getDerivative(
            getToken, urn)

          const filename = path.resolve(
            derivative.localPath,
            derivative.fileName)

          await this.saveToDisk(data, filename)

          resolve(filename)
        })
      })

      // wait for all files to be downloaded
      const files = await Promise.all(downloadTasks)

      resolve(files)
    })
	}

  /////////////////////////////////////////////////////////
  // Parse top level manifest to collect derivatives
  //
  /////////////////////////////////////////////////////////
  parseManifest (manifest) {

    const items = []

    const parseNodeRec = (node) => {

      const roles = [
        'Autodesk.CloudPlatform.DesignDescription',
        'Autodesk.CloudPlatform.PropertyDatabase',
        'Autodesk.CloudPlatform.IndexableContent',
        'leaflet-zip',
        'thumbnail',
        'graphics',
        'preview',
        'raas',
        'pdf',
        'lod',
      ]

      if (roles.includes(node.role)) {

        const item = {
          guid: node.guid,
          mime: node.mime
        }

        const pathInfo = this.getPathInfo(node.urn)

        items.push (Object.assign({}, item, pathInfo))
      }

      if (node.children) {

        node.children.forEach ((child) => {

          parseNodeRec (child)
        })
      }
    }

    parseNodeRec({
      children: manifest.derivatives
    })

    return items
  }

  /////////////////////////////////////////////////////////
  // Collect derivatives for SVF
  //
  /////////////////////////////////////////////////////////
  getSVFDerivatives (getToken, item) {

    return new Promise(async(resolve, reject) => {

      try {

        const svfPath = item.urn.slice (
          item.basePath.length)

        const files = [svfPath]

        const data = await this.getDerivative (
          getToken, item.urn)

        const pack = new Zip (data, {
          checkCRC32: true,
          base64: false
        })

        const manifestData =
          pack.files['manifest.json'].asNodeBuffer()

        const manifest = JSON.parse (
          manifestData.toString('utf8'))

        if (manifest.assets) {

          manifest.assets.forEach((asset) => {

            // Skip SVF embedded resources
            if (asset.URI.indexOf('embed:/') === 0) {
              return
            }

            files.push(asset.URI)
          })
        }

        return resolve(
          Object.assign({}, item, {
            files
          }))

      } catch (ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Collect derivatives for F2D
  //
  /////////////////////////////////////////////////////////
  getF2dDerivatives (getToken, item) {

    return new Promise(async(resolve, reject) => {

      try {

        const files = ['manifest.json.gz']

        const manifestPath = item.basePath +
          'manifest.json.gz'

        const data = await this.getDerivative (
          getToken, manifestPath)

        const manifestData = Zlib.gunzipSync(data)

        const manifest = JSON.parse (
          manifestData.toString('utf8'))

        if (manifest.assets) {

          manifest.assets.forEach((asset) => {

            // Skip SVF embedded resources
            if (asset.URI.indexOf('embed:/') === 0) {
              return
            }

            files.push(asset.URI)
          })
        }

        return resolve(
          Object.assign({}, item, {
            files
          }))

      } catch (ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Get all derivatives from top level manifest
  //
  /////////////////////////////////////////////////////////
	getDerivatives (getToken, manifest) {

    return new Promise(async(resolve, reject) => {

      const items = this.parseManifest(manifest)

      const derivativeTasks = items.map((item) => {

        switch (item.mime) {

          case 'application/autodesk-svf':
            return this.getSVFDerivatives(
              getToken, item)

          case 'application/autodesk-f2d':
            return this.getF2dDerivatives(
              getToken, item)

          case 'application/autodesk-db':
            return Promise.resolve(
              Object.assign({}, item, {
                files: [
                  'objects_attrs.json.gz',
                  'objects_vals.json.gz',
                  'objects_offs.json.gz',
                  'objects_ids.json.gz',
                  'objects_avs.json.gz',
                  item.rootFileName
                ]}))

          default:
            return Promise.resolve(
              Object.assign({}, item, {
                files: [
                  item.rootFileName
              ]}))
        }
      })

      const derivatives = await Promise.all(
        derivativeTasks)

      return resolve(derivatives)
    })
	}

  /////////////////////////////////////////////////////////
  // Generate path information from URN
  //
  /////////////////////////////////////////////////////////
  getPathInfo (encodedURN) {

		const urn = decodeURIComponent(encodedURN)

    const rootFileName = urn.slice (
      urn.lastIndexOf ('/') + 1)

		const basePath = urn.slice (
      0, urn.lastIndexOf ('/') + 1)

		const localPathTmp = basePath.slice (
      basePath.indexOf ('/') + 1)

		const localPath = localPathTmp.replace (
      /^output\//, '')

    return {
      rootFileName,
      localPath,
      basePath,
      urn
    }
	}

  /////////////////////////////////////////////////////////
  // Get derivative data for specific URN
  //
  /////////////////////////////////////////////////////////
	getDerivative (getToken, urn) {

    return new Promise(async(resolve, reject) => {

      const baseUrl = 'https://developer.api.autodesk.com/'

      const url = baseUrl +
        `derivativeservice/v2/derivatives/${urn}`

      const token = ((typeof getToken == 'function')
        ? await getToken()
        : getToken)

      request({
        url,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token.access_token,
          'Accept-Encoding': 'gzip, deflate'
        },
        encoding: null
      }, (err, response, body) => {

        if (err) {

          return reject(err)
        }

        if (body && body.errors) {

          return reject(body.errors)
        }

        if ([200, 201, 202].indexOf(
            response.statusCode) < 0) {

          return reject(response)
        }

        return resolve(body || {})
      })
    })
	}

  /////////////////////////////////////////////////////////
  // Save data to disk
  //
  /////////////////////////////////////////////////////////
  saveToDisk (data, filename) {

    return new Promise(async(resolve, reject) => {

      await this.mkdirpAsync(path.dirname(filename))

      const wstream = fs.createWriteStream(filename)

      const ext = path.extname(filename)

      wstream.on('finish', () => {

        resolve()
      })

      if (typeof data === 'object' && ext === '.json') {

        wstream.write(JSON.stringify(data))

      } else {

        wstream.write(data)
      }

      wstream.end()
    })
  }

  /////////////////////////////////////////////////////////
  // Create a zip
  //
  /////////////////////////////////////////////////////////
  createZip (rootDir, zipfile, zipRoot, files) {

    return new Promise((resolve, reject) => {

      try {

        const output = fs.createWriteStream(zipfile)

        const archive = archiver('zip')

        output.on('close', () => {

          resolve()
        })

        archive.on('error', (err) => {

           reject(err)
        })

        archive.pipe(output)

        if (files) {

          files.forEach((file) => {

            try {

              const rs = fs.createReadStream(file)

              archive.append(rs, {
                name:
                  `${zipRoot}/${file.replace(rootDir, '')}`
              })

            } catch(ex){

              console.log(ex)
            }
          })

        } else {

          archive.bulk([ {
            expand: false,
            src: [rootDir + '/*']
          }])
        }

        archive.finalize()

      } catch (ex) {

        reject(ex)
      }
    })
  }
}

