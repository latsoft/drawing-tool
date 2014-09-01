var SelectionTool     = require('scripts/tools/select-tool');
var LineTool          = require('scripts/tools/shape-tools/line-tool');
var BasicShapeTool    = require('scripts/tools/shape-tools/basic-shape-tool');
var FreeDrawTool      = require('scripts/tools/shape-tools/free-draw');
var TextTool          = require('scripts/tools/shape-tools/text-tool');
var DeleteTool        = require('scripts/tools/delete-tool');
var CloneTool         = require('scripts/tools/clone-tool');
var UIManager         = require('scripts/ui/ui-manager');
var UndoRedo          = require('scripts/undo-redo');
var rescale2resize    = require('scripts/fabric-extensions/rescale-2-resize');
var multitouchSupport = require('scripts/fabric-extensions/multi-touch-support');

var DEF_OPTIONS = {
  width: 800,
  height: 600
};

var DEF_STATE = {
  stroke: '#333',
  strokeWidth: 8,
  fill: ""
};

var EVENTS = {
  STATE_CHANGED:   'state:changed',
  TOOL_CHANGED:    'tool:changed',
  UNDO_POSSIBLE:   'undo:possible',
  UNDO_IMPOSSIBLE: 'undo:impossible',
  REDO_POSSIBLE:   'redo:possible',
  REDO_IMPOSSIBLE: 'redo:impossible'
};

// Note that some object properties aren't serialized by default by FabricJS.
// List them here so they can be serialized.
var ADDITIONAL_PROPS_TO_SERIALIZE = ['lockUniScaling'];

/**
 * DrawingTool Constructor
 * This does the work of initializing the entire webapp. It constructs the
 * `DrawingTool` as well as the fabric.js canvas and UI.
 *
 * parameters:
 *  - selector: this is the selector for the div of where the DrawingTool will be housed
 *  - options: custom width and height for the drawTool canvas (see `DEF_OPTIONS` above)
 *  - settings: settings for starting state (see `DEF_STATE` above)
 */
function DrawingTool(selector, options, settings) {
  this.selector = selector;

  this.options = $.extend(true, {}, DEF_OPTIONS, options);
  this.state = $.extend(true, {}, DEF_STATE, settings);

  this._dispatch = new EventEmitter2({
    wildcard: true,
    newListener: false,
    maxListeners: 100,
    delimiter: ':'
  });

  this._initDOM();
  this._initFabricJS();
  this._initTools();

  this._history = new UndoRedo(this);

  new UIManager(this);

  // Apply a fix that changes native FabricJS rescaling behavior into resizing.
  rescale2resize(this.canvas);
  // Adds support for multitouch support (pinching resize, two finger rotate, etc)
  multitouchSupport(this.canvas);

  // Note that at the beginning we will emmit two events - state:changed and tool:changed.
  this._fireStateChange();
  this.chooseTool('select');
  this.pushToHistory();
}

DrawingTool.prototype.ADDITIONAL_PROPS_TO_SERIALIZE = ADDITIONAL_PROPS_TO_SERIALIZE;

/**
 * Clears all objects from the fabric canvas and can also clear the background image
 *
 * parameters:
 *  - clearBackground: if true, this function will also remove the background image
 */
DrawingTool.prototype.clear = function (clearBackground) {
  this.canvas.clear();
  if (clearBackground) {
    this.canvas.setBackgroundImage(null);
  }
  this.canvas.renderAll();
  this.pushToHistory();
};

/**
 * Deselects any selected objects and re-renders the fabricjs canvas
 */
DrawingTool.prototype.clearSelection = function () {
  // Important! It will cause that all custom control points will be removed (e.g. for lines).
  this.canvas.deactivateAllWithDispatch();
  this.canvas.renderAll();
};

/**
 * Saves the current state of the fabricjs canvas into a JSON format.
 * (used in conjunction with `load()`)
 */
DrawingTool.prototype.save = function () {
  var selection = this.getSelection();
  // It ensures that all custom control points will be removed before serialization!
  this.clearSelection();
  var result = JSON.stringify({
    dt: {
      // Drawing Tool specific options.
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight()
    },
    canvas: this.canvas.toJSON(ADDITIONAL_PROPS_TO_SERIALIZE)
  });
  this.select(selection);
  return result;
};

