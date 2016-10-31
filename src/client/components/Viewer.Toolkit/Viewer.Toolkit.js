

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

  //////////////////////////////////////////////////////////////////////////
  // Return default viewable path: first 3d or 2d item
  //
  //////////////////////////////////////////////////////////////////////////
  static getDefaultViewablePath (doc, roles = ['3d', '2d']) {

    var rootItem = doc.getRootItem()

    let roleArray = [...roles]

    let items = []

    roleArray.forEach((role) => {

      items = [ ...items,
        ...Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, { type: 'geometry', role }, true) ]
    })

    return items.length ? doc.getViewablePath(items[0]) : null
  }

  /////////////////////////////////////////////////////////////////
  // Toolbar button
  //
  /////////////////////////////////////////////////////////////////
  static createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id);

    button.icon.style.fontSize = '24px';

    button.icon.className = className;

    button.setToolTip(tooltip);

    button.onClick = handler;

    return button;
  }

  /////////////////////////////////////////////////////////////////
  // Control group
  //
  /////////////////////////////////////////////////////////////////
  static createControlGroup(viewer, ctrlGroupName) {

    var viewerToolbar = viewer.getToolbar(true);

    if(viewerToolbar){

      var ctrlGroup =  new Autodesk.Viewing.UI.ControlGroup(
        ctrlGroupName);

      viewerToolbar.addControl(ctrlGroup);

      return ctrlGroup;
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

      try{

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

      } catch(ex){

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Node bounding box
  //
  /////////////////////////////////////////////////////////////////
  static getWorldBoundingBox(model, dbId) {

    return new Promise(async(resolve, reject)=>{

      try{

        var fragIds = await ViewerToolkit.getFragIds(
          model, dbId);

        if(!fragIds.length){

          return reject('No geometry, invalid dbId?');
        }

        var fragList = model.getFragmentList();

        var fragbBox = new THREE.Box3();
        var nodebBox = new THREE.Box3();

        fragIds.forEach(function(fragId) {

          fragList.getWorldBounds(fragId, fragbBox);
          nodebBox.union(fragbBox);
        });

        return resolve(nodebBox);
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  // Gets properties from component
  //
  /////////////////////////////////////////////////////////////////
  static getProperties(model, dbId, requestedProps = null) {

    return new Promise((resolve, reject) => {

      try {

        if (requestedProps) {

          const propTasks = requestedProps.map((displayName) => {

            return ViewerToolkit.getProperty(
              model, dbId, displayName, 'Not Available')
          })

          Promise.all(propTasks).then((properties) => {

            resolve(properties)
          })

        } else {

          model.getProperties(dbId, function(result) {

            if (result.properties) {

              return resolve(
                result.properties)
            }

            return reject('No Properties')
          })
        }

      } catch (ex) {

          console.log(ex)
          return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static getProperty(model, dbId, displayName, defaultValue) {

    return new Promise((resolve, reject) => {

      try{

        model.getProperties(dbId, function(result){

          if (result.properties) {

            result.properties.forEach((prop) => {

              if(typeof displayName === 'function') {

                if(displayName(prop.displayName)){

                  resolve(prop)
                }

              } else if (displayName === prop.displayName) {

                resolve(prop)
              }
            });

            if (defaultValue) {

              return resolve({
                displayValue: defaultValue,
                displayName
              })
            }

            reject(new Error('Not Found'))

          } else {

            reject(new Error('Error getting properties'));
          }
        })
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  // Gets all existing properties from component  dbIds
  //
  /////////////////////////////////////////////////////////////////
  static getPropertyList (model, dbIds) {

    return new Promise(async(resolve, reject)=>{

      try{

        var propertyTasks = dbIds.map((dbId)=>{

          return ViewerToolkit.getProperties(model, dbId);
        });

        var propertyResults = await Promise.all(
          propertyTasks
        );

        var properties = [];

        propertyResults.forEach((propertyResult)=>{

          propertyResult.forEach((prop)=>{

            if(properties.indexOf(prop.displayName) < 0){

              properties.push(prop.displayName);
            }
          });
        });

        return resolve(properties.sort());
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static getBulkPropertiesAsync (model, dbIds, propFilter) {

    return new Promise((resolve, reject) => {

      model.getBulkProperties(dbIds, propFilter, (result) => {

        resolve (result)

      }, (error) => {

        reject(error)
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // Maps components by property
  //
  /////////////////////////////////////////////////////////////////
  static mapComponentsByProp (model, propName, components, defaultProp) {

    return new Promise(async(resolve, reject) => {

      try {

        const results = await ViewerToolkit.getBulkPropertiesAsync(
          model, components, [propName])

        const propertyResults = results.map((result) => {

          return Object.assign({}, result.properties[0], {
            dbId: result.dbId
          })
        })

        var componentsMap = {};

        propertyResults.forEach((result) => {

          var value = result.displayValue;

          if(typeof value == 'string'){

            value = value.split(':')[0]
          }

          if (!componentsMap[value]) {

            componentsMap[value] = []
          }

          componentsMap[value].push(result.dbId)
        })

        return resolve(componentsMap)

      } catch(ex){

        return reject(ex);
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
      });

      viewer.impl.matman().addMaterial(
        'ADN-Material-Line',
        _material,
        true);
    }

    function drawLines(coordsArray, mat) {

      var lines = [];

      for (var i = 0; i < coordsArray.length; i+=2) {

        var start = coordsArray[i];
        var end = coordsArray[i+1];

        var geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(
          start.x, start.y, start.z));

        geometry.vertices.push(new THREE.Vector3(
          end.x, end.y, end.z));

        geometry.computeLineDistances();

        var line = new THREE.Line(geometry, mat);

        viewer.impl.scene.add(line);

        lines.push(line);
      }

      return lines;
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

    viewer.impl.sceneUpdated(true);

    return lines;
  }

  /////////////////////////////////////////////////////////////////
  // Set component material
  //
  /////////////////////////////////////////////////////////////////
  static async setMaterial(model, dbId, material) {

    const fragIds = await ViewerToolkit.getFragIds(
      model, dbId)

    const fragList = model.getFragmentList()

    fragIds.forEach((fragId)=> {

      fragList.setMaterial(fragId, material)
    })
  }

  /////////////////////////////////////////////////////////////////
  // Recursively builds the model tree
  //
  /////////////////////////////////////////////////////////////////
  static buildModelTree(model, createNodeFunc = null){

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
  static executeTaskOnModelTree(model, task) {

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
  static isolateFull (viewer, model = null, dbIds = []) {

    return new Promise(async(resolve, reject) => {

      try {

        model = model || viewer.model

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

      } catch(ex){

        return reject(ex)
      }
    })
  }
}

