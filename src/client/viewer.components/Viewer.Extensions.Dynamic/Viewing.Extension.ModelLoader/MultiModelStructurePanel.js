'use strict';

/**
 * TreeOnDemand view control
 * @constructor
 * @param {TreeDelegate} treeDelegate
 * @param {Object} root - A node in the model Document
 * @param {HTMLElement} parentContainer - DOM element parent of the tree.
 * @param {Object} options
 */
function TreeOnDemand(treeDelegate, root, parentContainer, options) {

  this.treeDelegate = treeDelegate;
  this.root = root;
  this.options = options || {};
  this.dirty = false;

  // Initialize root container.
  this.rootContainer = document.createElement('div');
  this.rootContainer.classList.add('treeview');
  this.rootContainer.classList.add('on-demand');
  this.rootContainer.scroller = document.createElement('div');
  this.rootContainer.scroller.classList.add('scroller');
  this.rootContainer.appendChild( this.rootContainer.scroller);

  if (parentContainer) {
    parentContainer.appendChild(this.rootContainer);
  }

  // Initialize tables.
  // These are tables to share css strings between nodes.
  var nodeCssTable = [[], ['group'], ['leaf']];
  var nodeIndexToNodeCssTable = new Uint16Array(treeDelegate.getTreeNodeCount());
  var cssStringToNodeCssTable = {'': 0, 'group': 1, 'leaf': 2};

  var createTables = function(node) {

    var nodeId = getNodeId(this, node);
    var nodeIndex = treeDelegate.getTreeNodeIndex(nodeId);
    nodeIndexToNodeCssTable[nodeIndex] = treeDelegate.isTreeNodeGroup(node) ? 1 : 2;

    this.treeDelegate.forEachChild(node, createTables);
    return true;
  }.bind(this);
  createTables(this.root);

  this.nodeCssTable = nodeCssTable;
  this.nodeIndexToNodeCssTable = nodeIndexToNodeCssTable;
  this.cssStringToNodeCssTable = cssStringToNodeCssTable;

  // Creates element pools.
  var elementsPool = [];
  var elementsPoolCount = 150; //ELEMENT_POOL_LENGHT
  var elementsUsedCount = 0;

  for (var i = 0; i < elementsPoolCount; ++i) {
    var element = createNodeHTmlElement();
    elementsPool[i] = element;
  }

  this.elementsPool = elementsPool;
  this.elementsUsed = 0;

  // Add input event listeners.
  var touchDevice = Autodesk.Viewing.isTouchDevice();

  if (touchDevice) {
    this.hammer = new Hammer.Manager(this.rootContainer, {
      recognizers: [
        Autodesk.Viewing.GestureRecognizers.doubletap,
        Autodesk.Viewing.GestureRecognizers.press
      ],
      inputClass: Hammer.TouchInput
    });
  }

  this.scrollListener = onPanelScroll.bind(this);
  parentContainer.addEventListener('scroll', this.scrollListener);

  var _this = this;
  this.removeListeners = function() {
    parentContainer.removeEventListener('scroll', _this.scrollListener);
  }

  for (var i = 0; i < elementsPoolCount; ++i) {
    var element = elementsPool[i];

    if (touchDevice) {
      this.hammer.on('doubletap', onElementDoubleTap.bind(this));
      this.hammer.on('press', onElementPress.bind(this));
    }

    element.addEventListener('click', onElementClick.bind(this));
    element.addEventListener('dblclick', onElementDoubleClick.bind(this));
    element.addEventListener('contextmenu', onElementContextMenu.bind(this));
    element.addEventListener('mouseover', onElementMouseOver.bind(this));
    element.addEventListener('mouseout', onElementMouseOut.bind(this));

    element.icon.addEventListener('click', onElementIconClick.bind(this));
  }

  redraw(this);
};

var proto = TreeOnDemand.prototype;
proto.constructor = TreeOnDemand;


/**
 * Show/hide the tree control
 * @param {boolean} show - true to show the tree control, false to hide it
 */
proto.show = function (show) {

  this.rootContainer.style.display = 'show' ? block : 'none';
};

/**
 * Get the root container
 * @nosideeffects
 * @returns {string}
 */
proto.getRootContainer = function () {

  return this.rootContainer;
};

/**
 * Get the tree delegate
 * @nosideeffects
 * @returns {TreeDelegate}
 */
proto.delegate = function () {

  return this.treeDelegate;
};

/**
 * Is the given group node in the tree collapsed?
 * @nosideeffects
 * @param {Object} group -The group node
 * @returns {boolean} true if group node is collapsed, false if expanded
 */
proto.isCollapsed = function(group) {

  var css = getNodeCss(this, group);
  return css && css.indexOf('collapsed') !== -1;
};

/**
 * Collapse/expand the given group node in the tree
 * @param {Object} group - the group node
 * @param {boolean} collapsed - true to collapse the group node, false to expand it
 */
proto.setCollapsed = function(group, collapsed, recursive) {

  if (collapsed) {
    this.addClass(group, 'collapsed', recursive);
    this.removeClass(group, 'expanded', recursive);
  } else {
    this.addClass(group, 'expanded', recursive);
    this.removeClass(group, 'collapsed', recursive);
  }
};

/**
 * Collapse/expand all group nodes in the tree
 * @param {boolean} collapsed - true to collapse tree, false to expand it
 */
proto.setAllCollapsed = function(collapsed) {

  var collapse = collapsed ?
    function(node) {
      this.addClass(node, 'collapsed', false);
      this.removeClass(node, 'expanded', false);
    }.bind(this) :
    function(node) {
      this.addClass(node, 'collapsed', false);
      this.removeClass(node, 'expanded', false);
    }.bind(this);

  this.iterate(this.root,function(node) {
    this.treeDelegate.isTreeNodeGroup(node) && collapse(node);
    return true;
  }.bind(this));
};

/**
 * Add the given nodes to the current selection
 * @param {Array.<Object>} nodes - nodes to add to the current selection
 */
proto.addToSelection = function(nodes) {

  var nodesCount = nodes.length;

  for (var i = 0; i < nodesCount; ++i) {
    this.addClass(nodes[i], 'selected', false);
  }

  redraw(this);
};

/**
 * Remove the given nodes from the current selection
 * @param {Array.<Object>} nodes - The nodes to remove from the current selection
 */
proto.removeFromSelection = function(nodes) {

  var nodesCount = nodes.length;

  for (var i = 0; i < nodesCount; ++i) {
    this.removeClass(nodes[i], 'selected', false);
  }

  redraw(this);
};