/*
 * Loads a previous state of the fabricjs canvas from JSON.
 * (used in conjunction with `save()`)
 *
 * parameters:
 *  - jsonString: JSON data
 *  - callback: function invoked when load is finished
 *  - noHistoryUpdate: if true, this action won't be saved in undo / redo history
 */
DrawingTool.prototype.load = function (jsonString, callback, noHistoryUpdate) {
  if (!jsonString) {
    return;
  }

  var state = JSON.parse(jsonString);

  // Process Drawing Tool specific options.
  var dtState = state.dt;
  this.canvas.setDimensions({
    width: dtState.width,
    height: dtState.height
  });

  // Load FabricJS state.
  var loadDef = $.Deferred();
  var bgImgDef = $.Deferred();
  // Note that we remove background definition before we call #loadFromJSON
  // and then add the same background manually. Otherwise, the background
  // won't be loaded due to CORS error (FabricJS bug?).
  var canvasState = state.canvas;
  var backgroundImage = canvasState.backgroundImage;
  delete canvasState.backgroundImage;
  this.canvas.loadFromJSON(canvasState, loadDef.resolve.bind(loadDef));
  if (backgroundImage !== undefined) {
    var imageSrc = backgroundImage.src;
    delete backgroundImage.src;
    this._setBackgroundImage(imageSrc, backgroundImage, bgImgDef.resolve.bind(bgImgDef));
  } else {
    this._setBackgroundImage(null, null, bgImgDef.resolve.bind(bgImgDef));
  }

  // Call load finished callback when both loading from JSON and separate background
  // loading process are done.
  $.when(loadDef, bgImgDef).done(function () {
    // We don't serialize selectable property which depends on currently selected tool.
    // Currently objects should be selectable only if select tool is active.
    this.tools.select.setSelectable(this.tools.select.active);
    if (!noHistoryUpdate) {
      this.pushToHistory();
    }
    if (typeof callback === 'function') {
      callback();
    }
  }.bind(this));
};

DrawingTool.prototype.pushToHistory = function () {
  this._history.saveState();
  this._fireHistoryEvents();
};

DrawingTool.prototype.undo = function () {
  this._history.undo();
  this._fireHistoryEvents();
};

DrawingTool.prototype.redo = function () {
  this._history.redo();
  this._fireHistoryEvents();
};

DrawingTool.prototype.resetHistory = function () {
  this._history.reset();
  // Push the "initial" state.
  this.pushToHistory();
};

DrawingTool.prototype._fireHistoryEvents = function () {
  if (this._history.canUndo()) {
    this._dispatch.emit(EVENTS.UNDO_POSSIBLE);
  } else {
    this._dispatch.emit(EVENTS.UNDO_IMPOSSIBLE);
  }
  if (this._history.canRedo()) {
    this._dispatch.emit(EVENTS.REDO_POSSIBLE);
  } else {
    this._dispatch.emit(EVENTS.REDO_IMPOSSIBLE);
  }
};

/**
 * Sets the stroke color for new shapes and fires a `stateEvent` to signal a
 * change in the stroke color.
 *
 * parameters:
 *  - color: can be in any web-friendly format
 *          ex: literal-'black', hex-'#444444', or rgba-'rgba(100,200,200,.75)'
 */
DrawingTool.prototype.setStrokeColor = function (color) {
  this.state.stroke = color;
  this._fireStateChange();
};

/**
 * Sets the stroke width for new shapes and fires a `stateEvent` to signal a
 * change in the stroke width. This is also the font size for the text tool.
 *
 * parameters:
 *  - width: integer for the desired width
 */
DrawingTool.prototype.setStrokeWidth = function (width) {
  this.state.strokeWidth = width;
  this._fireStateChange();
};

/**
 * Sets the fill color for new shapes and fires a `stateEvent` to signal a
 * change in the fill color.
 *
 * parameters:
 *  - color: can be in any web-friendly format
 *          ex: literal-'black', hex-'#444444', or rgba-'rgba(100,200,200,.75)'
 */
DrawingTool.prototype.setFillColor = function (color) {
  this.state.fill = color;
  this._fireStateChange();
};

