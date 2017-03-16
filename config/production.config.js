
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const config = {

  client: {
    // this the public host name of your server for the
    // client socket to connect.
    // eg. https://myforgeapp.mydomain.com
    host: 'https://forge-rcdb.autodesk.io',
    env: 'production',
    port: 443
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
      viewer3D: 'https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.min.js?v=2.13',
      threeJS:  'https://developer.api.autodesk.com/viewingservice/v1/viewers/three.min.js?v=2.13',
      style:    'https://developer.api.autodesk.com/viewingservice/v1/viewers/style.min.css?v=2.13'
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
        materials: 'rcdb.materials',
        models: 'rcdb.models'
      }
    },
    {
      type: 'mongo',
      dbhost: process.env.CONFIGURATOR_DBHOST,
      dbName: process.env.CONFIGURATOR_DBNAME,
      user: process.env.CONFIGURATOR_USER,
      pass: process.env.CONFIGURATOR_PASS,
      port: process.env.CONFIGURATOR_PORT,
      collections: {
        models: 'configurator.models'
      }
    }
  ]
}

module.exports = config


