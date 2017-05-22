/////////////////////////////////////////////////////////////////
// Forge Viewer proxy
// By Philippe Leefsma, February 2017
//
/////////////////////////////////////////////////////////////////
import BaseSvc from './BaseSvc'
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

export default class LMVProxySvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name () {

    return 'LMVProxySvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  fixContentHeaders (req, res) {

    // DS does not return content-encoding header
    // for gzip and other files that we know are gzipped,
    // so we add it here. The viewer does want
    // gzip files uncompressed by the browser

    const extName = path.extname (req.path)

    if ( EXTENSIONS.gzip.indexOf (extName) > -1 ) {
      res.set ('content-encoding', 'gzip')
    }

    if ( EXTENSIONS.json.indexOf (extName) > -1 ){
      res.set ('content-type', 'application/json')
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setCORSHeaders (res) {

    res.set('access-control-allow-origin', '*')

    res.set('access-control-allow-credentials', false)

    res.set('access-control-allow-headers',
      "Origin, X-Requested-With, Content-Type, Accept")
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  proxyClientHeaders (clientHeaders, upstreamHeaders) {

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  request (access_token, req, res, url) {

    const authHeaders = {
      Authorization: `Bearer ${access_token}`
    }

    const options = {
      host:       this._config.endpoint,
      port:       443,
      path:       url,
      method:     'GET', //only proxy GET
      headers:    authHeaders
    }

    this.proxyClientHeaders(
      req.headers,
      options.headers)

    const creq = https.request(options, (cres) => {

      // set encoding
      //cres.setEncoding('utf8');
      for (let h in cres.headers) {
        res.set(h, cres.headers[h])
      }

      this.fixContentHeaders(req, res)

      this.setCORSHeaders(res)

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  generateProxy (proxyEndpoint, getToken) {

    const proxyGet = async(req, res) => {

      const token = await getToken(req.session)

      const url = req.url.replace(proxyEndpoint, '')

      this.request(token.access_token, req, res, url)
    }

    return proxyGet
  }
}
