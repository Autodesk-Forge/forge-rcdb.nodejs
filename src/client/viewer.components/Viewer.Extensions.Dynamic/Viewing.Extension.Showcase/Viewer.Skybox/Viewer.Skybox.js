

export default class ViewerSkybox {

  constructor (viewer, options) {

    const faceMaterials = options.imageList.map((url) => {
      return new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(url),
        side: THREE.BackSide
      })
    })

    const skyMaterial = new THREE.MeshFaceMaterial(
      faceMaterials)

    const geometry = new THREE.CubeGeometry(
      options.size.x,
      options.size.y,
      options.size.z,
      1, 1, 1,
      null, true)

    const skybox = new THREE.Mesh(
      geometry, skyMaterial)

    viewer.impl.scene.add(skybox)
  }
}


