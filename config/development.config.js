
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'http://localhost'
const PORT= 3000

const config = {

  env: 'development',

  client: {
    host: `${HOST_URL}`,
    env: 'development',
    port: PORT
  },

  gallery: {
    bucket: {
        bucketKey: 'forge-rcdb-gallery-tmp-dev',
        policyKey: 'Transient'
      }
  },

  meta: {
    bucket: {
      bucketKey: 'forge-rcdb-meta-dev',
      policyKey: 'Persistent'
    }
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
        'bucket:read',
        'bucket:create'
      ]
    },

    viewer: {
      //viewer3D: 'https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.js?v=2.15',
      //threeJS:  'https://developer.api.autodesk.com/viewingservice/v1/viewers/three.js?v=2.15',
      //style:    'https://developer.api.autodesk.com/viewingservice/v1/viewers/style.css?v=2.15'

      viewer3D: '/resources/libs/lmv/2.15/viewer3D.js',
      threeJS:  '/resources/libs/lmv/2.15/three.js',
      style:    '/resources/libs/lmv/2.15/style.css'
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
        configurator: {
          models: 'configurator.models'
        },
        gallery: {
          models: 'gallery.models'
        },
        rcdb:{
          materials: 'rcdb.materials',
          models: 'rcdb.models'
        }
      }
    }
  ]
}

module.exports = config


