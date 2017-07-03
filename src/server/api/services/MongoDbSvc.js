/////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////

import BaseSvc from './BaseSvc'
import mongo from 'mongodb'
import path from 'path'
import util from 'util'
import fs from 'fs'

export default class DbSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor(config) {

    super (config)

    this._db = null
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get config() {

    return this._config
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return this._config.dbName || 'MongoDbSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getConnectionURL() {


    if (this._config.user.length && this._config.pass.length) {

      return util.format('mongodb://%s:%s@%s:%d/%s',
        this._config.user,
        this._config.pass,
        this._config.dbhost,
        this._config.port,
        this._config.dbName)

    } else {

      return util.format('mongodb://%s:%d/%s',
        this._config.dbhost,
        this._config.port,
        this._config.dbName)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  connect() {

    return new Promise((resolve, reject) => {

      const url = this.getConnectionURL()

      const client = mongo.MongoClient

      client.connect(url, (err, db) => {

        if (err) {

          return reject(err)

        } else {

          this._db = db

          return resolve(db)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getDb() {

    return new Promise((resolve) => {

      return this._db
        ? resolve(this._db)
        : this.connect()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getCollection (collectionName) {

    return new Promise((resolve, reject)=> {

      this._db.collection(collectionName,
        (err, collection)=> {

          return err
            ? reject(err)
            : resolve(collection)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  insert (collectionName, item) {

    return new Promise(async(resolve, reject) => {

      try{

        const collection = await this.getCollection(
          collectionName)

        collection.insert(item, {w:1}, (err, result) => {

          return err
            ? reject(err)
            : resolve(item)
        })

      } catch(ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  findOne(collectionName, opts = {}) {

    var _thisSvc = this;

    return new Promise(async(resolve, reject)=> {

      try{

        var collection = await _thisSvc.getCollection(
          collectionName);

        collection.findOne(
          opts.fieldQuery || {},
          opts.pageQuery || {}, (err, dbItem)=> {

            if(err){
              return reject(err);
            }

            if(!dbItem) {
              return reject('Not Found');
            }

            return resolve(dbItem);
          });
      }
      catch(ex){

        console.log(ex)
        reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  findOrCreate(collectionName, item, query) {

    var _thisSvc = this;

    return new Promise(async(resolve, reject)=> {

      try{

        var collection = await _thisSvc.getCollection(
          collectionName);

        collection.findOne(query, {}, (err, dbItem)=> {

          if(err){
            return reject(err);
          }

          if(dbItem) {

            return resolve(dbItem);
          }

          return _thisSvc.insert(collectionName, item);
        });
      }
      catch(ex){

        reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateItem(collectionName, query, opts = {}) {

    var _thisSvc = this;

    return new Promise(async(resolve, reject)=> {

      try{

        var collection = await _thisSvc.getCollection(
          collectionName);

        collection.update(
          query,
          opts,
          (err, res)=> {

            if(err){
              return reject(err);
            }

            return resolve(res);
          });
      }
      catch(ex){

        reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateItem(collectionName, item, query) {

    var _thisSvc = this;

    return new Promise(async(resolve, reject)=> {

      try{

        var collection =
          await _thisSvc.getCollection(
            collectionName)

        if (typeof item._id === 'string') {

          item._id = new mongo.ObjectId(item._id)
        }

        collection.update(
          query,
          item, (err, res)=> {

            if(err){

              return reject(err)
            }

            return resolve(res)
          })

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  upsertItem(collectionName, item, query) {

    var _thisSvc = this;

    return new Promise(async(resolve, reject)=> {

      try{

        var collection = await _thisSvc.getCollection(
          collectionName);

        if(typeof item._id === 'string') {
          item._id = new mongo.ObjectId(item._id);
        }

        collection.update(
          query,
          item, { upsert: true },(err, res)=> {

            if(err){

              return reject(err);
            }

            return resolve(res);
          })

      } catch(ex){

        reject(ex);
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  distinct(collectionName, key) {

    var _thisSvc = this;

    return new Promise(async(resolve, reject)=> {

      try{

        var collection = await _thisSvc.getCollection(
          collectionName);

        collection.distinct(key, function(err, values) {

          if (err) {

            return reject(err);
          }

          return resolve(values);
        });
      }
      catch(ex){

        reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getCursor (collectionName, opts = {}) {

    return new Promise((resolve, reject) => {

      this._db.collection(collectionName, (err, collection)=> {

        if (err) {

          return reject(err)
        }

        const cursor = collection.find(
          opts.fieldQuery || {},
          opts.pageQuery || {}).
          sort(opts.sort || {})

        return resolve(cursor)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getItems (collectionName, opts = {}) {

    return new Promise(async(resolve, reject) => {

      try {

        const cursor = await this.getCursor(
          collectionName, opts)

        cursor.toArray((err, items) => {

          if (err) {

            return reject(err)
          }

          return resolve(items)
        })

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  dropCollection (collectionName) {

    return new Promise(async(resolve, reject) => {

      const collection = await this.getCollection(
        collectionName)

      collection.drop((err, result) => {

        return err
          ? reject(err)
          : resolve(result)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  removeItems (collectionName, query) {

    return new Promise(async(resolve, reject) => {

      const collection = await this.getCollection(
        collectionName)

      collection.remove(query, (err, result) => {

        return err
          ? reject(err)
          : resolve(result)
      })
    })
  }
}