DrawingTool.prototype.setSelectionStrokeColor = function (color) {
  if (!this.getSelection()) return;
  this.forEachSelectedObject(function (obj) {
    this._setObjectProp(obj, 'stroke', color);
  }.bind(this));
  this.canvas.renderAll();
  this.pushToHistory();
};

DrawingTool.prototype.setSelectionFillColor = function (color) {
  if (!this.getSelection()) return;
  this.forEachSelectedObject(function (obj) {
    this._setObjectProp(obj, 'fill', color);
  }.bind(this));
  this.canvas.renderAll();
  this.pushToHistory();
};

DrawingTool.prototype.setSelectionStrokeWidth = function (width) {
  if (!this.getSelection()) return;
  this.forEachSelectedObject(function (obj) {
    this._setObjectProp(obj, 'strokeWidth', width);
  }.bind(this));
  this.canvas.renderAll();
  this.pushToHistory();
};

DrawingTool.prototype.sendSelectionToFront = function () {
  if (!this.getSelection()) return;
  this._sendSelectionTo('front');
  this.pushToHistory();
};

DrawingTool.prototype.sendSelectionToBack = function () {
  if (!this.getSelection()) return;
  this._sendSelectionTo('back');
  this.pushToHistory();
};

DrawingTool.prototype.forEachSelectedObject = function (callback) {
  if (this.canvas.getActiveObject()) {
    callback(this.canvas.getActiveObject());
  } else if (this.canvas.getActiveGroup()) {
    this.canvas.getActiveGroup().objects.forEach(callback);
  }
};

DrawingTool.prototype._setObjectProp = function (object, type, value) {
  if (object.type === 'i-text') {
    // Special case for text. We assume that text color is defined by 'stroke', not fill.
    if (type === 'stroke') {
      type = 'fill';
    } else if (type === 'fill') {
      return;
    } else if (type === 'strokeWidth') {
      type = 'fontSize';
      value = value * 4;
    }
  }
  object.set(type, value);
};

DrawingTool.prototype._sendSelectionTo = function (where) {
  if (this.canvas.getActiveObject()) {
    // Simple case, only a single object is selected.
    send(this.canvas.getActiveObject());
  } else if (this.canvas.getActiveGroup()) {
    // Yes, this is overcomplicated, however FabricJS cannot handle
    // sending a group to front or back. We need to remove selection,
    // send particular objects and recreate selection...
    var objects = this.canvas.getActiveGroup().getObjects();
    this.clearSelection();
    objects.forEach(send);
    this.select(objects);
  }
  function send(obj) {
    // Note that this function handles custom control points defined for lines.
    // See: line-custom-control-points.js
    if (obj._dt_sourceObj) {
      send(obj._dt_sourceObj);
      return;
    }
    if (where === 'front') {
      obj.bringToFront();
      // Make sure that custom control point are send to front AFTER shape itself.
      if (obj._dt_controlPoints) {
        obj._dt_controlPoints.forEach(function (cp) {
          cp.bringToFront();
        });
      }
    } else {
      // Make sure that custom control point are send to back BEFORE shape itself.
      if (obj._dt_controlPoints) {
        obj._dt_controlPoints.forEach(function (cp) {
          cp.sendToBack();
        });
      }
      obj.sendToBack();
    }
  }
};

/**
 * Set the background image for the fabricjs canvas.
 *
 * parameters:
 *  - imageSrc: string with location of the image
 *  - fit: (string) how to put the image into the canvas
 *        ex: "resizeBackgroundToCanvas" or "resizeCanvasToBackground"
 *  - callback: function which is called when background image is loaded and set.
 */
DrawingTool.prototype.setBackgroundImage = function (imageSrc, fit, callback) {
  this._setBackgroundImage(imageSrc, null, function () {
    switch (fit) {
      case "resizeBackgroundToCanvas": this.resizeBackgroundToCanvas(); break;
      case "resizeCanvasToBackground": this.resizeCanvasToBackground(); break;
      case "shrinkBackgroundToCanvas": this.shrinkBackgroundToCanvas(); break;
    }
    if (typeof callback === 'function') {
      callback();
    }
    this.pushToHistory();
  }.bind(this));
};

