/// //////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
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
/// //////////////////////////////////////////////////////////////////////////////
import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import express from 'express'
import config from 'c0nfig'

export default function () {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  const router = express.Router()

  const shouldCompress = (req, res) => {
    return true
  }

  router.use(compression({
    filter: shouldCompress
  }))

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  const getToken = (req) => {
    const forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

    switch (req.params.auth) {
      case '2legged':

        return forgeSvc.get2LeggedToken()

      case '3legged':

        return forgeSvc.get3LeggedTokenMaster(req.session)

      default:

        return Promise.reject({
          msg: 'Invalid auth parameter, must be [2legged, 3legged]',
          statusCode: 401
        })
    }
  }

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.get('/:auth/health', async (req, res) => {
    try {
      const toolkitSvc = ServiceManager.getService(
        'AR-VR-ToolkitSvc')

      const health = await toolkitSvc.getHealth()

      res.json(health)
    } catch (ex) {
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.get('/:auth/manifest/:urn', async (req, res) => {
    try {
      const toolkitSvc = ServiceManager.getService(
        'AR-VR-ToolkitSvc')

      const token = await getToken(req)

      const urn = req.params.urn

      const manifest =
        await toolkitSvc.getManifest(
          token.access_token, urn)

      res.json(manifest)
    } catch (ex) {
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.get('/:auth/:urn/scenes/:sceneId',
    async (req, res) => {
      try {
        const toolkitSvc = ServiceManager.getService(
          'AR-VR-ToolkitSvc')

        const token = await getToken(req)

        const { sceneId, urn } = req.params

        const scene =
        await toolkitSvc.getScene(
          token.access_token,
          urn, sceneId)

        res.json(scene)
      } catch (ex) {
        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.get('/:auth/projects/:projectId/versions/:versionId/scenes/:sceneId',
    async (req, res) => {
      try {
        const toolkitSvc = ServiceManager.getService(
          'AR-VR-ToolkitSvc')

        const token = await getToken(req)

        const { projectId, sceneId, versionId } = req.params

        const scene =
        await toolkitSvc.getScene3Legged(
          token.access_token,
          projectId, versionId, sceneId)

        res.json(scene)
      } catch (ex) {
        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.get('/:auth/:urn/instanceTree/:sceneId',
    async (req, res) => {
      try {
        const toolkitSvc = ServiceManager.getService(
          'AR-VR-ToolkitSvc')

        const token = await getToken(req)

        const { sceneId, urn } = req.params

        const instanceTree =
        await toolkitSvc.getInstanceTree(
          token.access_token,
          urn, sceneId)

        res.json(instanceTree)
      } catch (ex) {
        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.put('/:auth/scenes', async (req, res) => {
    try {
      const toolkitSvc = ServiceManager.getService(
        'AR-VR-ToolkitSvc')

      const token = await getToken(req)

      const { auth } = req.params

      const {
        sceneId, sceneDef, options,
        projectId, versionId,
        urn
      } = req.body

      switch (auth) {
        case '2legged':

          const scene2LeggedRes =
            await toolkitSvc.createScene(
              token.access_token,
              urn, sceneId, sceneDef, options)

          return res.json(scene2LeggedRes)

        case '3legged':

          const scene3LeggedRes =
            await toolkitSvc.createScene3Legged(
              token.access_token,
              projectId, versionId,
              sceneId, sceneDef, options)

          return res.json(scene3LeggedRes)

        default:

          return Promise.reject({
            msg: 'Invalid auth parameter, must be [2legged, 3legged]',
            statusCode: 401
          })
      }
    } catch (ex) {
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.post('/:auth/scenes', async (req, res) => {
    try {
      const toolkitSvc = ServiceManager.getService(
        'AR-VR-ToolkitSvc')

      const token = await getToken(req)

      const { sceneId, urn } = req.body

      const processRes =
        await toolkitSvc.processScene(
          token.access_token,
          urn, sceneId)

      return res.json(processRes)
    } catch (ex) {
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.delete('/:auth/:urn/scenes/:sceneId', async (req, res) => {
    try {
      const toolkitSvc = ServiceManager.getService(
        'AR-VR-ToolkitSvc')

      const token = await getToken(req)

      const { urn, sceneId } = req.params

      const deleteRes =
        await toolkitSvc.deleteScene(
          token.access_token,
          urn, sceneId)

      return res.json(deleteRes)
    } catch (ex) {
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.delete('/:auth/projects/:projectId/versions/:versionId/scenes/:sceneId',
    async (req, res) => {
      try {
        const toolkitSvc = ServiceManager.getService(
          'AR-VR-ToolkitSvc')

        const token = await getToken(req)

        const { projectId, versionId, sceneId } = req.params

        const deleteRes =
        await toolkitSvc.deleteScene3Legged(
          token.access_token,
          projectId, versionId, sceneId)

        res.json(deleteRes)
      } catch (ex) {
        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

  return router
}
