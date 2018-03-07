/**
 * Tree view control delegate
 * This class allows you to customize the behavior of a Tree view control.
 * Override the methods you want and pass an instance of this class to
 * the Tree constructor.
 * @constructor
 */
var TreeDelegate = function () {
};

TreeDelegate.prototype.constructor = TreeDelegate;

/**
 * Override this method to specify whether or not a node is a group node
 * @param {Object} node - Node in the model Document
 * @returns {boolean} true if this node is a group node, false otherwise
 */
TreeDelegate.prototype.isTreeNodeGroup = function (node) {
  throw 'isTreeNodeGroup is not implemented.';
};

/**
 * Override this method to specify the id for a node
 * @param {Object} node - Node in the model Document
 * @returns {string} Id of the tree node
 */
TreeDelegate.prototype.getTreeNodeId = function (node) {
  throw 'getTreeNodeId is not implemented.';
};

/**
 * Override this method to specify the index for a node
 * @param {Object} node - Node in the model Document
 * @returns {string} Id of the tree node
 */
TreeDelegate.prototype.getTreeNodeIndex = function (node) {
  throw 'getTreeNodeIndex is not implemented.';
};

/**
 * Override this method to specify the parent node id for a node
 * @param {string} nodeId - Node in the model Document
 * @returns {string} Id of the tree node
 */
TreeDelegate.prototype.getTreeNodeParentId = function(nodeId) {
  throw 'getTreeNodeParentId is not implemented.';
}

/**
 * Override this method to specify the label for a node
 * @param {Object} node - Node in the model Document
 * @returns {string} Label of the tree node
 */
TreeDelegate.prototype.getTreeNodeLabel = function (node) {
  return node.name;
};

/**
 * Override this method to specify the total number of nodes in the tree
 * @returns {Number} Number of nodes in the tree.
 */
TreeDelegate.prototype.getTreeNodeCount = function () {
  throw 'getTreeNodeCount is not implemented.';
};

/**
 * Override this method to specify if a tree node should be created for this node
 * @param {Object} node - Node in the model Document
 * @returns {boolean} true if a node should be created, false otherwise
 */
TreeDelegate.prototype.shouldCreateTreeNode = function (node) {
  return true;
};


/**
 * Iterates over the children of a given node and calls the callback with each child.
 */
TreeDelegate.prototype.forEachChild = function (node, callback) {
  var childCount = node.children ? node.children.length : 0;
  for (var childIndex = 0; childIndex < childCount; ++childIndex) {
    var child = node.children[childIndex];
    callback(child);
  }
};


/**
 * Override this to create the HTMLContent for this node for appending to the
 * parent.  By default, a label is created.
 *
 * @param {Object} node - Node in the model Document
 * @param {HTMLElement} parent - the parent for this content.
 * @param {Object=} [options] - An optional dictionary of options.  Current parameters:
 *                              {boolean} [localize] - when true, localization is attempted for the given node; false by default.
 *
 * @private
 */
TreeDelegate.prototype.createTreeNode = function (node, parent, options) {
  var label = document.createElement('label');
  parent.appendChild(label);

  var text = this.getTreeNodeLabel(node);
  if (options && options.localize) {
    label.setAttribute('data-i18n', text);
    text = Autodesk.Viewing.i18n.translate(text);
  }
  label.textContent = text;
};

/**
 * Override this method to do something when the user clicks on a tree node
 * @param {Tree} tree
 * @param {Object} node - Node in the model Document
 * @param {Event} event
 */
TreeDelegate.prototype.onTreeNodeClick = function (tree, node, event) {};

/**
 * Override this to do something when the user clicks on this tree node's icon.
 * The default behavior is for the icons for group nodes to toggle the collapse/expand
 * state of that group.
 * @param {Tree} tree
 * @param {Object} node - Node in the model Document
 * @param {Event} event
 */
TreeDelegate.prototype.onTreeNodeIconClick = function (tree, node, event) {
  if (tree.delegate().isTreeNodeGroup(node)) {
    tree.setCollapsed(node, !tree.isCollapsed(node));
  }
};

/**
 * Override this to do something when the user double-clicks on a tree node
 * @param {Tree} tree
 * @param {Object} node - Node in the model Document
 * @param {Event} event
 */
TreeDelegate.prototype.onTreeNodeDoubleClick = function (tree, node, event) {};

/**
 * Override this to do something when the user right-clicks on a tree node
 * @param {Tree} tree
 * @param {Object} node - Node in the model Document
 * @param {Event} event
 */
TreeDelegate.prototype.onTreeNodeRightClick = function (tree, node, event) {};

/**
 * Override this to do something when the tree control changes its size,
 * the event is fired by only TreeOnDemand objects.
 * @param {Tree} tree
 */
TreeDelegate.prototype.onTreeNodeReized = function (tree) {};

/**
 * Override this to specify the type of a node. This way, in css, the designer
 * can specify custom styling per type.
 * @param {Object} node - Node in the model Document
 * @returns {string} Class for the node
 */
TreeDelegate.prototype.getTreeNodeClass = function (node) {
  return '';
};

/**
 * Override this to specify the maximum tree's container html size. This method is used by
 * TreeOnDemand to calculate the amount of nodes it will create at any specific time.
 * @param {Object} node - Node in the model Document
 * @returns {Number} - HTMLELement for node height in pixels
 */
TreeDelegate.prototype.getTreeNodeParentMaxSize = function (node) {
  return {width: 0, height: 0};
}

/**
 * Override this to specify the html element height of a node depending on its type.
 * This method is used by TreeOnDemand to calculate the layout of the elements it creates at any specific time.
 * @param {Object} node - Node in the model Document
 * @returns {Number} - HTMLELement for node height in pixels
 */
TreeDelegate.prototype.getTreeNodeClientHeight = function (node) {
  return 0;
}

/**
 * Override this to specify the left offset of a node depending on its type and depth level in the tree.
 * This method is used by TreeOnDemand to calculate the layout of the elements it creates at any specific time.
 * @param {Object} node - Node in the model Document
 * @param {Number} depthLevel - Number of parents of in the hirarchy tree.
 * @returns {Number} HTMLELement for node left offset position in pixels
 */
TreeDelegate.prototype.getTreeNodeDepthOffset = function (node, depthLevel) {
  return 0;
}

/**
 * Override this method to do something when the user hovers on a tree node
 * @param {Tree} tree
 * @param {Object} node - Node in the model Document
 * @param {Event} event
 */
TreeDelegate.prototype.onTreeNodeHover = function (tree, node, event) {};

export default TreeDelegate
