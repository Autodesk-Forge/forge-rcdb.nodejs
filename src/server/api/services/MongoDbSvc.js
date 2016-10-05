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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(config) {

    super(config)

    this._db = null;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return this._config.dbName || 'MongoDbSvc';
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getConnectionURL() {

    var _thisSvc = this;

    if (_thisSvc._config.user.length &&
        _thisSvc._config.pass.length) {

      return util.format('mongodb://%s:%s@%s:%d/%s',
        _thisSvc._config.user,
        _thisSvc._config.pass,
        _thisSvc._config.dbhost,
        _thisSvc._config.port,
        _thisSvc._config.dbName);
    }
    else {

      return util.format('mongodb://%s:%d/%s',
        _thisSvc._config.dbhost,
        _thisSvc._config.port,
        _thisSvc._config.dbName);
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  connect() {

    var _thisSvc = this;

    var promise = new Promise((resolve, reject) => {

      var url = _thisSvc.getConnectionURL();

      var client = mongo.MongoClient;

      client.connect(url, (err, db)=> {

        if (err) {

          return reject(err);
        }
        else {

          console.log('MongoDbSvc: connected to ' +
            _thisSvc._config.dbName)

          _thisSvc._db = db;

          return resolve(db);
        }
      });
    });

    return promise;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getDb() {

    var _thisSvc = this;

    return new Promise((resolve, reject)=> {

      try{

        if(_thisSvc._db) {

          return resolve(_thisSvc._db);
        }
        else {

          return _thisSvc.connect();
        }
      }
      catch(ex){

        reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getCollection(collectionName) {

    var _thisSvc = this;

    return new Promise((resolve, reject)=> {

      try{

        _thisSvc._db.collection(collectionName,
          (err, collection)=> {

            if (err) {

              return reject(err);
            }

            return resolve(collection);
          });
      }
      catch(ex){

        reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  insert(collectionName, item) {

    var _thisSvc = this;

    return new Promise(async(resolve, reject)=> {

      try{

        var collection = await _thisSvc.getCollection(
          collectionName);

        collection.insert(item, {w:1}, (err, result)=>{

          if (err) {

            return reject(err);
          }

          return resolve(item);
        });
      }
      catch(ex){

        reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getCursor(collectionName, opts = {}) {

    var _thisSvc = this;

    var promise = new Promise((resolve, reject)=> {

      _thisSvc._db.collection(collectionName, (err, collection)=> {

        if (err) {

          return reject(err);
        }

        var cursor = collection.find(
          opts.fieldQuery || {},
          opts.pageQuery || {}).
          sort(opts.sort || {});

        return resolve(cursor);
      });
    });

    return promise;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getItems(collectionName, opts = {}) {

    var _thisSvc = this;

    var promise = new Promise(async(resolve, reject)=> {

      try {

        var cursor = await _thisSvc.getCursor(
          collectionName, opts);

        cursor.toArray((err, items)=> {

          if (err) {

            return reject(err);
          }

          return resolve(items);
        });
      }
      catch(ex){

        return reject(ex);
      }
    });

    return promise;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  removeCollection(name, opts) {

    var _thisSvc = this;

    var promise = new Promise((resolve, reject)=> {

      _thisSvc._db.collection(name, (err, collection)=> {

        if (err) {
          return reject(err);
        }

        collection.remove({}, (err, result)=> {

            if (err) {
              return reject(err);
            }

            return resolve(result);
          });
      });
    });

    return promise;
  }
}