/**
 * Set the current selection
 * @param {Array.<Object>} nodes - nodes to make currently selected
 */
proto.setSelection = function(nodes) {

  this.clearSelection();
  this.addToSelection(nodes);

  return this.selectedNodes;
};

/**
 * Clear the current selection
 */
proto.clearSelection = function () {

  // In order to optimize memmory, we send one at a time (the whole model could be selected).
  var nodeToRemove = [];
  var unselect = function(node) {

    var nodeId = getNodeId(this, node);
    var css = getNodeCss(this, nodeId);

    if (css.indexOf('selected') !== -1) {
      nodeToRemove[0] = nodeId;
      this.removeFromSelection(nodeToRemove);
    }

    this.treeDelegate.forEachChild(node, unselect);
    return true;
  }.bind(this);
  unselect(this.root);
};

/**
 * Is the given node selected?
 * @nosideeffects
 * @param {Object} node - The tree node
 * @returns {boolean} - true if node is selected, false otherwise
 */
proto.isSelected = function(node) {

  return getNodeCss(this, node).indexOf('selected') !== -1;
};

/**
 * Scrolls the tree control so the node provided shows at the top.
 * @param {Object} node - The tree node
 */
proto.scrollTo = function(node) {

  var nodeFound = false;
  var nodeId = getNodeId(this, node);
  var expandedHeightStack = []; // Heights of the visible branches and nodes before node.

  var getNodeScrollTop = function(candidate) {

    var candidateId = getNodeId(this, candidate);
    nodeFound = nodeFound || nodeId === candidateId;
    if (nodeFound) {
      return;
    }

    expandedHeightStack.push(this.treeDelegate.getTreeNodeClientHeight(node));

    var stackSize = expandedHeightStack.length;
    var elementExpanded = (
    this.treeDelegate.isTreeNodeGroup(candidateId) &&
    getNodeCss(this, candidateId).indexOf('expanded') !== -1);

    this.treeDelegate.forEachChild(candidate, getNodeScrollTop);

    if(!elementExpanded && !nodeFound) {
      if (expandedHeightStack.length > stackSize) {
        expandedHeightStack.splice(stackSize);
      }
    }
  }.bind(this);

  this.setCollapsed(node, false, true);

  // Calculate and set the container's parent scroll top.
  getNodeScrollTop(this.root);
  if (!nodeFound) {
    return;
  }

  var scrollTop = 0;
  var expandedHeightStackCount = expandedHeightStack.length;

  for (var i = this.options.excludeRoot ? 1 : 0; i < expandedHeightStackCount; ++i) {
    scrollTop += expandedHeightStack[i];
  }

  if (this.rootContainer.parentNode.scrollTop === scrollTop) {
    return;
  }

  // If the panel will grow due to breanch expansion,
  // it's needed to regenerate the panel and then scroll to the deisred item.
  redraw(this, true);
  this.rootContainer.parentNode.scrollTop = scrollTop;
};

/**
 * Add a class to a node
 * @param {Number|Object} node - The tree node
 * @param {string} className
 * @returns {boolean} - true if the class was added, false otherwise
 */
proto.addClass = function(node, className, recursive) {

  function add(tree, nodeId, className) {

    var css = getNodeCss(tree, nodeId);
    var cssIndex = css.indexOf(className);

    if (cssIndex !== -1) {
      return;
    }

    css = css.slice(0);
    css.push(className);
    css.sort();

    setNodeCss(tree, nodeId, css);
  }

  // It is intentional that the recursive add starts at the parent.
  var delegate = this.treeDelegate;
  if (recursive) {
    var parentId = delegate.getTreeNodeParentId(getNodeId(this, node));
    while (parentId) {
      add(this, parentId, className);
      parentId = delegate.getTreeNodeParentId(parentId);
    }
  } else {
    add(this, node, className);
  }

  redraw(this);
  return true;
};

/**
 * Remove a class from a node
 * @param {Number|Object} node - The tree node or its dbId
 * @param {string} className
 * @returns {boolean} - true if the class was removed, false otherwise
 */
proto.removeClass = function (node, className, recursive) {

  function remove(tree, nodeId, className) {

    var css = getNodeCss(tree, nodeId);
    var cssIndex = css.indexOf(className);

    if (cssIndex === -1) {
      return;
    }

    css = css.slice(0);
    css.splice(cssIndex, 1);

    setNodeCss(tree, nodeId, css);
  };

  //It is intentional that the recursive add starts at the parent.
  var delegate = this.treeDelegate;
  if (recursive) {
    var parentId = delegate.getTreeNodeParentId(getNodeId(this, node));
    while (parentId) {
      remove(this, parentId, className);
      parentId = delegate.getTreeNodeParentId(parentId);
    }
  } else {
    remove(this, node, className);
  }

  redraw(this);
  return true;
};

/**
 * Does the node have the given class?
 * @nosideeffects
 * @param {Number|Object} node - The node or its dbId
 * @param {string} className
 * @returns {boolean} true if the node has the given class, false otherwise
 */
proto.hasClass = function(node, className) {

  return getNodeCss(this, node).indexOf(className) !== 1;
};

/**
 * Clears the contents of the tree
 */
proto.clear = function() {

  var scroller = this.rootContainer.scroller;
  var child;
  while (child = scroller.lastChild) {
    scroller.removeChild(child);
  }

  this.elementsUsed = 0;
};

/**
 * Iterates through nodes in the tree in pre-order.
 * @param {Object|Number} node - node at which to start the iteration.
 * @param {function(Object)} callback - callback function for each iterated node, if callbak returns false, node's chidren are not visited.
 */
proto.iterate = function(node, callback) {

  // roodId === 0 is a valid root node
  if (node === undefined || node === null) {
    return;
  }

  if(!this.treeDelegate.shouldCreateTreeNode(node)) {
    return;
  }

  if(!callback(node)) {
    return;
  }

  this.treeDelegate.forEachChild(node, function(child) {
    this.iterate(child, callback);
  }.bind(this));
};

/**
 *
 * @param {*} tree
 * @param {*} initial
 */
