
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'http://localhost'
const PORT = 3000

const config = {

  env: 'development',

  webpurify_API_KEY: process.env.WEBPURIFY_API_KEY,

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
      clientSecret: process.env.FORGE_DEV_CLIENT_SECRET,
      clientId: process.env.FORGE_DEV_CLIENT_ID,

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
      callbackUrl: `https://dcc54956.ngrok.io/api/forge/callback/hooks`
    },

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/derivativeservice/v2/viewers/viewer3D.js?v=5.0',
      style:    'https://developer.api.autodesk.com/derivativeservice/v2/viewers/style.css?v=5.0'

      // viewer3D: '/resources/libs/lmv/4.0.1/viewer3D.js',
      // threeJS:  '/resources/libs/lmv/4.0.1/three.js',
      // style:    '/resources/libs/lmv/4.0.1/style.css'
    }
  },
  // Set the "connectionString" and "dbName" and leave other fields empty if you'd like to specify the entire connection string yourself.
  database: {
    type: 'mongo',
    connectionString: '',
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