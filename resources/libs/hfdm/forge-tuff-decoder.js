/**
 * @fileoverview This is a templated file were will be inserted the module-loader
 *   ( ModuleLoader ), the compiled content of PropertySets module-robotized files
 *   ( MRCompileContent ) and the exports for this module ( DistributionExports ).
 */


(function() {

  // Obfuscated name we will use to save the 'include' and 'exportModule' functions in the global object.
  var incName = '731C5F31F5FB7B5572F8126AB507CD6E3BD84701588731AED25203ED768BE97B_Adsk_Forge_include';
  var expName = '731C5F31F5FB7B5572F8126AB507CD6E3BD84701588731AED25203ED768BE97B_Adsk_Forge_exportModule';
  var savedState = {};


  /**
   * This is where the magic happens.
   */
  function main() {

    var existingFcts = saveStateOfGlobals();
    var include = existingFcts.include;
    var exportModule = existingFcts.exportModule;

    // If neither 'include' nor 'exportModule' exist, get module-loader to define them.
    if (!include && !exportModule) {

      var mlExports = moduleLoader();

      include = mlExports.include;
      exportModule = mlExports.exportModule;

    } else if (!include) {
      console.error('\'exportModule\' is defined, but not \'include\'. You might have a problem with Module Loader.');
    } else if (!exportModule) {
      console.error('\'include\' is defined, but not \'exportModule\'. You might have a problem with Module Loader.');
    }


    // Executes the code resulting from the execution of MRCompile. This is what exports
    // all the Lynx goodies.
    compiledContent(include, exportModule);

    // From the content, define what is exported publicly.
    defineExports(include, exportModule);

    // Return the window/global object in the state it was before we executed module-loader.
    restoreStateOfGlobals();
  }


  /**
   * Look into the global objects for the presence of 'include' and 'exportModule' and save
   * those into the global saveStateOfGlobals object. If the ADSK Forge version of
   * 'include' and 'exportModules' are already in the global object, use these definitions
   * here.
   *
   * @return {object} If there are 'include' and 'exportModule' in the global namespaces
   *                  return them in this object.
   */
  function saveStateOfGlobals() {
    var retVal = {};

    // Overwrite whatever 'include' and 'exportModule' functions that already exist
    // in the global objects. Save a copy before hand so that we can restore what was
    // there at the end of the process.
    if (typeof window !== 'undefined') {
      savedState.include      = window.include      || null;
      savedState.exportModule = window.exportModule || null;

      if (window[incName]) {
        retVal.include = window[incName];
      }
      if (window[expName]) {
        retVal.exportModule = window[expName];
      }
    } else if (typeof require !== 'undefined') {
      savedState.include      = global.include      || null;
      savedState.exportModule = global.exportModule || null;

      if (global[incName]) {
        retVal.include = global[incName];
      }
      if (global[expName]) {
        retVal.exportModule = global[expName];
      }
    } else {
      console.error('We seems to be in a state where neither \'window\' nor \'global\' exist');
      throw new Error('Invalid namespace state.');
    }

    return retVal;
  }

  /**
   * Restore the 'include' and 'exportModule' functions into the global objects
   * to the original state.
   */
  function restoreStateOfGlobals() {

    // Return the window/global object in the state it was before we executed module-loader.
    if (typeof window !== 'undefined') {
      if (savedState.include) {
        window['include'] = savedState.include;
      } else {
        delete window['include'];
      }
      if (savedState.exportModule) {
        window['exportModule'] = savedState.exportModule;
      } else {
        delete window['exportModule'];
      }
    } else if (typeof require !== 'undefined') {
      if (savedState.include) {
        global['include'] = savedState.include;
      } else {
        delete global['include'];
      }
      if (savedState.exportModule) {
        global['exportModule'] = savedState.exportModule;
      } else {
        delete global['exportModule'];
      }
    }
  }

  /**
   * Module loader implementation
   * @return {object} An object with 'include' and 'exportModule' properties.
   */
  function moduleLoader() {
    var include;
    var exportModule;

    (function() {

      var MODULE_NAMESPACE_DELIMITER = '.';
      var EVENT_ALREADY_REGISTERED = 'Event already registered in ModuleLoader.';

      var MSG = {
        NAMESPACE_ERROR: 'You cannot export to a module path that is part of another module\'s namespace: ',
        DUPLICATE_LEAF: 'You cannot re-use a module in a namespace that already has a module: '
      };

      /**
       * A node in the module graph
       * @param {string} in_moduleNamespace The module, or module path you wish to save in a node.
       * @param {*} in_interface The module that is exported.
       */
      var Node = function(in_moduleNamespace, in_interface) {
        var moduleNamespaceSegments = in_moduleNamespace.split(MODULE_NAMESPACE_DELIMITER);
        this._id = moduleNamespaceSegments[moduleNamespaceSegments.length - 1];
        this._moduleNamespace = moduleNamespaceSegments;
        this._parent = null;
        this._inEdges = {};
        this._interface = in_interface || {};
        this._changeCallbacks = [];
        this._leaf = null;
      };
      Node.prototype.onChange = function(callback) {
        this._changeCallbacks.push(callback);
      };
      Node.prototype.triggerChange = function() {
        this._changeCallbacks.forEach(function(changeCallback) {
          changeCallback();
        });
      };
      Node.prototype.hasInput = function(nodeId) {
        return !!this._inEdges[nodeId];
      };
      Node.prototype.addInput = function(childNode) {
        // This is forbidden
        // exportModule('foo', 'Hello World');
        // exportModule('foo.bar', 'Hello World');
        // In this example, 'foo' is already a module
        // so it cannot also be part of the namespace of another module
        console.assert(this._leaf !== true, MSG.DUPLICATE_LEAF + this._moduleNamespace);
        var childNodeId = childNode.getId();
        this._inEdges[childNodeId] = childNode;
        this._interface[childNodeId] = childNode.getInterface();
        var that = this;
        childNode.onChange(function() {
          that._interface[childNodeId] = childNode.getInterface();
        });
        this._leaf = false;
      };
      Node.prototype.getInput = function(nodeId) {
        return this._inEdges[nodeId];
      };

      Node.prototype.getId = function() {
        return this._id;
      };
      Node.prototype.getInterface = function() {
        return this._interface;
      };
      Node.prototype.setInterface = function(in_interface) {
        // This is forbidden
        // exportModule('foo.bar', 'Hello World');
        // exportModule('foo', 'Hello World');
        // In this example, 'foo' is already part of a module namespace
        // so it cannot also be its own module
        console.assert(this._leaf !== false, MSG.NAMESPACE_ERROR + this._moduleNamespace);
        this._interface = in_interface;
        this.triggerChange();
        this._leaf = true;
      };

      /**
       * ModuleRegistrar
       * the central registry for modules in the front-end.
       * @constructor
       * @alias LYNX.ModuleRobot.ModuleRegistrar
       */
      var ModuleRegistrar = function() {
        this._root = new Node('root');
        this._onIncludeEvents = {};
        this._onExportEvents  = {};
        this._delayedRequest = {};
        this._exportedModules = {};
      };

      ModuleRegistrar.prototype.constructor = ModuleRegistrar;

      /**
       * Internal method used to expand from root.
       * @param {String} in_path the path to expand
       * @param {object} in_option some options
       * @param {boolean} in_option.lazy Whether or not it's okay if we don't find the module right-away
       * @return {Object} the node at the end of the path.
       * @private
       */
      ModuleRegistrar.prototype._expand = function( in_path, in_option ) {
        var node = this._root;

        var pathArr = in_path.split(MODULE_NAMESPACE_DELIMITER);
        for (var i = 0; i < pathArr.length; i++) {
          if (node.hasInput(pathArr[i])) {
            node = node.getInput(pathArr[i]);
          } else if (in_option.lazy) {
            node = null;
            break;
          } else {
            var moduleNamespace = pathArr.join('.');
            var errorMessage = "Module Error: path '" + moduleNamespace + "' doesn't exist\n";
            // Produce an interesting stack. Get the current stack and remove all the internal
            // module loader functions
            var stack = (new Error()).stack;
            var stackMessage = '';
            if (stack) {
              var stackLines = stack.split('\n');
              while (stackLines.length && stackLines[0].indexOf('ModuleRegistrar.include') === -1) {
                stackLines.shift(1);
              }
              if (stackLines.length) {
                stackLines.shift(1);
              }
              stackMessage = stackLines.join('\n');
            }
            throw new Error(errorMessage + stackMessage);
          }
        }

        return node;
      };

      /**
       * An expand method to make sure the path exists.
       * @param {String} in_moduleNamespace the path to expand.
       * @return {Object} the node at the end of the path.
       * @private
       */
      ModuleRegistrar.prototype._assertExpand = function( in_moduleNamespace ) {
        var moduleNamespaceSegments = in_moduleNamespace.split(MODULE_NAMESPACE_DELIMITER);

        var module = this._root;
        var moduleNamespace = moduleNamespaceSegments[0];
        for (var i = 0; i < moduleNamespaceSegments.length; i++) {
          if (i !== 0) {
            moduleNamespace = moduleNamespace + MODULE_NAMESPACE_DELIMITER + moduleNamespaceSegments[i];
          }

          var moduleNamespaceSegment = moduleNamespaceSegments[i];
          var nextModule = module.getInput(moduleNamespaceSegment);
          if (nextModule) {
            module = nextModule;
          } else {
            nextModule = new Node(moduleNamespace);
            module.addInput(nextModule);
            module = nextModule;
          }
        }

        return module;
      };

      /**
       * A method to register OnInclude events – this will get fired at every
       * inclusion call.
       * @param {String} in_key the key we give to this event
       * @param {Function} in_function the function to call when the event happens.
       */
      ModuleRegistrar.prototype.registerOnIncludeEvent = function( in_key, in_function ) {
        if (!this._onIncludeEvents[in_key]) {
          this._onIncludeEvents[in_key] = in_function;
        } else {
          throw new Error( EVENT_ALREADY_REGISTERED + ' key: ' + in_key + ' function: ' + in_function );
        }
      };

      /**
       * A internal method to delay callbacks
       * @param {String} in_moduleNamespace the ID of the module.
       * @param {Function} in_function the callback
       * @private
       */
      ModuleRegistrar.prototype._callbackWhenAvailable = function( in_moduleNamespace, in_function ) {
        if (!this._delayedRequest[ in_moduleNamespace ]) {
          this._delayedRequest[ in_moduleNamespace ] = [];
        }
        this._delayedRequest[ in_moduleNamespace].push( in_function );
      };

      /**
       * Internal method to run include callback events
       * @param {String} in_path the path of the module being included.
       * @private
       */
      ModuleRegistrar.prototype._runIncludeEvents = function(in_path) {
        var keys = Object.keys(this._onIncludeEvents);
        var l = keys.length;
        for (var i = 0; i < l; i++) {
          this._onIncludeEvents[keys[i]](in_path);
        }
      };

      /**
       * The module, or module path you wish to include. There are a couple ways to
       * make an inclusion, and it depends on the intent you are trying to express.
       * The first one is by simply saying exactly what you wish to
       * include, and associate it to a local variable:
       *
       * var RGB = include("Color.RGB");
       * In this case RGB will be the interface that was registered at "Color.RGB".
       *
       * Another way is to include the entire namespace:
       *
       * var Color = include("Color");
       * This gives a bit more freedom, but it is also more vague and you may be
       * including things that you don't need. The general recommendation is to be
       * as specific as possible, so to produce a clean dependency graph.
       * In the above example, Color.RGB, Color.CMYK and Color.LAB would be possible
       * values of the object returned by the include.
       *
       * Lastly, you can return a specific set within a namespace, for example:
       * var Color = include("Color", ["RGB", "CMYK"] );
       *
       * In this case LAB would not be available in this inclusion of the
       * Color module.
       *
       * The specialization of the keys also allow for namespacing:
       * include( "Color", [ "Utils.Randomizer", "RGB" ] );
       *
       * @param {string} in_moduleNamespace The module, or module path you wish to include
       * @param {Array.<string>=} in_specialize a specific set within a namespace
       * @return {*} The module found at the given module path.
       */
      ModuleRegistrar.prototype.include = function( in_moduleNamespace, in_specialize ) {
        var that = this;
        var module;

        if (in_specialize) {
          var specializedInterface = {};

          in_specialize.forEach(function(specialize) {
            var specificPath = in_moduleNamespace + MODULE_NAMESPACE_DELIMITER + specialize;

            // if we are specializing we will take into account this can be a definition
            // that only happens later in time – i.e. on cyclic loads. In which case
            // we keep the request in a queue for later.

            that._runIncludeEvents( specificPath );
            var subModule = that._expand(specificPath, {lazy: true});
            if (subModule) {
              var subInterface = subModule.getInterface();
              specializedInterface[specialize] = subInterface;
            } else {
              that._callbackWhenAvailable(specificPath, function( availableSubInterface ) {
                specializedInterface[specialize] = availableSubInterface;
              });
            }
          });

          module = new Node('tmp', specializedInterface);
        } else {
          this._runIncludeEvents(in_moduleNamespace);
          module = this._expand(in_moduleNamespace, {lazy: false});
        }

        return module.getInterface();

      };

      ModuleRegistrar.prototype._addExportedModule = function( in_moduleNamespace, in_interface ) {
        this._exportedModules[ in_moduleNamespace ] = in_interface;
      };

      /**
       * @param {string} in_moduleNamespace - module namespace
       * @return {*|undefined} the module or undefined if the module does not exist
       */
      ModuleRegistrar.prototype.includeOptional = function( in_moduleNamespace ) {
        return this._exportedModules[ in_moduleNamespace ];
      };

      ModuleRegistrar.prototype._executeAwaitingRequests = function( in_moduleNamespace, in_interface ) {
        // execute awaiting requests
        var requests = this._delayedRequest[ in_moduleNamespace ];
        if (requests) {
          while (requests.length > 0) {
            requests.pop()(in_interface); // empty the requests
          }

          delete this._delayedRequest[in_moduleNamespace];
        }
      };

      /**
       * Exports a module interface
       * @param {String} in_moduleNamespace the path to this module, for example "Color.RGB"
       * or "MyLibrary.Math.Vector".
       * @param {*} in_interface the interface you wish to export. It can be any
       * value, for example:
       *
       * // Exporting a Value
       * exportModule( "Math.HalfPi", Math.PI/2 );
       *
       * // Exporting a class
       * var RGBClass = function(){
       *   this.r = 0;
       *   this.g = 0;
       *   this.b = 0;
       * }
       *
       * exportModule( "Color.RGB", RGBClass );
       *
       * // Exporting a module interface
       * exportModule( "Math.Utils.CONSTANTS", {
       *   MAX_INT : Math.pow(2,53),
       *   ONE_DEGREE_IN_RADIAN : 0.017453292519943295;
       * });
       */
      ModuleRegistrar.prototype.exportModule = function(in_moduleNamespace, in_interface) {
        if ( !this.includeOptional( in_moduleNamespace ) ) {

          // run export events
          var keys = Object.keys(this._onExportEvents);
          var l = keys.length;
          for (var i = 0; i < l; i++) {
            this._onExportEvents[keys[i]](in_moduleNamespace, in_interface);
          }

          var node = this._assertExpand(in_moduleNamespace);

          // We may not have an interface, in which case we will take this was
          // intended to be a new namespace.
          if (in_interface !== undefined) {
            node.setInterface(in_interface);  // extend node
            this._executeAwaitingRequests(in_moduleNamespace, in_interface);
            this._addExportedModule(in_moduleNamespace, in_interface);
          }

        } else {
          console.warn( 'Module already exists ' + in_moduleNamespace +
            '. This is OK if and only if both module instances have the same version.');
        }
      };

      /**
       * Create our central registrar object
       * @type {ModuleRegistrar}
       */
      var registrar = new ModuleRegistrar();

      /**
       * Tells the module system to include a module when loading this file.
       * @global
       * @return {*}
       */
      var include = registrar.include.bind(registrar);

      /**
       * Query for and return module if it it exists or return undefined if it doesn't
       * @global
       * @return {*}
       */
      var includeOptional = registrar.includeOptional.bind(registrar);

      /**
       * Tell the modules system that this file exports a symbol.
       * @global
       */
      var exportModule = registrar.exportModule.bind(registrar);

      /**
       * Identify our environment and get our global object to expose module registrar
       */
      if (typeof window !== 'undefined') {
        if (window.exportModule || window.include) {
          console.warn('[ModuleLoader] The global variables `include` and `exportModule` already exist');
          console.warn('[ModuleLoader] Two instances of ModuleRobot were probably created');
        }
        window.exportModule = window.exportModule || exportModule;
        window.include = window.include || include;
        window.includeOptional = window.includeOptional || includeOptional;
      }
      if (typeof require !== 'undefined') {
        if (global.exportModule || global.include) {
          console.warn('[ModuleLoader] The global variables `include` and `exportModule` already exist');
          console.warn('[ModuleLoader] Two instances of ModuleRobot were probably created');
        }
        module.exports = function() {
          global.exportModule = global.exportModule || exportModule;
          global.include = global.include || include;
          global.includeOptional = global.includeOptional || includeOptional;
        };
      }

      /**
       * Use the module loader to export an interface to itself
       */
      exportModule( 'ModuleLoader', {
        registerOnIncludeEvent:  registrar.registerOnIncludeEvent.bind(registrar),
        exportModule:            registrar.exportModule.bind(registrar),
        include:                 registrar.include.bind(registrar),
        includeOptional: registrar.includeOptional.bind(registrar)
      });

    })();


    if (typeof window !== 'undefined') {
      include = window.include;
      exportModule = window.exportModule;

      // Insert the include/exportModule coming from the module-loader into a properties
      // that are highly improbable to exist before-hand.
      window[incName] = include;
      window[expName] = exportModule;
    } else if (typeof require !== 'undefined') {
      module.exports();  // This will export the 'include' and 'exportModule' into global.

      include = global.include;
      exportModule = global.exportModule;

      // Insert the include/exportModule coming from the module-loader into a properties
      // that are highly improbable to exist before-hand.
      global[incName] = include;
      global[expName] = exportModule;
    }

    return {
      include: include,
      exportModule: exportModule
    };
  }

  /**
   * This is the concatenation of all exports in PropertySets. This content is
   * generated by MRCompile and inserted here.
   * @param {function} include The 'include' function to be used by the compiled content.
   * @param {function} exportModule The 'exportModule' function to be used by the compiled content.
   */
  function compiledContent(include, exportModule) {

    /**
     * @fileoverview Provides a browser abstraction layer for constructing WebWorker
     * instances.
     */
    /**
     * @fileoverview Global WebWorker pool used to schedule decompression jobs for TUFF files.
     */
    /**
     * @fileoverview Generic decoding context.
     */
    /**
     * @fileoverview Pre-defined context to hangle filament clusters
     */
    /**
     * @fileoverview Triangle Mesh decoding context
     */
    /**
     * @fileoverview place to register all user-defined contexts
     */
    /**
     * @fileoverview Functionality to decode TUFF files
     */
    /* eslint-disable no-undef*/
    /**
     * @fileoverview Decodes TUFF data and returns the decoded typed streams
     */
    /**
     * @fileoverview Creates a THREE object with data extracted from a TUFF file/chunk/package
     */
    /**
     * @fileoverview
     * Process loaded tuff data
     */
    /* include('LYNX.TUFF.custom.exportModule'); */
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      /**
       * @alias LYNX.TUFF.LZMA
       */
      var LZMA = {};
      LZMA.OutWindow = function () {
        this._windowSize = 0;
        this._pos = 0;
        this._streamPos = 0;
        this._buffer = null;
        this._stream = null;
      };
      LZMA.OutWindow.prototype.create = function (windowSize) {
        if (!this._buffer || this._windowSize !== windowSize) {
          this._buffer = new Uint8Array(windowSize);
        }
        this._windowSize = windowSize;
        this._pos = 0;
        this._streamPos = 0;
      };
      LZMA.OutWindow.prototype.flush = function () {
        var size = this._pos - this._streamPos;
        if (size !== 0) {
          while (size--) {
            this._stream.writeByte(this._buffer[this._streamPos++]);
          }
          if (this._pos >= this._windowSize) {
            this._pos = 0;
          }
          this._streamPos = this._pos;
        }
      };
      LZMA.OutWindow.prototype.releaseStream = function () {
        this.flush();
        this._stream = null;
      };
      LZMA.OutWindow.prototype.setStream = function (stream) {
        this.releaseStream();
        this._stream = stream;
      };
      LZMA.OutWindow.prototype.init = function (solid) {
        if (!solid) {
          this._streamPos = 0;
          this._pos = 0;
        }
      };
      LZMA.OutWindow.prototype.copyBlock = function (distance, len) {
        var pos = this._pos - distance - 1;
        if (pos < 0) {
          pos += this._windowSize;
        }
        while (len--) {
          if (pos >= this._windowSize) {
            pos = 0;
          }
          this._buffer[this._pos++] = this._buffer[pos++];
          if (this._pos >= this._windowSize) {
            this.flush();
          }
        }
      };
      LZMA.OutWindow.prototype.putByte = function (b) {
        this._buffer[this._pos++] = b;
        if (this._pos >= this._windowSize) {
          this.flush();
        }
      };
      LZMA.OutWindow.prototype.getByte = function (distance) {
        var pos = this._pos - distance - 1;
        if (pos < 0) {
          pos += this._windowSize;
        }
        return this._buffer[pos];
      };
      LZMA.RangeDecoder = function () {
      };
      LZMA.RangeDecoder.prototype.setStream = function (stream) {
        this._stream = stream;
      };
      LZMA.RangeDecoder.prototype.releaseStream = function () {
        this._stream = null;
      };
      LZMA.RangeDecoder.prototype.init = function () {
        var i = 5;
        this._code = 0;
        this._range = -1;
        while (i--) {
          this._code = this._code << 8 | this._stream.readByte();
        }
      };
      LZMA.RangeDecoder.prototype.decodeDirectBits = function (numTotalBits) {
        var result = 0;
        var i = numTotalBits;
        var t;
        while (i--) {
          this._range >>>= 1;
          t = this._code - this._range >>> 31;
          this._code -= this._range & t - 1;
          result = result << 1 | 1 - t;
          if ((this._range & 4278190080) === 0) {
            this._code = this._code << 8 | this._stream.readByte();
            this._range <<= 8;
          }
        }
        return result;
      };
      LZMA.RangeDecoder.prototype.decodeBit = function (probs, index) {
        var prob = probs[index];
        var newBound = (this._range >>> 11) * prob;
        if ((this._code ^ 2147483648) < (newBound ^ 2147483648)) {
          this._range = newBound;
          probs[index] += 2048 - prob >>> 5;
          if ((this._range & 4278190080) === 0) {
            this._code = this._code << 8 | this._stream.readByte();
            this._range <<= 8;
          }
          return 0;
        }
        this._range -= newBound;
        this._code -= newBound;
        probs[index] -= prob >>> 5;
        if ((this._range & 4278190080) === 0) {
          this._code = this._code << 8 | this._stream.readByte();
          this._range <<= 8;
        }
        return 1;
      };
      LZMA.initBitModels = function (len) {
        var probs = new Int32Array(len);
        for (var i = 0; i < len; i++) {
          probs[i] = 1024;
        }
        return probs;
      };
      LZMA.BitTreeDecoder = function (numBitLevels) {
        this._models = null;
        this._numBitLevels = numBitLevels;
      };
      LZMA.BitTreeDecoder.prototype.init = function () {
        this._models = LZMA.initBitModels(1 << this._numBitLevels);
      };
      LZMA.BitTreeDecoder.prototype.decode = function (rangeDecoder) {
        var m = 1;
        var i = this._numBitLevels;
        while (i--) {
          m = m << 1 | rangeDecoder.decodeBit(this._models, m);
        }
        return m - (1 << this._numBitLevels);
      };
      LZMA.BitTreeDecoder.prototype.reverseDecode = function (rangeDecoder) {
        var m = 1;
        var symbol = 0;
        var i = 0;
        var bit;
        for (; i < this._numBitLevels; ++i) {
          bit = rangeDecoder.decodeBit(this._models, m);
          m = m << 1 | bit;
          symbol |= bit << i;
        }
        return symbol;
      };
      LZMA.reverseDecode2 = function (models, startIndex, rangeDecoder, numBitLevels) {
        var m = 1;
        var symbol = 0;
        var i = 0;
        var bit;
        for (; i < numBitLevels; ++i) {
          bit = rangeDecoder.decodeBit(models, startIndex + m);
          m = m << 1 | bit;
          symbol |= bit << i;
        }
        return symbol;
      };
      LZMA.LenDecoder = function () {
        this._choice = null;
        this._lowCoder = [];
        this._midCoder = [];
        this._highCoder = new LZMA.BitTreeDecoder(8);
        this._numPosStates = 0;
      };
      LZMA.LenDecoder.prototype.create = function (numPosStates) {
        for (; this._numPosStates < numPosStates; ++this._numPosStates) {
          this._lowCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
          this._midCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
        }
      };
      LZMA.LenDecoder.prototype.init = function () {
        var i = this._numPosStates;
        this._choice = LZMA.initBitModels(2);
        while (i--) {
          this._lowCoder[i].init();
          this._midCoder[i].init();
        }
        this._highCoder.init();
      };
      LZMA.LenDecoder.prototype.decode = function (rangeDecoder, posState) {
        if (rangeDecoder.decodeBit(this._choice, 0) === 0) {
          return this._lowCoder[posState].decode(rangeDecoder);
        }
        if (rangeDecoder.decodeBit(this._choice, 1) === 0) {
          return 8 + this._midCoder[posState].decode(rangeDecoder);
        }
        return 16 + this._highCoder.decode(rangeDecoder);
      };
      LZMA.Decoder2 = function () {
        this._decoders = null;
      };
      LZMA.Decoder2.prototype.init = function () {
        this._decoders = LZMA.initBitModels(768);
      };
      LZMA.Decoder2.prototype.setRangeDecoder = function (rangeDecoder) {
        this._rangeDecoder = rangeDecoder;
      };
      LZMA.Decoder2.prototype.decodeNormal = function () {
        var symbol = 1;
        do {
          symbol = symbol << 1 | this._rangeDecoder.decodeBit(this._decoders, symbol);
        } while (symbol < 256);
        return symbol & 255;
      };
      LZMA.Decoder2.prototype.decodeWithMatchByte = function (rangeDecoder, matchByte) {
        var symbol = 1;
        var matchBit;
        var bit;
        do {
          matchBit = matchByte >> 7 & 1;
          matchByte <<= 1;
          bit = rangeDecoder.decodeBit(this._decoders, (1 + matchBit << 8) + symbol);
          symbol = symbol << 1 | bit;
          if (matchBit !== bit) {
            while (symbol < 256) {
              symbol = symbol << 1 | rangeDecoder.decodeBit(this._decoders, symbol);
            }
            break;
          }
        } while (symbol < 256);
        return symbol & 255;
      };
      LZMA.LiteralDecoder = function () {
      };
      LZMA.LiteralDecoder.prototype.create = function (numPosBits, numPrevBits) {
        var i;
        if (this._coders && this._numPrevBits === numPrevBits && this._numPosBits === numPosBits) {
          return;
        }
        this._numPosBits = numPosBits;
        this._posMask = (1 << numPosBits) - 1;
        this._numPrevBits = numPrevBits;
        this._coders = [];
        i = 1 << this._numPrevBits + this._numPosBits;
        while (i--) {
          this._coders[i] = new LZMA.Decoder2();
        }
      };
      LZMA.LiteralDecoder.prototype.init = function () {
        var i = 1 << this._numPrevBits + this._numPosBits;
        while (i--) {
          this._coders[i].init();
        }
      };
      LZMA.LiteralDecoder.prototype.getDecoder = function (pos, prevByte) {
        return this._coders[((pos & this._posMask) << this._numPrevBits) + ((prevByte & 255) >>> 8 - this._numPrevBits)];
      };
      LZMA.LiteralDecoder.prototype.getCoders = function () {
        return this._coders;
      };
      LZMA.Decoder = function () {
        this._outWindow = new LZMA.OutWindow();
        this._rangeDecoder = new LZMA.RangeDecoder();
        this._isMatchDecoders = null;
        this._isRepDecoders = null;
        this._isRepG0Decoders = null;
        this._isRepG1Decoders = null;
        this._isRepG2Decoders = null;
        this._isRep0LongDecoders = null;
        this._posSlotDecoder = [];
        this._posDecoders = [];
        this._posAlignDecoder = new LZMA.BitTreeDecoder(4);
        this._lenDecoder = new LZMA.LenDecoder();
        this._repLenDecoder = new LZMA.LenDecoder();
        this._literalDecoder = new LZMA.LiteralDecoder();
        this._dictionarySize = -1;
        this._dictionarySizeCheck = -1;
        this._posSlotDecoder[0] = new LZMA.BitTreeDecoder(6);
        this._posSlotDecoder[1] = new LZMA.BitTreeDecoder(6);
        this._posSlotDecoder[2] = new LZMA.BitTreeDecoder(6);
        this._posSlotDecoder[3] = new LZMA.BitTreeDecoder(6);
      };
      LZMA.Decoder.prototype.setDictionarySize = function (dictionarySize) {
        if (dictionarySize < 0) {
          return false;
        }
        if (this._dictionarySize !== dictionarySize) {
          this._dictionarySize = dictionarySize;
          this._dictionarySizeCheck = Math.max(this._dictionarySize, 1);
          this._outWindow.create(Math.max(this._dictionarySizeCheck, 4096));
        }
        return true;
      };
      LZMA.Decoder.prototype.setLcLpPb = function (lc, lp, pb) {
        var numPosStates = 1 << pb;
        if (lc > 8 || lp > 4 || pb > 4) {
          return false;
        }
        this._literalDecoder.create(lp, lc);
        this._lenDecoder.create(numPosStates);
        this._repLenDecoder.create(numPosStates);
        this._posStateMask = numPosStates - 1;
        return true;
      };
      LZMA.Decoder.prototype.init = function () {
        var i = 4;
        this._outWindow.init(false);
        this._isMatchDecoders = LZMA.initBitModels(192);
        this._isRep0LongDecoders = LZMA.initBitModels(192);
        this._isRepDecoders = LZMA.initBitModels(12);
        this._isRepG0Decoders = LZMA.initBitModels(12);
        this._isRepG1Decoders = LZMA.initBitModels(12);
        this._isRepG2Decoders = LZMA.initBitModels(12);
        this._posDecoders = LZMA.initBitModels(114);
        this._literalDecoder.init();
        while (i--) {
          this._posSlotDecoder[i].init();
        }
        this._lenDecoder.init();
        this._repLenDecoder.init();
        this._posAlignDecoder.init();
        this._rangeDecoder.init();
      };
      LZMA.Decoder.prototype.decodeBytes = function (outSize) {
        var state = 0;
        var rep0 = 0;
        var rep1 = 0;
        var rep2 = 0;
        var rep3 = 0;
        var nowPos64 = 0;
        var prevByte = 0;
        var posState, decoder2, len, distance, posSlot, numDirectBits;
        if (outSize < 0) {
          return undefined;
        }
        while (nowPos64 < outSize) {
          posState = nowPos64 & this._posStateMask;
          if (this._rangeDecoder.decodeBit(this._isMatchDecoders, (state << 4) + posState) === 0) {
            decoder2 = this._literalDecoder.getDecoder(nowPos64++, prevByte);
            if (state >= 7) {
              prevByte = decoder2.decodeWithMatchByte(this._rangeDecoder, this._outWindow.getByte(rep0));
            } else {
              prevByte = decoder2.decodeNormal();
            }
            this._outWindow.putByte(prevByte);
            state = state < 4 ? 0 : state - (state < 10 ? 3 : 6);
          } else {
            if (this._rangeDecoder.decodeBit(this._isRepDecoders, state) === 1) {
              len = 0;
              if (this._rangeDecoder.decodeBit(this._isRepG0Decoders, state) === 0) {
                if (this._rangeDecoder.decodeBit(this._isRep0LongDecoders, (state << 4) + posState) === 0) {
                  state = state < 7 ? 9 : 11;
                  len = 1;
                }
              } else {
                if (this._rangeDecoder.decodeBit(this._isRepG1Decoders, state) === 0) {
                  distance = rep1;
                } else {
                  if (this._rangeDecoder.decodeBit(this._isRepG2Decoders, state) === 0) {
                    distance = rep2;
                  } else {
                    distance = rep3;
                    rep3 = rep2;
                  }
                  rep2 = rep1;
                }
                rep1 = rep0;
                rep0 = distance;
              }
              if (len === 0) {
                len = 2 + this._repLenDecoder.decode(this._rangeDecoder, posState);
                state = state < 7 ? 8 : 11;
              }
            } else {
              rep3 = rep2;
              rep2 = rep1;
              rep1 = rep0;
              len = 2 + this._lenDecoder.decode(this._rangeDecoder, posState);
              state = state < 7 ? 7 : 10;
              posSlot = this._posSlotDecoder[len <= 5 ? len - 2 : 3].decode(this._rangeDecoder);
              if (posSlot >= 4) {
                numDirectBits = (posSlot >> 1) - 1;
                rep0 = (2 | posSlot & 1) << numDirectBits;
                if (posSlot < 14) {
                  rep0 += LZMA.reverseDecode2(this._posDecoders, rep0 - posSlot - 1, this._rangeDecoder, numDirectBits);
                } else {
                  rep0 += this._rangeDecoder.decodeDirectBits(numDirectBits - 4) << 4;
                  rep0 += this._posAlignDecoder.reverseDecode(this._rangeDecoder);
                  if (rep0 < 0) {
                    if (rep0 === -1) {
                      break;
                    }
                    return false;
                  }
                }
              } else {
                rep0 = posSlot;
              }
            }
            if (rep0 >= nowPos64 || rep0 >= this._dictionarySizeCheck) {
              return false;
            }
            this._outWindow.copyBlock(rep0, len);
            nowPos64 += len;
            prevByte = this._outWindow.getByte(0);
          }
        }
        return undefined;
      };
      LZMA.Decoder.prototype.decode = function (inStream, outStream, outSize) {
        this._rangeDecoder.setStream(inStream);
        this._outWindow.setStream(outStream);
        this.init();
        var coders = this._literalDecoder.getCoders();
        for (var i = 0; i < coders.length; i++) {
          coders[i].setRangeDecoder(this._rangeDecoder);
        }
        this.decodeBytes(outSize);
        this._outWindow.flush();
        this._outWindow.releaseStream();
        this._rangeDecoder.releaseStream();
        return true;
      };
      LZMA.Decoder.prototype.setDecoderProperties = function (properties) {
        var value, lc, lp, pb, dictionarySize;
        if (properties.size < 5) {
          return false;
        }
        value = properties.readByte();
        lc = value % 9;
        value = ~~(value / 9);
        lp = value % 5;
        pb = ~~(value / 5);
        if (!this.setLcLpPb(lc, lp, pb)) {
          return false;
        }
        dictionarySize = properties.readByte();
        dictionarySize |= properties.readByte() << 8;
        dictionarySize |= properties.readByte() << 16;
        dictionarySize += properties.readByte() * 16777216;
        return this.setDictionarySize(dictionarySize);
      };
      LZMA.decompress = function (properties, inStream, outStream, outSize) {
        var decoder = new LZMA.Decoder();
        if (!decoder.setDecoderProperties(properties)) {
          throw new Error('Incorrect stream properties');
        }
        if (!decoder.decode(inStream, outStream, outSize)) {
          throw new Error('Error in data stream');
        }
        return true;
      };
      exportModule('LYNX.TUFF.LZMA', LZMA);
    }());
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      /**
       * @alias LYNX.TUFF.CONSTANTS
       */
      var CONSTANTS = {};
      // Currently pretty high since we are storing our info in floats.
      CONSTANTS.ACCEPTABLE_UNIT_VECTOR_ERROR = 0.000001;
      CONSTANTS.STREAM_HEADER_ID = 'ADSK';
      CONSTANTS.TUFF_ENTITY_ID_LENGTH = 36;
      CONSTANTS.TUFF_REBUILD_MARKER = '********-****-****-****-************';
      CONSTANTS.GEOMETRY_TYPES = {
        GEOMETRY: 0,
        POINT_CLOUD: 1,
        FIBER_CLUSTER: 2,
        TRIANGLE_MESH: 3
      };
      CONSTANTS.LIMITS = { MAX_WEBGL_HAIRS: 10000 };
      CONSTANTS.STREAM_TYPE_SEQUENCE_NAME = '*str*type*seq';
      CONSTANTS.FORMATS = {
        XX_TUGT0: 'XX_TUGT0',
        // General geometry, default case
        TM_TUGT0: 'TM_TUGT0',
        // Triangle mesh, version 0
        TM_TUGT1: 'TM_TUGT1',
        // Triangle mesh, version 1
        TM_TUGT2: 'TM_TUGT2',
        // Triangle mesh, version 2
        FC_TUGT0: 'FC_TUGT0',
        // Fiber cluster (e.g. hair geometry)
        PC_TUGT0: 'PC_TUGT0',
        // Particle cluster (e.g. point cloud)
        MULTTUGT: 'MULTTUGT',
        // MultiTUFF, currently not used
        MULTITUFF: 'XX_MULTI'  // Multiple TUFF chunks packed in a single file
      };
      CONSTANTS.TUFF_STREAM_TYPE_NAMES = {
        int8Streams: 'int8Streams',
        int16Streams: 'int16Streams',
        int32Streams: 'int32Streams',
        int64Streams: 'int64Streams',
        floatStreams: 'floatStreams',
        doubleStreams: 'doubleStreams',
        vector2Streams: 'vector2Streams',
        vector3Streams: 'vector3Streams',
        normVector3Streams: 'normVector3Streams',
        vector4Streams: 'vector4Streams'
      };
      CONSTANTS.PREDEFINED_STREAM_NAMES = {
        POS: '*pos',
        // Predefined name for position stream in a geometry.
        POSIDX: '*pos*idx',
        // Predefined name for topology (index) stream in a geometry.
        NRM: '*nrm',
        // Predefined name for normal stream in a geometry.
        NRMIDX: '*nrm*idx',
        // Predefined name for normal index stream in a geometry.
        TEX: '*tex*0',
        // Predefined name for first texture stream in a geometry
        TEXIDX: '*tex*0*idx'  // Predefined name for first texture index stream in a geometry
      };
      CONSTANTS.TUFF_STREAM_TYPES = {
        Stream_uint8: 0,
        Stream_int32: 1,
        Stream_float: 2,
        Stream_vec2f: 3,
        Stream_vec3f: 4,
        Stream_normVec3f: 5,
        Stream_vec4f: 6,
        Stream_int64: 7,
        Stream_double: 8
      };
      CONSTANTS.SEEK_TYPE = {
        RELATIVE: 0,
        ABSOLUTE: 1
      };
      CONSTANTS.PREDEFINED_OPTION_NAMES = { REORDER_TOPOLOGY: 'reorder_topology' };
      exportModule('LYNX.TUFF.CONSTANTS', CONSTANTS);
    }());
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      var TUFF = {};
      var CONSTANTS = include('LYNX.TUFF.CONSTANTS');
      /**
       * Representation for C++ LT::FPFloat<1,0,0,0>
       * @param {ArrayBuffer} arrayBuffer
       * @param {Number} offset
       * @constructor
       */
      TUFF.FPFloat = function (arrayBuffer, offset) {
      };
      /**
       * Creates a conventional float from its fixed point arithmetic representation
       * @param {Uint8Array} f buffer containing the data
       * @param {number} offset starting point of the fp-float to be read
       * @param {number} size size of the fp-float to be read, in bytes
       * @returns {number}  decompressed float
       */
      TUFF.convertFPFloatToFloat = function (f, offset, size) {
        var tmpi = f[offset];
        var shift = 0;
        for (var i = 1; i < size; i++) {
          shift = i * 8;
          tmpi |= f[offset + i] << shift;
        }
        var sgn = 1;
        shift = size * 8 - 1;
        if (tmpi & 1 << shift) {
          sgn = -1;
        }
        tmpi &= ~(1 << shift);
        return sgn * tmpi / ((1 << shift) - 1);
      };
      /**
       * Creates a conventional double from its fixed point arithmetic representation
       * @param {Uint8Array} f buffer containing the data
       * @param {number} offset starting point of the fp-double to be read
       * @param {number} size size of the fp-double to be read, in bytes
       * @returns {number}  decompressed double
       */
      TUFF.convertFPDoubleToDouble = function (f, offset, size) {
        var TWO_PWR_32 = (1 << 16) * (1 << 16);
        var MAX_DBL_HIGH_BIT_SIZE = 21;
        var shift = 0;
        var low = f[offset];
        var high = 0;
        var sgn = 1;
        var low_bound = Math.min(size, 4);
        for (var i = 1; i < low_bound; ++i) {
          shift = i * 8;
          low |= f[offset + i] << shift;
        }
        if (size < 4) {
          shift = size * 8 - 1;
          if (low & 1 << shift) {
            sgn = -1;
          }
          low &= ~(1 << shift);
          return sgn * low / ((1 << shift) - 1);
        } else if (size === 4) {
          var bound = (1 << 30) * 2;
          if (low & bound) {
            sgn = -1;
          }
          low &= ~bound;
          return sgn * low / (bound - 1);
        } else {
          high = f[offset + 4];
          for (var i = 5; i < size; ++i) {
            shift = (i - 4) * 8;
            high |= f[offset + i] << shift;
          }
          shift = (size - 4) * 8 - 1;
          if (shift > MAX_DBL_HIGH_BIT_SIZE) {
            shift = MAX_DBL_HIGH_BIT_SIZE;
          }
          if (high & 1 << shift) {
            sgn = -1;
          }
          high &= ~(1 << shift);
          return sgn * (high * TWO_PWR_32 + (low >>> 0)) / ((1 << shift) * TWO_PWR_32 - 1);
        }
      };
      TUFF.File = function () {
        this.int8Streams = [];
        this.int32Streams = [];
        this.int64Streams = [];
        this.vector4Streams = [];
        this.vector3Streams = [];
        this.normVector3Streams = [];
        this.vector2Streams = [];
        this.floatStreams = [];
        this.doubleStreams = [];
      };
      // reverse makeIndexDeltas()
      TUFF.restoreIndices = function (nTriangle, triIdx) {
        var prevTri;
        for (var i = 0; i < nTriangle; i++) {
          // step 1: reverse derivative of the first triangle index
          if (i >= 1) {
            prevTri = triIdx[3 * (i - 1)];
            triIdx[3 * i] += prevTri;
          }
          // step 2: reverse delta from third triangle index to the first triangle
          // index
          triIdx[3 * i + 2] += triIdx[3 * i];
          // step 3: reverse delta from second triangle index to the previous
          // second triangle index, if the previous triangle shares the same first
          // index, otherwise reverse the delta to the first triangle index
          if (i >= 1 && triIdx[3 * i] === prevTri) {
            triIdx[3 * i + 1] += triIdx[3 * (i - 1) + 1];
          } else {
            triIdx[3 * i + 1] += triIdx[3 * i];
          }
        }
      };
      TUFF.restoreIndices2 = function (nTriangle, triIdx) {
        var prevTri;
        for (var i = 0; i < nTriangle; i++) {
          if (i >= 1) {
            prevTri = triIdx[3 * (i - 1)];
            triIdx[3 * i] += prevTri;
          }
          triIdx[3 * i + 1] += triIdx[3 * i];
          triIdx[3 * i + 2] += triIdx[3 * i + 1];
        }
      };
      TUFF.restoreIndicesStream = function (stream) {
        for (var i = stream.getSize() - 2; i >= 0; i--) {
          stream.data[i] = stream.data[i + 1] - stream.data[i];
        }
      };
      TUFF.vector2fToUnitVector3fHQ = function (stream2, stream3) {
        var size = stream2.getSize() / 2;
        if (stream3.getSize() / 3 === size) {
          for (var i = 0; i < size; i++) {
            var tmp0 = stream2.data[2 * i];
            var z = stream2.data[2 * i + 1];
            var st = Math.sqrt(Math.max(0, 1 - z * z));
            var phi = tmp0;
            var x = Math.cos(phi) * st;
            var y = Math.sin(phi) * st;
            var l = Math.sqrt(x * x + y * y + z * z);
            stream3.data[3 * i] = x / l;
            stream3.data[3 * i + 1] = y / l;
            stream3.data[3 * i + 2] = z / l;
          }
        } else {
          throw new Error('incompatible streams');
        }
      };
      /*
       * memcopy-like function for typed arrays.
       * Due to a strange behavior in some scenarios we decided
       * to comment the copy using the `set` function and instead
       * copy the values manually. Didn't observe any negative impact
       * in performance, however we might want to check again once we have more time.
       */
      TUFF.copyData = function (origin, start, length, destination) {
        /*
        var originBuffer = new Uint8Array(origin.buffer, start, length);
        var destinationBuffer = new Uint8Array(destination.buffer);
        destinationBuffer.set(originBuffer);
        */
        for (var i = 0; i < length; ++i) {
          destination[i] = origin[i + start];
        }
      };
      /**
       * Extracts header information from all streams within the chunk
       *
       * @param {LYNX.TUFF.Stream} file
       * @param {Number} majorVersion
       * @param {Number} minorVersion
       */
      TUFF.File.prototype.extractTUFFHeader = function (file, majorVersion, minorVersion) {
        var header = new TUFF.StreamHeader();
        file.readStreamHeader(header);
        if (header.name !== CONSTANTS.STREAM_TYPE_SEQUENCE_NAME) {
          throw new Error('No type sequence stream present. Unsupported TUFF version (' + majorVersion + ', ' + minorVersion + '). Stream name expected: ' + header.name + ', header name retrieved: ' + header.name);
        } else {
          var typeSeqStream = new TUFF.Uint8Stream(header.size);
          file.readStream(undefined, typeSeqStream.data, header);
          // no context required since this stream is not compressed
          var nStreams = typeSeqStream.data.length;
          var headerInfos = new Array(nStreams);
          // now iterating through all streams and extracting their header information
          for (var i = 0; i < nStreams; ++i) {
            file.readStreamHeader(header);
            var streamHeaderInfo = {
              name: header.name,
              // stream name
              nElems: header.nElement,
              // number of elements
              type: typeSeqStream.data[i],
              // stream type
              size: 0  // stream size in bytes
            };
            switch (streamHeaderInfo.type) {
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_uint8:
              streamHeaderInfo.size = streamHeaderInfo.nElems;
              break;
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_int32:
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_float:
              streamHeaderInfo.size = streamHeaderInfo.nElems * 4;
              break;
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_vec2f:
              streamHeaderInfo.nElems /= 2;
              streamHeaderInfo.size = streamHeaderInfo.nElems * 8;
              break;
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_vec3f:
              streamHeaderInfo.nElems /= 3;
              streamHeaderInfo.size = streamHeaderInfo.nElems * 12;
              break;
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_normVec3f:
              streamHeaderInfo.nElems /= 2;
              streamHeaderInfo.size = streamHeaderInfo.nElems * 12;
              break;
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_vec4f:
              streamHeaderInfo.nElems /= 4;
              streamHeaderInfo.size = streamHeaderInfo.nElems * 16;
              break;
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_int64:
            case CONSTANTS.TUFF_STREAM_TYPES.Stream_double:
              streamHeaderInfo.size = streamHeaderInfo.nElems * 8;
              break;
            default:
              throw new Error('unknown stream type: ' + streamHeaderInfo.type);
            }
            headerInfos[i] = streamHeaderInfo;
            if (header.compression > 0) {
              // header.size !== compressed size
              // compressed size, in bytes
              var blobSize = file.readUint64();
              var infoSize = 0;
              // compression method ID
              var ID = file.readStaticString(4);
              if (ID === CONSTANTS.STREAM_HEADER_ID) {
                // eslint-disable-next-line no-unused-vars
                var contextID = file.readUint64();
                // context ID, irrelevant in this case
                // read compression info
                infoSize = file.readUint32();
              } else {
                // we shouldn't reach this block, since we are actually not supporting TUFF streams without 'ADSK' ID
                file.seek(-4, CONSTANTS.SEEK_TYPE.RELATIVE);
                infoSize = file.readUint32();
              }
              file.seek(blobSize + infoSize, CONSTANTS.SEEK_TYPE.RELATIVE);
            } else {
              file.seek(header.size, CONSTANTS.SEEK_TYPE.RELATIVE);
            }
          }
          return headerInfos;
        }
      };
      // Load tuff file body after reading header (containing formatId, majorVersion and minorVersion).
      // @context is used to assign desired streams so that unused streams can be thrown away early
      /**
       * Decodes TUFF data after reading chunk header containing formatID, major and minor versions
       *
       * @param {LYNX.TUFF.Stream} file                       file containing the TUFF data
       * @param {LYNX.TUFF.CONSTANTS.FORMATS} formatId        format of the data stored in the stream
       * @param {Number} majorVersion                         TUFF major version
       * @param {Number} minorVersion                         TUFF minor version
       * @param {LYNX.TUFF.Context.GenericContext} context    object with the required functionality to process the streams
       * @param {JSON=} globalMeta                            global metadata
       * @param {JSON=} chunkMeta                             chunk level metadata
       * @param {object=}filter                               filter object used to retrieve specific streams
       */
      TUFF.File.prototype.load = function (file, formatId, majorVersion, minorVersion, context, globalMeta, chunkMeta, filter) {
        var STREAM_TYPES = CONSTANTS.TUFF_STREAM_TYPES;
        this.formatId = formatId;
        var header = new TUFF.StreamHeader();
        var streamIntegerItemType = {
          shortStr: 0,
          intStr: 1,
          longStr: 2
        };
        /**
         * Generic method to read an integer (short|int|long} stream
         * @param {streamIntegerItemType} in_type
         * @return {{stream: TUFF.DataStream, redundant: number}}
         */
        var readIntegerStream = function (in_type) {
          var type = in_type || streamIntegerItemType.intStr;
          file.readStreamHeader(header);
          file.seek(-header.getHeaderSize());
          var StreamType = undefined;
          var streamReadFunction = undefined;
          switch (type) {
          case streamIntegerItemType.intStr:
            StreamType = TUFF.Int32Stream;
            streamReadFunction = file.readInt32Stream;
            break;
          case streamIntegerItemType.longStr:
            StreamType = TUFF.Int64Stream;
            streamReadFunction = file.readInt64Stream;
            break;
          default:
            StreamType = TUFF.Int32Stream;
            streamReadFunction = file.readInt32Stream;
          }
          var redundantIdx = -1;
          var intStream;
          if (header.name === '*') {
            var nElem = 3 * header.nElement;
            intStream = new StreamType(nElem);
            var tmpStream = new StreamType(header.nElement);
            for (var j = 0; j < 3; j++) {
              redundantIdx = streamReadFunction(context, header, tmpStream, file);
              for (var k = 0, l = j; k < header.nElement; k++, l += 3) {
                intStream.data[l] = tmpStream.data[k];
              }
            }
            intStream.name = tmpStream.name;
          } else {
            intStream = new StreamType(header.nElement);
            redundantIdx = streamReadFunction(context, header, intStream, file);
          }
          return {
            stream: intStream,
            redundant: redundantIdx
          };
        };
        var readFloatVectorStream = function () {
          var tmpStream = null;
          return function (vectorSize) {
            file.readStreamHeader(header);
            var nElem = header.nElement;
            var vecStream;
            var error;
            file.seek(-header.getHeaderSize());
            if (header.name === '*') {
              vecStream = new TUFF.FloatStream(nElem * vectorSize);
              vecStream.setStride(vectorSize);
              if (tmpStream === null || tmpStream.getSize() < nElem) {
                tmpStream = new TUFF.FloatStream(nElem);
              }
              for (var l = 0; l < vectorSize; l++) {
                error = file.readFloatStream(context, header, tmpStream, majorVersion, minorVersion);
                if (error !== 'TUFFError_None') {
                  throw error;
                }
                for (var k = 0; k < tmpStream.getSize(); k++) {
                  vecStream.data[vectorSize * k + l] = tmpStream.data[k];
                }
              }
              vecStream.name = tmpStream.name;
            } else {
              vecStream = new TUFF.FloatStream(nElem);
              error = file.readFloatStream(context, header, vecStream, majorVersion, minorVersion);
              if (error !== 'TUFFError_None') {
                throw error;
              }
            }
            return vecStream;
          };
        }();
        var readStreams = function (in_streamTypes, in_streamOffsets) {
          var STREAM_TYPE_NAMES = CONSTANTS.TUFF_STREAM_TYPE_NAMES;
          var hasOffsets = in_streamOffsets !== undefined && in_streamOffsets.length === in_streamTypes.length;
          for (var i = 0; i < in_streamTypes.length; ++i) {
            if (hasOffsets) {
              file.seek(in_streamOffsets[i], CONSTANTS.SEEK_TYPE.ABSOLUTE);
            }
            var vecStream;
            switch (in_streamTypes[i]) {
            case STREAM_TYPES.Stream_uint8:
              file.readStreamHeader(header);
              var uint8Stream = new TUFF.Uint8Stream(header.size);
              file.readStream(context, uint8Stream.data, header);
              uint8Stream.name = header.name;
              context.setStreams(STREAM_TYPE_NAMES.int8Streams, uint8Stream);
              break;
            case STREAM_TYPES.Stream_int32:
              var result = readIntegerStream(streamIntegerItemType.intStr);
              context.setStreams(STREAM_TYPE_NAMES.int32Streams, result.stream, result.redundant);
              break;
            case STREAM_TYPES.Stream_int64:
              var result = readIntegerStream(streamIntegerItemType.longStr);
              context.setStreams(STREAM_TYPE_NAMES.int64Streams, result.stream, result.redundant);
              break;
            case STREAM_TYPES.Stream_vec4f:
              vecStream = readFloatVectorStream(4);
              context.setStreams(STREAM_TYPE_NAMES.vector4Streams, vecStream);
              break;
            case STREAM_TYPES.Stream_vec3f:
              vecStream = readFloatVectorStream(3);
              context.setStreams(STREAM_TYPE_NAMES.vector3Streams, vecStream);
              break;
            case STREAM_TYPES.Stream_normVec3f:
              vecStream = readFloatVectorStream(2);
              var vec3Stream = new TUFF.FloatStream(vecStream.getSize() / 2 * 3);
              TUFF.vector2fToUnitVector3fHQ(vecStream, vec3Stream);
              vec3Stream.name = vecStream.name;
              vec3Stream.setStride(3);
              context.setStreams(STREAM_TYPE_NAMES.normVector3Streams, vec3Stream);
              break;
            case STREAM_TYPES.Stream_vec2f:
              vecStream = readFloatVectorStream(2);
              context.setStreams(STREAM_TYPE_NAMES.vector2Streams, vecStream);
              break;
            case STREAM_TYPES.Stream_float:
              file.readStreamHeader(header);
              file.seek(-header.getHeaderSize());
              var nElem = header.nElement;
              var fltStream = new TUFF.FloatStream(nElem);
              var error = file.readFloatStream(context, header, fltStream, majorVersion, minorVersion);
              if (error !== 'TUFFError_None') {
                throw error;
              }
              context.setStreams(STREAM_TYPE_NAMES.floatStreams, fltStream);
              fltStream.clear();
              break;
            case STREAM_TYPES.Stream_double:
              file.readStreamHeader(header);
              file.seek(-header.getHeaderSize());
              var nElem = header.nElement;
              var dblStream = new TUFF.DoubleStream(nElem);
              var error = file.readDoubleStream(context, header, dblStream, majorVersion, minorVersion);
              if (error !== 'TUFFError_None') {
                throw error;
              }
              context.setStreams(STREAM_TYPE_NAMES.doubleStreams, dblStream);
              dblStream.clear();
              break;
            default:  // Do nothing
            }
          }
        };
        var i;
        var streamOffsets = [];
        var typeSeqArray = [];
        if (filter !== undefined) {
          for (i = 0; i < filter.length; ++i) {
            typeSeqArray.push(filter[i].type);
            streamOffsets.push(filter[i].offset);
          }
        } else {
          //  reading the first stream, is it a type sequence stream ?
          file.readStreamHeader(header);
          var strName = header.name;
          if (strName === CONSTANTS.STREAM_TYPE_SEQUENCE_NAME) {
            // data stream types are stored in this stream
            var typeSeqStream = new TUFF.Uint8Stream(header.size);
            file.readStream(context, typeSeqStream.data, header);
            typeSeqStream.name = header.name;
            var length = typeSeqStream.getSize();
            typeSeqArray.length = length;
            // TODO: replace with the fast version of the TUFF.copyData function
            for (i = 0; i < length; ++i) {
              typeSeqArray[i] = typeSeqStream.data[i];
            }
          } else {
            throw new Error('No type sequence stream present. ' + 'TUFF file/chunk with version (' + majorVersion + '.' + minorVersion + ')');
          }
        }
        readStreams(typeSeqArray, streamOffsets);
        context.restoreStreams(globalMeta, chunkMeta, majorVersion, minorVersion);
      };
      TUFF.DataStream = function () {
        this.data = [];
        this.name = '';
        this.currentPos = 0;
        this.capacity = 0;
        this.stride = 1;
        this.streamTypeIndex = {
          TUFFStream_int8: 0,
          TUFFStream_uint8: 1,
          TUFFStream_int16: 2,
          TUFFStream_uint16: 3,
          TUFFStream_Int24: 4,
          TUFFStream_UInt24: 5,
          TUFFStream_int32: 6,
          TUFFStream_float: 7,
          TUFFStream_FPFloat: 8,
          TUFFStream_uint32: 9,
          TUFFStream_Int40: 10,
          TUFFStream_UInt40: 11,
          TUFFStream_Int48: 12,
          TUFFStream_UInt48: 13,
          TUFFStream_Int56: 14,
          TUFFStream_UInt56: 15,
          TUFFStream_int64: 16,
          TUFFStream_double: 17,
          TUFFStream_FPDouble: 18
        };
        this.streamElemSize = [
          1,
          1,
          2,
          2,
          3,
          3,
          4,
          4,
          3,
          4,
          5,
          5,
          6,
          6,
          7,
          7,
          8,
          8,
          7
        ];
      };
      TUFF.DataStream.prototype.clear = function () {
        this.data.length = 0;
      };
      TUFF.DataStream.prototype.getStride = function () {
        return this.stride;
      };
      TUFF.DataStream.prototype.setStride = function (v) {
        this.stride = v;
      };
      TUFF.DataStream.prototype.push = function (v) {
        this.data[this.currentPos++] = v;
      };
      TUFF.DataStream.prototype.pop = function () {
        return this.data[--this.currentPos];
      };
      TUFF.DataStream.prototype.get = function (i) {
        return this.data[i];
      };
      TUFF.DataStream.prototype.setCapacity = function (s) {
        this.data.length = s;
      };
      TUFF.DataStream.prototype.setSize = function (s) {
        this.data.length = s;
      };
      TUFF.DataStream.prototype.getSize = function () {
        return this.data.length;
      };
      TUFF.Int32Stream = function (size) {
        if (size < 0) {
          throw new Error('invalid stream size');
        }
        this.stride = 1;
        this.data = new Int32Array(size);
      };
      TUFF.Int32Stream.prototype = new TUFF.DataStream();
      TUFF.Int64Stream = function (size) {
        if (size < 0) {
          throw new Error('invalid stream size');
        }
        this.stride = 2;
        this.data = new Int32Array(size * this.stride);
      };
      TUFF.Int64Stream.prototype = new TUFF.DataStream();
      TUFF.Int64Stream.prototype.push = function (v) {
        this.data[this.currentPos++] = v.low;
        this.data[this.currentPos++] = v.high;
      };
      TUFF.Int64Stream.prototype.pop = function () {
        var _res = {
          low: 0,
          high: 0
        };
        _res.high = this.data[--this.currentPos];
        _res.low = this.data[--this.currentPos];
        return _res;
      };
      TUFF.Int64Stream.prototype.get = function (i) {
        var _res = {
          low: 0,
          high: 0
        };
        _res.low = this.data[2 * i];
        _res.high = this.data[2 * i + 1];
        return _res;
      };
      TUFF.Int64Stream.prototype.setCapacity = function (s) {
        this.data.length = s * this.stride;
      };
      TUFF.Int64Stream.prototype.setSize = function (s) {
        this.data.length = s * this.stride;
      };
      TUFF.Int64Stream.prototype.getSize = function () {
        return this.data.length / this.stride;
      };
      TUFF.Int8Stream = function (size) {
        if (size < 0) {
          throw new Error('invalid stream size');
        }
        this.stride = 1;
        this.data = new Int8Array(size);
      };
      TUFF.Int8Stream.prototype = new TUFF.DataStream();
      TUFF.Uint8Stream = function (size) {
        if (size < 0) {
          throw new Error('invalid stream size');
        }
        this.stride = 1;
        this.data = new Uint8Array(size);
      };
      TUFF.Uint8Stream.prototype = new TUFF.DataStream();
      TUFF.FloatStream = function (size) {
        if (size < 0) {
          throw new Error('invalid stream size');
        }
        this.stride = 1;
        this.data = new Float32Array(size);
      };
      TUFF.FloatStream.prototype = new TUFF.DataStream();
      TUFF.DoubleStream = function (size) {
        if (size < 0) {
          throw new Error('invalid stream size');
        }
        this.stride = 1;
        this.data = new Float64Array(size);
      };
      TUFF.DoubleStream.prototype = new TUFF.DataStream();
      TUFF.StreamHeader = function (stream) {
        this.type = 0;
        this.size = 0;
        this.nElement = 0;
        this.name = '';
        this.interleave = 0;
        this.compression = 0;
        this.infoSize = 0;
        this.info = [];
      };
      // get size in bytes on disk
      TUFF.StreamHeader.prototype.getHeaderSize = function () {
        // string + stringlength + type + size + interleave + compression + elements + infoSize + info
        return this.name.length + 4 + 4 + 8 + 4 + 4 + 8 + 4 + this.infoSize;
      };
      // stride = 3, {123123123} -> {111222333}
      TUFF.deInterleaveFloatStream = function () {
        var tmpT = null;
        return function (stream, stride) {
          if (tmpT === null || tmpT.length < stream.getSize()) {
            tmpT = new stream.data.constructor(stream.getSize());
          }
          var offset = stream.getSize() / stride;
          var it = 0;
          var dataStride = stream.getStride();
          for (var i = 0; i < stride; i++) {
            for (var j = 0; j < offset; j++) {
              for (var k = 0; k < dataStride; k++) {
                tmpT[it++] = stream.data[j * stride * dataStride + i * dataStride + k];
              }
            }
          }
          if (tmpT.length > stream.data.length) {
            for (var i = 0; i < stream.data.length; ++i) {
              stream.data[i] = tmpT[i];
            }
          } else {
            stream.data.set(tmpT);
          }
        };
      }();
      TUFF.deInterleaveDoubleStream = function () {
        var tmpT = null;
        return function (stream, stride) {
          if (tmpT === null || tmpT.length < stream.getSize()) {
            tmpT = new stream.data.constructor(stream.getSize());
          }
          var offset = stream.getSize() / stride;
          var it = 0;
          var dataStride = stream.getStride();
          for (var i = 0; i < stride; i++) {
            for (var j = 0; j < offset; j++) {
              for (var k = 0; k < dataStride; k++) {
                tmpT[it++] = stream.data[j * stride * dataStride + i * dataStride + k];
              }
            }
          }
          if (tmpT.length > stream.data.length) {
            for (var i = 0; i < stream.data.length; ++i) {
              stream.data[i] = tmpT[i];
            }
          } else {
            stream.data.set(tmpT);
          }
        };
      }();
      TUFF.deInterleaveIntStream = function () {
        var tmpT = null;
        return function (stream, stride) {
          if (tmpT === null || tmpT.length < stream.getSize()) {
            tmpT = new stream.data.constructor(stream.getSize());
          }
          var offset = stream.getSize() / stride;
          var it = 0;
          var dataStride = stream.getStride();
          for (var i = 0; i < stride; i++) {
            for (var j = 0; j < offset; j++) {
              for (var k = 0; k < dataStride; k++) {
                tmpT[it++] = stream.data[j * stride * dataStride + i * dataStride + k];
              }
            }
          }
          if (tmpT.length > stream.data.length) {
            for (var i = 0; i < stream.data.length; ++i) {
              stream.data[i] = tmpT[i];
            }
          } else {
            stream.data.set(tmpT);
          }
        };
      }();
      // stride = 3, {111222333} -> {123123123}
      TUFF.interleaveFloatStream = function () {
        var tmpT = null;
        return function (stream, stride) {
          if (tmpT === null || tmpT.length < stream.getSize()) {
            tmpT = new stream.data.constructor(stream.getSize());
          }
          var dataStride = stream.getStride();
          var offset = stream.getSize() / stride;
          var it = 0;
          for (var i = 0; i < offset; i++) {
            for (var j = 0; j < stride; j++) {
              for (var k = 0; k < dataStride; k++) {
                tmpT[it++] = stream.data[i * dataStride + j * offset * dataStride + k];
              }
            }
          }
          if (tmpT.length > stream.data.length) {
            for (var i = 0; i < stream.data.length; ++i) {
              stream.data[i] = tmpT[i];
            }
          } else {
            stream.data.set(tmpT);
          }
        };
      }();
      TUFF.interleaveDoubleStream = function () {
        var tmpT = null;
        return function (stream, stride) {
          if (tmpT === null || tmpT.length < stream.getSize()) {
            tmpT = new stream.data.constructor(stream.getSize());
          }
          var dataStride = stream.getStride();
          var offset = stream.getSize() / stride;
          var it = 0;
          for (var i = 0; i < offset; i++) {
            for (var j = 0; j < stride; j++) {
              for (var k = 0; k < dataStride; k++) {
                tmpT[it++] = stream.data[i * dataStride + j * offset * dataStride + k];
              }
            }
          }
          if (tmpT.length > stream.data.length) {
            for (var i = 0; i < stream.data.length; ++i) {
              stream.data[i] = tmpT[i];
            }
          } else {
            stream.data.set(tmpT);
          }
        };
      }();
      TUFF.interleaveIntStream = function () {
        var tmpT = null;
        return function (stream, stride) {
          if (tmpT === null || tmpT.length < stream.getSize()) {
            tmpT = new stream.data.constructor(stream.getSize());
          }
          var dataStride = stream.getStride();
          var offset = stream.getSize() / stride;
          var it = 0;
          for (var i = 0; i < offset; i++) {
            for (var j = 0; j < stride; j++) {
              for (var k = 0; k < dataStride; k++) {
                tmpT[it++] = stream.data[i * dataStride + j * offset * dataStride + k];
              }
            }
          }
          if (tmpT.length > stream.data.length) {
            for (var i = 0; i < stream.data.length; ++i) {
              stream.data[i] = tmpT[i];
            }
          } else {
            stream.data.set(tmpT);
          }
        };
      }();
      TUFF.isLittleEndian = function () {
        var buffer = new ArrayBuffer(2);
        var bytes = new Uint8Array(buffer);
        var ints = new Uint16Array(buffer);
        bytes[0] = 1;
        return ints[0] === 1;
      }();
      TUFF.InterleavedStream = function (data, count) {
        this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        this.offset = 0;
        // TUFF.isLittleEndian? 3: 0;
        this.elementSize = 1;
        this.count = count * this.elementSize;
        this.len = this.data.len;
      };
      TUFF.InterleavedStream.prototype.writeByte = function (value) {
        this.data[this.offset] = value;
        this.offset += this.count;
      };
      /**
       *
       * @param data
       * @constructor
       * @alias Lynx.TUFF.Stream
       */
      TUFF.Stream = function (data, offset) {
        if (data instanceof Uint8Array) {
          this.uint8Data = data;
          this.offset = offset || 0;
          this.data = this.uint8Data.buffer;
        } else {
          // ArrayBuffer == fallback
          this.data = data;
          this.offset = offset || 0;
          this.uint8Data = new Uint8Array(data, offset);
        }
        // temporary buffers to store transient data
        this.headerBuffer = new Uint8Array(1);
        this.dataBuffer = new Uint8Array(1);
      };
      TUFF.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);
      TUFF.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);
      TUFF.Stream.prototype.readByte = function () {
        return this.uint8Data[this.offset++];
      };
      TUFF.Stream.prototype.readUint32 = function () {
        var res = this.uint8Data[this.offset++];
        for (var i = 1; i < 4; ++i) {
          res |= this.uint8Data[this.offset++] << 8 * i;
        }
        return res;
      };
      TUFF.Stream.prototype.readFloat32 = function () {
        var m = this.uint8Data[this.offset++];
        m += this.uint8Data[this.offset++] << 8;
        var b1 = this.uint8Data[this.offset++];
        var b2 = this.uint8Data[this.offset++];
        m += (b1 & 127) << 16;
        var e = (b2 & 127) << 1 | (b1 & 128) >>> 7;
        var s = b2 & 128 ? -1 : 1;
        if (e === 255) {
          return m !== 0 ? NaN : s * Infinity;
        }
        if (e > 0) {
          return s * (1 + m * this.TWO_POW_MINUS23) * Math.pow(2, e - 127);
        }
        if (m !== 0) {
          return s * m * this.TWO_POW_MINUS126;
        }
        return s * 0;
      };
      TUFF.Stream.prototype.readBytes = function (len) {
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; ++i) {
          bytes[i] = this.uint8Data[this.offset++];
        }
        return bytes;
      };
      // global variable used as a temporary buffer to parse strings
      var streamNameBuffer = new Uint8Array(1);
      TUFF.Stream.prototype.readString = function () {
        var len = this.readUint32();
        if (len !== streamNameBuffer.length) {
          streamNameBuffer = new Uint8Array(len);
        }
        for (var i = 0; i < len; ++i) {
          streamNameBuffer[i] = this.uint8Data[this.offset++];
        }
        var str = String.fromCharCode.apply(null, streamNameBuffer);
        return str;
      };
      TUFF.Stream.prototype.readStaticString = function (len) {
        if (len !== streamNameBuffer.length) {
          streamNameBuffer = new Uint8Array(len);
        }
        for (var i = 0; i < len; ++i) {
          streamNameBuffer[i] = this.uint8Data[this.offset++];
        }
        var str = String.fromCharCode.apply(null, streamNameBuffer);
        return str;
      };
      /**
       *
       * @param {number} in_offset offset to seek to
       * @param {LYNX.TUFF.CONSTANTS.SEEK_TYPE} [in_type] how to seek (relative or absolute offset)
       */
      TUFF.Stream.prototype.seek = function (in_offset, in_type) {
        if (in_type === CONSTANTS.SEEK_TYPE.ABSOLUTE) {
          this.offset = in_offset;
        } else {
          // assuming relative seek type
          this.offset += in_offset;
        }
      };
      /**
       * Read uint64 value
       * WARNING: only correct if the read values do not use more than the lower 53 bits,
       * because that's the maximum amount of integer bits a "double" floating point
       * number can represent.
       * @return {number} read value
       */
      TUFF.Stream.prototype.readUint64 = function () {
        var i = this.uint8Data[this.offset++];
        i |= this.uint8Data[this.offset++] << 8;
        i |= this.uint8Data[this.offset++] << 16;
        i |= this.uint8Data[this.offset++] << 24;
        i += this.uint8Data[this.offset++] * 4294967296;
        // binary operators only work on 32 bit values
        i += this.uint8Data[this.offset++] * 1099511627776;
        i += this.uint8Data[this.offset++] * 281474976710656;
        this.offset++;
        // unused because these bits could not be represented correctly anyway
        return i;
      };
      TUFF.Stream.prototype.readArrayInt32 = function (array) {
        var i = 0;
        var len = array.length;
        while (i < len) {
          array[i++] = this.readUint32();
        }
        return array;
      };
      TUFF.Stream.prototype.readArrayInt8 = function (array, len) {
        var i = 0;
        while (i < len) {
          array[i++] = this.uint8Data[this.offset++];
        }
      };
      TUFF.Stream.prototype.readArrayFloat32 = function (array) {
        var i = 0;
        var len = array.length;
        while (i < len) {
          array[i++] = this.readFloat32();
        }
        return array;
      };
      /**
       * Reads a float stream from the TUFF data stream
       * @param {LYNX.TUFF.Context.GenericContext} context context to process the data
       * @param {LYNX.TUFF.DataStream} stream stream to be fulled with data
       * @param {Number} majorVersion TUFF major version
       * @param {Number} minorVersion TUFF minor version
       * @return {string} error code
       */
      TUFF.Stream.prototype.readFloatStream = function (context, header, stream, majorVersion, minorVersion) {
        this.readStreamHeader(header);
        if (this.dataBuffer.length < header.size) {
          this.dataBuffer = new Uint8Array(header.size);
        }
        this.readStream(context, this.dataBuffer, header);
        stream.name = header.name;
        if (header.type === stream.streamTypeIndex.TUFFStream_float) {
          // direct copy from the buffer to the stream
          var data = new DataView(this.dataBuffer.buffer);
          for (var i = 0; i < header.nElement; ++i) {
            stream.data[i] = data.getFloat32(i * 4, true);
          }
        } else if (header.type === stream.streamTypeIndex.TUFFStream_FPFloat) {
          // we have to transform the data in the stream
          var elemSize = 3;
          // 24 bits == 3 bytes is the default size of fp-float
          if (this.headerBuffer.length < header.infoSize) {
            this.headerBuffer = new Uint8Array(header.infoSize);
          }
          this.headerBuffer.set(header.info);
          var propView = new DataView(this.headerBuffer.buffer);
          var mean = propView.getFloat64(0, true);
          var range = propView.getFloat64(8, true);
          if (minorVersion >= 1) {
            var bitSize = propView.getInt32(16, true);
            elemSize = bitSize / 8;
          }
          var nElem = header.size / elemSize;
          for (var i = 0; i < nElem; i++) {
            stream.data[i] = TUFF.convertFPFloatToFloat(this.dataBuffer, i * elemSize, elemSize) * range + mean;
          }
        }
        if (header.interleave < 0) {
          TUFF.interleaveFloatStream(stream, -header.interleave);
        } else if (header.interleave > 0) {
          TUFF.deInterleaveFloatStream(stream, header.interleave);
        }
        return 'TUFFError_None';
      };
      /**
       * Reads a double stream from the TUFF data stream
       * @param {LYNX.TUFF.Context.GenericContext} context context to process the data
       * @param {LYNX.TUFF.DataStream} stream stream to be fulled with data
       * @param {Number} majorVersion                         TUFF major version
       * @param {Number} minorVersion                         TUFF minor version
       * @return {string} error code
       */
      TUFF.Stream.prototype.readDoubleStream = function (context, header, stream, majorVersion, minorVersion) {
        this.readStreamHeader(header);
        if (this.dataBuffer.length < header.size) {
          this.dataBuffer = new Uint8Array(header.size);
        }
        this.readStream(context, this.dataBuffer, header);
        stream.name = header.name;
        if (header.type === stream.streamTypeIndex.TUFFStream_double) {
          // we can simply map the content of the stream to a typed array
          var data = new DataView(this.dataBuffer.buffer);
          for (var i = 0; i < header.nElement; ++i) {
            stream.data[i] = data.getFloat64(i * 8, true);
          }
        } else if (header.type === stream.streamTypeIndex.TUFFStream_FPDouble) {
          // we have to transform the data in the stream
          var elemSize = 6;
          // 48 bits == 6 bytes is the default size of fp-double
          if (this.headerBuffer.length < header.infoSize) {
            this.headerBuffer = new Uint8Array(header.infoSize);
          }
          this.headerBuffer.set(header.info);
          var propView = new DataView(this.headerBuffer.buffer);
          var mean = propView.getFloat64(0, true);
          var range = propView.getFloat64(8, true);
          if (minorVersion >= 1) {
            var bitSize = propView.getInt32(16, true);
            elemSize = bitSize / 8;
          }
          var nElem = header.size / elemSize;
          for (var i = 0; i < nElem; ++i) {
            stream.data[i] = TUFF.convertFPDoubleToDouble(this.dataBuffer, i * elemSize, elemSize) * range + mean;
          }
        }
        if (header.interleave < 0) {
          TUFF.interleaveDoubleStream(stream, -header.interleave);
        } else if (header.interleave > 0) {
          TUFF.deInterleaveDoubleStream(stream, header.interleave);
        }
        return 'TUFFError_None';
      };
      /**
       * Reads a 64-bit integer stream from the TUFF data stream
       * Since JS offers no support for 64-bit integers, we have to manually store each one of them.
       * This has a negative impact on the method's performance
       * @param {LYNX.TUFF.Context.GenericContext} context context to process the data
       * @param {LYNX.TUFF.DataStream} stream stream to be fulled with data
       * @param {LYNX.TUFF.Stream} file container
       * @return {number} reference stream index if redundant, -1 otherwise
       */
      TUFF.Stream.prototype.readInt64Stream = function (context, header, stream, file) {
        // eslint-disable-line
        file.readStreamHeader(header);
        if (file.dataBuffer.length < header.size) {
          file.dataBuffer = new Uint8Array(header.size);
        }
        file.readStream(context, file.dataBuffer, header);
        stream.name = header.name;
        var redundant = -1;
        if (header.infoSize === 4) {
          redundant = (header.info[0] | header.info[1] << 8 | header.info[2] << 16 | header.info[3] << 24) - 1;
        }
        var nElems = Math.floor(header.size / stream.streamElemSize[header.type]);
        stream.setCapacity(nElems);
        var i, j, low, high;
        switch (header.type) {
        case stream.streamTypeIndex.TUFFStream_int8:
          for (i = 0; i < nElems; i++) {
            low = file.dataBuffer[i];
            if (low & 1 << 7) {
              low = -((~low & (1 << 8) - 1) + 1);
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_uint8:
          for (i = 0; i < nElems; i++) {
            stream.data[2 * i] = file.dataBuffer[i];
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_int16:
          for (i = 0, j = 0; i < nElems; i++, j += 2) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8);
            if (low & 1 << 15) {
              low = -((~low & (1 << 16) - 1) + 1);
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_uint16:
          for (i = 0, j = 0; i < nElems; i++, j += 2) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8);
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_Int24:
          for (i = 0, j = 0; i < nElems; i++, j += 3) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16);
            if (low & 1 << 23) {
              low = -(low & ~(1 << 23));
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_UInt24:
          for (i = 0, j = 0; i < nElems; i++, j += 3) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16);
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_int32:
          for (i = 0, j = 0; i < nElems; i++, j += 4) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            if (low & 1 << 31) {
              low = -((~low & 4294967295) + 1);
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_uint32:
          for (i = 0, j = 0; i < nElems; i++, j += 4) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = 0;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_Int40:
          for (i = 0, j = 0; i < nElems; i++, j += 5) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            high = file.dataBuffer[j + 4];
            if (high & 1 << 7) {
              high = -((~high & (1 << 8) - 1) + 1);
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = high;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_UInt40:
          for (i = 0, j = 0; i < nElems; i++, j += 5) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            high = file.dataBuffer[j + 4];
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = high;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_Int48:
          for (i = 0, j = 0; i < nElems; i++, j += 6) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            high = file.dataBuffer[j + 4] + (file.dataBuffer[j + 5] << 8);
            if (high & 1 << 15) {
              high = -((~high & (1 << 16) - 1) + 1);
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = high;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_UInt48:
          for (i = 0, j = 0; i < nElems; i++, j += 6) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            high = file.dataBuffer[j + 4] + (file.dataBuffer[j + 5] << 8);
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = high;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_Int56:
          for (i = 0, j = 0; i < nElems; i++, j += 7) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            high = file.dataBuffer[j + 4] + (file.dataBuffer[j + 5] << 8) + (file.dataBuffer[j + 6] << 16);
            if (high & 1 << 23) {
              high = -(high & ~(1 << 23));
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = high;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_UInt56:
          for (i = 0, j = 0; i < nElems; i++, j += 7) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            high = file.dataBuffer[j + 4] + (file.dataBuffer[j + 5] << 8) + (file.dataBuffer[j + 6] << 16);
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = high;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_int64:
          for (i = 0, j = 0; i < nElems; i++, j += 8) {
            low = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            high = file.dataBuffer[j + 4] + (file.dataBuffer[j + 5] << 8) + (file.dataBuffer[j + 6] << 16) + (file.dataBuffer[j + 7] << 24);
            if (high & 1 << 31) {
              high = -((~high & 4294967295) + 1);
            }
            stream.data[2 * i] = low;
            stream.data[2 * i + 1] = high;
          }
          break;
        default:
          return redundant;
        }
        if (header.interleave < 0) {
          TUFF.interleaveIntStream(stream, -header.interleave);
        } else if (header.interleave > 0) {
          TUFF.deInterleaveIntStream(stream, header.interleave);
        }
        return redundant;
      };
      /**
       * Reads a 32-bit integer stream from the TUFF data stream
       * @param {LYNX.TUFF.Context.GenericContext} context context to process the data
       * @param {LYNX.TUFF.DataStream} stream stream to be fulled with data
       * @param {LYNX.TUFF.Stream} file container
       * @return {number} reference stream index if redundant, -1 otherwise
       */
      TUFF.Stream.prototype.readInt32Stream = function (context, header, stream, file) {
        file.readStreamHeader(header);
        if (file.dataBuffer.length < header.size) {
          file.dataBuffer = new Uint8Array(header.size);
        }
        file.readStream(context, file.dataBuffer, header);
        stream.name = header.name;
        var redundant = -1;
        if (header.infoSize === 4) {
          redundant = (header.info[0] | header.info[1] << 8 | header.info[2] << 16 | header.info[3] << 24) - 1;
        }
        var nElem = Math.floor(header.size / stream.streamElemSize[header.type]);
        stream.setCapacity(nElem);
        var i, j, d;
        switch (header.type) {
        case stream.streamTypeIndex.TUFFStream_int8:
          for (i = 0; i < nElem; i++) {
            d = file.dataBuffer[i];
            if (d & 1 << 7) {
              d = -((~d & (1 << 8) - 1) + 1);
            }
            stream.data[i] = d;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_uint8:
          for (i = 0; i < nElem; i++) {
            stream.data[i] = file.dataBuffer[i];
          }
          break;
        case stream.streamTypeIndex.TUFFStream_int16:
          for (i = 0, j = 0; i < nElem; i++, j += 2) {
            d = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8);
            if (d & 1 << 15) {
              d = -((~d & (1 << 16) - 1) + 1);
            }
            stream.data[i] = d;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_uint16:
          for (i = 0, j = 0; i < nElem; i++, j += 2) {
            stream.data[i] = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8);
          }
          break;
        case stream.streamTypeIndex.TUFFStream_Int24:
          for (i = 0, j = 0; i < nElem; i++, j += 3) {
            d = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16);
            if (d & 1 << 23) {
              d = -(d & ~(1 << 23));
            }
            stream.data[i] = d;
          }
          break;
        case stream.streamTypeIndex.TUFFStream_UInt24:
          for (i = 0, j = 0; i < nElem; i++, j += 3) {
            stream.data[i] = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16);
          }
          break;
        case stream.streamTypeIndex.TUFFStream_int32:
          for (i = 0, j = 0; i < nElem; i++, j += 4) {
            d = file.dataBuffer[j] + (file.dataBuffer[j + 1] << 8) + (file.dataBuffer[j + 2] << 16) + (file.dataBuffer[j + 3] << 24);
            if (d & 1 << 31) {
              d = -((~d & 4294967295) + 1);
            }
            stream.data[i] = d;
          }
          break;
        default:
          return redundant;
        }
        if (header.interleave < 0) {
          TUFF.interleaveIntStream(stream, -header.interleave);
        } else if (header.interleave > 0) {
          TUFF.deInterleaveIntStream(stream, header.interleave);
        }
        return redundant;
      };
      TUFF.Stream.prototype.readStreamHeader = function (header) {
        header.type = this.readUint32();
        header.size = this.readUint64();
        header.nElement = this.readUint64();
        header.name = this.readString();
        header.interleave = this.readUint32();
        header.compression = this.readUint32();
        header.infoSize = this.readUint32();
        header.info = this.readBytes(header.infoSize);
      };
      TUFF.Stream.prototype.readStream = function (context, data, header) {
        if (header.size === 0) {
          return;
        }
        if (header.compression > 0) {
          this.readCompressedStream(context, data, header.size);
        } else {
          this.readArrayInt8(data, header.size);
        }
      };
      TUFF.Stream.prototype.readCompressedStream = function (context, data, length) {
        this.readUint64();
        var contextID;
        var outPropSize;
        var buffer = new Uint8Array(4);
        for (var i = 0; i < 4; ++i) {
          buffer[i] = this.uint8Data[this.offset++];
        }
        var str = String.fromCharCode.apply(null, buffer);
        if (str === CONSTANTS.STREAM_HEADER_ID) {
          contextID = this.readUint64();
          if (contextID !== context.getID()) {
            // ERROR !!!!!
            console.log('ERROR !! provided context cannot decompress data');
            return;
          }
          // read compression info
          outPropSize = this.readUint32();
        } else {
          // convert to compression info
          outPropSize = buffer[0];
          for (var i = 1; i < 4; ++i) {
            outPropSize |= buffer[i] << 8 * i;
          }
        }
        if (outPropSize !== 0) {
          context.decompressStream(this, data, length);
        } else {
          this.readArrayInt8(data, length);
        }
      };
      exportModule('LYNX.TUFF.Stream', TUFF.Stream);
      exportModule('LYNX.TUFF.StreamHeader', TUFF.StreamHeader);
      exportModule('LYNX.TUFF.DataStream', TUFF.DataStream);
      exportModule('LYNX.TUFF.InterleavedStream', TUFF.InterleavedStream);
      exportModule('LYNX.TUFF.File', TUFF.File);
      exportModule('LYNX.TUFF.Int32Stream', TUFF.Int32Stream);
      exportModule('LYNX.TUFF.Int8Stream', TUFF.Int8Stream);
      exportModule('LYNX.TUFF.Uint8Stream', TUFF.Uint8Stream);
      exportModule('LYNX.TUFF.FloatStream', TUFF.FloatStream);
      exportModule('LYNX.TUFF.restoreIndicesStream', TUFF.restoreIndicesStream);
      exportModule('LYNX.TUFF.restoreIndices', TUFF.restoreIndices);
      exportModule('LYNX.TUFF.restoreIndices2', TUFF.restoreIndices2);
    }());
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      var webWorkerService = function () {
        // The default worker constructor.  Forwards to the native browser Worker
        // constructor.
        var DEFAULT_BROWSER_WORKER = function (in_script, in_callback) {
          in_callback(new Worker(in_script));
        };
        /**
         * Class managing the construction of workers.  Allows for specialization of
         * worker construction.
         *
         * @constructor
         * @alias LYNX.TUFF.webWorkerService
         */
        var WorkerService = function () {
          // Assume the default factory is the browser.
          this._service = DEFAULT_BROWSER_WORKER;
        };
        /**
         * @param {String} in_script Url of worker script.
         * @param {function} in_callback Function receiving the Worker instance.
         */
        WorkerService.prototype.getWorker = function (in_script, in_callback) {
          this._service(in_script, in_callback);
        };
        /**
         * Synchronous version of getWorker.
         * Note that this routine should be considered deprecated, as it is only available
         * in specific circumstances. All callers should consider using the async
         * version, getWorker.
         * @param {String} in_script Url of worker script.
         * @return {Worker} worker object with the passed functionality
         */
        WorkerService.prototype.getWorkerSync = function (in_script) {
          var worker;
          if (this.isSyncAvailable()) {
            this.getWorker(in_script, function (in_worker) {
              worker = in_worker;
            });
          } else {
            throw new Error('Sync worker construction not supported.');
          }
          return worker;
        };
        /**
         * Helper routine to query if sync worker construction is currently supported.
         * @return {Boolean}  true iff sync worker construction is supported
         */
        WorkerService.prototype.isSyncAvailable = function () {
          return this._service === DEFAULT_BROWSER_WORKER;
        };
        /**
         * Routine used to override the factory used to build workers.
         * @param {function(String, function)} in_workerFactory new routine
         */
        WorkerService.prototype.installWorkerFactory = function (in_workerFactory) {
          this._service = in_workerFactory;
        };
        return new WorkerService();
      }();
      exportModule('LYNX.TUFF.webWorkerService', webWorkerService);
    }());
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      var webWorkerService = include('LYNX.TUFF.webWorkerService');
      var tuffLoaderWorkerPool = function () {
        var workerPoolInitialized = false;
        /**
         * Class that encapsulates a worker-pool of WebWorkers.
         *
         * @constructor
         */
        var WorkerPool = function () {
          // Specify the size of the pool.
          this._maximumConcurrentWorkers = undefined;
          // Array of WebWorker instances.
          this._workers = [];
          // The index pointer used to schedule tasks to allocated workers.
          this._index = 0;
          // Counter used for generation of unique request ids for tasks.
          this._requestCount = 0;
          // Map from request ids to { onmessage : function (event) } instances.
          this._requestHandlers = {};
        };
        /**
         * Initialize the set of workers for use.
         * @param {String} in_pathToWorker  path to the file containing the worker functionality
         * @param {Number=} in_numWorkers   number of worker threads to be generated
         */
        WorkerPool.prototype.init = function (in_pathToWorker, in_numWorkers) {
          if (workerPoolInitialized) {
            return;
          }
          if (in_numWorkers !== undefined && !isNaN(parseInt(in_numWorkers, 10))) {
            this._maximumConcurrentWorkers = in_numWorkers;
          } else {
            this._maximumConcurrentWorkers = 8;
          }
          var that = this;
          var worker;
          for (var x = 0; x < this._maximumConcurrentWorkers; ++x) {
            // The sync version is used here because the tuff loader is only used in a
            // browser environment, where sync support must be present.
            worker = webWorkerService.getWorkerSync(in_pathToWorker);
            worker.postMessage = worker.webkitPostMessage || worker.postMessage;
            worker.onmessage = function (event) {
              var requestId = event.data.requestId;
              if (requestId === undefined) {
                console.error('WorkerPool received message without requestId.');
                return;
              }
              that._requestHandlers[requestId].onmessage(event.data);
              // The worker contract is that the finalExit message is the last
              // signal to a worker package - we can remove the reference
              // for the worker package now.
              if (event.data.data.msg === 'finalExit') {
                delete that._requestHandlers[event.data.requestId];
              }
            };
            worker.onerror = function (error) {
              console.error('Unrecoverable error in TUFF worker. ' + error.stack);
            };
            this._workers.push(worker);
          }
          workerPoolInitialized = true;
        };
        /**
         * Schedule a task for execution by the pool.
         * @param {Object} in_package Object with onmessage member function.
         * @param {Object} in_message Initial message to send to the worker.
         * @param {Array} in_transferable Array of objects to pass by reference to the
         *   worker.
         */
        WorkerPool.prototype.launchTask = function (in_package, in_message, in_transferable) {
          // Select a pre-allocated worker to service this task.
          var workerIndex = this._index;
          this._index = (this._index + 1) % this._maximumConcurrentWorkers;
          // Assign a mailbox id for this task.
          in_message.requestId = this._requestCount;
          ++this._requestCount;
          this._requestHandlers[in_message.requestId] = in_package;
          this._workers[workerIndex].postMessage(in_message, in_transferable);
        };
        return new WorkerPool();
      }();
      exportModule('LYNX.TUFF.tuffLoaderWorkerPool', tuffLoaderWorkerPool);
    }());
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      var restoreIndicesStream = include('LYNX.TUFF.restoreIndicesStream');
      var LZMA = include('LYNX.TUFF.LZMA');
      /**
       * Parent class of all processing context. Domain-specific contexts must inherit from this class
       * and redefine the 'restoreStreams' and 'decompressStream' methods, depending on the functionality
       * the new processing context provides
       * @param {Object} scope    object that contains the streams extracted from the TUFF file/blob
       * @constructor
       */
      var GenericContext = function (scope) {
        this.scope = scope;
        this._ID = GenericContext.contextID;
      };
      /**
       * Returns the ID of the processing context, as set during registration
       * @return {number} the processing context ID
       */
      GenericContext.prototype.getID = function () {
        return this._ID;
      };
      /**
       * Static function, creates a new context with the given empty container
       * @param {Objec} in_scope    container for the processed streams
       * @return {LYNX.TUFF.Context.GenericContext} the processing context
       */
      GenericContext.createContext = function (in_scope) {
        return new GenericContext(in_scope);
      };
      /**
       * Store the already processed stream in the container
       * @param {CONSTANTS.TUFF_STREAM_TYPE_NAMES} type   stream type
       * @param {TUFF.DataStream} stream                  processed stream
       * @param {number=} redundant                       index of the reference parameter.
       *                                                  stream not redundant if the parameter is not set
       */
      GenericContext.prototype.setStreams = function (type, stream, redundant) {
        this.scope[type].push({
          stream: stream,
          redundant: redundant !== undefined ? redundant : -1
        });
      };
      /**
       * Decompress a stream with LZMA compresion algorithm.
       * Contexts that support a different compression technique must inherit
       * from 'GenericContext' and redefine this method
       * @param {TUFF.Stream} file        file/blob containing the binary data
       * @param {Uint8Array} buffer       container to store the decompressed data
       * @param {number} length           lenght of the compressed stream
       */
      GenericContext.prototype.decompressStream = function (file, buffer, length) {
        // TODO: Move this include declaration to the begining of the file !!!
        var InterleavedStream = include('LYNX.TUFF.InterleavedStream');
        LZMA.decompress(file, file, new InterleavedStream(buffer, 1), length);
      };
      /**
       * Restores any high level optimization performed in the streams during encoding
       * @param {Object=} globalMeta    JSON blob with the global metadata
       * @param {Object=} chunkMeta     JSON blobl with the chunk level metadata
       * @param {number=} majorVersion  major version of the encoded data
       * @param {number=} minorVersion  minor version of the encoded data
       */
      GenericContext.prototype.restoreStreams = function (globalMeta, chunkMeta, majorVersion, minorVersion) {
        var int32Streams = this.scope.int32Streams;
        for (var i = 0; i < int32Streams.length; ++i) {
          var item = int32Streams[i];
          if (item.redundant !== -1) {
            item.stream.data = int32Streams[item.redundant].stream.data;
          } else {
            restoreIndicesStream(item.stream);
          }
        }
      };
      exportModule('LYNX.TUFF.Context.GenericContext', GenericContext);
    }());
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      var GenericContext = include('LYNX.TUFF.Context.GenericContext');
      var FiberClusterContext = function (scope) {
        GenericContext.call(this, scope);
        this._ID = FiberClusterContext.contextID;
      };
      FiberClusterContext.createContext = function (in_scope) {
        return new FiberClusterContext(in_scope);
      };
      FiberClusterContext.prototype = Object.create(GenericContext.prototype);
      FiberClusterContext.prototype.constructor = FiberClusterContext;
      exportModule('LYNX.TUFF.Context.FiberClusterContext', FiberClusterContext);
    }());
    var ID_SUFFIX = '*id';
    // Suffix for ID streams
    var INDEX_SUFFIX = '*idx';
    // Suffix for index streams
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      var GenericContext = include('LYNX.TUFF.Context.GenericContext');
      var restoreIndicesStream = include('LYNX.TUFF.restoreIndicesStream');
      var restoreIndices = include('LYNX.TUFF.restoreIndices');
      var restoreIndices2 = include('LYNX.TUFF.restoreIndices2');
      var CONSTANTS = include('LYNX.TUFF.CONSTANTS');
      /**
       * Context to with specific functionality to decode triangle meshes
       * @param {Object=} scope   container for the processed streams
       * @constructor
       */
      var TriangleMeshContext = function (scope) {
        GenericContext.call(this, scope);
        this._ID = TriangleMeshContext.contextID;
      };
      TriangleMeshContext.createContext = function (in_scope) {
        return new TriangleMeshContext(in_scope);
      };
      TriangleMeshContext.prototype = Object.create(GenericContext.prototype);
      TriangleMeshContext.prototype.constructor = TriangleMeshContext;
      /**
       * Restores any high level optimization performed in the streams during encoding
       * @param {Object=} globalMeta    JSON blob with the global metadata
       * @param {Object=} chunkMeta     JSON blob with the chunk level metadata
       * @param {number=} majorVersion  major version of the encoded data
       * @param {number=} minorVersion  minor version of the encoded data
       */
      TriangleMeshContext.prototype.restoreStreams = function (globalMeta, chunkMeta, majorVersion, minorVersion) {
        var i, j;
        var posIdxIdx = -1;
        var nTriangle;
        var stream;
        var name;
        var int32Streams = this.scope.int32Streams;
        for (i = 0; i < int32Streams.length; i++) {
          if (int32Streams[i].stream.name === CONSTANTS.PREDEFINED_STREAM_NAMES.POSIDX) {
            posIdxIdx = i;
            nTriangle = int32Streams[i].stream.data.length / 3;
            break;
          }
        }
        if (posIdxIdx === -1 || posIdxIdx > 0) {
          throw new Error('Invalid file. No position indices found');
        }
        var reorderedTriangles = true;
        for (i = 0; i < int32Streams.length; i++) {
          stream = int32Streams[i].stream;
          name = stream.name;
          if (name.indexOf(ID_SUFFIX) !== -1 && name.indexOf(INDEX_SUFFIX) === -1) {
            if (int32Streams[i].redundant !== -1) {
              var redIdx = int32Streams[i].redundant;
              // check if we mixed id/idx streams in redundancy
              var mixedIdIdx = name.indexOf(ID_SUFFIX) !== -1 && int32Streams[redIdx].stream.name.indexOf(INDEX_SUFFIX) !== -1 || name.indexOf(INDEX_SUFFIX) !== -1 && int32Streams[redIdx].stream.name.indexOf(ID_SUFFIX) !== -1;
              if (!mixedIdIdx) {
                // use reference to data stream if we are redundant and id/idx is NOT mixed
                stream.data = int32Streams[redIdx].stream.data;
              } else {
                // use copy if we are redundant and id/idx IS mixed
                stream.data = new Int32Array(int32Streams[redIdx].stream.data);
              }
              if (int32Streams[redIdx].stream.name.indexOf(INDEX_SUFFIX) !== -1) {
                restoreIndicesStream(stream);
              }
            } else {
              restoreIndicesStream(stream);
            }
            if (minorVersion === 0) {
              reorderedTriangles = false;
            } else {
              var _ref = stream.data[0];
              for (j = 1; j < stream.getSize(); j++) {
                if (stream.data[j] !== _ref) {
                  reorderedTriangles = false;
                  break;
                }
              }
            }
          }
        }
        if (globalMeta && globalMeta[CONSTANTS.PREDEFINED_OPTION_NAMES.REORDER_TOPOLOGY] === 0 || chunkMeta && chunkMeta[CONSTANTS.PREDEFINED_OPTION_NAMES.REORDER_TOPOLOGY] === 0) {
          reorderedTriangles = false;
        }
        for (i = 0; i < int32Streams.length; i++) {
          stream = int32Streams[i].stream;
          name = stream.name;
          var size = stream.getSize();
          /** i believe we can simply get rid of this block **/
          if (int32Streams[i].redundant !== -1) {
            // use reference to data stream if we are redundant
            stream.data = int32Streams[int32Streams[i].redundant].stream.data;
          }
          if (size === 0) {
            continue;
          }
          if (name.indexOf(INDEX_SUFFIX) !== -1) {
            // posIdx
            if (i === 0 && reorderedTriangles === true) {
              restoreIndices(nTriangle, stream.data);  // other indices
            } else {
              restoreIndices2(nTriangle, stream.data);
            }
          }
        }
      };
      exportModule('LYNX.TUFF.Context.TriangleMeshContext', TriangleMeshContext);
    }());
    var registerContext = function () {
      return function (in_type, in_initializers) {
        in_type.contextID = in_initializers.length;
        in_initializers.push(in_type.createContext);
      };
    }();
    var initFunctions = [];
    var GenericContext = include('LYNX.TUFF.Context.GenericContext');
    var FiberClusterContext = include('LYNX.TUFF.Context.FiberClusterContext');
    var TriangleMeshContext = include('LYNX.TUFF.Context.TriangleMeshContext');
    /**
     * Registration of user-defined contexts takes place here
     * List ordering cannot be altered and has to be similar to
     * the ordering in the encoder
     */
    registerContext(GenericContext, initFunctions);
    registerContext(FiberClusterContext, initFunctions);
    registerContext(TriangleMeshContext, initFunctions);
    exportModule('LYNX.TUFF.Context.initializers', initFunctions);
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      var CONSTANTS = include('LYNX.TUFF.CONSTANTS');
      var File = include('LYNX.TUFF.File');
      var Stream = include('LYNX.TUFF.Stream');
      var initFunctions = include('LYNX.TUFF.Context.initializers');
      /** include the new generated contexts here **/
      var GenericContext = include('LYNX.TUFF.Context.GenericContext');
      var FiberClusterContext = include('LYNX.TUFF.Context.FiberClusterContext');
      var TriangleMeshContext = include('LYNX.TUFF.Context.TriangleMeshContext');
      // utility function to compute the numeric value of a version ID
      var extractNumericVersion = function (in_versionID) {
        return parseInt(in_versionID.substring(1), 10);
      };
      // Method to create a predefined context based on the geometry type.
      // Useful for legacy TUFF files which have no associated metadata information
      var createContextFromFormat = function (in_scope, in_format) {
        if (in_format === CONSTANTS.FORMATS.TM_TUGT0 || in_format === CONSTANTS.FORMATS.TM_TUGT1 || in_format === CONSTANTS.FORMATS.TM_TUGT2) {
          return new TriangleMeshContext(in_scope);
        } else if (in_format === CONSTANTS.FORMATS.FC_TUGT0) {
          return new FiberClusterContext(in_scope);
        } else if (in_format === CONSTANTS.FORMATS.XX_TUGT0) {
          return new GenericContext(in_scope);
        } else {
          return undefined;
        }
      };
      var processStream = function (in_stream, in_format, in_minor, in_major, in_contextID, in_gMeta, in_cMeta, in_streamFilter) {
        var file = new File();
        var creator;
        if (in_contextID !== undefined) {
          creator = initFunctions[in_contextID](file);
        } else {
          // old school, try to process the data
          // with one of our pre-defined contexts
          creator = createContextFromFormat(file, in_format);
        }
        if (creator === undefined) {
          // not the right file type, stop loading.
          throw new Error('invalid file ' + in_format);
        }
        file.load(in_stream, in_format, in_major, in_minor, creator, in_gMeta, in_cMeta, in_streamFilter);
        return { file: file };
      };
      var extractTUFFDataHeaderInformation = function (in_streamData, in_finishedCallback) {
        try {
          var arr = null;
          var headers = null;
          var file = new File();
          var stream = new Stream(in_streamData);
          // This will load the file.
          var formatId = stream.readStaticString(8);
          var majorVersion = extractNumericVersion(stream.readStaticString(4));
          var minorVersion = extractNumericVersion(stream.readStaticString(4));
          // eslint-disable-next-line no-unused-vars
          var dummy = stream.readStaticString(1);
          // version string is zero terminated
          if (formatId === CONSTANTS.FORMATS.MULTITUFF) {
            // file containing multiple TUFF chunks
            var nChunks = stream.readUint32();
            arr = new Array(nChunks);
            for (var j = 0; j < nChunks; ++j) {
              formatId = stream.readStaticString(8);
              majorVersion = extractNumericVersion(stream.readStaticString(4));
              minorVersion = extractNumericVersion(stream.readStaticString(4));
              dummy = stream.readStaticString(1);
              if (majorVersion < 1) {
                throw new Error('Deprecated TUFF version');
              }
              // extract header information from the TUFF chunk
              headers = file.extractTUFFHeader(stream, majorVersion, minorVersion);
              if (in_finishedCallback) {
                in_finishedCallback(null, [headers]);
              } else {
                arr[j] = headers;
              }
            }
            return arr;
          } else {
            // only one chunk
            if (majorVersion < 1) {
              in_finishedCallback(new Error('Deprecated TUFF version'), null);
              return null;
            }
            arr = new Array(1);
            headers = file.extractTUFFHeader(stream, majorVersion, minorVersion);
            if (in_finishedCallback) {
              in_finishedCallback(null, [headers]);
            } else {
              arr[0] = headers;
            }
          }
          return arr;
        } catch (e) {
          if (in_finishedCallback) {
            in_finishedCallback(e, null);
          } else {
            throw e;
          }
          return null;
        }
      };
      var processTUFFDataPackage = function (in_streamData, in_context, in_globalMetaData, in_chunkMetaData, in_filter, in_finishedCallback, in_statusCallback) {
        var statusCallback = in_statusCallback || function () {
        };
        try {
          var result = null;
          var arr = null;
          statusCallback({
            msg: 'profile',
            body: 'Parsing .tuff file...'
          });
          var stream = new Stream(in_streamData);
          // This will load the file.
          var formatId = stream.readStaticString(8);
          var majorVersion = extractNumericVersion(stream.readStaticString(4));
          var minorVersion = extractNumericVersion(stream.readStaticString(4));
          // eslint-disable-next-line no-unused-vars
          var dummy = stream.readStaticString(1);
          // version string is zero terminated
          if (formatId === CONSTANTS.FORMATS.MULTITUFF) {
            // file containing multiple TUFF chunks
            // without metadata information
            // we then read the file sequentially
            // however only the last chunk will be visualized
            // because the calling structure doesn't support
            // multiple TUFF files
            statusCallback({
              msg: 'warning',
              body: 'Multi TUFF without metadata information. \n' + 'Only the last chunk will be visualized'
            });
            var nChunks = stream.readUint32();
            arr = new Array(nChunks);
            for (var j = 0; j < nChunks; ++j) {
              formatId = stream.readStaticString(8);
              majorVersion = extractNumericVersion(stream.readStaticString(4));
              minorVersion = extractNumericVersion(stream.readStaticString(4));
              dummy = stream.readStaticString(1);
              if (majorVersion < 1) {
                throw new Error('Deprecated TUFF version');
              }
              // process the TUFF chunk
              result = processStream(stream, formatId, minorVersion, majorVersion, in_context, in_globalMetaData, in_chunkMetaData, in_filter);
              if (in_finishedCallback) {
                in_finishedCallback(result.file);
              } else {
                arr[j] = result;
              }
              statusCallback({ msg: 'done' });
            }
            statusCallback({ msg: 'doneAll' });
            return arr;
          } else {
            // process the old-school TUFF file
            if (majorVersion < 1) {
              throw new Error('Deprecated TUFF version');
            }
            arr = new Array(1);
            result = processStream(stream, formatId, minorVersion, majorVersion, in_context, in_globalMetaData, in_chunkMetaData, in_filter);
            if (in_finishedCallback) {
              in_finishedCallback(result.file);
            } else {
              arr[0] = result;
            }
            statusCallback({ msg: 'done' });
          }
          statusCallback({ msg: 'doneAll' });
          return arr;
        } catch (e) {
          statusCallback({
            msg: 'skip',
            body: 'Loading .tuff file failed. Error: ' + e.stack
          });
          return null;
        } finally {
          // Signal the completion of the TUFF processing request.
          statusCallback({ msg: 'finalExit' });
        }
      };
      exportModule('LYNX.TUFF.processTUFFDataPackage', processTUFFDataPackage);
      exportModule('LYNX.TUFF.extractTUFFDataHeaderInformation', extractTUFFDataHeaderInformation);
    }());
    (function () {
      /* include('LYNX.TUFF.custom.exportModule'); */
      // Enable for nitty gritty details of processing.
      var VERBOSE_TUFF_PROCESSING = false;
      var CONSTANTS = include('LYNX.TUFF.CONSTANTS');
      var workerPool = include('LYNX.TUFF.tuffLoaderWorkerPool');
      var processTUFFDataPackage = include('LYNX.TUFF.processTUFFDataPackage');
      var extractTUFFHeaderInformation = include('LYNX.TUFF.extractTUFFDataHeaderInformation');
      // TODO: This path has to be configurable. Module Robot should be able to configure configure worker threads
      var pathToWorker = '/modules/node_modules/@adsk/tuff-decoder/src/tuff_worker.js';
      /**
       * The interface of this class contains the required methods to decode TUFF data
       * or extract TUFF header information without decoding the TUFF streams. It mimics
       * the behavior of the TUFFImporter class in the C++ implementation of the TUFF library
       *
       * @param {Boolean=} in_spawnWorker    improves the performance of the library by spawning workers
       *                                     threads to decode TUFF chunks in parallel. Since the code
       *                                     passed to a worker thread has to be located in a specific
       *                                     physical location, users calling the decoder from within a
       *                                     worker thread or using a single-file compiled version of
       *                                     the library should set in_spanWorker = false | undefined
       * @param {Number=} in_numWorkers      number of workers spawned during decoding,
       *                                     only relevant if in_spawnWorker == true.
       *                                     If no value is provided and in_spawnWorker == true
       *                                     the worker pool spawns as many workers as possible
       * @constructor
       */
      var TUFFLoader = function (in_spawnWorker, in_numWorkers) {
        this._workers = !!in_spawnWorker;
        // is the library called from within a worker thread ?
        if (this._workers && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
          this._workers = false;
        }
        // is the library called from within a node process ?
        this._workers = this._workers && typeof Worker !== 'undefined';
        // if workers available, ensure that the tuff worker pool is ready to process the load.
        if (this._workers === true) {
          workerPool.init(pathToWorker, in_numWorkers);
        }
      };
      TUFFLoader.prototype.constructor = TUFFLoader;
      var handleMessage = function (params, data) {
        var lData = params;
        // This gives an error from time to time as it can't find the given key....
        // Not sure why, I assume that
        // if there's no key, then there's just nothing to worry about, right?
        if (!lData) {
          return;
        }
        if (!data) {
          lData.callback(new Error('Could not load the file.'));
          return;
        }
        var workerPackage = {
          start_seconds: 0,
          type: CONSTANTS.GEOMETRY_TYPES.GEOMETRY,
          // general data containers
          int8Streams: [],
          int32Streams: [],
          int64Streams: [],
          vector4Streams: [],
          vector3Streams: [],
          normVector3Streams: [],
          vector2Streams: [],
          floatStreams: [],
          doubleStreams: []
        };
        workerPackage.onmessage = function (event) {
          // The worker takes care of most computation involved with loading
          // the mesh, and of course does the decompression. Once the
          // data are ready, it pushes arrays back to here.
          if (event.data.msg === 'int8Stream') {
            this.int8Streams.push(event.data.body);
          } else if (event.data.msg === 'int32Stream') {
            this.int32Streams.push(event.data.body);
          } else if (event.data.msg === 'int64Stream') {
            this.int64Streams.push(event.data.body);
          } else if (event.data.msg === 'vector4Stream') {
            this.vector4Streams.push(event.data.body);
          } else if (event.data.msg === 'vector3Stream') {
            this.vector3Streams.push(event.data.body);
          } else if (event.data.msg === 'normVec3Stream') {
            this.normVector3Streams.push(event.data.body);
          } else if (event.data.msg === 'vector2Stream') {
            this.vector2Streams.push(event.data.body);
          } else if (event.data.msg === 'floatStream') {
            this.floatStreams.push(event.data.body);
          } else if (event.data.msg === 'doubleStream') {
            this.doubleStreams.push(event.data.body);
          } else if (event.data.msg === 'format') {
            if (VERBOSE_TUFF_PROCESSING) {
              console.log('TUFF file format: ' + event.data.body);
            }
            this.type = event.data.body;
          } else if (event.data.msg === 'skip') {
            // We skip loading of the object when the worker cannot handle the file
            // e.g. when it cannot allocate the required memory
            console.log('Loading failed. Skipping. ' + event.data.body);
            return;
          } else if (event.data.msg === 'message') {
            if (VERBOSE_TUFF_PROCESSING) {
              console.log(event.data.body);
            }
            return;
          } else if (event.data.msg === 'warning') {
            if (VERBOSE_TUFF_PROCESSING) {
              console.warn(event.data.body);
            }
            return;
          } else if (event.data.msg === 'doneAll') {
          } else if (event.data.msg === 'done') {
            lData.status_callback({ status: 'done' });
            lData.callback(null, {
              type: this.type,
              int8Streams: this.int8Streams,
              int32Streams: this.int32Streams,
              int64Streams: this.int64Streams,
              vector4Streams: this.vector4Streams,
              vector3Streams: this.vector3Streams,
              normVector3Streams: this.normVector3Streams,
              vector2Streams: this.vector2Streams,
              floatStreams: this.floatStreams,
              doubleStreams: this.doubleStreams
            });
          } else if (event.data.msg === 'profile') {
            if (VERBOSE_TUFF_PROCESSING) {
              var seconds = new Date().getTime() / 1000 - this.start_seconds;
              console.log('Time: ' + seconds + ' ' + event.data.body);
            }
          } else if (event.data.msg === 'begin') {
            if (event.data.body === 'bounding') {
              lData.status_callback({ status: 'computing' });
            } else if (event.data.body === 'transfer') {
              lData.status_callback({ status: 'loading' });
            }
          }
        };
        workerPackage.start_seconds = new Date().getTime() / 1000;
        var launchObj = {
          data: data,
          filter: params.filter,
          context: params.context,
          globalMetaData: params.globalMetaData,
          chunkMetaData: params.chunkMetaData
        };
        workerPool.launchTask(workerPackage, launchObj, [data]);
      };
      var decodeData = function (params, data) {
        var lData = params;
        if (!lData) {
          return;
        }
        if (!data) {
          lData.callback(new Error('Could not load the file.'));
          return;
        }
        lData.status_callback({ status: 'computing' });
        var finishedCallback = function (in_file, in_time) {
          lData.status_callback({ status: 'done' });
          var i, j;
          var tuffStreams = {
            int8Streams: new Array(in_file.int8Streams.length),
            int32Streams: new Array(in_file.int32Streams.length),
            int64Streams: new Array(in_file.int64Streams.length),
            vector4Streams: new Array(in_file.vector4Streams.length),
            vector3Streams: new Array(in_file.vector3Streams.length),
            normVector3Streams: new Array(in_file.normVector3Streams.length),
            vector2Streams: new Array(in_file.vector2Streams.length),
            floatStreams: new Array(in_file.floatStreams.length),
            doubleStreams: new Array(in_file.doubleStreams.length)
          };
          var keys = Object.keys(tuffStreams);
          for (i = 0; i < keys.length; ++i) {
            for (j = 0; j < in_file[keys[i]].length; ++j) {
              tuffStreams[keys[i]][j] = in_file[keys[i]][j].stream;
            }
          }
          lData.callback(null, {
            type: in_file.formatId,
            time: in_time,
            int8Streams: tuffStreams.int8Streams,
            int32Streams: tuffStreams.int32Streams,
            int64Streams: tuffStreams.int64Streams,
            vector4Streams: tuffStreams.vector4Streams,
            vector3Streams: tuffStreams.vector3Streams,
            normVector3Streams: tuffStreams.normVector3Streams,
            vector2Streams: tuffStreams.vector2Streams,
            floatStreams: tuffStreams.floatStreams,
            doubleStreams: tuffStreams.doubleStreams
          });
        };
        var statusUpdateCallback = function (in_message) {
          var msg = in_message.msg;
          if (in_message.body) {
            msg = msg + ' => ' + in_message.body;
          }
          lData.status_callback({ status: msg });
        };
        processTUFFDataPackage(data, params.context, params.globalMetaData, params.chunkMetaData, params.filter, finishedCallback, statusUpdateCallback);
      };
      var decodeDataSync = function (in_data, in_params) {
        var chunks = null;
        if (!in_data) {
          console.log('Error: No data to read !!!');
          return null;
        }
        if (in_params) {
          chunks = processTUFFDataPackage(in_data, in_params.context, in_params.globalMetaData, in_params.chunkMetaData, in_params.filter);
        } else {
          chunks = processTUFFDataPackage(in_data);
        }
        var nChunks = chunks.length;
        var result = new Array(nChunks);
        for (var i = 0; i < nChunks; ++i) {
          var file = chunks[i].file;
          // TODO: Optimize this for the LMV case
          var data = {
            int8Streams: new Array(file.int8Streams.length),
            int32Streams: new Array(file.int32Streams.length),
            int64Streams: new Array(file.int64Streams.length),
            vector4Streams: new Array(file.vector4Streams.length),
            vector3Streams: new Array(file.vector3Streams.length),
            normVector3Streams: new Array(file.normVector3Streams.length),
            vector2Streams: new Array(file.vector2Streams.length),
            floatStreams: new Array(file.floatStreams.length),
            doubleStreams: new Array(file.doubleStreams.length)
          };
          for (var j = 0; j < file.int8Streams.length; ++j) {
            data.int8Streams[j] = file.int8Streams[j].stream;
          }
          for (var j = 0; j < file.int32Streams.length; ++j) {
            data.int32Streams[j] = file.int32Streams[j].stream;
          }
          for (var j = 0; j < file.int64Streams.length; ++j) {
            data.int64Streams[j] = file.int64Streams[j].stream;
          }
          for (var j = 0; j < file.vector4Streams.length; ++j) {
            data.vector4Streams[j] = file.vector4Streams[j].stream;
          }
          for (var j = 0; j < file.vector3Streams.length; ++j) {
            data.vector3Streams[j] = file.vector3Streams[j].stream;
          }
          for (var j = 0; j < file.normVector3Streams.length; ++j) {
            data.normVector3Streams[j] = file.normVector3Streams[j].stream;
          }
          for (var j = 0; j < file.vector2Streams.length; ++j) {
            data.vector2Streams[j] = file.vector2Streams[j].stream;
          }
          for (var j = 0; j < file.floatStreams.length; ++j) {
            data.floatStreams[j] = file.floatStreams[j].stream;
          }
          for (var j = 0; j < file.doubleStreams.length; ++j) {
            data.doubleStreams[j] = file.doubleStreams[j].stream;
          }
          data.type = file.formatId;
          result[i] = data;
        }
        return result;
      };
      var checkForIntegerStreams = function (in_streams, in_meta) {
        // first remove all integer streams from the filter structure
        var intStreamID = CONSTANTS.TUFF_STREAM_TYPES.Stream_int32;
        var intStreamFound = false;
        var i;
        for (i = in_meta.length - 1; i >= 0; --i) {
          if (in_meta[i].type === intStreamID) {
            intStreamFound = true;
            in_meta.splice(i, 1);
          }
        }
        if (!intStreamFound) {
          return;
        }
        // then add all integer streams in the correct sequence
        for (i = 0; i < in_streams.length; ++i) {
          if (in_streams[i].type === intStreamID) {
            in_meta.push({
              index: i,
              type: in_streams[i].type
            });
          }
        }
      };
      var load = function (in_data, in_meta, in_callback, status_callback, in_context) {
        try {
          var callingFunction = this._workers ? handleMessage : decodeData;
          in_callback = in_callback || function () {
          };
          status_callback = status_callback || function () {
          };
          var that = this;
          var i, j, chunkIdx, streamIdx;
          var params, buffer;
          if (in_meta !== undefined) {
            var metaData = JSON.parse(in_meta);
            var nChunks = metaData.chunks.length;
            var chunks = metaData.chunks;
            var globalMetaData = metaData.attributes;
            if (in_context && in_context.filterInfo && in_context.filterInfo.length) {
              // retrieving only the required chunks, based on the filter information
              var info = in_context.filterInfo;
              info.sort(function (a, b) {
                return a.chunkIdx - b.chunkIdx;
              });
              for (i = 0; i < info.length; ++i) {
                chunkIdx = info[i].chunkIdx;
                params = {
                  scope: that,
                  context: undefined,
                  globalMetaData: globalMetaData,
                  chunkMetaData: chunks[i].attributes,
                  callback: in_callback,
                  status_callback: status_callback,
                  filter: []
                };
                // conservative approach: if an integer stream is requested, we fetch all integer streams
                // to avoid possible errors related to redundant streams or, in the case of triangle meshes,
                // stream re-ordering from the high-level stream optimization
                checkForIntegerStreams(chunks[chunkIdx].streams, info[i].streams);
                for (j = 0; j < info[i].streams.length; ++j) {
                  streamIdx = info[i].streams[j].index;
                  params.context = chunks[chunkIdx].context;
                  params.filter.push({
                    type: info[i].streams[j].type,
                    offset: chunks[chunkIdx].streams[streamIdx].offset - chunks[chunkIdx].offset
                  });
                }
                buffer = in_data.slice(chunks[chunkIdx].offset, chunks[chunkIdx].offset + chunks[chunkIdx].size);
                callingFunction(params, buffer);
              }
            } else {
              // no filter information, retrieving all chunks in parallel
              for (i = 0; i < nChunks; ++i) {
                params = {
                  scope: that,
                  context: chunks[i].context,
                  globalMetaData: globalMetaData,
                  chunkMetaData: chunks[i].attributes,
                  callback: in_callback,
                  status_callback: status_callback
                };
                buffer = in_data.slice(chunks[i].offset, chunks[i].offset + chunks[i].size);
                callingFunction(params, buffer);
              }
            }
          } else {
            // no meta-data information, reading the data sequentially
            params = {
              scope: that,
              callback: in_callback,
              status_callback: status_callback
            };
            callingFunction(params, in_data);
          }
        } catch (e) {
          // We skip loading of the object when there is an exception
          // e.g. when we cannot allocate the required memory
          console.log('Processing failed. Skipping object. Error: ' + e.stack);
        }
      };
      var loadSync = function (in_data, in_meta, in_context) {
        var result = [];
        var params = undefined;
        var that = this;
        var i;
        var buffer = undefined;
        if (in_meta !== undefined) {
          var metaData = JSON.parse(in_meta);
          var nChunks = metaData.chunks.length;
          var chunks = metaData.chunks;
          var globalMetaData = metaData.attributes;
          result = new Array(nChunks);
          // no filter information, retrieving all chunks
          for (i = 0; i < nChunks; ++i) {
            params = {
              scope: that,
              context: chunks[i].context,
              globalMetaData: globalMetaData,
              chunkMetaData: chunks[i].attributes
            };
            buffer = in_data.slice(chunks[i].offset, chunks[i].offset + chunks[i].size);
            var res = decodeDataSync(buffer, params);
            if (res) {
              result[i] = res[0];
            }
          }
        } else {
          result = decodeDataSync(in_data);
        }
        return result;
      };
      /**
       * Load a tuff file and create model buffers
       *
       * @param {ArrayBuffer} in_data       TUFF stream extracted as binary array
       * @param {String} in_meta            TUFF metadata extracted as a string
       * @param {function} in_callback      function to be called when the loading process ends
       * @param {function} status_callback  function called when the loading status changes
       * @param {object=} in_context        contains additional information to handle the loaded tuff
       *
       * @deprecated since version 2.3.0 Use 'importStreamData' instead
       */
      TUFFLoader.prototype.load = function (in_data, in_meta, in_callback, status_callback, in_context) {
        load(in_data, in_meta, in_callback, status_callback, in_context);
      };
      /**
       * Loads a TUFF file/package and extract its data sequentially
       * This function has no support for multi-threading
       *
       * @param {ArrayBuffer} in_data       TUFF stream extracted as binary array
       * @param {String} in_meta            TUFF metadata extracted as a string
       * @param {object=} in_context        contains additional information to handle the loaded tuff
       * @return {Array} [chunks] an array of objects containing the chunk data (streams)
       *
       * @deprecated since version 2.3.0. Use 'importStreamDataSync' instead
       */
      TUFFLoader.prototype.loadSync = function (in_data, in_meta, in_context) {
        return loadSync(in_data, in_meta, in_context);
      };
      /**
       * Loads a TUFF file/package and extracts the TUFF data asynchronously
       *
       * @param {ArrayBuffer} in_data       TUFF data represented as binary array
       * @param {String} in_meta            TUFF metadata represented as a string
       * @param {function} in_callback      function to be called when the loading process ends
       * @param {function} status_callback  function called when the loading status changes
       * @param {object=} in_context        contains additional information to handle the loaded tuff
       */
      TUFFLoader.prototype.importStreamData = function (in_data, in_meta, in_callback, status_callback, in_context) {
        load(in_data, in_meta, in_callback, status_callback, in_context);
      };
      /**
       * Loads a TUFF file/package and extracts the TUFF data synchronously.
       * This function works single-threaded
       *
       * @param {ArrayBuffer} in_data       TUFF data extracted as binary array
       * @param {String=} in_meta           TUFF metadata extracted as a string
       * @param {object=} in_context        contains additional information to handle the loaded tuff
       * @return {Array}                    array of objects containing the chunk data (streams)
       */
      TUFFLoader.prototype.importStreamDataSync = function (in_data, in_meta, in_context) {
        return loadSync(in_data, in_meta, in_context);
      };
      /**
       * Extracts header information from a TUFF
       * file/package without decoding the TUFF streams
       *
       * @param {ArrayBuffer} in_data       TUFF data extracted as binary array
       * @param {function} in_callback      function to be called when the extraction of header information ends
       * @return {Array}                    two-dimensional array of objects containing
       *                                    stream header information for each chunk
       */
      TUFFLoader.prototype.extractHeaderInfo = function (in_data, in_callback) {
        var result = extractTUFFHeaderInformation(in_data, in_callback);
        return result;
      };
      exportModule('LYNX.TUFF.TUFFLoader', TUFFLoader);
    }());
    (function () {
      var CONSTANTS = include('LYNX.TUFF.CONSTANTS');
      var TUFFLoader = include('LYNX.TUFF.TUFFLoader');
      /**
       * @classdesc Class offering functionality to retrieve typed streams within a decoded TUFF chunk
       * @class
       *
       * @param {Object} in_chunk TUFF chunk containing all streams grouped by their type
       * @constructor
       */
      var TUFFStreamExtractor = function (in_chunk) {
        this._chunk = in_chunk;
      };
      TUFFStreamExtractor.prototype.constructor = TUFFStreamExtractor;
      /**
       * Returns the the chunk's format
       *
       * @return {LYNX.TUFF.CONSTANTS.FORMATS}  Chunk format
       */
      TUFFStreamExtractor.prototype.getType = function () {
        return this._chunk.type;
      };
      /**
       * Checks whether the chunk contains streams of a given type
       *
       * @param {String} in_type stream type. Check 'LYNX.TUFF.CONSTANTS.TUFF_STREAM_TYPE_NAMES'
       * @return {boolean}       true iff streams of the given type are present
       */
      TUFFStreamExtractor.prototype.hasStreams = function (in_type) {
        return this._chunk[in_type] && this._chunk[in_type].length > 0;
      };
      /**
       * Returns all streams of a given type within the chunk
       *
       * @param {String} in_type stream type. Check 'LYNX.TUFF.CONSTANTS.TUFF_STREAM_TYPE_NAMES'
       * @return {Array}         array of streams
       */
      TUFFStreamExtractor.prototype.getStreams = function (in_type) {
        if (!this._chunk[in_type] || !this._chunk[in_type].length) {
          console.warn('No streams of this type: ' + in_type);
        }
        return this._chunk[in_type];
      };
      /**
       * Checks whether the chunk contains a stream of the given type with the given name
       *
       * @param {String} in_type  stream type. Check 'LYNX.TUFF.CONSTANTS.TUFF_STREAM_TYPE_NAMES'
       * @param {String} in_name  stream name
       * @return {boolean}        true iff streams with the given type and name are present
       */
      TUFFStreamExtractor.prototype.hasStreamsWithName = function (in_type, in_name) {
        if (!this.hasStreams(in_type)) {
          return false;
        }
        for (var i = 0; i < this._chunk[in_type].length; ++i) {
          if (this._chunk[in_type][i].name === in_name) {
            return true;
          }
        }
        return false;
      };
      /**
       * Returns all streams within the chunk with a given type and name
       *
       * @param {String} in_type  stream type. Check 'LYNX.TUFF.CONSTANTS.TUFF_STREAM_TYPE_NAMES'
       * @param {String} in_name  stream name
       * @return {Array}          array of typed arrays containing stream data
       */
      TUFFStreamExtractor.prototype.getStreamsByName = function (in_type, in_name) {
        var streams = this.getStreams(in_type);
        var result = [];
        for (var i = 0; i < streams.length; ++i) {
          if (streams[i].name === in_name) {
            result.push(streams[i].data);
          }
        }
        if (result.length > 1) {
          console.warn('Multiple streams with the same name found');
        } else if (result < 1) {
          console.warn('No stream found with the given name and type');
        }
        return result;
      };
      /**
       * Returns the first stream within the chunk with a given type and name
       *
       * @param {String} in_type  stream type. Check 'LYNX.TUFF.CONSTANTS.TUFF_STREAM_TYPE_NAMES'
       * @param {String} in_name  stream name
       * @return {Array}          typed array containing stream data
       */
      TUFFStreamExtractor.prototype.getStreamByName = function (in_type, in_name) {
        var streams = this.getStreams(in_type);
        for (var i = 0; i < streams.length; ++i) {
          if (streams[i].name === in_name) {
            return streams[i].data;
          }
        }
        return null;
      };
      /**
       * @classdesc Class that generates a THREE geometry object from the chunk's stream data
       * @class
       * @augments TUFFStreamExtractor
       *
       * @param {Object} in_chunk TUFF chunk containing all streams grouped by their type
       * @constructor
       */
      var THREEMeshGenerator = function (in_chunk) {
        TUFFStreamExtractor.call(this, in_chunk);
      };
      THREEMeshGenerator.prototype = Object.create(TUFFStreamExtractor.prototype);
      THREEMeshGenerator.prototype.constructor = THREEMeshGenerator;
      /**
       * Returns vertex, normal, texture and index buffers generated from
       * the corresponding position, normal, texture and topology streams
       *
       * @return {{indices: Int32Array, positions: Float32Array, normals: Float32Array, uvs: Float32Array}}
       *         object containing the buffers as typed arrays
       */
      THREEMeshGenerator.prototype.getBuffers = function () {
        var i, j;
        var vertexIndexArray, vertexPositionArray, vertexNormalArray, vertexUvArrays;
        var STR_NAMES = CONSTANTS.PREDEFINED_STREAM_NAMES;
        var STR_TYPE_NAMES = CONSTANTS.TUFF_STREAM_TYPE_NAMES;
        var hasNormals = this.hasStreamsWithName(STR_TYPE_NAMES.normVector3Streams, STR_NAMES.NRM) && this.hasStreamsWithName(STR_TYPE_NAMES.int32Streams, STR_NAMES.NRMIDX);
        var hasUvs = this.hasStreamsWithName(STR_TYPE_NAMES.vector2Streams, STR_NAMES.TEX) && this.hasStreamsWithName(STR_TYPE_NAMES.int32Streams, STR_NAMES.TEXIDX);
        var positionIndices = this.getStreamByName(STR_TYPE_NAMES.int32Streams, STR_NAMES.POSIDX);
        vertexPositionArray = new Float32Array(positionIndices.length * 3);
        var uvIndices;
        var normalIndices;
        var type = this.getType();
        if (type === CONSTANTS.FORMATS.TM_TUGT0 || type === CONSTANTS.FORMATS.TM_TUGT2) {
          uvIndices = this.getStreamByName(STR_TYPE_NAMES.int32Streams, STR_NAMES.TEXIDX);
          normalIndices = this.getStreamByName(STR_TYPE_NAMES.int32Streams, STR_NAMES.NRMIDX);
        } else if (type === CONSTANTS.FORMATS.TM_TUGT1) {
          uvIndices = positionIndices;
          normalIndices = positionIndices;
        } else {
          // not the right file type, stop loading. should not be reached at this point
          throw new Error('invalid TUFF chunk type: ' + type);
        }
        var vertices = this.getStreamByName(STR_TYPE_NAMES.vector3Streams, STR_NAMES.POS);
        var normals = this.getStreamByName(STR_TYPE_NAMES.normVector3Streams, STR_NAMES.NRM);
        var uvs = this.getStreamByName(STR_TYPE_NAMES.vector2Streams, STR_NAMES.TEX);
        if (type !== CONSTANTS.FORMATS.TM_TUGT1) {
          // For TM_TUGT0 and TM_TUGT2 formats we create a new single index buffer as required by the GPU.
          // TODO: We currently simply duplicate vertices but we should optimize and shrink these buffers
          vertexIndexArray = new Uint32Array(positionIndices.length);
          vertexNormalArray = new Float32Array(positionIndices.length * 3);
          vertexUvArrays = [];
          vertexUvArrays[0] = {};
          vertexUvArrays[0].uv = new Float32Array(vertexPositionArray.length / 3 * 2);
          for (i = 0; i < positionIndices.length; i += 1) {
            for (j = 0; j < 3; j++) {
              vertexPositionArray[3 * i + j] = vertices[3 * positionIndices[i] + j];
            }
            if (normals) {
              for (j = 0; j < 3; j++) {
                vertexNormalArray[3 * i + j] = normals[3 * normalIndices[i] + j];
              }
            }
            if (uvs) {
              for (j = 0; j < 2; j++) {
                vertexUvArrays[0].uv[i * 2 + j] = uvs[2 * uvIndices[i] + j];
              }
            }
            vertexIndexArray[i] = i;
          }
        } else {
          // For TM_TUGT1 format we directly use the buffers from the file
          vertexIndexArray = positionIndices;
          vertexPositionArray = vertices;
          vertexNormalArray = normals;
          vertexUvArrays = [];
          vertexUvArrays[0] = {};
          vertexUvArrays[0].uv = uvs;
        }
        if (!hasNormals) {
          vertexNormalArray = undefined;
        }
        if (!hasUvs) {
          vertexUvArrays = undefined;
        }
        return {
          indices: vertexIndexArray,
          positions: vertexPositionArray,
          normals: vertexNormalArray,
          uvs: vertexUvArrays
        };
      };
      /**
       * Returns a THREE.js geometry generated from the corresponding
       * position, normal and topology streams within the TUFF chunk,
       * or null if the chunk data doesn't represent a geometry
       *
       * @param {THREE.js} in_THREE             instance of the THREE.js library used to create the geometry
       * @return {THREE.BufferGeometry|null}    the generated geometry
       */
      THREEMeshGenerator.prototype.getGeometry = function (in_THREE) {
        if (this._chunk.type === CONSTANTS.FORMATS.TM_TUGT0 || this._chunk.type === CONSTANTS.FORMATS.TM_TUGT1 || this._chunk.type === CONSTANTS.FORMATS.TM_TUGT2) {
          var buffers = this.getBuffers();
          var geometry = new in_THREE.BufferGeometry();
          var indexBuffer32 = new Uint32Array(buffers.indices);
          geometry.setIndex(new in_THREE.BufferAttribute(indexBuffer32, 1));
          geometry.addAttribute('position', new in_THREE.BufferAttribute(buffers.positions, 3));
          if (buffers.normals) {
            geometry.addAttribute('normal', new in_THREE.BufferAttribute(buffers.normals, 3));
          }
          return geometry;
        } else {
          return null;
        }
      };
      /**
       * Utility function that generates THREE.js geometry from stream data in the TUFF chunk
       *
       * @param {THREE.js} in_THREE              instance of the THREE.js library used to create the geometry
       * @param {Object} in_TUFFChunk            chunk containing all streams grouped by their type
       * @return {Array<THREE.BufferGeometry>}   array of the generated geometries
       */
      var geometryFromDecodedTUFFChunk = function (in_THREE, in_TUFFChunk) {
        var extractor = new THREEMeshGenerator(in_TUFFChunk);
        return [extractor.getGeometry(in_THREE)];
      };
      /**
       * Utility function that decodes a binary blob with TUFF data
       * and generates a THREE geometry for each decoded chunk
       *
       * @param {THREE.js} in_THREE                   instance of the THREE.js library used to create the geometry
       * @param {ArrayBuffer} in_TUFFData             binary blob with encoded TUFF data
       * @param {Boolean=} in_spawnWorker             decode TUFF chunks in parallel using worker threads.
       * @param {String=} in_metaData                 JSON string containing metadata information
       * @param {Function=} in_callback               Callback function to be called every time a TUFF chunk is processed
       * @return {Array<THREE.BufferGeometry>|null}   array of the generated geometries, if no callback present
       */
      var geometryFromEncodedTUFFData = function (in_THREE, in_TUFFData, in_spawnWorker, in_metaData, in_callback) {
        var loader = new TUFFLoader(in_spawnWorker);
        var extractor = undefined;
        if (in_callback) {
          // we do the asynchronous way
          var loadUpdateCallback = function (data) {
            console.log('loading status: ' + data.status);
          };
          var loadFinishedCallback = function (error, data) {
            if (error) {
              in_callback(error, null);
            } else {
              extractor = new THREEMeshGenerator(data);
              in_callback(null, extractor.getGeometry(in_THREE));
            }
          };
          loader.importStreamData(in_TUFFData, in_metaData, loadFinishedCallback, loadUpdateCallback);
          return null;
        } else {
          // no callback, synchronous way
          var chunks = loader.importStreamDataSync(in_TUFFData, in_metaData);
          var result = new Array(chunks.length);
          for (var i = 0; i < chunks.length; ++i) {
            extractor = new THREEMeshGenerator(chunks[i]);
            result[i] = extractor.getGeometry(in_THREE);
          }
          return result;
        }
      };
      /**
       * Utility function that retrieve and decode a binary blob with TUFF data
       * to generate THREE geometry for each decoded TUFF chunk
       *
       * @param {THREE.js} in_THREE         instance of the THREE.js library used to create the geometry
       * @param {String} in_URL             location of the TUFF package
       * @param {Boolean} in_spawnWorker    decode TUFF chunks in parallel using worker threads.
       * @param {Function} in_callback      callback function to be called every time a TUFF chunk is processed
       */
      var geometryFromRemoteTUFFData = function (in_THREE, in_URL, in_spawnWorker, in_callback) {
        var request = new XMLHttpRequest();
        request.open('GET', in_URL, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
          var status = request.status;
          if (status === 200) {
            geometryFromEncodedTUFFData(in_THREE, request.response, in_spawnWorker, undefined, in_callback);
          } else {
            in_callback(new Error('Request failed: Error ' + status), null);
          }
        };
        request.send();
      };
      exportModule('LYNX.TUFF.TUFFStreamExtractor', TUFFStreamExtractor);
      exportModule('LYNX.TUFF.THREEMeshGenerator', THREEMeshGenerator);
      exportModule('LYNX.TUFF.THREEFromDecodedTUFF', geometryFromDecodedTUFFChunk);
      exportModule('LYNX.TUFF.THREEFromEncodedTUFF', geometryFromEncodedTUFFData);
      exportModule('LXNX.TUFF.THREEFromRemoteTUFF', geometryFromRemoteTUFFData);
    }());
    var postCommonInformation = function (file, time, self) {
      self.postMessage({
        msg: 'format',
        body: file.formatId
      });
      self.postMessage({
        msg: 'time',
        body: time
      });
      var i;
      for (i = 0; i < file.int8Streams.length; ++i) {
        self.postMessage({
          msg: 'int8Stream',
          body: file.int8Streams[i].stream
        }, [file.int8Streams[i].stream.buffer]);
      }
      for (i = 0; i < file.int32Streams.length; ++i) {
        self.postMessage({
          msg: 'int32Stream',
          body: file.int32Streams[i].stream
        }, [file.int32Streams[i].stream.buffer]);
      }
      for (i = 0; i < file.int64Streams.length; ++i) {
        self.postMessage({
          msg: 'int64Stream',
          body: file.int64Streams[i].stream
        }, [file.int64Streams[i].stream.buffer]);
      }
      for (i = 0; i < file.vector4Streams.length; ++i) {
        self.postMessage({
          msg: 'vector4Stream',
          body: file.vector4Streams[i].stream
        }, [file.vector4Streams[i].stream.buffer]);
      }
      for (i = 0; i < file.vector3Streams.length; ++i) {
        self.postMessage({
          msg: 'vector3Stream',
          body: file.vector3Streams[i].stream
        }, [file.vector3Streams[i].stream.buffer]);
      }
      for (i = 0; i < file.normVector3Streams.length; ++i) {
        self.postMessage({
          msg: 'normVec3Stream',
          body: file.normVector3Streams[i].stream
        }, [file.normVector3Streams[i].stream.buffer]);
      }
      for (i = 0; i < file.vector2Streams.length; ++i) {
        self.postMessage({
          msg: 'vector2Stream',
          body: file.vector2Streams[i].stream
        }, [file.vector2Streams[i].stream.buffer]);
      }
      for (i = 0; i < file.floatStreams.length; ++i) {
        self.postMessage({
          msg: 'floatStream',
          body: file.floatStreams[i].stream
        }, [file.floatStreams[i].stream.buffer]);
      }
      for (i = 0; i < file.doubleStreams.length; ++i) {
        self.postMessage({
          msg: 'doubleStream',
          body: file.doubleStreams[i].stream
        }, [file.doubleStreams[i].stream.buffer]);
      }
      self.postMessage({
        msg: 'profile',
        body: 'Done.'
      });
      self.postMessage({
        msg: 'end',
        body: 'transfer'
      });
    };
    exportModule('LYNX.TUFF.broadcastStreams', postCommonInformation);

  }


  /**
   * Defines what is ultimately exported by the single-file representation of
   * this module.
   * @param {function} include The 'include' function to be used to get whatever
   *   object/class that needs to be exported in the window object ( if running in
   *   the browser ), or the module.exports object ( if running in NodeJS )
   */
  function defineExports(include) {

    /**
     * @fileoverview This files defines the SDK that will be exported in the
     * distribution file.
     */
    (function() {
      /**
       * Copy the exported content to the appropriate global object.
       * @param  {object} in_exports The content to be exported.
       */
      function makeExports(in_exports) {
        if (typeof window !== 'undefined') {
          window.Forge = window.Forge || {};
          window.Forge.TUFF = in_exports;
        } else if (typeof require !== 'undefined') {
          module.exports = in_exports;
        }
      }

      // Defines what this module exports publicly.
      makeExports({
        processTUFFDataPackage:           include('LYNX.TUFF.processTUFFDataPackage'),
        extractTUFFDataHeaderInformation: include('LYNX.TUFF.extractTUFFDataHeaderInformation'),
        TUFFStreamExtractor:              include('LYNX.TUFF.TUFFStreamExtractor'),
        THREEMeshGenerator:               include('LYNX.TUFF.THREEMeshGenerator'),
        THREEFromDecodedTUFF:             include('LYNX.TUFF.THREEFromDecodedTUFF'),
        THREEFromEncodedTUFF:             include('LYNX.TUFF.THREEFromEncodedTUFF'),
        THREEFromRemoteTUFF:              include('LXNX.TUFF.THREEFromRemoteTUFF')
      });
    })();


  }


  main();
})();