function redraw(tree, inmediate) {

  var clearElementTree = function() {
    var elementsUsed = tree.elementsUsed;
    var elementsPool = tree.elementsPool;

    // Return used elements to the elements pool.
    for (var i = 0; i < elementsUsed; ++i) {

      // Remove node id, just in case.
      var element = elementsPool[i];
      element.setAttribute('lmv-nodeId', '');

      // Remove css classes.
      element.className = '';

      // Remove all controls and listeners added by tree delegate, we spare the icon.
      var header = element.header;
      var childrenToRemove = header.childNodes.length - 1;

      for (var j = 0; j < childrenToRemove; ++j) {
        header.removeChild(header.lastChild);
      }
    }
    tree.clear();
  }.bind(tree);

  var createTreeElements = function(node) {

    var container = tree.rootContainer;
    var scroller = container.scroller;
    var nodeId = getNodeId(tree, node);

    if (tree.elementsUsed === tree.elementsPool.length) {
      return false;
    }

    // Add size to container panel.
    var elementClasses = getNodeCss(tree, nodeId);
    var elementHeight = tree.nodeDepth === -1 ? 0 : tree.treeDelegate.getTreeNodeClientHeight(node);
    var elementTop = container.height;
    var elementBottom = elementTop + elementHeight;
    container.height = elementBottom;

    // if node is inside scroll window, create it.
    if (elementBottom < scroller.top || elementTop > scroller.top + scroller.height) {

      // Add children if this is an expanded group.
      if (elementClasses.indexOf('expanded') !== -1) {
        tree.nodeDepth++;
        tree.treeDelegate.forEachChild(node, createTreeElements);
        tree.nodeDepth--;
      }
      return;
    }

    // Adjust scroller position to align with partialy in view first element.
    if (scroller.empty) {
      scroller.empty = false;
      scroller.style.top = (scroller.top - (elementHeight - (container.height - scroller.top))) + 'px';
    }

    // Add element to panel.
    var element = null;
    if (elementHeight > 0) {
      element = tree.elementsPool[tree.elementsUsed++];
      element.setAttribute("lmv-nodeId", nodeId);

      tree.treeDelegate.createTreeNode(node, element.header, tree.options);
      var css = tree.treeDelegate.getTreeNodeClass(node);
      if (css) {
        element.classList.add(css);
      }

      var elementClassesCount = elementClasses.length;
      for (var i = 0; i < elementClassesCount; ++i) {
        element.classList.add(elementClasses[i]);
      }

      var offset = tree.treeDelegate.getTreeNodeDepthOffset(node, tree.nodeDepth);
      element.style.left = offset + 'px';

      scroller.appendChild(element);
    }

    // Add children if tree is an expanded group.
    if (elementClasses.indexOf('expanded') !== -1) {
      tree.nodeDepth++;
      tree.treeDelegate.forEachChild(node, createTreeElements);
      tree.nodeDepth--;
    }
  }.bind(tree);

  var createElementTree = function() {

    tree.dirty = false;
    tree.nodeDepth = tree.options.excludeRoot ? -1 : 0;;

    // Set scroller size to match parent of root container.
    var container = tree.rootContainer;
    container.height = 0;

    var containerParent = container.parentNode;
    if(!containerParent) {
      return;
    }

    var scroller = container.scroller;
    var parentSize = tree.treeDelegate.getTreeNodeParentMaxSize();

    var SCROLL_SAFE_PADDING = 300;

    scroller.empty = true;
    scroller.top = Math.max(0, containerParent.scrollTop - SCROLL_SAFE_PADDING), tree.rootContainer.height;
    scroller.width = 999999;
    scroller.height = parentSize.height + 2 * SCROLL_SAFE_PADDING;
    scroller.style.width = scroller.width + 'px';
    scroller.style.top = scroller.top + 'px';

    clearElementTree();
    createTreeElements(tree.root);

    // Shrink scroller actual height if needed, so control doesn't go outside of the container.
    var height = Math.max(0, Math.min(container.height, scroller.top + scroller.height) - scroller.top);
    if (height !== scroller.height) {
      scroller.style.height =  height + 'px';
    }

    var top = Math.min(scroller.top, tree.rootContainer.height);
    if (top !== scroller.top) {
      scroller.style.top =  top + 'px';
    }

    var newContainerHeight = tree.rootContainer.height + 'px';
    if (container.style.height != newContainerHeight) {
      container.style.height = newContainerHeight;
      tree.treeDelegate.onTreeNodeReized(tree);
    }
  }.bind(tree);

  // If the panel is not dirty, marked as dirty and schedule an update during next frame.
  if (tree.dirty && !inmediate) {
    return false;
  }

  if (inmediate) {
    createElementTree();
  } else {
    tree.dirty = true;

    // All update requests are executed as one during next frame.
    requestAnimationFrame(function() {
      createElementTree();
    });
  }
}

/**
 * Get the id of the node if it's an object or returns input parameter if it's string or number.
 * @private
 * @param {*} node - A node object or a string or number with the id of the node.
 * @returns {number} The id of the node
 */
function getNodeId(tree, node) {

  if (typeof node !== "number" && typeof node !== "string") {
    return tree.threeDelegate.getTreeNodeId(node | 0x0);
  }
  return node;
}

/**
 * Returns the node associated to the html element provided
 * @private
 * @param {*} tree - A TreeOnDemand object instance.
 * @param {*} element - A node object or a string or number with the id of the node.
 * @returns {Number} Node object associated with with the html control.
 */
function getNodeIdFromElement(tree, element) {

  var nodeElement = null;

  while (element && element !== tree.rootContainer) {
    if (element.hasAttribute("lmv-nodeId")) {
      nodeElement = element;
      break;
    }
    element = element.parentElement;
  }

  if(!nodeElement) {
    return null;
  }

  var nodeId = nodeElement.getAttribute("lmv-nodeId");
  return nodeId | 0;
};

/**
 * Get the css array from the css table.
 * @private
 * @param {*} tree - A TreeOnDemand object instance.
 * @param {Number} nodeId - A node id to whome state will be retrived.
 * @returns {Array} Array of strings with the css classes
 */
function getNodeCss(tree, node) {

  var nodeIndex = tree.treeDelegate.getTreeNodeIndex(node);
  return tree.nodeCssTable[tree.nodeIndexToNodeCssTable[nodeIndex]];
}

/**
 * Adds a new css entry table is needed and associate the css table index to node.
 * @private
 * @param {*} tree - A TreeOnDemand object instance.
 * @param {Number} nodeId - A node id to whome state will be retrived.
 */
function setNodeCss(tree, node, css) {

  var key = css.join(' ');
  var index = tree.cssStringToNodeCssTable[key] || tree.nodeCssTable.length;

  if (index === tree.nodeCssTable.length) {
    tree.nodeCssTable.push(css);
    tree.cssStringToNodeCssTable[key] = index;
  }

  var nodeIndex = tree.treeDelegate.getTreeNodeIndex(node);
  tree.nodeIndexToNodeCssTable[nodeIndex] = index;
}

