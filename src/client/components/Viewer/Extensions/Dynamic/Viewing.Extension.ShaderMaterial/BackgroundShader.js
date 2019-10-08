
(function init_BackgroundShader () {
  'use strict'

  var avs = Autodesk.Viewing.Shaders

  if (typeof avs.BackgroundShader !== 'undefined') { return }

  avs.BackgroundShader = {

    uniforms: {
      color1: { type: 'v3', value: new THREE.Vector3(41.0 / 255.0, 76.0 / 255.0, 120.0 / 255.0) },
      color2: { type: 'v3', value: new THREE.Vector3(1.0 / 255.0, 2.0 / 255.0, 3.0 / 255.0) },
      irradianceMap: { type: 't', value: 1.0 },
      // "envMap": {type: "t", value: null},
      exposure: { type: 'f', value: 1.0 },
      uCamDir: { type: 'v3', value: new THREE.Vector3() },
      uCamUp: { type: 'v3', value: new THREE.Vector3() },
      uResolution: { type: 'v2', value: new THREE.Vector2(600, 400) },
      envMapBackground: { type: 'i', value: 0 },

      tBackground: { type: 't', value: null },
      bUseBackground: { type: 'i', value: 0 }
    },

    vertexShader: [
      'uniform vec3 color1;',
      'uniform vec3 color2;',

      'varying vec2 vUv;',
      'varying vec3 vColor;',

      'void main() {',

      'if (uv.y == 0.0)',
      'vColor = color2;',
      'else',
      'vColor = color1;',

      'vUv = uv;',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

      '}'

    ].join('\n'),

    fragmentShader: [

      'varying vec3 vColor;',
      'varying vec2 vUv;',

      'uniform samplerCube irradianceMap;',
      // "uniform samplerCube envMap;",
      'uniform float exposure;',
      'uniform vec3 uCamDir;',
      'uniform vec3 uCamUp;',
      'uniform vec2 uResolution;',
      'uniform bool envMapBackground;',

      'uniform sampler2D tBackground;',
      'uniform bool bUseBackground;',

      'const int bloomRange = 4;',

      OrderedDitheringShaderChunk,

      // NOTE: This depends on the specific encoding used.
      // We use the environment preset's built in exposure correction,
      // a gamma of 2.0 and an extra factor of 16
      // when generating the cube map in the modified CubeMapGen tool
      // See this article by Karis for details: http://graphicrants.blogspot.ca/2009/04/rgbm-color-encoding.html
      'vec3 RGBMDecode(in vec4 vRGBM, in float exposure) {',
      'vec3 ret = vRGBM.rgb * (vRGBM.a * 16.0);', // vairable factor in alpha channel + fixed factor of 16.0
      'ret *= ret;', // remove gamma of 2.0 to go into linear space
      'ret *= exposure;', // apply exposure to get back original intensity
      'return ret;',
      '}',

      'vec3 rayDir(in vec2 vUv) {',
      'vec3 A = (uResolution.x/uResolution.y)*normalize(cross(uCamDir,uCamUp));',
      'vec3 B = normalize(uCamUp);',
      'vec3 C = normalize(uCamDir);',

      'vec3 ray = normalize( C + (2.0*vUv.x-1.0)*A + (2.0*vUv.y-1.0)*B );',
      'return ray;',
      '}',

      'vec4 getColor(in vec3 rd) {',
      'vec4 color = vec4(RGBMDecode(textureCube(irradianceMap, rd), exposure), 1.0);',
      'return color;',
      '}',

      'void main() {',
      'vec3 rd = rayDir(vUv);',

      'if (envMapBackground) {',
      'gl_FragColor = getColor(rd);',
      '}',
      'else {',
      'if (bUseBackground) {',
      'gl_FragColor = texture2D( tBackground, vUv );',
      '} else {',
      'gl_FragColor = vec4(orderedDithering(vColor), 1.0);',
      '}',
      '}',

      // For the bloom effect for background
      // "vec4 sum = vec4(0);",
      //
      // "for ( int i = -bloomRange; i < bloomRange; i++ ) {",
      //    "for ( int j = -bloomRange + 1; j < bloomRange - 1; j++ ) {",
      //        "vec3 sRay = rayDir(vUv + vec2(j, i) * 0.004);",
      //        "sum += getColor(sRay) * 0.25;",
      //    "}",
      // "}",
      // "if (getColor(rd).r < 0.3) {",
      //    "gl_FragColor = sum * sum * 0.012 + getColor(rd);",
      // "}",
      // "else if (getColor(rd).r < 0.5) {",
      //    "gl_FragColor = sum * sum * 0.009 + getColor(rd);",
      // "}",
      // "else {",
      //    "gl_FragColor = sum * sum * 0.0075 + getColor(rd);",
      // "}",
      '}'
    ].join('\n')
  }
})()
