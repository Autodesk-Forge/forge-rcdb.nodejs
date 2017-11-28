const Payloads = {

  stl: ({urn}) => {
    return ({
      input: {
        urn
      },
      output: {
        force: true,
        formats: [{
          type: 'stl'
        }],
        destination: {
          region: 'us'
        }
      }
    })
  },

  step: ({urn}) => {
    return ({
      input: {
        urn
      },
      output: {
        force: true,
        formats: [{
          type: 'step'
        }],
        destination: {
          region: 'us'
        }
      }
    })
  },

  dwg: ({urn}) => {
    return ({
      input: {
        urn
      },
      output:{
        force: true,
        formats: [{
          type: 'dwg'
        }],
        destination: {
          region: 'us'
        }
      }
    })
  },

  iges: ({urn}) => {
    return ({
      input: {
        urn
      },
      output:{
        force: true,
        formats: [{
          type: 'iges'
        }],
        destination: {
          region: 'us'
        }
      }
    })
  },

  obj: ({urn, modelGuid, objectIds = [-1]}) => {
    return ({
      input: {
        urn
      },
      output:{
        force: false,
        formats: [{
          type: 'obj',
          advanced: {
            modelGuid,
            objectIds
          }
        }],
        destination: {
          region: 'us'
        }
      }
    })
  },

  svf: ({urn}) => {
    return ({
      input: {
        urn
      },
      output:{
        force: true,
        formats: [{
          type: 'svf',
          views: ['2d', '3d']
        }],
        destination: {
          region: 'us'
        }
      }
    })
  },

  fbx: ({urn}) => {
    return ({
      input: {
        urn
      },
      output:{
        force: true,
        formats: [{
          type: 'fbx'
        }],
        destination: {
          region: 'us'
        }
      }
    })
  },

  ifc: ({urn}) => {
    return ({
      input: {
        urn
      },
      output:{
        force: true,
        formats: [{
          type: 'ifc'
        }],
        destination: {
          region: 'us'
        }
      }
    })
  }
}

export default Payloads