/**
 * Given a node, create the corresponding HTML elements for the node and all of its descendants
 * @private
 * @param {Object} tree - TreeOnDemand node
 * @param {Object=} [options] - An optional dictionary of options.  Current parameters:
 *                              {boolean} [localize] - when true, localization is attempted for the given node; false by default.
 * @param {Number} [depth]
 */
function createNodeHTmlElement(tree, options) {

  var header = document.createElement('lmvheader');

  var icon = document.createElement('icon');
  header.appendChild(icon);

  var element = document.createElement('div');
  element.header = header;
  element.icon = icon;
  element.appendChild(header);

  return element;
};

/**
 *
 * @param {*} event
 */
function onPanelScroll(event) {

  var container = this.rootContainer;
  var scroller = container.scroller;
  var parentSize = this.treeDelegate.getTreeNodeParentMaxSize();

  // If scroller is still inside the container visible area, return, no need to recalculate.
  if (scroller.top + scroller.height < container.parentNode.scrollTop + parentSize.height ||
    scroller.top > container.parentNode.scrollTop) {
    redraw(this, true);
  }
}

/**
 *
 * @param {*} event
 */
function onElementDoubleTap(event) {

  var nodeId = getNodeIdFromElement(this, event.target);
  nodeId && this.treeDelegate.onTreeNodeDoubleClick(this, nodeId, event);
}

/**
 *
 * @param {*} event
 */
function onElementPress(event) {

  var nodeId = getNodeIdFromElement(this, event.target);
  nodeId && this.treeDelegate.onTreeNodeRightClick(this, nodeId, event);
}

/**
 *
 * @param {*} event
 */
function onElementClick(event) {

  // Click has to be done over the children of the tree elements.
  // Group and leaf nodes are only containers to layout consumer content.
  if (event.target.classList.contains('group') ||
    event.target.classList.contains('leaf')) {
    return;
  }

  var nodeId = getNodeIdFromElement(this, event.target);
  if(!nodeId) {
    return;
  }

  this.treeDelegate.onTreeNodeClick(this, nodeId, event);
  event.stopPropagation();

  if(!event.target.classList.contains('propertyLink')) {
    event.preventDefault();
  }
}

/**
 *
 * @param {*} event
 */
function onElementDoubleClick(event) {

  // Click has to be done over the children of the tree elements.
  // Group and leaf nodes are only containers to layout consumer content.
  if (event.target.classList.contains('group') ||
    event.target.classList.contains('leaf')) {
    return;
  }

  var nodeId = getNodeIdFromElement(this, event.target);
  if(!nodeId) {
    return;
  }

  this.treeDelegate.onTreeNodeDoubleClick(this, nodeId, event);
  event.stopPropagation();
  event.preventDefault();
}

/**
 *
 * @param {*} event
 */
function onElementContextMenu(event) {

  // Click has to be done over the children of the tree elements.
  // Group and leaf nodes are only containers to layout consumer content.
  if (event.target.classList.contains('group') ||
    event.target.classList.contains('leaf')) {
    return;
  }

  var nodeId = getNodeIdFromElement(this, event.target);
  if(!nodeId) {
    return;
  }

  this.treeDelegate.onTreeNodeRightClick(this, nodeId, event);
  event.stopPropagation();
  event.preventDefault();
}

/**
 *
 * @param {*} event
 */
function onElementMouseOver(event) {

  // Hover has to be done over the children of the tree elements.
  // Group and leaf nodes are only containers to layout consumer content.
  if (event.target.classList.contains('group') ||
    event.target.classList.contains('leaf')) {
    this.treeDelegate.onTreeNodeHover(this, -1, event);
    return;
  }

  var nodeId = getNodeIdFromElement(this, event.target);
  if(!nodeId) {
    return;
  }

  this.treeDelegate.onTreeNodeHover(this, nodeId, event);
  event.stopPropagation();
  event.preventDefault();
}

/**
 *
 * @param {*} event
 */
function onElementMouseOut(event) {

  // When the mouse leaves the element, set node to -1 (background), no highlight,
  // If the mouse out event is within the same element. don't do anything.
  var element = event.toElement || event.relatedTarget;
  if (getNodeIdFromElement(this, event.target) !== getNodeIdFromElement(this, element)) {
    this.treeDelegate.onTreeNodeHover(this, -1, event);
    event.stopPropagation();
    event.preventDefault();
  }
}

/**
 *
 * @param {*} event
 */
function onElementIconClick(event) {

  var nodeId = getNodeIdFromElement(this, event.target);
  if(!nodeId) {
    return;
  }

  this.treeDelegate.onTreeNodeIconClick(this, nodeId, event);
  event.stopPropagation();
  event.preventDefault();
}


/**
 * Model structure panel.
 *
 * Sets the model structure panel for displaying the loaded model.
 * @alias Autodesk.Viewing.UI.ModelStructurePanel
 * @augments Autodesk.Viewing.UI.DockingPanel
 * @param {HTMLElement} parentContainer - The container for this panel.
 * @param {string} id - The id for this panel.
 * @param {string} title - The initial title for this panel.
 * @param {object} [options] - An optional dictionary of options.
 * @param {boolean} [options.startCollapsed=true] - When true, collapses all of the nodes under the root.
 * @constructor
 * @category UI
 */
function ModelStructurePanel(parentContainer, id, title, options)
{
  Autodesk.Viewing.UI.DockingPanel.call(this, parentContainer, id, title, options);
  this.container.classList.add('modelStructurePanel');

  options = options || {};
  if (!options.heightAdjustment)
    options.heightAdjustment = 40;
  if (!options.marginTop)
    options.marginTop = 0;
  options.left = true;

  this.createScrollContainer(options);

  this.options = options;
  this.instanceTree = null;
  this.tree = null;
  this.selectedNodes = [];

  this.uiCreated = false;

  var that = this;
  this.addVisibilityListener(function (show) {
    if (show) {
      if (!that.uiCreated) {
        that.createUI();
      }

      that.resizeToContent();
    }
  });
};

ModelStructurePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
ModelStructurePanel.prototype.constructor = ModelStructurePanel;

/**
 * Sets the model for this panel to display.
 *
 * @param {InstanceTree} instanceTree - The object tree returned by Autodesk.Viewing.Model.getObjectTree( function(instanceTree) );
 * @param {string=} [modelTitle] - An optional title to display for this model.
 */
