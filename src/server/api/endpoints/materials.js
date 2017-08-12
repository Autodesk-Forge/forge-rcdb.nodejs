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
import express from 'express'
import config from 'c0nfig'

module.exports = function () {

    const router = express.Router()

    const dbName = config.databases[0].dbName

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.get('/:config', async(req, res) => {

      try {

        const config = req.params.config

        const dbSvc = ServiceManager.getService(dbName)

        if (!dbSvc) {

          res.status(404)
          res.json('Invalid database')
          return
        }

        const collectionCfg = dbSvc.config.collections[config]

        const items = await dbSvc.getItems(
          collectionCfg.materials)

        res.json(items)

      } catch (ex) {

        console.log(ex)

        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.get('/:config/:id', async (req, res) => {

      try {

        const config = req.params.config

        const dbSvc = ServiceManager.getService(dbName)

        if (!dbSvc) {

          res.status(404)
          res.json('Invalid database')
          return
        }

        const id = req.params.id

        const collectionCfg = dbSvc.config.collections[config]

        const item = await dbSvc.findOne(
          collectionCfg.materials, {
            _id: id
          })

        res.json (item)

      } catch (ex) {

        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.post('/:config', async (req, res) => {

      try {

        const config = req.params.config

        const dbSvc = ServiceManager.getService(dbName)

        if (!dbSvc) {

          res.status(404)
          res.json('Invalid database')
          return
        }

        const material = req.body;

        const query = { name: material.name }

        const collectionCfg = dbSvc.config.collections[config]

        await dbSvc.upsertItem(
          collectionCfg.materials,
          material, query)

        res.json(material)

      } catch (ex) {

        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

    return router;
}
