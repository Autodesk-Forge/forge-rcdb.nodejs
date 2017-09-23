
var norm = new THREE.Vector3()
var t1 = new THREE.Vector3()
var t2 = new THREE.Vector3()
var depth = 0


function checkBoxSeparation(
  phase,
  minX, minY, minZ,
  maxX, maxY, maxZ,
  norm, v1, v2, v3) {

  var minQ, maxQ;
  minQ = norm.x * (norm.x > 0 ? minX : maxX);
  maxQ = norm.x * (norm.x > 0 ? maxX : minX);
  minQ += norm.y * (norm.y > 0 ? minY : maxY);
  maxQ += norm.y * (norm.y > 0 ? maxY : minY);
  minQ += norm.z * (norm.z > 0 ? minZ : maxZ);
  maxQ += norm.z * (norm.z > 0 ? maxZ : minZ);

  var q1 = norm.x * v1.x + norm.y * v1.y + norm.z * v1.z;
  var q2 = norm.x * v2.x + norm.y * v2.y + norm.z * v2.z;
  var q3 = norm.x * v3.x + norm.y * v3.y + norm.z * v3.z;
  var vMinQ = Math.min(q1, q2, q3), vMaxQ = Math.max(q1, q2, q3);

  if (phase === 0) {

    // just check the collision
    return minQ > vMaxQ || maxQ < vMinQ;

  } else {

    // compute penetration depth
    var sq = 1 / norm.length();

    if (!isFinite(sq)) {

      return;
    }

    depth = Math.min(depth, (vMaxQ - minQ) * sq, (maxQ - vMinQ) * sq);
  }
}

function geometryIntersectsBox3_PassThree(
  phase,
  minX, minY, minZ,
  maxX, maxY, maxZ,
  axis, v1, v2, v3, t1, t2) {

  t1.subVectors(v1, v2);

  switch (axis) {
    case 0:
      t1.set(0, -t1.z, t1.y);
      break;
    case 1:
      t1.set(-t1.z, 0, t1.x);
      break;
    case 2:
      t1.set(-t1.y, t1.x, 0);
      break;
  }

  return checkBoxSeparation(
    phase,
    minX, minY, minZ,
    maxX, maxY, maxZ,
    t1, v1, v2, v3);
}

function geometryIntersectsBox3(geo, box) {

  // Tomas Akenine-Möller. 2005. Fast 3D triangle-box overlap testing.
  // http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/code/tribox_tam.pdf

  var faces = geo.faces;
  var verts = geo.vertices;
  var minX = box.min.x, maxX = box.max.x;
  var minY = box.min.y, maxY = box.max.y;
  var minZ = box.min.z, maxZ = box.max.z;
  var results = [];

  for (var fI = 0; fI < faces.length; ++fI) {

    var face = faces[fI];
    var v1 = verts[face.a];
    var v2 = verts[face.b];
    var v3 = verts[face.c];
    var vMinX = Math.min(v1.x, v2.x, v3.x);
    var vMinY = Math.min(v1.y, v2.y, v3.y);
    var vMinZ = Math.min(v1.z, v2.z, v3.z);
    var vMaxX = Math.max(v1.x, v2.x, v3.x);
    var vMaxY = Math.max(v1.y, v2.y, v3.y);
    var vMaxZ = Math.max(v1.z, v2.z, v3.z);

    // bounding AABB cull
    if (vMinX > maxX ||
      vMinY > maxY ||
      vMinZ > maxZ ||
      vMaxX < minX ||
      vMaxY < minY ||
      vMaxZ < minZ) {
      // never be intersecting
      continue;
    }

    t1.subVectors(v2, v1);
    t2.subVectors(v3, v1);
    norm.crossVectors(t1, t2);

    if (checkBoxSeparation(0, minX, minY, minZ, maxX, maxY, maxZ, norm, v1, v2, v3) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v2, v3, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v3, v2, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 0, v2, v3, v1, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v2, v3, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v3, v2, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 1, v2, v3, v1, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v2, v3, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v3, v2, t1, t2) ||
      geometryIntersectsBox3_PassThree(0, minX, minY, minZ, maxX, maxY, maxZ, 2, v2, v3, v1, t1, t2)) {
      // never be intersecting
      continue;
    }

    // compute depth
    depth = Infinity;
    checkBoxSeparation(1, minX, minY, minZ, maxX, maxY, maxZ, norm, v1, v2, v3);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v2, v3, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 0, v1, v3, v2, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 0, v2, v3, v1, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v2, v3, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 1, v1, v3, v2, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 1, v2, v3, v1, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v2, v3, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 2, v1, v3, v2, t1, t2);
    geometryIntersectsBox3_PassThree(1, minX, minY, minZ, maxX, maxY, maxZ, 2, v2, v3, v1, t1, t2);

    // triangle touches the box
    results.push({
      faceIndex: fI,
      depth: depth
    });
  }

  return results;
}


export default function (geometry, box) {

  return geometryIntersectsBox3(geometry, box)
}
