
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////

module.exports = {

    clientConfig: {
      forge: {
        token2LeggedUrl: '/api/forge/token/2legged'
      }
    },

    serverConfig: {

        port: 3000,
        
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
            }
        }
    }
}
