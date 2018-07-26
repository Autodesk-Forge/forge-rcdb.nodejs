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
import BaseSvc from './BaseSvc'
import Forge from 'forge-apis'
import memoize from 'memoizee'
import request from 'request'
import moment from 'moment'
import crypto from 'crypto'

export default class ForgeSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static BASE_HOOKS_URL =
    'https://developer.api.autodesk.com/webhooks/v1'

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    // will return same result if query arguments are
    // identical { sessionId, refreshToken }

    this.__refresh3LeggedTokenMemo = memoize(

      (session, scope) => {

        return this.__refresh3LeggedToken(
          session, scope)

      }, {

        normalizer: (args) => {

          const memoId = {
            refreshToken: args[0].forge.refreshToken,
            sessionId: args[0].id
          }

          return JSON.stringify(JSON.stringify(memoId))
        },
        promise: true
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name () {

    return 'ForgeSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get clientId () {

    return this._config.oauth.clientId
  }

  /////////////////////////////////////////////////////////
  // Returns current logged in user
  //
  /////////////////////////////////////////////////////////
  async getUser (session) {

    if (!session.forge) {

      return null
    }

    const token =
      await this.get3LeggedTokenMaster(
        session)

    const url =
      `${this._config.oauth.baseUri}` +
      `/userprofile/v1/users/@me`

    return this.requestAsync({
      token: token.access_token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////
  // Return token expiry in seconds
  //
  /////////////////////////////////////////////////////////
  getExpiry (token) {

    const age = moment().diff(token.time_stamp, 'seconds')

    return token.expires_in - age
  }

  /////////////////////////////////////////////////////////
  // Stores 2Legged token
  //
  /////////////////////////////////////////////////////////
  set2LeggedToken (token) {

    //store current time
    token.time_stamp = moment().format()

    this._2LeggedToken = token
  }

  /////////////////////////////////////////////////////////
  // return master token (full privileges),
  // refresh automatically if expired
  //
  /////////////////////////////////////////////////////////
  get2LeggedToken () {

    return new Promise(async(resolve, reject) => {

      try {

        var token = this._2LeggedToken

        if (!token) {

          token = await this.request2LeggedToken(
            this._config.oauth.scope)

          this.set2LeggedToken(token)
        }

        if (this.getExpiry(token) < 60) {

          token = await this.request2LeggedToken(
            this._config.oauth.scope)

          this.set2LeggedToken(token)
        }

        resolve(token)

      } catch (ex){

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Request new 2-legged with specified scope
  //
  /////////////////////////////////////////////////////////
  request2LeggedToken (scope) {

    const oAuth2TwoLegged = new Forge.AuthClientTwoLegged(
      this._config.oauth.clientId,
      this._config.oauth.clientSecret,
      Array.isArray(scope) ? scope : [scope])

    return oAuth2TwoLegged.authenticate()
  }

  /////////////////////////////////////////////////////////
  // Stores 3Legged token
  //
  /////////////////////////////////////////////////////////
  set3LeggedTokenMaster (session, token) {

    //store current time
    token.time_stamp = moment().format()

    session.forge = session.forge || {
      refreshToken: token.refresh_token
    }

    session.forge.masterToken = token
  }

  /////////////////////////////////////////////////////////
  // Get 3Legged token
  //
  /////////////////////////////////////////////////////////
  get3LeggedTokenMaster (session) {

    return new Promise(async(resolve, reject) => {

      try {

        if (!session.forge) {

          return reject ({
            status:404,
            msg: 'Not Found'
          })
        }

        var token = session.forge.masterToken

        if(this.getExpiry(token) < 60) {

          token = await this.refresh3LeggedToken (
            session,
            this._config.oauth.scope.join(' '))

          this.set3LeggedTokenMaster(
            session, token)
        }

        resolve(token)

      } catch (ex){

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Stores 3Legged token for client (reduced privileges)
  //
  /////////////////////////////////////////////////////////
  set3LeggedTokenClient (session, token) {

    //store current time
    token.time_stamp = moment().format()

    session.forge.clientToken = token
  }

  /////////////////////////////////////////////////////////
  // Get 3Legged token for client (reduced privileges)
  //
  /////////////////////////////////////////////////////////
  get3LeggedTokenClient (session, scope) {

    return new Promise(async(resolve, reject) => {

      try {

        const scopeStr = Array.isArray(scope)
          ? scope.join(' ')
          : scope

        if (!session.forge) {

          return reject({
            status:404,
            msg: 'Not Found'
          })

        } else if(!session.forge.clientToken) {

          // request a downgraded token
          // to provide to client App

          const clientToken =
            await this.refresh3LeggedToken (
              session, scopeStr)

          this.set3LeggedTokenClient(
            session, clientToken)
        }

        var token = session.forge.clientToken

        if(this.getExpiry(token) < 60) {

          token = await this.refresh3LeggedToken (
            session, scopeStr)

          this.set3LeggedTokenClient(
            session, token)
        }

        resolve(token)

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Delete 3 legged token (user logout)
  //
  /////////////////////////////////////////////////////////
  logout (session) {

    session.forge = null
  }

  /////////////////////////////////////////////////////////
  // Ensure returned token has requested scope
  //
  /////////////////////////////////////////////////////////
  refresh3LeggedToken (session, requestedScope) {

    return new Promise(async(resolve, reject) => {

      try {

        let token = null

        while (true) {

          token = await this.__refresh3LeggedTokenMemo(
            session, requestedScope)

          if (token.scope !== requestedScope) {

            this.sleep(1000)

          } else {

            break
          }
        }

        resolve (token)

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  generateCryptoToken({
    stringBase = 'base64',
    byteLength = 48 } = {}) {

    return new Promise((resolve, reject) => {
      crypto.randomBytes(byteLength, (err, buffer) => {
        return err
          ? reject(err)
          : resolve(buffer.toString(stringBase))
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Refresh 3-legged token with specified scope
  //
  /////////////////////////////////////////////////////////
  __refresh3LeggedToken (session, scope) {

    return new Promise((resolve, reject) => {

      const url = this._config.oauth.baseUri +
        this._config.oauth.refreshTokenUri

      request({
        url: url,
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        agentOptions: {
          secureProtocol: 'TLSv1_2_method' // 'TLSv1.2'
        },
        json: true,
        form: {
          client_secret: this._config.oauth.clientSecret,
          client_id: this._config.oauth.clientId,
          refresh_token: session.forge.refreshToken,
          grant_type: 'refresh_token',
          scope: scope
        }

      }, (err, response, body) => {

        try {

          if (err) {

            return reject(err)
          }

          if (body && body.errors) {

            return reject(body.errors)
          }

          if([200, 201, 202].indexOf(
              response.statusCode) < 0){

            return reject(response)
          }

          session.forge.refreshToken =
            body.refresh_token

          body.scope = scope

          return resolve (body)

        } catch (ex) {

          return reject(ex)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  sleep (ms) {
    return new Promise((resolve)=> {
      setTimeout(()=> {
        resolve()
      }, ms)
    })
  }

  /////////////////////////////////////////////////////////
  // REST request wrapper
  //
  /////////////////////////////////////////////////////////
  requestAsync(params) {

    return new Promise( function(resolve, reject) {

      request({

        url: params.url,
        method: params.method || 'GET',
        headers: params.headers || {
          'Authorization': 'Bearer ' + params.token
        },
        agentOptions: {
          secureProtocol: 'TLSv1_2_method' // 'TLSv1.2'
        },
        json: params.json,
        body: params.body

      }, function (err, response, body) {

        try {

          if (err) {

            return reject(err)
          }

          if (body && body.errors) {

            return reject(body.errors)
          }

          if (response && [200, 201, 202, 204].indexOf(
              response.statusCode) < 0) {

            return reject(response.statusMessage)
          }

          return resolve(body ? (body.data || body) : {})

        } catch (ex) {

          return reject(ex)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////
  // GET systems/:system_id/events/:event_id/hooks/:hook_id
  //
  /////////////////////////////////////////////////////////
  getHook (token, systemId, eventId, hookId) {

    const url =
      `${ForgeSvc.BASE_HOOKS_URL}/systems/` +
      `${systemId}/events/${eventId}/hooks/${hookId}`

    return this.requestAsync({
      token: token.access_token,
      json: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET systems/:system_id/hooks
  //
  /////////////////////////////////////////////////////////
  getSystemHooks (token, systemId) {

    const url =
      `${ForgeSvc.BASE_HOOKS_URL}/systems/${systemId}/hooks`

    return this.requestAsync({
      token: token.access_token,
      json: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET systems/:system_id/events/:event_id/hooks
  //
  /////////////////////////////////////////////////////////
  getEventHooks (token, systemId, eventId) {

    const url =
      `${ForgeSvc.BASE_HOOKS_URL}/systems/` +
      `${systemId}/events/${eventId}/hooks`

    return this.requestAsync({
      token: token.access_token,
      json: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // GET hooks
  //
  /////////////////////////////////////////////////////////
  getHooks (token) {

    const url = `${ForgeSvc.BASE_HOOKS_URL}/hooks`

    return this.requestAsync({
      token: token.access_token,
      json: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // POST systems/:system_id/events/:event_id/hooks
  //
  /////////////////////////////////////////////////////////
  createEventHook (token, systemId, eventId, params) {

    const url =
      `${ForgeSvc.BASE_HOOKS_URL}/systems/` +
      `${systemId}/events/${eventId}/hooks`

    const body = Object.assign({}, params, {
      callbackUrl: this._config.hooks.callbackUrl
    })

    return this.requestAsync({
      token: token.access_token,
      method: 'POST',
      json: true,
      body,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // POST systems/:system_id/hooks
  //
  /////////////////////////////////////////////////////////
  createSystemHook (token, systemId, params) {

    const url =
      `${ForgeSvc.BASE_HOOKS_URL}/systems/` +
      `${systemId}/hooks`

    const body = Object.assign({}, params, {
      callbackUrl: this._config.hooks.callbackUrl
    })

    return this.requestAsync({
      token: token.access_token,
      method: 'POST',
      json: true,
      body,
      url
    })
  }

  /////////////////////////////////////////////////////////
  // DELETE systems/:system_id/events/:event_id/hooks/:hook_id
  //
  /////////////////////////////////////////////////////////
  removeHook (token, systemId, eventId, hookId) {

    const url =
      `${ForgeSvc.BASE_HOOKS_URL}/systems/` +
      `${systemId}/events/${eventId}/hooks/${hookId}`

    return this.requestAsync({
      token: token.access_token,
      method: 'DELETE',
      url
    })
  }
}