ModelStructurePanel.prototype.setModel = function(instanceTree, modelTitle)
{
  this.instanceTree = instanceTree;
  this.modelTitle = modelTitle;

  if (this.isVisible())
    this.createUI();
  else
    this.uiCreated = false;
};

/**
 * Used for delayed initialization of the HTML DOM tree
 * @private
 */
ModelStructurePanel.prototype.createUI = function()
{
  var that = this;
  var instanceTree = that.instanceTree;

  if (!instanceTree /*|| this.uiCreated*/)
    return;

  var createDelegate = function()
  {
    var delegate = new Autodesk.Viewing.UI.TreeDelegate();

    delegate.getTreeNodeId = function(node)
    {
      if (typeof node == "object") {
        Autodesk.Viewing.Private.logger.warn("Object used instead of dbId. Fix it.");
        return node.dbId;
      } else
        return node;
    };

    delegate.getTreeNodeIndex = function(node)
    {
      if (typeof node == "object") {
        Autodesk.Viewing.Private.logger.warn("Object used instead of dbId. Fix it.");
        return that.instanceTree.nodeAccess.dbIdToIndex[node.dbId];
      } else
        return that.instanceTree.nodeAccess.dbIdToIndex[node];
    };

    delegate.getTreeNodeLabel = function(node)
    {
      var dbId = this.getTreeNodeId(node);

      var res = that.instanceTree.getNodeName(dbId);
      if (dbId == -1e10)      // Replace Object -10000000000 with Object 0
        res = 'Object 0';

      return res || ('Object ' + dbId);
    };

    delegate.getTreeNodeClass = function(node)
    {
      return that.getNodeClass(node);
    };

    delegate.getTreeNodeParentId = function(nodeId)
    {
      return that.instanceTree.nodeAccess.getParentId(nodeId);
    }

    delegate.getTreeNodeCount = function()
    {
      return that.instanceTree.nodeAccess.getNumNodes();
    }

    delegate.getTreeNodeParentMaxSize = function()
    {
      if (that.container) {

        var width = that.container.clientWidth  | 0x0;
        var height = that.container.style.maxHeight.replace('px', '') | 0x0;

        return {width: width, height: height};
      }

      return {width: 0, height: 0}
    }

    delegate.getTreeNodeClientHeight = function (node)
    {
      return 29;
    }

    delegate.getTreeNodeDepthOffset = function (node, depth)
    {
      return 25 * depth;
    }

    delegate.isTreeNodeGroup = function(node)
    {
      return that.isGroupNode(node);
    };

    delegate.shouldCreateTreeNode = function(node)
    {
      return that.shouldInclude(node);
    };

    delegate.onTreeNodeClick = function(tree, node, event)
    {
      that.onClick(node, event);
    };

    delegate.onTreeNodeRightClick = function(tree, node, event)
    {
      that.onRightClick(node, event);
    };

    delegate.onTreeNodeDoubleClick = function(tree, node, event)
    {
      that.onDoubleClick(node, event);
    };

    delegate.onTreeNodeIconClick = function(tree, node, event)
    {
      that.onIconClick(node, event);
    };

    delegate.onTreeNodeReized = function(tree)
    {
      that.resizeToContent();
    };

    delegate.forEachChild = function(node, callback)
    {
      var dbId = this.getTreeNodeId(node);
      that.instanceTree.enumNodeChildren(dbId, callback);
    };

    delegate.onTreeNodeHover = function(tree, node, event)
    {
      that.onHover(node, event);
    };

    return delegate;
  };

  var title = that.modelTitle;

  if(!title) {
    if (that.options && that.options.defaultTitle) {
      title = that.options.defaultTitle;
    }
  }

  var options = {};
  if(!title) {
    title = "Browser";  // localized by DockingPanel.prototype.setTitle
    options.localizeTitle = true;
  }
  that.setTitle(title, options);

  // Remove the previous tree from the scroll container and any listeners on the title bar.
  //
  if(that.tree) {
    while(that.scrollContainer.hasChildNodes()){
      that.scrollContainer.removeChild(that.scrollContainer.lastChild);
    }
    that.title.removeEventListener("click", that.onTitleClick);
    that.title.removeEventListener("dblclick", that.onTitleDoubleClick);
    that.tree.removeListeners && that.tree.removeListeners();
  }

  var rootId = this.rootId = instanceTree.getRootId();
  var rootName = instanceTree.getNodeName(rootId);
  var childName;
  var childId = 0;
  var childCount = 0;
  instanceTree.enumNodeChildren(rootId, function(child) {
    if (!childCount) {
      childName = instanceTree.getNodeName(child);
      childId = child;
    }
    childCount++;
  });

  var delegate = createDelegate();
  this.myDelegate = delegate;

  //Detect Fusion models which have a root inside a root (which was probably an arms race
  //against us putting the root in the title bar)
  var skipRoot = (childCount === 1 && rootName === childName);
  var treeOptions = {
    excludeRoot: !!(that.options && that.options.excludeRoot) || skipRoot,
    startCollapsed: !!(that.options && that.options.startCollapsed) && !skipRoot,
    localize: true,
  };
  that.tree = new TreeOnDemand(delegate, rootId, that.scrollContainer, treeOptions);

  // Initialize collapsed states.
  that.tree.setAllCollapsed(true);

  if (treeOptions.excludeRoot) {
    that.tree.setCollapsed(rootId, false);
    if(!treeOptions.startCollapsed) {
      that.tree.setCollapsed(childId, false);
    }
  } else {
    if(!treeOptions.startCollapsed) {
      that.tree.setCollapsed(rootId, false);
    }
  }

  this.uiCreated = true;
};

/**
 * Override this method to specify the label for a node.
 * By default, this is the node's name, or 'Object ' + object id if the name
 * is blank.
 *
 * @param {Object} node - A node in an Autodesk.Viewing.Model
 * @returns {string} Label of the tree node
 */
ModelStructurePanel.prototype.getNodeLabel = function(node)
{
  return this.myDelegate.getNodeLabel(node);
};

/**
 * Override this to specify the CSS classes of a node. This way, in CSS, the designer
 * can specify custom styling per type.
 * By default, an empty string is returned.
 *
 * @param {Object} node - A node in an Autodesk.Viewing.Model
 * @returns {string} CSS classes for the node
 */
ModelStructurePanel.prototype.getNodeClass = function(node)
{
  return '';
};

