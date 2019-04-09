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
import mongo from 'mongodb'
import config from 'c0nfig'
import WebPurify from 'webpurify';
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

  const wp = new WebPurify({
    api_key: config.webpurify_API_KEY
    //, endpoint:   'us'  // Optional, available choices: 'eu', 'ap'. Default: 'us'.
    //, enterprise: false // Optional, set to true if you are using the enterprise API, allows SSL
  });

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
        return res.json('Invalid collection')
      }

      const item = await dbSvc.findOne(
        materialsConfig.collection, {
          fieldQuery: {
            _id: new mongo.ObjectId(req.params.id)
          }
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
      console.log(db)
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
      const badwords = await checkProfanity(material.supplier)

      if (badwords === 0) {
        const query = { name: material.name }
        await dbSvc.upsert(
          materialsConfig.collection,
          material, query)
  
        res.json(material)        
      } else {
        res.status(400)
        res.json('mind your words mate..')
      }

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //  profanity checker
  async function checkProfanity(text){
    return wp.checkCount(text)
  }

  return router;
}
