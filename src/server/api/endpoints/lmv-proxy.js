/////////////////////////////////////////////////////////////////
// Forge Viewer proxy
// By Philippe Leefsma, February 2017
//
/////////////////////////////////////////////////////////////////
import ServiceManager from '../services/SvcManager'
import https from 'https'
import path from 'path'

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
const EXTENSIONS = {
  gzip: [ '.json.gz', '.bin', '.pack' ],
  json: [ '.json.gz', '.json' ]
}

const WHITE_LIST = [
  'if-modified-since',
  'if-none-match',
  'accept-encoding',
  'x-ads-acm-namespace',      // Forge Data Management API
  'x-ads-acm-check-groups'    // Forge Data Management API
]

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
function fixContentHeaders (req, res) {

  // DS does not return content-encoding header
  // for gzip and other files that we know are gzipped,
  // so we add it here. The viewer does want
  // gzip files uncompressed by the browser
  if ( EXTENSIONS.gzip.indexOf (path.extname (req.path)) > -1 ) {
    res.set ('content-encoding', 'gzip')
  }

  if ( EXTENSIONS.json.indexOf (path.extname (req.path)) > -1 ){
    res.set ('content-type', 'application/json')
  }
}

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
function setCORSHeaders (res) {

    res.set('access-control-allow-origin', '*')

    res.set('access-control-allow-credentials', false)

    res.set('access-control-allow-headers',
      "Origin, X-Requested-With, Content-Type, Accept")
}

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
function proxyClientHeaders (clientHeaders, upstreamHeaders) {

  WHITE_LIST.forEach(h => {

      const hval = clientHeaders[h]

      if (hval) {
          upstreamHeaders[h] = hval
      }
  })

  // fix for OSS issue not accepting the
  // etag surrounded with double quotes...
  const etag = upstreamHeaders['if-none-match']

  if (etag) {

    if(etag[0] === '"' && etag[etag.length - 1] === '"') {

        upstreamHeaders['if-none-match'] =
          etag.substring(1, etag.length - 1);
    }
  }
}

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
function Proxy(endpoint, authHeaders) {

  this.authHeaders = authHeaders
  this.endpoint = endpoint
}

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
Proxy.prototype.request = function(req, res, url) {

    const options = {
      host:       this.endpoint,
      port:       443,
      path:       url,
      method:     'GET', //only proxy GET
      headers:    this.authHeaders
    }

    proxyClientHeaders(req.headers, options.headers)

    const creq = https.request(options, (cres) => {

        // set encoding
        //cres.setEncoding('utf8');
        for (let h in cres.headers) {
            res.set(h, cres.headers[h])
        }

        fixContentHeaders(req, res)

        setCORSHeaders(res)

        res.writeHead(cres.statusCode)

        cres.pipe(res)

        cres.on('error', (e) => {
          // we got an error,
          // return error 500 to client and log error
          debug.error(e.message)
          res.end()
        })
    })

    creq.end()
}

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
function proxyGet (req, res) {

  const forgeSvc = ServiceManager.getService('ForgeSvc')

  forgeSvc.get2LeggedToken().then((token) => {

    const url = req.url.replace (/^\/lmv\-proxy/gm, '')

    const endpoint = 'developer.api.autodesk.com'

    const authHeaders = {
      Authorization: `Bearer ${token.access_token}`
    }

    const proxy = new Proxy(endpoint, authHeaders)

    proxy.request(req, res, url)
  })
}

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
exports.get = proxyGet
