
const norm = new THREE.Vector3()
const t1 = new THREE.Vector3()
const t2 = new THREE.Vector3()
let depth = 0

function checkBoxSeparation (
  phase,
  minX, minY, minZ,
  maxX, maxY, maxZ,
  norm, v1, v2, v3) {
  const minQ =
    norm.x * (norm.x > 0 ? minX : maxX) +
    norm.y * (norm.y > 0 ? minY : maxY) +
    norm.z * (norm.z > 0 ? minZ : maxZ)

  const maxQ =
    norm.x * (norm.x > 0 ? maxX : minX) +
    norm.y * (norm.y > 0 ? maxY : minY) +
    norm.z * (norm.z > 0 ? maxZ : minZ)

  const q1 = norm.x * v1.x + norm.y * v1.y + norm.z * v1.z
  const q2 = norm.x * v2.x + norm.y * v2.y + norm.z * v2.z
  const q3 = norm.x * v3.x + norm.y * v3.y + norm.z * v3.z

  const vMinQ = Math.min(q1, q2, q3)
  const vMaxQ = Math.max(q1, q2, q3)

  if (phase === 0) {
    // just check the collision
    return (minQ > vMaxQ) || (maxQ < vMinQ)
  } else {
    // compute penetration depth
    const sq = 1 / norm.length()

    if (!isFinite(sq)) {
      return
    }

    depth = Math.min(
      depth,
      (vMaxQ - minQ) * sq,
      (maxQ - vMinQ) * sq)
  }
}

function geometryIntersectsBox3_PassThree (
  phase,
  minX, minY, minZ,
  maxX, maxY, maxZ,
  axis, v1, v2, v3, t1) {
  t1.subVectors(v1, v2)

  switch (axis) {
    case 0:
      t1.set(0, -t1.z, t1.y)
      break

    case 1:
      t1.set(-t1.z, 0, t1.x)
      break

    case 2:
      t1.set(-t1.y, t1.x, 0)
      break
  }

  return checkBoxSeparation(
    phase,
    minX, minY, minZ,
    maxX, maxY, maxZ,
    t1, v1, v2, v3)
}

function geometryIntersectsBox3 (geometry, box) {
  // Tomas Akenine-Möller. 2005.
  // Fast 3D triangle-box overlap testing.
  // http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/code/tribox_tam.pdf

  const { faces, vertices } = geometry

  const minX = box.min.x
  const minY = box.min.y
  const minZ = box.min.z

  const maxX = box.max.x
  const maxY = box.max.y
  const maxZ = box.max.z

  const results = []

  for (var fI = 0; fI < faces.length; ++fI) {
    const face = faces[fI]

    const v1 = vertices[face.a]
    const v2 = vertices[face.b]
    const v3 = vertices[face.c]

    const vMinX = Math.min(v1.x, v2.x, v3.x)
    const vMinY = Math.min(v1.y, v2.y, v3.y)
    const vMinZ = Math.min(v1.z, v2.z, v3.z)

    const vMaxX = Math.max(v1.x, v2.x, v3.x)
    const vMaxY = Math.max(v1.y, v2.y, v3.y)
    const vMaxZ = Math.max(v1.z, v2.z, v3.z)

    // bounding AABB cull
    if (
      vMinX > maxX ||
      vMinY > maxY ||
      vMinZ > maxZ ||
      vMaxX < minX ||
      vMaxY < minY ||
      vMaxZ < minZ
    ) {
      // never be intersecting
      continue
    }

    t1.subVectors(v2, v1)
    t2.subVectors(v3, v1)

    norm.crossVectors(t1, t2)

    if (
      checkBoxSeparation(0, minX, minY, minZ, maxX, maxY, maxZ, norm, v1, v2, v3) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v2, v3, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v3, v2, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 0, v2, v3, v1, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v2, v3, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v3, v2, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 1, v2, v3, v1, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v2, v3, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v3, v2, t1) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 2, v2, v3, v1, t1)
    ) {
      // never be intersecting
      continue
    }

    // compute depth
    depth = Infinity

    checkBoxSeparation(1, minX, minY, minZ, maxX, maxY, maxZ, norm, v1, v2, v3)

    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v2, v3, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v3, v2, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 0, v2, v3, v1, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v2, v3, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v3, v2, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 1, v2, v3, v1, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v2, v3, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v3, v2, t1)
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 2, v2, v3, v1, t1)

    // triangle touches the box
    results.push({
      faceIndex: fI,
      depth: depth
    })
  }

  return results
}

export default geometryIntersectsBox3
