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
import { OAuth2 } from 'oauth'
import express from 'express'
import config from 'c0nfig'

module.exports = function() {

  const router = express.Router()

  /////////////////////////////////////////////////////////
  // Initialize OAuth library
  //
  /////////////////////////////////////////////////////////

  const oauth2 = new OAuth2(
    config.forge.oauth.clientId,
    config.forge.oauth.clientSecret,
    config.forge.oauth.baseUri,
    config.forge.oauth.authorizationUri,
    config.forge.oauth.accessTokenUri,
    null)

  /////////////////////////////////////////////////////////
  // login endpoint
  //
  /////////////////////////////////////////////////////////
  router.post('/login', (req, res) => {

    req.session.redirect = req.body.origin || '/'

    const authURL = oauth2.getAuthorizeUrl({
      redirect_uri: config.forge.oauth.redirectUri,
      scope: config.forge.oauth.scope.join(' ')
    })

    res.json(authURL + '&response_type=code')
  })

  /////////////////////////////////////////////////////////
  // logout endpoint
  //
  /////////////////////////////////////////////////////////
  router.post('/logout', (req, res) => {

    const forgeSvc = ServiceManager.getService(
      'ForgeSvc')

    forgeSvc.delete3LeggedToken(req.session)

    res.json('success')
  })

  /////////////////////////////////////////////////////////
  // GET /clientId
  // Get Forge app clientId
  //
  /////////////////////////////////////////////////////////
  router.get('/clientId', async (req, res) => {

    try {

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      res.json({
        clientId: forgeSvc.clientId
      })

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /user
  // Get current user
  //
  /////////////////////////////////////////////////////////
  router.get('/user', async (req, res) => {

    try {

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const response = await forgeSvc.getUser(token)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // Reply looks as follow:
  //
  //  access_token: "...",
  //  refresh_token: "...",
  //  results: {
  //    token_type: "Bearer",
  //    expires_in: 86399,
  //    access_token: "..."
  //  }
  //
  /////////////////////////////////////////////////////////
  router.get('/callback/oauth', (req, res) => {

    // filter out errors (access_denied, ...)
    if (req.query && req.query.error) {

      return res.redirect(req.session.redirect)
    }

    if (!req.query || !req.query.code) {

      return res.redirect(req.session.redirect)
    }

    oauth2.getOAuthAccessToken(
      req.query.code, {
        grant_type: 'authorization_code',
        redirect_uri: config.forge.oauth.redirectUri
      },
      (err, access_token, refresh_token, results) => {

        try {

          if (err) {

            return res.redirect(req.session.redirect)
          }

          var forgeSvc = ServiceManager.getService(
            'ForgeSvc')

          var token = {
            scope: config.forge.oauth.scope,
            expires_in: results.expires_in,
            refresh_token: refresh_token,
            access_token: access_token
          }

          forgeSvc.set3LeggedTokenMaster(
            req.session, token)

          return res.redirect(req.session.redirect)

        } catch (ex) {

          return res.redirect(req.session.redirect)
        }
      })
  })

  /////////////////////////////////////////////////////////
  // reduced scope token
  // Not needed here because of proxy use
  //
  /////////////////////////////////////////////////////////
  //router.get('/token/3legged', async (req, res) => {
  //
  //  const forgeSvc = ServiceManager.getService(
  //    'ForgeSvc')
  //
  //  try {
  //
  //    const token = await forgeSvc.get3LeggedTokenClient(
  //      req.session,
  //      'viewable:read')
  //
  //    res.json({
  //      expires_in: forgeSvc.getExpiry(token),
  //      access_token: token.access_token,
  //      scope: token.scope
  //    })
  //
  //  } catch (error) {
  //
  //    forgeSvc.delete3LeggedToken(req.session)
  //
  //    res.status(error.statusCode || 404)
  //    res.json(error)
  //  }
  //})

  return router
}
