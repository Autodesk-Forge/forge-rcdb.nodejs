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
import mongo from 'mongodb'
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
  router.get('/:db', async (req, res) => {
    try {
      const db = req.params.db

      const dbSvc = ServiceManager.getService(
        config.database.dbName)

      const materialsConfig =
        config.database.materials[db] || db

      if (!materialsConfig) {
        res.status(404)
        res.json('Invalid config')
        return
      }

      const opts = {
        sort: {
          name: 1
        },
        query: JSON.parse(req.query.query || null)
      }
      if (process.env.NODE_ENV == 'development') { console.log(opts) }
      const items = await (opts.query ? dbSvc.findMany(materialsConfig, opts) : dbSvc.getItems(
        materialsConfig.collection,
        opts))

      res.json(items)
      if (process.env.NODE_ENV == 'development') { console.log(items) }
    } catch (ex) {
      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  router.get('/:db/:id', async (req, res) => {
    try {
      const db = req.params.db

      const dbSvc = ServiceManager.getService(
        config.database.dbName)

      const materialsConfig =
        config.database.materials[db]

      if (!materialsConfig) {
        res.status(404)
        return res.json('Invalid collection')
      }

      const item = await dbSvc.findOne(
        materialsConfig.collection, {
          fieldQuery: {
            _id: new mongo.ObjectId(req.params.id)
          }
        })

      res.json(item)
    } catch (ex) {
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
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

      const query = { _id: new mongo.ObjectId(material._id) }
      if (process.env.NODE_ENV == 'development') { console.log(material, query) }
      delete material._id
      await dbSvc.upsert(
        materialsConfig.collection,
        material, query)

      res.json(material)
    } catch (ex) {
      if (process.env.NODE_ENV == 'development') { console.log(ex) }
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  router.post('/:db/:id', async (req, res) => {
    try {
      const db = req.params.db

      const dbSvc = ServiceManager.getService(
        config.database.dbName)

      const material = req.body

      const query = { model_id: req.params.id, dbid: material.dbid }
      if (process.env.NODE_ENV == 'development') { console.log(material, query) }
      delete material._id
      await dbSvc.upsert(
        db,
        material, query)

      res.json(material)
    } catch (ex) {
      if (process.env.NODE_ENV == 'development') { console.log(ex) }
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}
