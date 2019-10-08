
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'http://localhost'
const PORT = 8080

const config = {
  env: 'development',

  client: {
    viewerTheme: 'light-theme',
    storageVersion: 4.0,
    host: `${HOST_URL}`,
    env: 'development',
    port: PORT
  },

  gallery: {
    lifetime: 60 * 60 * 24 * 7, // 7 days
    // whiteList of user emails who can upload
    // to the gallery without limit
    whiteList:[
      '.*' // match any
    ],
    // number of active models for
    // non white-listed user
    uploadLimit: 0,
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
    index: 'development.index.ejs'
  },

  forge: {

    oauth: {

      redirectUri: `${HOST_URL}:${PORT}/api/forge/callback/oauth`,
      authenticationUri: '/authentication/v1/authenticate',
      refreshTokenUri: '/authentication/v1/refreshtoken',
      authorizationUri: '/authentication/v1/authorize',
      accessTokenUri: '/authentication/v1/gettoken',

      baseUri: 'https://developer.api.autodesk.com',

      clientSecret: '',
      clientId: '',

      scope: [
        'data:read',
        'data:write',
        'data:create',
        'data:search',
        'bucket:read',
        'bucket:create',
        'bucket:delete',
        'viewables:read'
      ]
    },

    hooks: {
      callbackUrl: ``
    },

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js?v=v7.2',
      style:    'https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css?v=v7.2'

      // viewer3D: '/resources/libs/lmv/4.0.1/viewer3D.js',
      // threeJS:  '/resources/libs/lmv/4.0.1/three.js',
      // style:    '/resources/libs/lmv/4.0.1/style.css'
    }
  },
  // Set the "connectionString" and "dbName" and leave other fields empty if you'd like to specify the entire connection string yourself.
  database: {
    type: 'mongo',
    connectionString: '',
    dbName: 'admin',
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
