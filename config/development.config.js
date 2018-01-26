
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'http://localhost'
const PORT = 3000

const config = {

  env: 'development',

  client: {
    theme: 'forge-white.css',
    storageVersion: 2.1,
    host: `${HOST_URL}`,
    env: 'development',
    port: PORT
  },

  gallery: {
    lifetime: 60 * 60 * 24 * 1, // 1 day
    uploadLimit: 5,
    bucket: {
        bucketKey: 'forge-rcdb-gallery-dev',
        policyKey: 'Transient'
      }
  },

  meta: {
    bucket: {
      bucketKey: 'forge-rcdb-meta-dev',
      policyKey: 'Persistent'
    }
  },

  layouts: {
    index: 'index.ejs'
  },

  forge: {

    oauth: {

      redirectUri: `${HOST_URL}:${PORT}/api/forge/callback/oauth`,
      authenticationUri: '/authentication/v1/authenticate',
      refreshTokenUri: '/authentication/v1/refreshtoken',
      authorizationUri: '/authentication/v1/authorize',
      accessTokenUri: '/authentication/v1/gettoken',

      baseUri: 'https://developer.api.autodesk.com',
      clientSecret: process.env.FORGE_DEV_CLIENT_SECRET,
      clientId: process.env.FORGE_DEV_CLIENT_ID,

      scope: [
        'data:read',
        'data:write',
        'data:create',
        'data:search',
        'bucket:read',
        'bucket:create',
        'bucket:delete'
      ]
    },

    viewer: {
      //viewer3D: 'https://developer.api.autodesk.com/derivativeservice/v2/viewers/viewer3D.js?v=3.1.1',
      //threeJS:  'https://developer.api.autodesk.com/derivativeservice/v2/viewers/three.js?v=3.1.1',
      //style:    'https://developer.api.autodesk.com/derivativeservice/v2/viewers/style.css?v=3.1.1'

      viewer3D: '/resources/libs/lmv/3.2.1/viewer3D.js',
      threeJS:  '/resources/libs/lmv/3.2.1/three.js',
      style:    '/resources/libs/lmv/3.2.1/style.min.css'
    }
  },

  database: {
    type: 'mongo',
    dbName: 'forge-rcdb',
    user: '',
    pass: '',
    dbhost: 'localhost',
    port: 27017,
    models: {
      configurator: {
        collection:'configurator.models'
      },
      gallery: {
        collection:'gallery.models'
      },
      rcdb:{
        collection:'rcdb.models'
      }
    },
    materials: {
      rcdb:{
        collection:'rcdb.materials'
      }
    },
    users: {
      collection:'rcdb.users'
    }
  }
}

module.exports = config