/**
 * Override this method to specify whether or not a node is a group node.
 * By default, a node is considered a group if it has a 'children' property containing
 * an array with at least one element.
 *
 * @param {Object} node - A node in an Autodesk.Viewing.Model
 * @returns {boolean} true if this node is a group node, false otherwise
 */
ModelStructurePanel.prototype.isGroupNode = function(node)
{
  var dbId = this.myDelegate.getTreeNodeId(node);
  return this.instanceTree.getChildCount(dbId);
};

/**
 * Override this method to specify if a tree node should be created for this node.
 * By default, every node will be displayed.
 *
 * @param {Object} node - A node in an {@link Autodesk.Viewing.Model}
 * @returns {boolean} true if a node should be created, false otherwise
 */
ModelStructurePanel.prototype.shouldInclude = function(node)
{
  return true;
};

/**
 * Override this method to do something when the user clicks on a tree node
 * @param {Object} node - A node in an {@link Autodesk.Viewing.Model}
 * @param {Event} event
 */
ModelStructurePanel.prototype.onClick = function(node, event)
{
  this.setSelection([node]);
};

/**
 * Override this to do something when the user double-clicks on a tree node
 *
 * @param {Object} node - A node in an {@link Autodesk.Viewing.Model}
 * @param {Event} event
 */
ModelStructurePanel.prototype.onDoubleClick = function(node, event)
{
};

/**
 * Override this to do something when the user clicks on a tree node's icon.
 * By default, groups will be expanded/collapsed.
 *
 * @param {Object} node - A node in an {@link Autodesk.Viewing.Model}
 * @param {Event} event
 */
ModelStructurePanel.prototype.onIconClick = function(node, event)
{
  this.setGroupCollapsed(node, !this.isGroupCollapsed(node));
};

/**
 * Collapse/expand a group node.
 *
 * @param {Object} node - A node to collapse/expand in the tree.
 * @param {Boolean} collapsed - True to collapse the group, false to expand it.
 */
ModelStructurePanel.prototype.setGroupCollapsed = function(node, collapsed)
{
  var delegate = this.tree.delegate();
  if (delegate.isTreeNodeGroup(node)) {
    this.tree.setCollapsed(node, collapsed);
  }
};

/**
 * Returns true if the group is collapsed.
 *
 * @param {Object} node - The node in the tree.
 * @returns {Boolean} - True if the group is collapsed, false otherwise.
 */
ModelStructurePanel.prototype.isGroupCollapsed = function(node)
{
  var delegate = this.tree.delegate();
  if (delegate.isTreeNodeGroup(node)) {
    return this.tree.isCollapsed(node);
  }
  return false
};

/**
 * Override this to do something when the user right-clicks on a tree node
 *
 * @param {Object} node - A node in an Autodesk.Viewing.Model
 * @param {Event} event
 */
ModelStructurePanel.prototype.onRightClick = function(node, event)
{
};

/**
 * Override this method to be notified when the user clicks on the title.
 * @override
 * @param {Event} event
 */
ModelStructurePanel.prototype.onTitleClick = function(event)
{
};

/**
 * Override this method to be notified when the user double-clicks on the title.
 * @override
 * @param {Event} event
 */
ModelStructurePanel.prototype.onTitleDoubleClick = function(event)
{
};

/**
 * Override this to do something when the user hovers on a tree node
 *
 * @param {Object} node - A node in an {@link Autodesk.Viewing.Model}
 * @param {Event} event
 */
ModelStructurePanel.prototype.onHover = function(node, event)
{
};

/**
 * Displays the given nodes as selected in this panel.
 *
 * @param {Array} nodes - An array of Autodesk.Viewing.Model nodes to display as selected
 */
ModelStructurePanel.prototype.setSelection = function(nodes)
{
  // Bail if no model structure.
  //
  if(!this.tree) {
    this.selectedNodes = nodes;
    return;
  }

  var i, parent;

  // Un-mark the ancestors.
  //
  for(i=0; i<this.selectedNodes.length; ++i) {
    parent = this.instanceTree.getNodeParentId(this.selectedNodes[i]);
    while(parent) {
      this.tree.removeClass(parent, 'ancestor-selected');
      parent = this.instanceTree.getNodeParentId(parent);
    }
  }

  // Mark the ancestors of the newly selected nodes.
  //
  var selectedNodesHierarchy = [];
  for(i=0; i<nodes.length; ++i) {
    selectedNodesHierarchy.push(nodes[i]);
    parent = this.instanceTree.getNodeParentId(nodes[i]);
    while(parent) {
      this.tree.addClass(parent, 'ancestor-selected');
      parent = this.instanceTree.getNodeParentId(parent);
    }
  }

  // Mark the newly selected nodes.
  //
  this.selectedNodes = nodes;
  this.tree.setSelection(selectedNodesHierarchy);
};

/**
 * Returns the width and height to be used when resizing the panel to the content.
 *
 * @returns {{height: number, width: number}}
 */
ModelStructurePanel.prototype.getContentSize = function ()
{
  var tree = this.tree;
  if (tree) {
    var treeContainer = tree.getRootContainer();
    if (treeContainer) {
      return {height: treeContainer.clientHeight + this.options.heightAdjustment + 35, width: treeContainer.clientWidth};
    }
  }
  return {height: 0, width: 0};
};

/**
 * Given a node's id, adds the given CSS class to this node.
 *
 * @param {string} id - The id of a node in an Autodesk.Viewing.Model
 * @param {string} className - The CSS class to add
 * @returns {boolean} - true if the class was added, false otherwise
 */
ModelStructurePanel.prototype.addClass = function(id, className)
{
  return (this.tree !== null) && this.tree.addClass(id, className);
};

/**
 * Given a node's id, removes the given CSS class from this node.
 *
 * @param {string} id - The id of a node in an Autodesk.Viewing.Model
 * @param {string} className - The CSS class to remove
 * @returns {boolean} - true if the class was removed, false otherwise
 */
ModelStructurePanel.prototype.removeClass = function(id, className)
{
  return (this.tree !== null) && this.tree.removeClass(id, className);
};


Autodesk.Viewing.UI.ModelStructurePanel = ModelStructurePanel

var kDefaultDocStructureConfig = {
  "click": {
    "onObject": ["toggleLeavesSelection"]
  },
  "clickShift": {
    "onObject": ["toggleMultipleLeavesSelection"]
  },
  "clickCtrl": {
    "onObject": ["toggleMultipleLeavesSelection"]
  }
};

