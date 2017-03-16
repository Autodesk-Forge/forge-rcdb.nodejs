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

module.exports = function () {

    var router = express.Router();

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.get('/:db', async(req, res) => {

      try {

        var db = req.params.db

        let dbSvc = ServiceManager.getService(db)

        if(!dbSvc) {

          res.status(404)
          res.json('Invalid database')
          return
        }

        let items = await dbSvc.getItems(
          dbSvc.config().collections.materials)

        res.json(items)

      } catch (ex) {

        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.get('/:db/:id', async (req, res) => {

      try {

        var db = req.params.db

        let dbSvc = ServiceManager.getService(db)

        if(!dbSvc) {

          res.status(404)
          res.json('Invalid database')
          return
        }

        var id = req.params.id

        let item = await dbSvc.findOne(
          dbSvc.config().collections.materials, {
            _id: id
          })

        res.json(item)

      } catch (ex) {

        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.post('/:db', async (req, res) => {

      try {

        var db = req.params.db

        let dbSvc = ServiceManager.getService(db)

        if(!dbSvc) {

          res.status(404)
          res.json('Invalid database')
          return
        }

        var material = req.body;

        const query = { name: material.name }

        const result = await dbSvc.upsertItem(
          dbSvc.config().collections.materials,
          material,
          query)

        res.json(material)

      } catch (ex) {

        res.status(ex.statusCode || 500)
        res.json(ex)
      }
    })

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.post('/reset', function (req, res) {

      var pageQuery = {};

      var fieldQuery = {};

      db.collection(config.materials, function (err, collection) {
        collection.find(fieldQuery, pageQuery)
          .sort({name: 1}).toArray(
          function (err, items) {

            if (err) {
              res.status(204); //HTTP 204: NO CONTENT
              res.err = err;
            }

            async.each(items,

              function (item, callback) {

                item.price = 1.0;
                item.currency = 'USD';

                collection.update(
                  {'_id': item._id},
                  item,
                  {safe: true},
                  function (err2, result) {

                    callback();
                  });
              },
              function (err) {

                res.send('ok')
              });
          });
      });
    });

    return router;
}
