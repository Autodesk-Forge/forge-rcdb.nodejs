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
import ForgeOAuth from 'forge-oauth2'
import BaseSvc from './BaseSvc'
import request from 'request'
import moment from 'moment'

export default class ForgeSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (opts) {

    super (opts)

    this._2leggedAPI = new ForgeOAuth.TwoLeggedApi()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'ForgeSvc'
  }

  /////////////////////////////////////////////////////////////////
  // Return token expiry in seconds
  //
  /////////////////////////////////////////////////////////////////
  getExpiry (token) {

    var age = moment().diff(token.time_stamp, 'seconds')

    return token.expires_in - age
  }

  /////////////////////////////////////////////////////////////////
  // Stores 2Legged token
  //
  /////////////////////////////////////////////////////////////////
  set2LeggedToken (token) {

    //store current time
    token.time_stamp = moment().format()

    this._2LeggedToken = token
  }

  /////////////////////////////////////////////////////////////////
  // return master token (full privileges),
  // refresh automatically if expired
  //
  /////////////////////////////////////////////////////////////////
  get2LeggedToken () {

    return new Promise(async(resolve, reject) => {

      try {

        var token = this._2LeggedToken

        if (!token) {

          token = await this.request2LeggedToken(
            this._config.oauth.scope.join(' '))

          this.set2LeggedToken(token)
        }

        if (this.getExpiry(token) < 60) {

          token = await this.request2LeggedToken(
            this._config.oauth.scope.join(' '))

          this.set2LeggedToken(token)
        }

        resolve(token)

      } catch (ex){

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Request new 2-legged with specified scope
  //
  /////////////////////////////////////////////////////////////////
  request2LeggedToken (scope) {

    return this._2leggedAPI.authenticate (
      this._config.oauth.clientId,
      this._config.oauth.clientSecret,
      'client_credentials', {
        scope: scope
      })
  }
}
