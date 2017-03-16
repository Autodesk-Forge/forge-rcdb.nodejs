///////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
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
///////////////////////////////////////////////////////////////////////
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  ///////////////////////////////////////////////////////////////////////////
  // 2-legged client token: exposes a 'data:read' only token to client App
  //
  ///////////////////////////////////////////////////////////////////////////
  router.get('/token/2legged', async(req, res) => {

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.request2LeggedToken(['data:read'])

      res.json(token)
    }
    catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  return router
}
