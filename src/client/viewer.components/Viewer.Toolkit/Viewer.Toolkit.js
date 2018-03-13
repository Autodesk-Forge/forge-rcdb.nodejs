

export default class Toolkit {

  ///////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  // Toolbar button
  //
  /////////////////////////////////////////////////////////
  static createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id)

    button.icon.style.fontSize = '24px'

    button.icon.className = className

    button.setToolTip(tooltip)

    button.onClick = handler

    return button
  }

  /////////////////////////////////////////////////////////
  // Control group
  //
  /////////////////////////////////////////////////////////
  static createControlGroup (viewer, ctrlGroupName) {

    var viewerToolbar = viewer.getToolbar(true)

    if (viewerToolbar) {

      var ctrlGroup =  new Autodesk.Viewing.UI.ControlGroup(
        ctrlGroupName)

      viewerToolbar.addControl(ctrlGroup)

      return ctrlGroup
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static getLeafNodes (model, dbIds) {

    return new Promise((resolve, reject) => {

      try {

        const instanceTree =
          model.getData().instanceTree ||
          model.getFragmentMap()

        dbIds = dbIds || instanceTree.getRootId()

        const dbIdArray = Array.isArray(dbIds)
          ? dbIds
          : [dbIds]

        const leafIds = []

        const getLeafNodeIdsRec = (id) => {

          let childCount = 0;

          instanceTree.enumNodeChildren(id, (childId) => {
            getLeafNodeIdsRec(childId)
            ++childCount
          })

          if (childCount === 0) {

            leafIds.push(id)
          }
        }

        dbIdArray.forEach((dbId) => {
          getLeafNodeIdsRec(dbId)
        })

        return resolve(leafIds)

      } catch(ex){

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // get node fragIds
  //
  /////////////////////////////////////////////////////////
  static getFragIds (model, dbIds) {

    return new Promise(async(resolve, reject) => {

      try {

        const it = model.getData().instanceTree

        dbIds = dbIds || it.getRootId()

        const dbIdArray = Array.isArray(dbIds)
          ? dbIds : [dbIds]

        const leafIds = it
          ? await Toolkit.getLeafNodes(model, dbIdArray)
          : dbIdArray

        let fragIds = []

        for(var i=0; i< leafIds.length; ++i) {

          if (it) {

            it.enumNodeFragments(
              leafIds[i], (fragId) => {
                fragIds.push(fragId)
              })

          } else {

            const leafFragIds =
              Toolkit.getLeafFragIds(
                model, leafIds[i])

            fragIds = [
              ...fragIds,
              ...leafFragIds
            ]
          }
        }

        return resolve(fragIds)

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // get leaf node fragIds
  //
  /////////////////////////////////////////////////////////
  static getLeafFragIds (model, leafId) {

   if (model.getData().instanceTree) {

     const it = model.getData().instanceTree

     const fragIds = []

     it.enumNodeFragments(
       leafId, (fragId) => {
         fragIds.push(fragId)
       })

     return fragIds

   } else {

     const fragments = model.getData().fragments

     const fragIds = fragments.dbId2fragId[leafId]

     return !Array.isArray(fragIds)
       ? [fragIds]
       : fragIds
   }
  }

  /////////////////////////////////////////////////////////
  // Node bounding box
  //
  /////////////////////////////////////////////////////////
  static getWorldBoundingBox (model, dbId) {

    return new Promise(async(resolve, reject) => {

      try {

        var fragIds =
          await Toolkit.getFragIds(
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

  /////////////////////////////////////////////////////////
  // Gets properties from component
  //
  /////////////////////////////////////////////////////////
  static getProperties (model, dbId, requestedProps = null) {

    return new Promise((resolve, reject) => {

      try {

        const dbIdInt = parseInt(dbId)

        if (isNaN(dbIdInt)) {

          return reject(dbId + ' is not a valid integer')
        }

        if (requestedProps) {

          const propTasks = requestedProps.map((displayName) => {

            return Toolkit.getProperty(
              model, dbIdInt, displayName, 'Not Available')
          })

          Promise.all(propTasks).then((properties) => {

            resolve(properties)
          })

        } else {

          model.getProperties(dbIdInt, (result) => {

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  // Gets all existing properties from component  dbIds
  //
  /////////////////////////////////////////////////////////
  static getPropertyList (viewer, dbIds, model = null) {

    return new Promise(async(resolve, reject) => {

      try {

        model = model || viewer.activeModel || viewer.model

        var propertyTasks = dbIds.map((dbId) => {

          return Toolkit.getProperties(model, dbId)
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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
          ? propFilter : [propFilter]

        model.getBulkProperties(dbIds, propFilterArray, (result) => {

          resolve (result)

        }, (error) => {

          reject(error)
        })
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Maps components by property
  //
  /////////////////////////////////////////////////////////
  static mapComponentsByProp (model, propFilter, components, defaultProp) {

    return new Promise(async (resolve, reject) => {

      try {

        const results = await Toolkit.getBulkPropertiesAsync(
          model, components, propFilter)

        const propertyResults = results.map((result) => {

          const prop = result.properties[0]

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static drawBox (viewer, min, max, material, overlayId) {

    const geometry = new THREE.Geometry()

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z))

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z))

    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z))

    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z))

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z))

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z))

    const lines = new THREE.Line(geometry,
      material, THREE.LinePieces)

    viewer.impl.addOverlay(overlayId, lines)

    viewer.impl.invalidate(
      true, true, true)

    return lines
  }

  /////////////////////////////////////////////////////////
  // Set component material
  //
  /////////////////////////////////////////////////////////
  static async setMaterial(model, dbId, material) {

    const fragIds = await Toolkit.getFragIds(
      model, dbId)

    const fragList = model.getFragmentList()

    fragIds.forEach((fragId) => {

      fragList.setMaterial(fragId, material)
    })
  }

  /////////////////////////////////////////////////////////
  // Recursively builds the model tree
  //
  /////////////////////////////////////////////////////////
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

            node.children.push(childNode)
          }

          _buildModelTreeRec(childNode)
        })
    }

    //get model instance tree and root component
    var instanceTree = model.getData().instanceTree

    var rootId = instanceTree.getRootId()

    var rootNode = {
      dbId: rootId,
      name: instanceTree.getNodeName(rootId)
    }

    _buildModelTreeRec(rootNode)

    return rootNode
  }

  /////////////////////////////////////////////////////////
  // Recursively execute task on model tree
  //
  /////////////////////////////////////////////////////////
  static executeTaskOnModelTree (model, task) {

    const taskResults = []

    function executeTaskOnModelTreeRec(dbId){

      instanceTree.enumNodeChildren(dbId,
        function(childId) {

          taskResults.push(task(model, childId))

          executeTaskOnModelTreeRec(childId)
        })
    }

    //get model instance tree and root component
    const instanceTree = model.getData().instanceTree

    const rootId = instanceTree.getRootId()

    executeTaskOnModelTreeRec(rootId)

    return taskResults
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static async isolateFull (viewer, dbIds = [], model = null) {

    try {

      model = model || viewer.activeModel || viewer.model

      const vizMng = viewer.impl.visibilityManager

      vizMng.isolate(dbIds, model)

      const targetIds = Array.isArray(dbIds) ? dbIds : [dbIds]

      const targetLeafIds = await Toolkit.getLeafNodes(
        model, targetIds)

      const leafIds = await Toolkit.getLeafNodes (model)

      const leafTasks = leafIds.map((dbId) => {

        return new Promise((resolveLeaf) => {

          const show = !targetLeafIds.length  ||
            targetLeafIds.indexOf(dbId) > -1

          vizMng.setNodeOff(dbId, !show, model)

          resolveLeaf()
        })
      })

      return Promise.all(leafTasks)

    } catch (ex) {

      return Promise.reject(ex)
    }
  }

  ///////////////////////////////////////////////////////////////////
  // Rotate selected fragments
  //
  ///////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  // A fix for viewer.restoreState
  // that also restores pivotPoint
  //
  /////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static getComponentsByParentName (name, model) {

    const instanceTree = model.getData().instanceTree

    const rootId = instanceTree.getRootId()

    let parentId = 0

    instanceTree.enumNodeChildren(rootId,
      (childId) => {

        const nodeName = instanceTree.getNodeName(childId)

        if (nodeName.indexOf(name) > -1) {

          parentId = childId
        }
      })

    return parentId > 0
      ? Toolkit.getLeafNodes(model, parentId)
      : []
  }

  /////////////////////////////////////////////////////////
  // Creates a standard THREE.Mesh out of a Viewer
  // component
  //
  /////////////////////////////////////////////////////////
  static buildComponentGeometry (
    viewer, model, dbId, faceFilter) {

    // first we assume the component dbId is a leaf
    // component: ie has no child so contains
    // geometry. This util method will return all fragIds
    // associated with that specific dbId
    const fragIds = Toolkit.getLeafFragIds(model, dbId)

    let matrixWorld = null

    const meshGeometry = new THREE.Geometry()

    fragIds.forEach((fragId) => {

      // for each fragId, get the proxy in order to access
      // THREE geometry
      const renderProxy =
        viewer.impl.getRenderProxy(
          model, fragId)

      matrixWorld = matrixWorld || renderProxy.matrixWorld

      const geometry = renderProxy.geometry

      const attributes = geometry.attributes

      const positions = geometry.vb
        ? geometry.vb
        : attributes.position.array

      const indices = attributes.index.array || geometry.ib

      const stride = geometry.vb ? geometry.vbstride : 3

      const offsets = [{
        count: indices.length,
        index: 0,
        start: 0
      }]

      for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {

        var start = offsets[oi].start
        var count = offsets[oi].count
        var index = offsets[oi].index

        for (var i = start, il = start + count; i < il; i += 3) {

          const a = index + indices[i]
          const b = index + indices[i + 1]
          const c = index + indices[i + 2]

          const vA = new THREE.Vector3()
          const vB = new THREE.Vector3()
          const vC = new THREE.Vector3()

          vA.fromArray(positions, a * stride)
          vB.fromArray(positions, b * stride)
          vC.fromArray(positions, c * stride)

          if (!faceFilter || faceFilter(vA, vB, vC)) {

            const faceIdx = meshGeometry.vertices.length

            meshGeometry.vertices.push(vA)
            meshGeometry.vertices.push(vB)
            meshGeometry.vertices.push(vC)

            const face = new THREE.Face3(
              faceIdx, faceIdx + 1, faceIdx + 2)

            meshGeometry.faces.push(face)
          }
        }
      }
    })

    meshGeometry.applyMatrix(matrixWorld)

    return meshGeometry
  }

  /////////////////////////////////////////////////////////
  // Creates a standard THREE.Mesh out of a Viewer
  // component
  //
  /////////////////////////////////////////////////////////
  static buildComponentMesh (
    viewer, model, dbId, faceFilter, material) {

    const meshGeometry =
      Toolkit.buildComponentGeometry(
        viewer, model, dbId, faceFilter)

    meshGeometry.computeFaceNormals()
    meshGeometry.computeVertexNormals()

    // creates THREE.Mesh
    const mesh = new THREE.Mesh(
      meshGeometry, material)

    mesh.dbId = dbId

    return mesh
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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