function MultiModelStructurePanel(viewer, title, options) {
  this.viewer = viewer;
  this.visible = false;

  options = options || {};
  options.excludeRoot = options.excludeRoot !== undefined ? options.excludeRoot : true;
  options.startCollapsed = options.startCollapsed !== undefined ? options.startCollapsed : true;
  options.heightAdjustment = 75; //bigger than default because of search bar

  ModelStructurePanel.call(this, viewer.container, viewer.container.id + 'MultiModelStructurePanel', title, options);

  this.clickConfig = (options && options.docStructureConfig) ? options.docStructureConfig : kDefaultDocStructureConfig;

  this.isMac = (navigator.userAgent.search("Mac OS") !== -1);

  this.initSearchBox();

  this.prevSearchResults = [];
  this.prevSearchString = "";

  // When selection changes in the viewer, the tree reflects the selection.
  this.ignoreNextSelectionChange = false;
  this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function(event) {

    if(!this.uiCreated) {
      this.needsToScroll = true
      return;
    }

    if (this.ignoreNextSelectionChange) {
      this.ignoreNextSelectionChange = false;
      return;
    }

    var selectedNodes = [];
    var dbIds = event.dbIdArray;

    for (var i = 0; i < dbIds.length; ++i) {
      toggleLeafNodes(dbIds[i], this.tree, this.myDelegate, selectedNodes, selectedNodes);
    }

    this.setSelection(selectedNodes);
    if (dbIds.length !== 0) {
      if (this.visible) {
        this.tree.scrollTo(dbIds[0]);
      } else {
        this.needsToScroll = true
      }
    }
  }.bind(this));
};

MultiModelStructurePanel.prototype = Object.create(ModelStructurePanel.prototype);
MultiModelStructurePanel.prototype.constructor = MultiModelStructurePanel;
Autodesk.Viewing.Extensions.ViewerPanelMixin.call(MultiModelStructurePanel.prototype);

MultiModelStructurePanel.prototype.initialize = function () {
  ModelStructurePanel.prototype.initialize.call(this);

  var that = this;

  that.addEventListener(that.viewer, Autodesk.Viewing.SELECTION_CHANGED_EVENT, function (event) {
    that.setSelection(event.nodeArray.slice());
  });
  that.addEventListener(that.viewer, Autodesk.Viewing.ISOLATE_EVENT, function (event) {
    that.setIsolation(event.nodeIdArray.slice());
  });
  that.addEventListener(that.viewer, Autodesk.Viewing.HIDE_EVENT, function (event) {
    that.setHidden(event.nodeIdArray.slice(), true);
  });
  that.addEventListener(that.viewer, Autodesk.Viewing.SHOW_EVENT, function (event) {
    that.setHidden(event.nodeIdArray.slice(), false);
  });
};

MultiModelStructurePanel.prototype.uninitialize = function () {
  this.viewer = null;
  ModelStructurePanel.prototype.uninitialize.call(this);
};

MultiModelStructurePanel.prototype.createUI = function () {

  ModelStructurePanel.prototype.createUI.call(this);

  var treeNodesContainer = this.container.querySelector('#MultiModelStructurePanel-scroll-container');
  treeNodesContainer.addEventListener('contextmenu', function(event) {
    this.viewer.contextMenu.show(event);
  }.bind(this));
};

MultiModelStructurePanel.prototype.show = function(show) {
  if (this.visible === show) {
    return;
  }

  this.visible = show;

  if (this.visible) {
    this.setSelection(this.selectedNodes);
  }

  if (this.needsToScroll && this.visible && this.selectedNodes.length !== 0) {
    this.tree.scrollTo(this.selectedNodes[0]);
    this.needsToScroll = false;
  }
}

MultiModelStructurePanel.prototype.handleAction = function (actionArray, dbId) {

  for (var action in actionArray) {
    switch (actionArray[action]) {
      case "toggleLeavesSelection":
        toggleLeavesSelection(this, dbId);
        break;
      case "toggleMultipleLeavesSelection":
        toggleMultipleLeavesSelection(this, dbId);
        break;
      case "selectOnly":
        this.ignoreNextSelectionChange = true;
        this.viewer.select(dbId);
        break;
      case "deselectAll":
        this.ignoreNextSelectionChange = true;
        this.viewer.select([]);
        break;
      case "selectToggle":
        this.ignoreNextSelectionChange = true;
        this.viewer.toggleSelect(dbId);
        break;
      case "isolate":
        this.viewer.isolate(dbId);
        break;
      case "showAll":
        this.viewer.isolate(null);
        break;
      case "focus":
        this.viewer.fitToView();
        break;
      case "hide":
        this.viewer.hide(dbId);
        break;
      case "show":
        this.viewer.show(dbId);
        break;
      case "toggleVisibility":
        this.viewer.toggleVisibility(dbId);
        break;
    }
  }
};

MultiModelStructurePanel.prototype.ctrlDown = function (event) {
  return (this.isMac && event.metaKey) || (!this.isMac && event.ctrlKey);
};

MultiModelStructurePanel.prototype.onClick = function (node, event) {

  if (this.isMac && event.ctrlKey) {
    return;
  }

  var that = this;

  var key = "click";

  if (that.ctrlDown(event)) {
    key += "Ctrl";
  }

  if (event.shiftKey) {
    key += "Shift";
  }

  if (event.altKey) {
    key += "Alt";
  }

  if (this.clickConfig && this.clickConfig[key]) {

    that.handleAction(this.clickConfig[key]["onObject"], node);

  } else {

    this.viewer.select(node);
  }
};

MultiModelStructurePanel.prototype.onDoubleClick = function (node, event) {
};

MultiModelStructurePanel.prototype.onHover = function (node, event) {
};

MultiModelStructurePanel.prototype.onRightClick = function (node, event) {

  // Sometimes CTRL + LMB maps to a right click on a mac. Redirect it.
  if (this.isMac && event.ctrlKey && event.button === 0) {
    if (this.clickConfig && this.clickConfig["clickCtrl"]) {
      this.handleAction(this.clickConfig["clickCtrl"]["onObject"], node);
    }

    return null;
  }

  return this.viewer.contextMenu.show(event);
};

