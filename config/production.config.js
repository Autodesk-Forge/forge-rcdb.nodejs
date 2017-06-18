
/////////////////////////////////////////////////////////////////////
// PRODUCTION configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'https://forge-rcdb.autodesk.io'
const PORT= 443

const config = {

  env: 'production',

  client: {
    // this the public host name of your server for the
    // client socket to connect.
    // eg. https://myforgeapp.mydomain.com
    host: `${HOST_URL}`,
    env: 'production',
    port: PORT
  },

  gallery: {
    bucket: {
      bucketKey: 'forge-rcdb-gallery-tmp-prod',
      policyKey: 'Transient'
    }
  },

  meta: {
    bucket: {
      bucketKey: 'forge-rcdb-meta',
      policyKey: 'Persistent'
    }
  },

  forge: {

    oauth: {

      redirectUri: `${HOST_URL}/api/forge/callback/oauth`,
      authenticationUri: '/authentication/v1/authenticate',
      refreshTokenUri: '/authentication/v1/refreshtoken',
      authorizationUri: '/authentication/v1/authorize',
      accessTokenUri: '/authentication/v1/gettoken',
      baseUri: 'https://developer.api.autodesk.com',

      clientSecret: process.env.FORGE_CLIENT_SECRET,
      clientId: process.env.FORGE_CLIENT_ID,

      scope: [
        'data:read',
        'data:write',
        'data:create',
        'bucket:read',
        'bucket:create'
      ]
    },

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.min.js?v=v2.15',
      threeJS:  'https://developer.api.autodesk.com/viewingservice/v1/viewers/three.min.js?v=v2.15',
      style:    'https://developer.api.autodesk.com/viewingservice/v1/viewers/style.min.css?v=v2.15'
    }
  },
  databases: [
    {
      type: 'mongo',
      dbhost: process.env.RCDB_DBHOST,
      dbName: process.env.RCDB_DBNAME,
      user: process.env.RCDB_USER,
      pass: process.env.RCDB_PASS,
      port: process.env.RCDB_PORT,
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