DrawingTool.prototype.resizeBackgroundToCanvas = function () {
  if (!this.canvas.backgroundImage) {
    return;
  }
  this.canvas.backgroundImage.set({
    width: this.canvas.width,
    height: this.canvas.height
  });
  this.canvas.renderAll();
};

// Fits background to canvas (keeping original aspect ratio) only when background is bigger than canvas.
DrawingTool.prototype.shrinkBackgroundToCanvas = function () {
  if (!this.canvas.backgroundImage) {
    return;
  }
  var bgImg = this.canvas.backgroundImage;
  var widthRatio  = this.canvas.width / bgImg.width;
  var heightRatio = this.canvas.height / bgImg.height;
  var minRatio    = Math.min(widthRatio, heightRatio);
  if (minRatio < 1) {
    bgImg.set({
      width:  bgImg.width * minRatio,
      height: bgImg.height * minRatio
    });
    this.canvas.renderAll();
  }
};

DrawingTool.prototype.resizeCanvasToBackground = function () {
  if (!this.canvas.backgroundImage) {
    return;
  }
  this.canvas.setDimensions({
    width: this.canvas.backgroundImage.width,
    height: this.canvas.backgroundImage.height
  });
  this.canvas.backgroundImage.set({
    top: this.canvas.height / 2,
    left: this.canvas.width / 2
  });
  this.canvas.renderAll();
};

/**
 * Calculates canvas element offset relative to the document.
 * Call this method when Drawing Tool container position is updated.
 * This method is attached as "resize" event handler of window (by FabricJS itself).
 */
DrawingTool.prototype.calcOffset = function () {
  this.canvas.calcOffset();
};

/**
 * Changes the current tool.
 *
 * parameters:
 *  - toolSelector: selector for the tool as sepecified in the contruction of the tool
 */
DrawingTool.prototype.chooseTool = function (toolSelector) {
  var newTool = this.tools[toolSelector];
  if (!newTool) {
    return;
  }

  if (this.currentTool !== undefined &&
      this.currentTool.selector === toolSelector) {
    // Some tools may implement .activateAgain() method and
    // enable some special behavior.
    this.currentTool.activateAgain();
    return;
  }

  if (newTool.singleUse === true) {
    // special single use tools should not be set as the current tool
    newTool.use();
    return;
  }

  // activate and deactivate the new and old tools
  if (this.currentTool !== undefined) {
    this.currentTool.setActive(false);
  }

  this.currentTool = newTool;
  this.currentTool.setActive(true);

  this._dispatch.emit(EVENTS.TOOL_CHANGED, toolSelector);

  this.canvas.renderAll();
};

/**
 * Changing the current tool out of this current tool to the default tool
 * aka 'select' tool
 */
DrawingTool.prototype.changeOutOfTool = function () {
  this.chooseTool('select');
};


DrawingTool.prototype.on = function () {
  this._dispatch.on.apply(this._dispatch, arguments);
};

DrawingTool.prototype.off = function (name, handler) {
  this._dispatch.off.apply(this._dispatch, arguments);
};

/**
 * Selects passed object or array of objects.
 */
DrawingTool.prototype.select = function (objectOrObjects) {
  if (!objectOrObjects) {
    return;
  }
  if (objectOrObjects.length === 1) {
    objectOrObjects = objectOrObjects[0];
  }
  if (!objectOrObjects.length) {
    // Simple scenario, select a single object.
    this.canvas.setActiveObject(objectOrObjects);
    return;
  }
  // More complex case, create a group and select it.
  var group = new fabric.Group(objectOrObjects, {
    originX: 'center',
    originY: 'center',
    canvas: this.canvas
  });
  // Important! E.g. ensures that outlines around objects are visible.
  group.addWithUpdate();
  this.canvas.setActiveGroup(group);
};

/**
 * Returns selected object or array of selected objects.
 */
DrawingTool.prototype.getSelection = function () {
  var actGroup = this.canvas.getActiveGroup();
  if (actGroup) {
    return actGroup.getObjects();
  }
  var actObject = this.canvas.getActiveObject();
  return actObject && actObject.isControlPoint ? actObject._dt_sourceObj : actObject;
};

