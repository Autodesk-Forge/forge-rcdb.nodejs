
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const config = {

  client: {
    host: 'http://localhost',
    env: 'development',
    port: 3000
  },

  forge: {

    oauth: {
      clientSecret: process.env.FORGE_CLIENT_SECRET,
      clientId: process.env.FORGE_CLIENT_ID,
      scope: [
        'data:read',
        'data:create',
        'data:write',
        'bucket:read',
        'bucket:create'
      ]
    },

    viewer: {
      //viewer3D: 'https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.js?v=2.13',
      //threeJS:  'https://developer.api.autodesk.com/viewingservice/v1/viewers/three.js?v=2.13',
      //style:    'https://developer.api.autodesk.com/viewingservice/v1/viewers/style.css?v=2.13'

      // requires local copy of viewer lib - not provided in this sample
      viewer3D: '/resources/libs/viewer-2.13/viewer3D.js',
      threeJS:  '/resources/libs/viewer-2.13/three.js',
      style:    '/resources/libs/viewer-2.13/style.css'
    }
  },
  databases: [
    {
      type: 'mongo',
      dbName: 'forge-rcdb',
      user: '',
      pass: '',
      dbhost: 'localhost',
      port: 27017,
      collections: {
        rcdb:{
          materials: 'rcdb.materials',
          models: 'rcdb.models'
        },
        configurator: {
          models: 'configurator.models'
        }
      }
    }
  ]
}

module.exports = config