MultiModelStructurePanel.prototype.setHidden = function (nodes, hidden) {

  if (!this.uiCreated)
    this.createUI();

  var tree = this.tree;
  if(!tree) {
    return;
  }

  var action =  hidden ?
    function(node) {
      tree.addClass(node, 'dim', false);
      tree.removeClass(node, 'visible', false);
      return true;
    } :
    function(node) {
      tree.removeClass(node, 'dim', false);
      tree.addClass(node, 'visible', false);
      return true;
    };

  for (var i = 0; i < nodes.length; ++i) {
    tree.iterate(nodes[i], action);
  }
};

MultiModelStructurePanel.prototype.setIsolation = function (nodes) {
  // roodId === 0 is a valid root node
  if (this.rootId === undefined || this.rootId === null) {
    return;
  }

  var tree = this.tree;
  tree && tree.iterate(this.rootId, function (node) {
    tree.removeClass(node, 'dim', false);
    tree.removeClass(node, 'visible', false);
    return true;
  });

  if (nodes.length > 0) {
    // If the root is isolated, we don't want to dim anything.
    //
    if (nodes.length === 1 && nodes[0] === this.rootId) {
      return;
    }

    this.setHidden([this.rootId], true);

    this.setHidden(nodes, false);
  }
};

MultiModelStructurePanel.prototype.initSearchBox = function () {
  var searchbox = document.createElement("input");
  searchbox.className = "toolbar-search-box";
  searchbox.type = "search";
  searchbox.results = 5;
  //searchbox.placeholder = Autodesk.Viewing.i18n.translate("Search");
  searchbox.placeholder = Autodesk.Viewing.i18n.translate("Filter by name");
  searchbox.incremental = "incremental";
  searchbox.autosave = this.container.id + "search_autosave";
  //searchbox.setAttribute("data-i18n", "[placeholder]Search");
  searchbox.setAttribute("data-i18n", "[placeholder]Filter by name");
  this.scrollContainer.parentNode.insertBefore(searchbox, this.scrollContainer);
  this.searchbox = searchbox;

  var viewer = this.viewer;
  var self = this;
  //ADP
  var trackAdpFirstSearch = true;

  function doSearch() {
    function collapsePreviousSearch() {
      for (var i=0; i<self.prevSearchResults.length; i++) {
        //self.tree.removeClass(self.prevSearchResults[i], "searchHit");
        self.tree.setCollapsed(self.prevSearchResults[i], true, true);
      }
      if (self.options.excludeRoot) {
        self.tree.setCollapsed(self.rootId, false, false);
      }
    }


    if (self.isSearching) {
      return; //don't send another search to the worker if one is in progress
    }

    if (searchbox.value.length === 0) {
      self.isSearching = false;
      self.prevSearchString = "";
      collapsePreviousSearch();
      self.tree.setSelection([]);
      viewer.select([]);
    } else {
      if (self.prevSearchString === searchbox.value) {
        return;
      }
      self.prevSearchString = searchbox.value;
      collapsePreviousSearch();
      if(trackAdpFirstSearch) {
        Autodesk.Viewing.Private.logger.track({category:'search_node', name: 'model_browser_tool'})
        trackAdpFirstSearch = false;
      }
      self.isSearching = true;

      viewer.search(searchbox.value, function (resultIds) {
        var selectedNodes = [];
        // var selectedNodes = resultIds;

        for (var i = 0; i < resultIds.length; ++i) {
          self.tree.setCollapsed(resultIds[i], false, true);
          gatherLeaves(resultIds[i], self.tree, self.myDelegate, selectedNodes);
          //      toggleLeafNodes(resultIds[i], self.tree, self.myDelegate, selectedNodes, selectedNodes);
        }

        self.ignoreNextSelectionChange = true;
        self.viewer.select(selectedNodes);
        self.setSelection(selectedNodes);

        if (selectedNodes.length !== 0) {
          self.viewer.fitToView(selectedNodes);
        }

        if (resultIds.length) {
          self.resizeToContent();
          self.tree.scrollTo(resultIds[0]);
        }

        self.prevSearchResults = resultIds;
        self.isSearching = false;
      }, null, ["name"]);
    }
  }

  var TIMEOUT = 500;
  var timeout;
  searchbox.addEventListener("input", function(e) { // delayed: as typing
    clearTimeout(timeout);
    timeout = setTimeout(doSearch, TIMEOUT);
  });

  searchbox.addEventListener("change", function(e) { // immediate: press enter, lose focus
    clearTimeout(timeout);
    doSearch();

    if (e.target === document.activeElement) { // focus lost.
      self.prevSearchString = "";
    }
  });
};

function gatherLeaves(dbId, tree, delegate, leaves) {

  tree.iterate(dbId, function(node) {
    if(!delegate.isTreeNodeGroup(node) && leaves.indexOf(node) === -1) {
      leaves.push(node);
    }
    return true;
  });
}

function toggleLeafNodes(dbId, tree, delegate, selectedLeaves, leaves) {
  var unselectedLeaves = false;
  var leavesFound = [];

  tree.iterate(dbId, function(node) {
    if(!delegate.isTreeNodeGroup(node)) {
      unselectedLeaves |= selectedLeaves.indexOf(node) === -1;
      leavesFound.push(node);
    }
    return true;
  });

  var leavesFoundCount = leavesFound.length;
  for (var i = 0; i < leavesFoundCount; ++i) {
    var node = leavesFound[i];
    var index = leaves.indexOf(node);

    if (unselectedLeaves) {
      if (index === -1) {
        leaves.push(node)
      }
    } else {
      if (index !== -1) {
        leaves.splice(index, 1);
      }
    }
  }
  return unselectedLeaves;
}

function toggleLeavesSelection(self, dbId) {

  var selectedNodes = [];

  if(!toggleLeafNodes(dbId, self.tree, self.myDelegate, self.selectedNodes, selectedNodes)) {
    selectedNodes = [];
  }

  self.ignoreNextSelectionChange = true;
  self.viewer.select(selectedNodes);
  self.setSelection(selectedNodes);

  if (selectedNodes.length !== 0) {
    self.viewer.fitToView(selectedNodes);
  }
}

function toggleMultipleLeavesSelection(self, dbId) {

  var selectedNodes = self.selectedNodes.slice(0);

  toggleLeafNodes(dbId, self.tree, self.myDelegate, self.selectedNodes, selectedNodes);

  self.ignoreNextSelectionChange = true;
  self.viewer.select(selectedNodes);
  self.setSelection(selectedNodes);

  if (selectedNodes.length !== 0) {
    self.viewer.fitToView(selectedNodes);
  }
}

Autodesk.Viewing.Extensions.ViewerModelStructurePanel = MultiModelStructurePanel
