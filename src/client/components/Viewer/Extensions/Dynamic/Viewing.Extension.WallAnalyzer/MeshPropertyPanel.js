
export default class MeshPropertyPanel extends
  Autodesk.Viewing.UI.PropertyPanel {
  /// //////////////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////////////
  constructor (viewer) {
    super(viewer.container)

    this.viewer = viewer
  }

  /// //////////////////////////////////////////////////////////////
  // setNodeProperties override
  //
  /// //////////////////////////////////////////////////////////////
  setNodeProperties (nodeId) {
    this.viewer.model.getProperties(nodeId, (result) => {
      this.setProperties(result.properties)

      this.setTitle(result.name)

      this.resizeToContent()

      this.nodeId = nodeId
    })
  }
}
