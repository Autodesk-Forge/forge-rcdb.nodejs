
import EdgesGeometry from './EdgesGeometry'
import sortBy from 'lodash/sortBy'
import ThreeBSP from './threeCSG'
import THREELib from 'three-js'

const THREE = THREELib()

THREE.EdgesGeometry = EdgesGeometry

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function getModelInfo () {
  return new Promise((resolve) => {
    const msgHandler = (event) => {
      if (event.data.msgId === 'MSG_ID_MODEL_INFO') {
        self.removeEventListener(
          'message', msgHandler)

        resolve(event.data)
      }
    }

    self.addEventListener('message', msgHandler)
  })
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function getComponents (category) {
  return new Promise((resolve) => {
    const meshes = []

    const msgHandler = (event) => {
      if (event.data.msgId === 'MSG_ID_COMPONENT') {
        const data = event.data

        if (data.category === category) {
          const mesh = buildComponentMesh(data)

          meshes.push(mesh)

          if (meshes.length === data.count) {
            self.removeEventListener(
              'message', msgHandler)

            resolve(meshes)
          }
        }
      }
    }

    self.addEventListener('message', msgHandler)
  })
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function buildComponentMesh (data) {
  const vertexArray = []

  for (let idx = 0; idx < data.nbMeshes; ++idx) {
    const meshData = {
      positions: data['positions' + idx],
      indices: data['indices' + idx],
      stride: data['stride' + idx]
    }

    getMeshGeometry(meshData, vertexArray)
  }

  const geometry = new THREE.Geometry()

  for (var i = 0; i < vertexArray.length; i += 3) {
    geometry.vertices.push(vertexArray[i])
    geometry.vertices.push(vertexArray[i + 1])
    geometry.vertices.push(vertexArray[i + 2])

    const face = new THREE.Face3(i, i + 1, i + 2)

    geometry.faces.push(face)
  }

  const matrixWorld = new THREE.Matrix4()

  if (data.matrixWorld) {
    matrixWorld.fromArray(data.matrixWorld)
  }

  const mesh = new THREE.Mesh(geometry)

  mesh.applyMatrix(matrixWorld)

  mesh.boundingBox = data.boundingBox

  mesh.bsp = new ThreeBSP(mesh)

  mesh.dbId = data.dbId

  return mesh
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function getMeshGeometry (data, vertexArray) {
  const offsets = [{
    count: data.indices.length,
    index: 0,
    start: 0
  }
  ]

  for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {
    var start = offsets[oi].start
    var count = offsets[oi].count
    var index = offsets[oi].index

    for (var i = start, il = start + count; i < il; i += 3) {
      const a = index + data.indices[i]
      const b = index + data.indices[i + 1]
      const c = index + data.indices[i + 2]

      const vA = new THREE.Vector3()
      const vB = new THREE.Vector3()
      const vC = new THREE.Vector3()

      vA.fromArray(data.positions, a * data.stride)
      vB.fromArray(data.positions, b * data.stride)
      vC.fromArray(data.positions, c * data.stride)

      vertexArray.push(vA)
      vertexArray.push(vB)
      vertexArray.push(vC)
    }
  }
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function postWallMesh (mesh, opts) {
  const geometry = mesh.geometry

  const msg = Object.assign({}, {
    matrixWorld: mesh.matrix.elements,
    vertices: geometry.vertices,
    floorDbIds: mesh.floorDbIds,
    pathEdges: mesh.pathEdges,
    msgId: 'MSG_ID_WALL_MESH',
    faces: geometry.faces,
    dbId: mesh.dbId
  }, opts)

  self.postMessage(msg)
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function createBoundingMesh (bbox) {
  const geometry = new THREE.BoxGeometry(
    bbox.max.x - bbox.min.x,
    bbox.max.y - bbox.min.y,
    bbox.max.z - bbox.min.z)

  const mesh = new THREE.Mesh(geometry)

  const transform = new THREE.Matrix4()

  transform.makeTranslation(0, 0,
    (bbox.max.z + bbox.min.z) * 0.5)

  mesh.applyMatrix(transform)

  return mesh
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function getHardEdges (mesh, matrix = null) {
  const edgesGeom = new THREE.EdgesGeometry(mesh.geometry)

  const positions = edgesGeom.attributes.position

  matrix = matrix || mesh.matrixWorld

  const edges = []

  for (let idx = 0;
    idx < positions.length;
    idx += (2 * positions.itemSize)) {
    const start = new THREE.Vector3(
      positions.array[idx],
      positions.array[idx + 1],
      positions.array[idx + 2])

    const end = new THREE.Vector3(
      positions.array[idx + 3],
      positions.array[idx + 4],
      positions.array[idx + 5])

    start.applyMatrix4(matrix)

    end.applyMatrix4(matrix)

    edges.push({
      start,
      end
    })
  }

  return edges
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
function mergeBoxes (boxes) {
  const mergedBoxes = []

  let height = -Number.MAX_VALUE

  for (let idx = 0; idx < boxes.length; ++idx) {
    const box = boxes[idx]

    const diff = box.max.z - height

    if (diff > 0.5) {
      height = box.max.z

      mergedBoxes.push(box)
    } else {
      const lastBox = mergedBoxes[mergedBoxes.length - 1]

      lastBox.max.x = Math.max(lastBox.max.x, box.max.x)
      lastBox.max.y = Math.max(lastBox.max.y, box.max.y)

      lastBox.min.x = Math.min(lastBox.min.x, box.min.x)
      lastBox.min.y = Math.min(lastBox.min.y, box.min.y)

      lastBox.dbIds.push(box.dbIds[0])
    }
  }

  return mergedBoxes
}

/// //////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////
async function workerMain () {
  const res = await Promise.all([
    getComponents('Floors'),
    getComponents('Walls'),
    getModelInfo()
  ])

  const floorMeshes = res[0]
  const wallMeshes = res[1]
  const modelInfo = res[2]

  const modelBox = modelInfo.boundingBox

  const extBoxes = floorMeshes.map((mesh) => {
    const min = {
      x: modelBox.min.x,
      y: modelBox.min.y,
      z: mesh.boundingBox.min.z
    }

    const max = {
      x: modelBox.max.x,
      y: modelBox.max.y,
      z: mesh.boundingBox.max.z
    }

    return {
      dbIds: [mesh.dbId],
      min,
      max
    }
  })

  const orderedExtBoxes = sortBy(extBoxes, (box) => {
    return box.min.z
  })

  // last box is model top
  orderedExtBoxes.push({

    min: {
      x: modelBox.min.x,
      y: modelBox.min.y,
      z: modelBox.max.z
    },

    max: {
      x: modelBox.max.x,
      y: modelBox.max.y,
      z: modelBox.max.z
    },

    dbIds: []
  })

  const mergedBoxes = mergeBoxes(orderedExtBoxes)

  for (let idx = mergedBoxes.length - 2; idx >= 0; --idx) {
    const levelBox = {
      max: mergedBoxes[idx + 1].min,
      min: mergedBoxes[idx].max
    }

    const levelBoundingMesh = createBoundingMesh(levelBox)

    const levelBSP = new ThreeBSP(levelBoundingMesh)

    wallMeshes.forEach((wallMesh) => {
      const resultBSP = levelBSP.intersect(wallMesh.bsp)

      const mesh = resultBSP.toMesh()

      const edges = getHardEdges(mesh)

      const filteredEdges = edges.filter((edge) => {
        return (
          (edge.start.z < levelBox.min.z + 0.1) &&
          (edge.end.z < levelBox.min.z + 0.1)
        )
      })

      mesh.floorDbIds = mergedBoxes[idx].dbIds

      mesh.pathEdges = filteredEdges

      mesh.dbId = wallMesh.dbId

      postWallMesh(mesh, {
        levelCount: mergedBoxes.length - 1,
        wallCount: wallMeshes.length,
        level: idx,
        levelBox
      })
    })
  }

  self.close()
}

/// //////////////////////////////////////////////////////
// Run the worker
//
/// //////////////////////////////////////////////////////
workerMain()
