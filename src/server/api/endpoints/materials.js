/////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////
import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import express from 'express'
import config from 'c0nfig'

module.exports = function () {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  const shouldCompress = (req, res) => {
    return true
  }

  router.use(compression({
    filter: shouldCompress
  }))

  ///////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////
  router.get('/:db', async(req, res) => {

    try {

      const db = req.params.db

      const dbSvc = ServiceManager.getService(
        config.database.dbName)

      const materialsConfig =
        config.database.materials[db]

      if (!materialsConfig) {

        res.status(404)
        res.json('Invalid config')
        return
      }

      const opts = {
        sort: {
          name: 1
        }
      }

      const items = await dbSvc.getItems(
        materialsConfig.collection,
        opts)

      res.json(items)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////
  router.get('/:db/:id', async (req, res) => {

    try {

      const db = req.params.db

      const dbSvc = ServiceManager.getService(
        config.database.dbName)

      const materialsConfig =
        config.database.materials[db]

      if (!materialsConfig) {

        res.status(404)
        res.json('Invalid config')
        return
      }

      const id = req.params.id

      const item = await dbSvc.findOne(
        materialsConfig.collection, {
          _id: id
        })

      res.json (item)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////
  router.post('/:db', async (req, res) => {

    try {

      const db = req.params.db

      const dbSvc = ServiceManager.getService(
        config.database.dbName)

      const materialsConfig =
        config.database.materials[db]

      if (!materialsConfig) {

        res.status(404)
        res.json('Invalid config')
        return
      }

      const material = req.body

      const query = { name: material.name }

      await dbSvc.upsert(
        materialsConfig.collection,
        material, query)

      res.json(material)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router;
}
