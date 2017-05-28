

export default class ViewerToolkit {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  static guid(format = 'xxxxxxxxxxxx') {

    var d = new Date().getTime();

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });

    return guid;
  }

  /////////////////////////////////////////////
  //mobile detection
  //
  /////////////////////////////////////////////
  static get mobile() {

    return {

      getUserAgent: function () {
        return navigator.userAgent;
      },
      isAndroid: function () {
        return this.getUserAgent().match(/Android/i);
      },
      isBlackBerry: function () {
        return this.getUserAgent().match(/BlackBerry/i);
      },
      isIOS: function () {
        return this.getUserAgent().match(/iPhone|iPad|iPod/i);
      },
      isOpera: function () {
        return this.getUserAgent().match(/Opera Mini/i);
      },
      isWindows: function () {
        return this.isWindowsDesktop() || this.isWindowsMobile();
      },
      isWindowsMobile: function () {
        return this.getUserAgent().match(/IEMobile/i);
      },
      isWindowsDesktop: function () {
        return this.getUserAgent().match(/WPDesktop/i);
      },
      isAny: function () {

        return this.isAndroid() ||
          this.isBlackBerry() ||
          this.isIOS() ||
          this.isWindowsMobile();
      }
    }
  }

  /////////////////////////////////////////////////////////
  // Load a document from URN
  //
  /////////////////////////////////////////////////////////
  static loadDocument (urn) {

    return new Promise((resolve, reject) => {

      const paramUrn = !urn.startsWith('urn:')
        ? 'urn:' + urn
        : urn

      Autodesk.Viewing.Document.load(paramUrn, (doc) => {

        resolve (doc)

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Return viewables
  //
  /////////////////////////////////////////////////////////
  static getViewableItems (doc, roles = ['3d', '2d']) {

    const rootItem = doc.getRootItem()

    let items = []

    const roleArray = roles
      ? (Array.isArray(roles) ? roles : [roles])
      : []

    roleArray.forEach((role) => {

      items = [ ...items,
        ...Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, { type: 'geometry', role }, true) ]
    })

    return items
  }

  /////////////////////////////////////////////////////////////////
  // Toolbar button
  //
  /////////////////////////////////////////////////////////////////
  static createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id)

    button.icon.style.fontSize = '24px'

    button.icon.className = className

    button.setToolTip(tooltip)

    button.onClick = handler

    return button
  }

  /////////////////////////////////////////////////////////////////
  // Control group
  //
  /////////////////////////////////////////////////////////////////
  static createControlGroup (viewer, ctrlGroupName) {

    var viewerToolbar = viewer.getToolbar(true)

    if (viewerToolbar) {

      var ctrlGroup =  new Autodesk.Viewing.UI.ControlGroup(
        ctrlGroupName)

      viewerToolbar.addControl(ctrlGroup)

      return ctrlGroup
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static getLeafNodes (model, dbIds) {

    return new Promise((resolve, reject)=>{

      try {

        const instanceTree = model.getData().instanceTree

        dbIds = dbIds || instanceTree.getRootId()

        const dbIdArray = Array.isArray(dbIds) ? dbIds : [dbIds]

        let leafIds = []

        const getLeafNodesRec = (id) => {

          var childCount = 0;

          instanceTree.enumNodeChildren(id, (childId) => {

              getLeafNodesRec(childId)

              ++childCount
            })

          if (childCount == 0) {

            leafIds.push(id)
          }
        }

        for (var i = 0; i < dbIdArray.length; ++i) {

          getLeafNodesRec(dbIdArray[i])
        }

        return resolve(leafIds)

      } catch(ex){

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // get node fragIds
  //
  /////////////////////////////////////////////////////////////////
  static getFragIds (model, dbIds) {

    return new Promise(async(resolve, reject) => {

      try {

        const dbIdArray = Array.isArray(dbIds) ? dbIds : [dbIds]

        const instanceTree = model.getData().instanceTree

        const leafIds = await ViewerToolkit.getLeafNodes(
          model, dbIdArray)

        let fragIds = []

        for(var i=0; i< leafIds.length; ++i) {

          instanceTree.enumNodeFragments(
            leafIds[i], (fragId) => {
              fragIds.push(fragId)
            })
        }

        return resolve(fragIds)

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // get leaf node fragIds
  //
  /////////////////////////////////////////////////////////////////
  static getLeafFragIds (model, leafId) {

    const instanceTree = model.getData().instanceTree

    const fragIds = []

    instanceTree.enumNodeFragments(
      leafId, (fragId) => {
        fragIds.push(fragId)
      })

    return fragIds
  }

  /////////////////////////////////////////////////////////////////
  // Node bounding box
  //
  /////////////////////////////////////////////////////////////////
  static getWorldBoundingBox (model, dbId) {

    return new Promise(async(resolve, reject) => {

      try {

        var fragIds =
          await ViewerToolkit.getFragIds(
            model, dbId)

        if (!fragIds.length) {

          return reject('No geometry, invalid dbId?')
        }

        var fragList = model.getFragmentList()

        var fragbBox = new THREE.Box3()
        var nodebBox = new THREE.Box3()

        fragIds.forEach(function(fragId) {

          fragList.getWorldBounds(fragId, fragbBox)
          nodebBox.union(fragbBox)
        })

        return resolve(nodebBox)

      } catch(ex){

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Gets properties from component
  //
  /////////////////////////////////////////////////////////////////
  static getProperties (model, dbId, requestedProps = null) {

    return new Promise((resolve, reject) => {

      try {

        const dbIdInt = parseInt(dbId)

        if (isNaN(dbIdInt)) {

          return reject(dbId + ' is not a valid integer')
        }

        if (requestedProps) {

          const propTasks = requestedProps.map((displayName) => {

            return ViewerToolkit.getProperty(
              model, dbIdInt, displayName, 'Not Available')
          })

          Promise.all(propTasks).then((properties) => {

            resolve(properties)
          })

        } else {

          model.getProperties(dbIdInt, function(result) {

            if (result.properties) {

              return resolve(
                result.properties)
            }

            return reject('No Properties')
          })
        }

      } catch (ex) {

          return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static getProperty (model, dbId, displayName, defaultValue) {

    return new Promise((resolve, reject) => {

      try {

        model.getProperties(dbId, (result) => {

          if (result.properties) {

            result.properties.forEach((prop) => {

              prop.dbId = dbId

              if (typeof displayName === 'function') {

                if (displayName (prop.displayName)){

                  resolve(prop)
                }

              } else if (displayName === prop.displayName) {

                resolve(prop)
              }
            })

            if (defaultValue) {

              return resolve({
                displayValue: defaultValue,
                displayName,
                dbId
              })
            }

            reject(new Error('Not Found'))

          } else {

            reject(new Error('Error getting properties'));
          }
        })

      } catch(ex){

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Gets all existing properties from component  dbIds
  //
  /////////////////////////////////////////////////////////////////
  static getPropertyList (viewer, dbIds, model = null) {

    return new Promise(async(resolve, reject) => {

      try {

        model = model || viewer.activeModel || viewer.model

        var propertyTasks = dbIds.map((dbId) => {

          return ViewerToolkit.getProperties(model, dbId)
        })

        var propertyResults = await Promise.all(
          propertyTasks)

        var properties = []

        propertyResults.forEach((propertyResult) => {

          propertyResult.forEach((prop) => {

            if (properties.indexOf(prop.displayName) < 0){

              properties.push(prop.displayName)
            }
          })
        })

        return resolve(properties.sort())

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static getBulkPropertiesAsync (model, dbIds, propFilter) {

    return new Promise(async(resolve, reject) => {

      if (typeof propFilter === 'function') {

        const propTasks = dbIds.map((dbId) => {

          return this.getProperty(
            model, dbId, propFilter, 'Not Found')
        })

        const propRes = await Promise.all(propTasks)

        const filteredRes = propRes.filter((res) => {

          return res.displayValue !== 'Not Found'
        })

        resolve(filteredRes.map((res) => {

          return {
            properties: [res],
            dbId: res.dbId
          }
        }))

      } else {

        const propFilterArray = Array.isArray (propFilter)
          ? propFilter :[propFilter]


        model.getBulkProperties(dbIds, propFilterArray, (result) => {

          resolve (result)

        }, (error) => {

          reject(error)
        })
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Maps components by property
  //
  /////////////////////////////////////////////////////////////////
  static mapComponentsByProp (model, propFilter, components, defaultProp) {

    return new Promise(async (resolve, reject) => {

      try {

        const results = await ViewerToolkit.getBulkPropertiesAsync(
          model, components, propFilter)

        const propertyResults = results.map((result) => {

          const prop = result.properties[0]

          //const prop = _.find(result.properties, {
          //  displayName: propFilter
          //})

          return Object.assign({}, prop, {
            dbId: result.dbId
          })
        })

        var componentsMap = {};

        propertyResults.forEach((result) => {

          var value = result.displayValue;

          if (typeof value == 'string') {

            value = value.split(':')[0]
          }

          if (!componentsMap[value]) {

            componentsMap[value] = []
          }

          componentsMap[value].push(result.dbId)
        })

        return resolve(componentsMap)

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////
  // Runs recursively the argument task on each node
  // of the data tree
  //
  /////////////////////////////////////////////////////////////
  static runTaskOnDataTree(root, taskFunc) {

    var tasks = [];

    var runTaskOnDataTreeRec = (node, parent=null)=> {

      if (node.children) {

        node.children.forEach((childNode)=> {

          runTaskOnDataTreeRec(childNode, node);
        });
      }

      var task = taskFunc(node, parent);

      tasks.push(task);
    }

    runTaskOnDataTreeRec(root);

    return Promise.all(tasks);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static drawBox(viewer, min, max, material = null) {

    var _material = material;

    if(!_material) {

      _material = new THREE.LineBasicMaterial({
        color: 0xffff00,
        linewidth: 2
      })

      viewer.impl.matman().addMaterial(
        'ADN-Material-Line',
        _material,
        true)
    }

    function drawLines(coordsArray, mat) {

      var lines = []

      for (var i = 0; i < coordsArray.length; i+=2) {

        var start = coordsArray[i]
        var end = coordsArray[i+1]

        var geometry = new THREE.Geometry()

        geometry.vertices.push(new THREE.Vector3(
          start.x, start.y, start.z))

        geometry.vertices.push(new THREE.Vector3(
          end.x, end.y, end.z))

        geometry.computeLineDistances()

        var line = new THREE.Line(geometry, mat)

        viewer.impl.scene.add(line)

        lines.push(line)
      }

      return lines
    }

    var lines = drawLines([

        {x: min.x, y: min.y, z: min.z},
        {x: max.x, y: min.y, z: min.z},

        {x: max.x, y: min.y, z: min.z},
        {x: max.x, y: min.y, z: max.z},

        {x: max.x, y: min.y, z: max.z},
        {x: min.x, y: min.y, z: max.z},

        {x: min.x, y: min.y, z: max.z},
        {x: min.x, y: min.y, z: min.z},

        {x: min.x, y: max.y, z: max.z},
        {x: max.x, y: max.y, z: max.z},

        {x: max.x, y: max.y, z: max.z},
        {x: max.x, y: max.y, z: min.z},

        {x: max.x, y: max.y, z: min.z},
        {x: min.x, y: max.y, z: min.z},

        {x: min.x, y: max.y, z: min.z},
        {x: min.x, y: max.y, z: max.z},

        {x: min.x, y: min.y, z: min.z},
        {x: min.x, y: max.y, z: min.z},

        {x: max.x, y: min.y, z: min.z},
        {x: max.x, y: max.y, z: min.z},

        {x: max.x, y: min.y, z: max.z},
        {x: max.x, y: max.y, z: max.z},

        {x: min.x, y: min.y, z: max.z},
        {x: min.x, y: max.y, z: max.z}],

      _material);

    viewer.impl.sceneUpdated(true)

    return lines
  }

  /////////////////////////////////////////////////////////////////
  // Set component material
  //
  /////////////////////////////////////////////////////////////////
  static async setMaterial(model, dbId, material) {

    const fragIds = await ViewerToolkit.getFragIds(model, dbId)

    const fragList = model.getFragmentList()

    fragIds.forEach((fragId) => {

      fragList.setMaterial(fragId, material)
    })
  }

  /////////////////////////////////////////////////////////////////
  // Recursively builds the model tree
  //
  /////////////////////////////////////////////////////////////////
  static buildModelTree (model, createNodeFunc = null){

    //builds model tree recursively
    function _buildModelTreeRec(node){

      instanceTree.enumNodeChildren(node.dbId,
        function(childId) {

          var childNode = null;

          if(createNodeFunc){

            childNode = createNodeFunc(childId);

          } else {

            node.children = node.children || [];

            childNode = {
              dbId: childId,
              name: instanceTree.getNodeName(childId)
            }

            node.children.push(childNode);
          }

          _buildModelTreeRec(childNode);
        });
    }

    //get model instance tree and root component
    var instanceTree = model.getData().instanceTree;

    var rootId = instanceTree.getRootId();

    var rootNode = {
      dbId: rootId,
      name: instanceTree.getNodeName(rootId)
    }

    _buildModelTreeRec(rootNode);

    return rootNode;
  }

  /////////////////////////////////////////////////////////////////
  // Recursively execute task on model tree
  //
  /////////////////////////////////////////////////////////////////
  static executeTaskOnModelTree (model, task) {

    var taskResults = [];

    function _executeTaskOnModelTreeRec(dbId){

      instanceTree.enumNodeChildren(dbId,
        function(childId) {

          taskResults.push(task(model, childId));

          _executeTaskOnModelTreeRec(childId);
        });
    }

    //get model instance tree and root component
    var instanceTree = model.getData().instanceTree;

    var rootId = instanceTree.getRootId();

    _executeTaskOnModelTreeRec(rootId);

    return taskResults;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static hide (viewer, dbIds = [], model = null) {

    try {

      model = model || viewer.activeModel || viewer.model

      viewer.hide (dbIds)

      const targetIds = Array.isArray(dbIds) ? dbIds : [dbIds]

      const tasks = targetIds.map((dbId) => {

        return new Promise((resolve) => {

          viewer.impl.visibilityManager.setNodeOff(
            dbId, true)

          resolve()
        })
      })

      return Promise.all(tasks)

    } catch (ex) {

      return Promise.reject(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static show (viewer, dbIds = [], model = null) {

    try {

      model = model || viewer.activeModel || viewer.model

      viewer.show (dbIds)

      const targetIds = Array.isArray(dbIds) ? dbIds : [dbIds]

      targetIds.forEach((dbId) => {

        viewer.impl.visibilityManager.setNodeOff(
          dbId, false)
      })

      return Promise.resolve()

    } catch (ex) {

      return Promise.reject(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static async isolateFull (viewer, dbIds = [], model = null) {

    try {

      model = model || viewer.activeModel || viewer.model

      viewer.isolate(dbIds)

      const targetIds = Array.isArray(dbIds) ? dbIds : [dbIds]

      const targetLeafIds = await ViewerToolkit.getLeafNodes(
        model, targetIds)

      const leafIds = await ViewerToolkit.getLeafNodes (model)

      const leafTasks = leafIds.map((dbId) => {

        return new Promise((resolveLeaf) => {

          const show = !targetLeafIds.length  ||
            targetLeafIds.indexOf(dbId) > -1

          viewer.impl.visibilityManager.setNodeOff(
            dbId, !show)

          resolveLeaf()
        })
      })

      return Promise.all(leafTasks)

    } catch (ex) {

      return Promise.reject(ex)
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // Rotate selected fragments
  //
  ///////////////////////////////////////////////////////////////////////////
  static rotateFragments (viewer, fragIds, axis, angle, center, model = null) {

    var quaternion = new THREE.Quaternion()

    quaternion.setFromAxisAngle(axis, angle)

    model = model || viewer.activeModel || viewer.model

    fragIds.forEach((fragId) => {

      var fragProxy = viewer.impl.getFragmentProxy(
        model, fragId)

      fragProxy.getAnimTransform()

      var position = new THREE.Vector3(
        fragProxy.position.x - center.x,
        fragProxy.position.y - center.y,
        fragProxy.position.z - center.z)

      position.applyQuaternion(quaternion)

      position.add(center)

      fragProxy.position = position

      fragProxy.quaternion.multiplyQuaternions(
        quaternion, fragProxy.quaternion)

      fragProxy.updateAnimTransform()
    })
  }

  /////////////////////////////////////////////////////////////////
  // A fix for viewer.restoreState
  // that also restores pivotPoint
  //
  /////////////////////////////////////////////////////////////////
  static restoreStateWithPivot (
    viewer, state, filter = null, immediate = false) {

    const onStateRestored = () => {

      viewer.removeEventListener(
        Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT,
        onStateRestored)

      const pivot = state.viewport.pivotPoint

      setTimeout(() => {

        viewer.navigation.setPivotPoint(
          new THREE.Vector3(
            pivot[0], pivot[1], pivot[2]))
      }, immediate ? 0 : 1250)
    }

    viewer.addEventListener(
      Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT,
      onStateRestored)

    viewer.restoreState(state, filter, immediate)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static selectiveExplode (viewer, scale, excludedFragIds, model = null) {

    model = model || viewer.activeModel || viewer.model

    var svf = model.getData();

    var mc = model.getVisibleBounds(true).center();

    var fragList = model.getFragmentList();

    var pt = new THREE.Vector3();

    //Input scale is in the range 0-1, where 0
    //means no displacement, and 1 maximum reasonable displacement.
    scale *= 2;

    //If we have a full part hierarchy we can use a
    //better grouping strategy when exploding
    if (svf.instanceTree && svf.instanceTree.nodeAccess.nodeBoxes && scale !== 0) {

      var scaledExplodeDepth = scale * (svf.instanceTree.maxDepth - 1) + 1;
      var explodeDepth = 0 | scaledExplodeDepth;
      var currentSegmentFraction = scaledExplodeDepth - explodeDepth;

      var it = svf.instanceTree;
      var tmpBox = new Float32Array(6);

      (function explodeRec(nodeId, depth, cx, cy, cz, ox, oy, oz) {

        var oscale = scale * 2;

        // smooth transition of this tree depth
        // from non-exploded to exploded state
        if (depth == explodeDepth)
          oscale *= currentSegmentFraction;

        it.getNodeBox(nodeId, tmpBox);

        var mycx = 0.5 * (tmpBox[0] + tmpBox[3]);
        var mycy = 0.5 * (tmpBox[1] + tmpBox[4]);
        var mycz = 0.5 * (tmpBox[2] + tmpBox[5]);

        if (depth > 0 && depth <= explodeDepth) {
          var dx = (mycx - cx) * oscale;
          var dy = (mycy - cy) * oscale;
          var dz = (mycz - cz) * oscale;

          //var omax = Math.max(dx, Math.max(dy, dz));
          ox += dx;
          oy += dy;
          oz += dz;
        }

        svf.instanceTree.enumNodeChildren(nodeId, function(dbId) {

          explodeRec(dbId, depth+1, mycx, mycy, mycz, ox, oy, oz);

        }, false);

        svf.instanceTree.enumNodeFragments(nodeId, function(fragId) {

          if (excludedFragIds.indexOf(fragId.toString()) < 0) {

            pt.x = ox;
            pt.y = oy;
            pt.z = oz;

            fragList.updateAnimTransform(fragId, null, null, pt);
          }

        }, false);

      })(svf.instanceTree.getRootId(), 0, mc.x, mc.y, mc.x, 0, 0, 0);

    } else {

      var boxes = fragList.fragments.boxes;

      var nbFrags = fragList.getCount()

      for (var fragId = 0; fragId < nbFrags; ++fragId) {

        if(excludedFragIds.indexOf(fragId.toString()) < 0) {

          if (scale == 0) {

            fragList.updateAnimTransform(fragId);

          } else {

            var box_offset = fragId * 6;

            var cx = 0.5 * (boxes[box_offset] + boxes[box_offset + 3]);
            var cy = 0.5 * (boxes[box_offset + 1] + boxes[box_offset + 4]);
            var cz = 0.5 * (boxes[box_offset + 2] + boxes[box_offset + 5]);

            cx = scale * (cx - mc.x);
            cy = scale * (cy - mc.y);
            cz = scale * (cz - mc.z);

            pt.x = cx;
            pt.y = cy;
            pt.z = cz;

            fragList.updateAnimTransform(fragId, null, null, pt);
          }
        }
      }
    }
  }
}


