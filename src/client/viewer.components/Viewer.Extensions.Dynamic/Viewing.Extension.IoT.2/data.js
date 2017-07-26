const initialState = {
  "viewport":{
    "eye":[87391.15872770472,-52418.6161141303,3808.015826295314],
    "target":[197906.0067692647,33671.042387167516,-86862.75432838047],
    "up":[0.428648156005003,0.3339114519146276,0.8395021742877],
    "worldUpVector":[0,0,1],
    "pivotPoint":[-1332.65625,-2874.078125,-7449],
    "distanceToOrbit":-27082.75565679362,
    "aspectRatio":1.3572397508038585,
    "projection":"perspective",
    "isOrthographic":false,
    "fieldOfView":75
  }
}

const items = [

  //Conveyors
  {
    status: 'OK',
    name: 'Conveyor',
    type: 'conveyors',
    metadata: [{
      name: 'Location',
      value: 'CC-01, Lower Conveyor'
    }, {
      name: 'Unit No',
      value: '02-210'
    }, {
      name: 'Type',
      value: 'Live Roller Conveyor'
    },{
      name: 'Model',
      value: '9265'
    }, {
      name: 'Manual',
      value: 'https://www.dematicdirect.com/Content/RelatedDocs/9265_Model%209165-9265%20Narrow%20Belt%20Live%20Roller%20APC%20Installation%20Guide.pdf',
      type: 'link'
    }],
    id: 'c1',
    worldPoint: {
      x: 89501.40769926165,
      y: -45102.77724539788,
      z: -3953.648606750600
    },
    dbId: 58253,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Oil Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5,
      name: 'Oil level',
      value: 0.8,
      max: 1.0,
      min: 0.0
    }, {
    threshold: 150 + (0.5 - Math.random()) * 50,
      name: 'Amperage' ,
      randomRange: 50.0,
      randomBase: 145.0,
      max: 200.0,
      min: 0.0
    }],
    state: {
      "viewport": {
        "eye": [88255.1447075106, -46079.521908684204, -1990.6050465916373],
        "target": [166604.71508533583, 47129.37670997173, -116094.04732099373],
        "up": [0.43997974062252976, 0.5234237640383375, 0.7296885575926694],
        "worldUpVector": [0, 0, 1],
        "pivotPoint": [-1332.65625, -2874.078125, -7449],
        "distanceToOrbit": -14197.811020198671,
        "aspectRatio": 1.440619667235495,
        "projection": "perspective",
        "isOrthographic": false,
        "fieldOfView": 75
      }
    }
  },

  {
    status: 'OK',
    name: 'Conveyor',
    type: 'conveyors',
    metadata: [{
      name: 'Location',
      value: 'CC-01, Lower Conveyor'
    }, {
      name: 'Unit No',
      value: '02-215'
    }, {
      name: 'Type',
      value: 'Live Roller Conveyor'
    },{
      name: 'Model',
      value: '9265'
    }, {
      name: 'Manual',
      value: 'https://www.dematicdirect.com/Content/RelatedDocs/9265_Model%209165-9265%20Narrow%20Belt%20Live%20Roller%20APC%20Installation%20Guide.pdf',
      type: 'link'
    }],
    id: 'c2',
    worldPoint: {
      x: 93391.63906000115,
      y: -44810.4149372582,
      z: -3970.0779562038642
    },
    dbId: 61680,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Oil Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Oil level',
      value: 0.95,
      max: 1.0,
      min: 0.0
    }, {
      threshold: 150 + (0.5 - Math.random()) * 50,
      name: 'Amperage' ,
      randomRange: 50.0,
      randomBase: 145.0,
      max: 200.0,
      min: 0.0
    }],
    state: {
      "viewport": {
        "eye": [92752.874104877, -46169.4884891061, -1990.6050450099017],
        "target": [162762.49882501984, 54426.85207240804, -115238.90839272905],
        "up": [0.38766614065207616, 0.5570347686492289, 0.734457098752422],
        "worldUpVector": [0, 0, 1],
        "pivotPoint": [-1332.65625, -2874.078125, -7449],
        "distanceToOrbit": -9668.38167282959,
        "aspectRatio": 1.440619667235495,
        "projection": "perspective",
        "isOrthographic": false,
        "fieldOfView": 75
      }
    }
  },

  {
    status: 'warning',
    name: 'Conveyor',
    type: 'conveyors',
    metadata: [{
      name: 'Location',
      value: 'CC-01, Lower Conveyor'
    }, {
      name: 'Unit No',
      value: '02-220'
    }, {
      name: 'Type',
      value: 'Live Roller Conveyor'
    },{
      name: 'Model',
      value: '9265'
    }, {
      name: 'Manual',
      value: 'https://www.dematicdirect.com/Content/RelatedDocs/9265_Model%209165-9265%20Narrow%20Belt%20Live%20Roller%20APC%20Installation%20Guide.pdf',
      type: 'link'
    }],
    id: 'c3',
    worldPoint: {
      x: 97244.18208305698,
      y: -44795.04134916465,
      z: -3952.1043602992295
    },
    dbId: 58126,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Oil Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Oil level',
      value: 0.98,
      max: 1.0,
      min: 0.0
    }, {
      threshold: 150 + (0.5 - Math.random()) * 50,
      name: 'Amperage' ,
      randomRange: 50.0,
      randomBase: 145.0,
      max: 200.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[96616.07741145027,-46192.66798740944,-1990.6050451514138],
        "target":[154207.82516886588,48058.838297910785,-127074.55146576429],
        "up":[0.39083780794395245,0.639623792407429,0.6619117857146103],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-5246.180553511613,
        "aspectRatio":1.440619667235495,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    },
    alert: {
      msg: 'Low inventory for replacement parts'
    }
  },

  {
    status: 'OK',
    name: 'Conveyor',
    type: 'conveyors',
    metadata: [{
      name: 'Location',
      value: 'CC-01, Lower Conveyor'
    }, {
      name: 'Unit No',
      value: '02-225'
    }, {
      name: 'Type',
      value: 'Live Roller Conveyor'
    },{
      name: 'Model',
      value: '9265'
    }, {
      name: 'Manual',
      value: 'https://www.dematicdirect.com/Content/RelatedDocs/9265_Model%209165-9265%20Narrow%20Belt%20Live%20Roller%20APC%20Installation%20Guide.pdf',
      type: 'link'
    }],
    id: 'c4',
    worldPoint: {
      x: 101015.41248380323,
      y: -44707.07855101893,
      z: -3950.8508686888745
    },
    dbId: 58097,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Oil Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Oil level',
      value: 0.95,
      max: 1.0,
      min: 0.0
    }, {
      threshold: 150 + (0.5 - Math.random()) * 50,
      name: 'Amperage' ,
      randomRange: 50.0,
      randomBase: 145.0,
      max: 200.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[100192.58950334761,-46214.12731822128,-1990.605045274157],
        "target":[163028.31546832048,59931.26812501942,-114378.22032210509],
        "up":[0.34308684358416164,0.579560244182019,0.7391896516612874],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-6985.068033096013,
        "aspectRatio":1.440619667235495,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  {
    status: 'error',
    name: 'Conveyor',
    type: 'conveyors',
    metadata: [{
      name: 'Location',
      value: 'CC-01, Lower Conveyor'
    }, {
      name: 'Unit No',
      value: '02-230'
    }, {
      name: 'Type',
      value: 'Live Roller Conveyor'
    },{
      name: 'Model',
      value: '9265'
    }, {
      name: 'Manual',
      value: 'https://www.dematicdirect.com/Content/RelatedDocs/9265_Model%209165-9265%20Narrow%20Belt%20Live%20Roller%20APC%20Installation%20Guide.pdf',
      type: 'link'
    }],
    id: 'c5',
    worldPoint: {
      x: 104783.92140135489,
      y: -44875.810847448345,
      z: -3954.0767452830914
    },
    dbId: 65701,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Oil Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Oil level',
      value: 0.95,
      max: 1.0,
      min: 0.0
    }, {
      threshold: 150 + (0.5 - Math.random()) * 50,
      name: 'Amperage' ,
      randomRange: 50.0,
      randomBase: 145.0,
      max: 200.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[104087.49516436132,-46255.89922600665,-1990.6050459371033],
        "target":[155085.58717897788,51225.79662978922,-127460.37464366421],
        "up":[0.3485420730231898,0.6662302649608379,0.6592842007684616],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-2771.168850670859,
        "aspectRatio":1.440619667235495,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  {
    status: 'error',
    name: 'Conveyor',
    type: 'conveyors',
    metadata: [{
      name: 'Location',
      value: 'CC-01, Lower Conveyor'
    }, {
      name: 'Unit No',
      value: '02-235'
    }, {
      name: 'Type',
      value: 'Live Roller Conveyor'
    },{
      name: 'Model',
      value: '9265'
    }, {
      name: 'Manual',
      value: 'https://www.dematicdirect.com/Content/RelatedDocs/9265_Model%209165-9265%20Narrow%20Belt%20Live%20Roller%20APC%20Installation%20Guide.pdf',
      type: 'link'
    }],
    id: 'c6',
    worldPoint: {
      x: 108786.9239196385,
      y: -44624.67983434124,
      z: -3953.4981083443254
    },
    dbId: 68343,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Oil Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Oil level',
      value: 0.95,
      max: 1.0,
      min: 0.0
    }, {
      threshold: 150 + (0.5 - Math.random()) * 50,
      name: 'Amperage' ,
      randomRange: 50.0,
      randomBase: 145.0,
      max: 200.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[108372.84442048208,-46189.39268376441,-1990.6050454156486],
        "target":[163135.1143210135,59385.42897904264,-119042.73157529798],
        "up":[0.32298137465495486,0.6226677800525984,0.7127186452663946],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-4768.927874181933,
        "aspectRatio":1.440619667235495,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  {
    status: 'OK',
    name: 'Conveyor',
    type: 'conveyors',
    metadata: [{
      name: 'Location',
      value: 'CC-01, Lower Conveyor'
    }, {
      name: 'Unit No',
      value: '02-240'
    }, {
      name: 'Type',
      value: 'Live Roller Conveyor'
    },{
      name: 'Model',
      value: '9265'
    }, {
      name: 'Manual',
      value: 'https://www.dematicdirect.com/Content/RelatedDocs/9265_Model%209165-9265%20Narrow%20Belt%20Live%20Roller%20APC%20Installation%20Guide.pdf',
      type: 'link'
    }],
    id: 'c7',
    worldPoint: {
      x: 112585.47746261273,
      y: -44570.84740489557,
      z: -3953.677668210338
    },
    dbId: 61903,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Oil Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Oil level',
      value: 0.95,
      max: 1.0,
      min: 0.0
    }, {
      threshold: 150 + (0.5 - Math.random()) * 50,
      name: 'Amperage' ,
      randomRange: 50.0,
      randomBase: 145.0,
      max: 200.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[112372.79141537227,-46124.558086877594,-2286.7170190472907],
        "target":[148201.1611140126,62903.1351560766,-123428.94553502563],
        "up":[0.22663941323551473,0.6896761597260891,0.6877364110425851],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":7592.599863030606,
        "aspectRatio":1.440619667235495,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  //DRMs
  {
    status: 'warning',
    name: 'DRM',
    type: 'DRMs',
    metadata: [{
      name: 'Location',
      value: 'A1-S1'
    }, {
      name: 'Unit No',
      value: '03-0100'
    }, {
      name: 'Type',
      value: 'Multishuttle 2'
    },{
      name: 'Model',
      value: 'DMS 2'
    }, {
      name: 'Manual',
      value: 'https://www.dematic.com/en/multishuttle/',
      type: 'link'
    }],
    id: 'drm1',
    worldPoint: {
      x: 90286.84375,
      y: -42823.58940643996,
      z: -1936.6725711940344
    },
    dbId: 65658,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Amperage',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[88971.41651447357,-44097.945072691466,-936.5167459019522],
        "target":[152022.38893353072,80643.71969325992,-92097.04245408125],
        "up":[0.24643320965292073,0.4875497973514322,0.8375952890762562],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":253.22207572292382,
        "aspectRatio":1.791805926916221,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  {
    status: 'warning',
    name: 'DRM',
    type: 'DRMs',
    metadata: [{
      name: 'Location',
      value: 'A1-S2'
    }, {
      name: 'Unit No',
      value: '03-0105'
    }, {
      name: 'Type',
      value: 'Multishuttle 2'
    },{
      name: 'Model',
      value: 'DMS 2'
    }, {
      name: 'Manual',
      value: 'https://www.dematic.com/en/multishuttle/',
      type: 'link'
    }],
    id: 'drm2',
    worldPoint: {
      x: 94156.84375,
      y: -42780.78414667948,
      z: -1987.685420261534
    },
    dbId: 55524,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Amperage',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state:{
      "viewport":{
        "eye":[92994.22509873811,-44142.27584317631,-1018.3510141817183],
        "target":[190500.5303799387,73518.91793815968,-68059.48321913285],
        "up":[0.25634969692440296,0.30933806053488416,0.9157482171379222],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-23435.269899217266,
        "aspectRatio":1.4810581140350878,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  {
    status: 'OK',
    name: 'DRM',
    type: 'DRMs',
    metadata: [{
      name: 'Location',
      value: 'A1-S3'
    }, {
      name: 'Unit No',
      value: '03-0110'
    }, {
      name: 'Type',
      value: 'Multishuttle 2'
    },{
      name: 'Model',
      value: 'DMS 2'
    }, {
      name: 'Manual',
      value: 'https://www.dematic.com/en/multishuttle/',
      type: 'link'
    }],
    id: 'drm3',
    worldPoint: {
      x: 98026.84375,
      y: -42643.682926213674,
      z: -2020.001349658286
    },
    dbId: 54337,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Amperage',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[96278.91496687978,-44150.487584839466,-1018.3510140716747],
        "target":[209812.44742044972,61467.821834324546,-62671.081878271085],
        "up":[0.27050835757583147,0.2516493127050206,0.9292458511592703],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-37910.42164832474,
        "aspectRatio":1.6424887663398693,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  //DRMs
  {
    status: 'OK',
    name: 'DRM',
    type: 'DRMs',
    metadata: [{
      name: 'Location',
      value: 'A1-S4'
    }, {
      name: 'Unit No',
      value: '03-0115'
    }, {
      name: 'Type',
      value: 'Multishuttle 2'
    },{
      name: 'Model',
      value: 'DMS 2'
    }, {
      name: 'Manual',
      value: 'https://www.dematic.com/en/multishuttle/',
      type: 'link'
    }],
    id: 'drm4',
    worldPoint: {
      x: 101896.84375,
      y: -42771.314288832626,
      z: -1966.492502150486
    },
    dbId: 61745,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Amperage',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[100220.48496275846,-44743.48010779832,-407.63893066962487],
        "target":[198144.61485402368,76847.20016050377,-59337.43407617584],
        "up":[0.22150511705452758,0.2750390317021576,0.9355688185050844],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-26599.052641162692,
        "aspectRatio":1.667722687007874,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  {
    status: 'OK',
    name: 'DRM',
    type: 'DRMs',
    metadata: [{
      name: 'Location',
      value: 'A1-S5'
    }, {
      name: 'Unit No',
      value: '03-0120'
    }, {
      name: 'Type',
      value: 'Multishuttle 2'
    },{
      name: 'Model',
      value: 'DMS 2'
    }, {
      name: 'Manual',
      value: 'https://www.dematic.com/en/multishuttle/',
      type: 'link'
    }],
    id: 'drm5',
    worldPoint: {
      x: 105766.84375,
      y: -42816.95135736377,
      z: -1954.4195228187527
    },
    dbId: 54395,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Amperage',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state: {
      "viewport": {
        "eye": [104513.42825552975, -44305.1611685688, -1036.5156145912279],
        "target": [187381.60567092532, 75660.91061522462, -82197.81360554838],
        "up": [0.27642852051189354, 0.40017826829453906, 0.873753184047068],
        "worldUpVector": [0, 0, 1],
        "pivotPoint": [-1332.65625, -2874.078125, -7449],
        "distanceToOrbit": -19658.834544832807,
        "aspectRatio": 1.667722687007874,
        "projection": "perspective",
        "isOrthographic": false,
        "fieldOfView": 75
      }
    }
  },

  {
    status: 'error',
    name: 'DRM',
    type: 'DRMs',
    metadata: [{
      name: 'Location',
      value: 'A1-S6'
    }, {
      name: 'Unit No',
      value: '03-0125'
    }, {
      name: 'Type',
      value: 'Multishuttle 2'
    },{
      name: 'Model',
      value: 'DMS 2'
    }, {
      name: 'Manual',
      value: 'https://www.dematic.com/en/multishuttle/',
      type: 'link'
    }],
    id: 'drm6',
    worldPoint: {
      x: 109636.84375,
      y: -42862.70749414769,
      z: -1975.9772245269478
    },
    dbId: 55880,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Amperage',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[108568.99323124335,-44169.16155437489,-1036.5156156322148],
        "target":[187032.95120947785,75592.34119588383,-86749.63746024927],
        "up":[0.28149083948169307,0.4296465130666859,0.8580016206846753],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-18745.682657509322,
        "aspectRatio":1.667722687007874,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  {
    status: 'OK',
    name: 'DRM',
    type: 'DRMs',
    metadata: [{
      name: 'Location',
      value: 'A1-S7'
    }, {
      name: 'Unit No',
      value: '03-0130'
    }, {
      name: 'Type',
      value: 'Multishuttle 2'
    },{
      name: 'Model',
      value: 'DMS 2'
    }, {
      name: 'Manual',
      value: 'https://www.dematic.com/en/multishuttle/',
      type: 'link'
    }],
    id: 'drm7',
    worldPoint: {
      x: 113540.19472509806,
      y: -42927.3046875,
      z: -1960.391485907252
    },
    dbId: 65622,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Temperature',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Amperage',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[112808.74983141491,-44046.97840172456,-1036.5156125116055],
        "target":[182399.3672640348,82434.44968931103,-84736.83707162837],
        "up":[0.2417921272004978,0.4394588620958721,0.8651083606978143],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-13176.813542544678,
        "aspectRatio":1.667722687007874,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  },

  //Sorters
  {
    status: 'OK',
    name: 'Sorter',
    type: 'sorters',
    metadata: [{
      name: 'Location',
      value: 'CC-02'
    }, {
      name: 'Unit No',
      value: '01-0100'
    }, {
      name: 'Type',
      value: 'FlexSort SL2 Shoe Sorter'
    },{
      name: 'Model',
      value: '2430'
    }, {
      name: 'Manual',
      value: 'http://www.dematic.com/en/flexsort-sl2',
      type: 'link'
    }],
    id: 's1',
    worldPoint: {
      x: 98061.3494749924,
      y: -50445.77515058874,
      z: -2269.64990234375
    },
    dbId: 55999,
    graphData: [{
      threshold: 20 + (0.5 - Math.random()) * 2,
      name: 'Amperage',
      randomRange: 10.0,
      randomBase: 23.0,
      max: 50.0,
      min: 0.0
    }, {
      threshold: 0.5 + (0.5 - Math.random()) * 0.2,
      name: 'Vibration',
      randomRange: 0.3,
      randomBase: 0.7,
      max: 2.0,
      min: 0.0
    }],
    state: {
      "viewport":{
        "eye":[96551.90306841617,-51634.62821215773,-538.3284455574643],
        "target":[160904.9478088526,54515.30330125261,-112059.7486808408],
        "up":[0.3464622045153781,0.5714871678508734,0.7438859844251215],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-1332.65625,-2874.078125,-7449],
        "distanceToOrbit":-2112.7162953651323,
        "aspectRatio":1.4810581140350878,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":75
      }
    }
  }
]

module.exports = {
  initialState,
  items
}