DrawingTool.prototype._fireStateChange = function () {
  this._dispatch.emit(EVENTS.STATE_CHANGED, this.state);
};

DrawingTool.prototype._setBackgroundImage = function (imageSrc, options, backgroundLoadedCallback) {
  options = options || {
    originX: 'center',
    originY: 'center',
    top: this.canvas.height / 2,
    left: this.canvas.width / 2,
    crossOrigin: 'anonymous'
  };
  var self = this;

  if (!imageSrc) {
    // Fast path when we remove background image.
    this.canvas.setBackgroundImage(null, bgLoaded);
  } else {
    loadImage();
  }

  function loadImage() {
    // Note we cannot use fabric.Image.fromURL, as then we would always get
    // fabric.Image instance and we couldn't guess whether load failed or not.
    // util.loadImage provides null to callback when loading fails.
    fabric.util.loadImage(imageSrc, callback, null, options.crossOrigin);
  }
  function callback (img) {
    // If image is null and crossOrigin settings are available, it probably means that loading failed
    // due to lack of CORS headers. Try again without them.
    if ((options.crossOrigin === 'anonymous' || options.crossOrigin === '') && !img) {
      options = $.extend(true, {}, options);
      delete options.crossOrigin;
      console.log('Background could not be loaded due to lack of CORS headers. Trying to load it again without CORS support.');
      loadImage();
      return;
    }
    self.canvas.setBackgroundImage(new fabric.Image(img, options), bgLoaded);
  }
  function bgLoaded() {
    if (typeof backgroundLoadedCallback === 'function') {
      backgroundLoadedCallback();
    }
    self.canvas.renderAll();
  }
};

DrawingTool.prototype._initTools = function () {
  // Initialize all the tools, they add themselves to the tools hash.
  this.tools = {
    select:      new SelectionTool("Selection Tool", this),
    line:        new LineTool("Line Tool", this),
    arrow:       new LineTool("Arrow Tool", this, "arrow"),
    doubleArrow: new LineTool("Double Arrow Tool", this, "arrow", {doubleArrowhead: true}),
    rect:        new BasicShapeTool("Rectangle Tool", this, "rect"),
    ellipse:     new BasicShapeTool("Ellipse Tool", this, "ellipse"),
    square:      new BasicShapeTool("Square Tool", this, "square"),
    circle:      new BasicShapeTool("Circle Tool", this, "circle"),
    free:        new FreeDrawTool("Free Draw Tool", this),
    text:        new TextTool("Text Tool", this),
    trash:       new DeleteTool("Delete Tool", this),
    clone:       new CloneTool("Clone Tool", this)
  };
};

DrawingTool.prototype._initDOM = function () {
  $(this.selector).empty();
  this.$element = $('<div class="dt-container">')
    .appendTo(this.selector);
  var $canvasContainer = $('<div class="dt-canvas-container">')
    .attr('tabindex', 0) // makes the canvas focusable for keyboard events
    .appendTo(this.$element);
  this.$canvas = $('<canvas>')
    .attr('width', this.options.width + 'px')
    .attr('height', this.options.height + 'px')
    .appendTo($canvasContainer);
};

DrawingTool.prototype._initFabricJS = function () {
  this.canvas = new fabric.Canvas(this.$canvas[0]);
  // Target find would be more tolerant on touch devices.
  if (fabric.isTouchSupported) {
    this.canvas.perPixelTargetFind = false;
  } else {
    this.canvas.perPixelTargetFind = true;
    this.canvas.targetFindTolerance = 12;
  }
  this.canvas.setBackgroundColor("#fff");
  this._setupHDPISupport();
};

DrawingTool.prototype._setupHDPISupport = function () {
  // devicePixelRatio may be undefined in old browsers.
  var pixelRatio = window.devicePixelRatio || 1;
  if (pixelRatio !== 1) {
    var canvEl = this.canvas.getElement();
    var w = canvEl.width;
    var h = canvEl.height;
    $(canvEl)
      .attr('width',  w * pixelRatio)
      .attr('height', h * pixelRatio)
      .css('width',   w)
      .css('height',  h);
    canvEl.getContext('2d').scale(pixelRatio, pixelRatio);
  }
};

module.exports = DrawingTool;
