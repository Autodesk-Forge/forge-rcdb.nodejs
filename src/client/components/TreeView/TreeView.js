import TreeViewBase from './base/TreeViewBase'
import EventsEmitter from 'EventsEmitter'

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
export default class TreeView extends
  EventsEmitter.Composer (TreeViewBase) {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setInputHandlers_ () {

    var tree = this
    var rootElem = this.myRootContainer

    var NODE_NOT_FOUND = null

    var getNodeFromElement = function(eventTarget) {

      var ret = null
      var found = false

      do {
        if (!eventTarget || eventTarget === rootElem) {
          ret = null
          found = true  // not found
        } else if (eventTarget.hasAttribute("lmv-nodeId")) {
          ret = eventTarget
          found = true
        } else {
          eventTarget = eventTarget.parentElement
        }
      } while(!found)

      if (ret) {
        var nodeId = ret.getAttribute("lmv-nodeId");
        return tree.nodeIdToNode[nodeId] || NODE_NOT_FOUND;
      }
      return NODE_NOT_FOUND
    }

    if (av.isTouchDevice()) {

      this.hammer = new Hammer.Manager(rootElem, {
        recognizers: [
          [
            Hammer.Tap, {
            event: 'doubletap',
            taps: 2,
            interval: 400,
            threshold: 6,
            posThreshold: 30
          }],
          [
            Hammer.Press, {
            event: 'press',
            time: 500
          }]
        ],
        inputClass: Hammer.TouchInput
      })

      this.hammer.on("doubletap", function (event) {

        var node = getNodeFromElement(event.target)
        if (node === NODE_NOT_FOUND)
          return
        tree.myDelegate.onTreeNodeDoubleClick(
          tree, node, event)
      })

      this.hammer.on('press', function (event) {

        var node = getNodeFromElement(event.target)
        if (node === NODE_NOT_FOUND)
          return
        tree.myDelegate.onTreeNodeRightClick(
          tree, node, event)
      })
    }

    rootElem.addEventListener('click', function (event) {

      var node = getNodeFromElement(event.target)

      if (node === NODE_NOT_FOUND)
        return

      tree.myDelegate.onTreeNodeClick(
        tree, node, event)

      if(!event.target.classList.contains('propertyLink')) {
        event.preventDefault()
      }
    }, false)

    rootElem.addEventListener('dblclick', function (event) {

      var node = getNodeFromElement(event.target);

      if (node === NODE_NOT_FOUND)
        return

      tree.myDelegate.onTreeNodeDoubleClick(
        tree, node, event)

      event.stopPropagation()
      event.preventDefault()

    }, false)

    rootElem.addEventListener('contextmenu', function (event) {

      var node = getNodeFromElement(event.target)

      if (node === NODE_NOT_FOUND)
        return

      tree.myDelegate.onTreeNodeRightClick(
        tree, node, event)

      event.stopPropagation()
      event.preventDefault()

    }, false)

    rootElem.addEventListener('mouseover', function (event) {

      var node = getNodeFromElement(event.target)

      if (node === NODE_NOT_FOUND)
        return

      tree.myDelegate.onTreeNodeHover(
        tree, node, event)

      event.stopPropagation()
      event.preventDefault()

    }, false)

    rootElem.addEventListener('mouseout', function (event) {
      // When the mouse leaves the element,
      // set node to -1 (background), no highlight,
      var node = -1

      tree.myDelegate.onTreeNodeHover(
        tree, node, event)

      event.stopPropagation()
      event.preventDefault()

    }, false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getNodeById (nodeId) {

    return this.nodeIdToNode[nodeId]
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  destroyNode (nodeId) {

    if (this.nodeIdToNode[nodeId]) {

      delete this.nodeIdToNode[nodeId]

      this.nodeIdToNode[nodeId] = null
    }

    if (this.nodeToElement[nodeId]) {

      this.nodeToElement[nodeId].remove()

      delete this.nodeToElement[nodeId]

      this.nodeToElement[nodeId] = null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  destroy () {

    this.clear ()

    this.myRootContainer.remove()
  }
}
