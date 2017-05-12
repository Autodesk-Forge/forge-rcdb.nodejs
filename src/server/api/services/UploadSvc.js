import BaseSvc from './BaseSvc'
import multer from 'multer'
import crypto from 'crypto'
import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs'

export default class UploadSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor(config) {

    super(config)

    // Initialize upload
    const storage = multer.diskStorage({

      destination: config.tempStorage,
      filename: (req, file, cb) => {
        crypto.pseudoRandomBytes(16, (err, raw) => {
          if (err) return cb(err)
          cb(null, raw.toString('hex') + path.extname(
            file.originalname))
        })
      }
    })

    this.multer = multer({storage: storage})

    // start cleanup task to remove uploaded temp files
    setInterval(() => {
      this.clean(config.tempStorage, 60 * 60 * 1000)
    }, 60 * 60 * 1000)

    setTimeout(() => {
      this.clean(config.tempStorage)
    }, 30 * 1000)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return 'UploadSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get uploader () {

    return this.multer
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  clean(dir, age = 0) {

    fs.readdir(dir, (err, files) => {

      if (err) {
        return console.error(err)
      }

      files.forEach((file) => {

        const filePath = path.join(dir, file)

        fs.stat(filePath, (err, stat) => {

          if (err) {
            return console.error(err)
          }

          const now = new Date().getTime()

          const endTime = new Date(stat.ctime).getTime() + age

          if (now > endTime) {

            return rimraf(filePath, (err) => {

              if (err) {
                return console.error(err);
              }

              console.log(`${dir} cleaned`);
            })
          }
        })
      })
    })
  }
}

