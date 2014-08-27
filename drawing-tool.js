!function(){"use strict";var t="undefined"!=typeof window?window:global;if("function"!=typeof t.require){var e={},i={},s=function(t,e){return{}.hasOwnProperty.call(t,e)},o=function(t,e){var i,s,o=[];i=/^\.\.?(\/|$)/.test(e)?[t,e].join("/").split("/"):e.split("/");for(var n=0,r=i.length;r>n;n++)s=i[n],".."===s?o.pop():"."!==s&&""!==s&&o.push(s);return o.join("/")},n=function(t){return t.split("/").slice(0,-1).join("/")},r=function(e){return function(i){var s=n(e),r=o(s,i);return t.require(r,e)}},a=function(t,e){var s={id:t,exports:{}};return i[t]=s,e(s.exports,r(t),s),s.exports},c=function(t,n){var r=o(t,".");if(null==n&&(n="/"),s(i,r))return i[r].exports;if(s(e,r))return a(r,e[r]);var c=o(r,"./index");if(s(i,c))return i[c].exports;if(s(e,c))return a(c,e[c]);throw new Error('Cannot find module "'+t+'" from "'+n+'"')},l=function(t,i){if("object"==typeof t)for(var o in t)s(t,o)&&(e[o]=t[o]);else e[t]=i},h=function(){var t=[];for(var i in e)s(e,i)&&t.push(i);return t};t.require=c,t.require.define=l,t.require.register=l,t.require.list=h,t.require.brunch=!0}}(),require.register("scripts/drawing-tool",function(t,e,i){function s(t,e,i){this.selector=t,this.options=$.extend(!0,{},d,e),this.state=$.extend(!0,{},f,i),this._dispatch=new EventEmitter2({wildcard:!0,newListener:!1,maxListeners:100,delimiter:":"}),this._initDOM(),this._initFabricJS(),this._initTools(),new h(this),u(this.canvas),p(this.canvas),this._fireStateChange(),this.chooseTool("select")}var o=e("scripts/tools/select-tool"),n=e("scripts/tools/shape-tools/line-tool"),r=e("scripts/tools/shape-tools/basic-shape-tool"),a=e("scripts/tools/shape-tools/free-draw"),c=e("scripts/tools/shape-tools/text-tool"),l=e("scripts/tools/delete-tool"),h=e("scripts/ui/ui-manager"),u=e("scripts/fabric-extensions/rescale-2-resize"),p=e("scripts/fabric-extensions/multi-touch-support"),d={width:700,height:500},f={stroke:"#333",strokeWidth:8,fill:""},v={STATE_CHANGED:"state:changed",TOOL_CHANGED:"tool:changed"},g=["lockUniScaling"];s.prototype.clear=function(t){this.canvas.clear(),t&&(this.canvas.setBackgroundImage(null),this._backgroundImage=null),this.canvas.renderAll()},s.prototype.clearSelection=function(){this.canvas.deactivateAllWithDispatch(),this.canvas.renderAll()},s.prototype.save=function(){return this.clearSelection(),JSON.stringify({dt:{width:this.canvas.getWidth(),height:this.canvas.getHeight()},canvas:this.canvas.toJSON(g)})},s.prototype.load=function(t){if(!t)return void this.clear(!0);var e=JSON.parse(t),i=e.dt;this.canvas.setDimensions({width:i.width,height:i.height});var s=e.canvas,o=s.backgroundImage;if(delete s.backgroundImage,this.canvas.loadFromJSON(s),void 0!==o){var n=o.src;delete o.src,this._setBackgroundImage(n,o)}this.canvas.renderAll()},s.prototype.setStrokeColor=function(t){this.state.stroke=t,this._fireStateChange()},s.prototype.setStrokeWidth=function(t){this.state.strokeWidth=t,this._fireStateChange()},s.prototype.setFillColor=function(t){this.state.fill=t,this._fireStateChange()},s.prototype.setSelectionStrokeColor=function(t){this._forEverySelectedObject(function(e){this._setObjectProp(e,"stroke",t)}.bind(this)),this.canvas.renderAll()},s.prototype.setSelectionFillColor=function(t){this._forEverySelectedObject(function(e){this._setObjectProp(e,"fill",t)}.bind(this)),this.canvas.renderAll()},s.prototype.setSelectionStrokeWidth=function(t){this._forEverySelectedObject(function(e){this._setObjectProp(e,"strokeWidth",t)}.bind(this)),this.canvas.renderAll()},s.prototype._forEverySelectedObject=function(t){this.canvas.getActiveObject()?t(this.canvas.getActiveObject()):this.canvas.getActiveGroup()&&this.canvas.getActiveGroup().objects.forEach(t)},s.prototype._setObjectProp=function(t,e,i){if("i-text"===t.type)if("stroke"===e)e="fill";else{if("fill"===e)return;"strokeWidth"===e&&(e="fontSize",i=4*i)}t.set(e,i)},s.prototype.setBackgroundImage=function(t,e){var i=this;this._setBackgroundImage(t,null,function(){switch(e){case"resizeBackgroundToCanvas":return void i.resizeBackgroundToCanvas();case"resizeCanvasToBackground":return void i.resizeCanvasToBackground()}})},s.prototype.resizeBackgroundToCanvas=function(){this._backgroundImage&&(this._backgroundImage.set({width:this.canvas.width,height:this.canvas.height}),this.canvas.renderAll())},s.prototype.resizeCanvasToBackground=function(){this._backgroundImage&&(this.canvas.setDimensions({width:this._backgroundImage.width,height:this._backgroundImage.height}),this._backgroundImage.set({top:this.canvas.height/2,left:this.canvas.width/2}),this.canvas.renderAll())},s.prototype.calcOffset=function(){this.canvas.calcOffset()},s.prototype.chooseTool=function(t){var e=this.tools[t];if(e){if(void 0!==this.currentTool&&this.currentTool.selector===t)return void this.currentTool.activateAgain();if(e.singleUse===!0)return void e.use();void 0!==this.currentTool&&this.currentTool.setActive(!1),this.currentTool=e,this.currentTool.setActive(!0),this._dispatch.emit(v.TOOL_CHANGED,t),this.canvas.renderAll()}},s.prototype.changeOutOfTool=function(){this.chooseTool("select")},s.prototype.on=function(){this._dispatch.on.apply(this._dispatch,arguments)},s.prototype.off=function(){this._dispatch.off.apply(this._dispatch,arguments)},s.prototype._fireStateChange=function(){this._dispatch.emit(v.STATE_CHANGED,this.state)},s.prototype._setBackgroundImage=function(t,e,i){function s(){fabric.util.loadImage(t,o,null,e.crossOrigin)}function o(t){return"anonymous"!==e.crossOrigin&&""!==e.crossOrigin||t?(t=new fabric.Image(t,e),n.canvas.setBackgroundImage(t,n.canvas.renderAll.bind(n.canvas)),n._backgroundImage=t,void("function"==typeof i&&i())):(e=$.extend(!0,{},e),delete e.crossOrigin,console.log("Background could not be loaded due to lack of CORS headers. Trying to load it again without CORS support."),void s())}e=e||{originX:"center",originY:"center",top:this.canvas.height/2,left:this.canvas.width/2,crossOrigin:"anonymous"},s();var n=this},s.prototype._initTools=function(){this.tools={select:new o("Selection Tool",this),line:new n("Line Tool",this),arrow:new n("Arrow Tool",this,"arrow"),doubleArrow:new n("Double Arrow Tool",this,"arrow",{doubleArrowhead:!0}),rect:new r("Rectangle Tool",this,"rect"),ellipse:new r("Ellipse Tool",this,"ellipse"),square:new r("Square Tool",this,"square"),circle:new r("Circle Tool",this,"circle"),free:new a("Free Draw Tool",this),text:new c("Text Tool",this),trash:new l("Delete Tool",this)}},s.prototype._initDOM=function(){$(this.selector).empty(),this.$element=$('<div class="dt-container">').appendTo(this.selector);var t=$('<div class="dt-canvas-container">').attr("tabindex",0).appendTo(this.$element);this.$canvas=$("<canvas>").attr("width",this.options.width+"px").attr("height",this.options.height+"px").appendTo(t)},s.prototype._initFabricJS=function(){this.canvas=new fabric.Canvas(this.$canvas[0]),fabric.isTouchSupported?this.canvas.perPixelTargetFind=!1:(this.canvas.perPixelTargetFind=!0,this.canvas.targetFindTolerance=12),this.canvas.setBackgroundColor("#fff")},i.exports=s}),require.register("scripts/fabric-extensions/arrow",function(){!function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend;return e.Arrow?void e.warn("fabric.Arrow is already defined"):(e.Arrow=e.util.createClass(e.Line,{type:"arrow",doubleArrowhead:!1,_render:function(t){t.beginPath();var e=this.group&&"path-group"===this.group.type;if(e&&!this.transformMatrix){var i=this.getCenterPoint();t.translate(-this.group.width/2+i.x,-this.group.height/2+i.y)}if(!this.strokeDashArray){var s,o=this.x1<=this.x2?-1:1,n=this.y1<=this.y2?-1:1,r=1===this.width?0:o*this.width/2,a=1===this.height?0:n*this.height/2,c=1===this.width?0:-1*o*this.width/2,l=1===this.height?0:-1*n*this.height/2,h=c-r,u=l-a,p=Math.sqrt(h*h+u*u),d=.5*this.strokeWidth,f=Math.min(3*d,p*(this.doubleArrowhead?.21:.35)),v=2*f*h/p,g=2*f*u/p,m=c-v,b=l-g,y=c-1.1*v,w=l-1.1*g;if(this.doubleArrowhead){var C=r+v,k=a+g,_=r+1.1*v,x=a+1.1*g;s=[this._perpCoords(r,a,c,l,C,k,d,1),this._perpCoords(r,a,c,l,_,x,f,1),[r,a],this._perpCoords(r,a,c,l,_,x,f,-1),this._perpCoords(r,a,c,l,C,k,d,-1)]}else s=[this._perpCoords(r,a,c,l,r,a,.5*d,1),this._perpCoords(r,a,c,l,r,a,.5*d,-1)];s.push(this._perpCoords(r,a,c,l,m,b,d,-1),this._perpCoords(r,a,c,l,y,w,f,-1),[c,l],this._perpCoords(r,a,c,l,y,w,f,1),this._perpCoords(r,a,c,l,m,b,d,1)),t.moveTo(s[0][0],s[0][1]),s.forEach(function(e){t.lineTo(e[0],e[1])})}if(this.stroke){var T=t.fillStyle;t.fillStyle=this.stroke,this._renderFill(t),t.fillStyle=T}},_perpCoords:function(t,e,i,s,o,n,r,a){var c=i-t,l=s-e,h=r/Math.sqrt(c*c+l*l);return[o+h*-l*a,n+h*c*a]},toObject:function(t){return i(this.callSuper("toObject",t),{doubleArrowhead:this.get("doubleArrowhead")})}}),e.Arrow.ATTRIBUTE_NAMES=e.SHARED_ATTRIBUTES.concat("x1 y1 x2 y2".split(" ")),e.Arrow.fromElement=function(t,s){var o=e.parseAttributes(t,e.Line.ATTRIBUTE_NAMES),n=[o.x1||0,o.y1||0,o.x2||0,o.y2||0];return new e.Arrow(n,i(o,s))},void(e.Arrow.fromObject=function(t){var i=[t.x1,t.y1,t.x2,t.y2];return new e.Arrow(i,t)}))}(this)}),require.register("scripts/fabric-extensions/line-custom-control-points",function(t,e,i){function s(t){if(!t.lineCustomControlPointsEnabled){var e=null;t.on("object:selected",function(t){var i=t.target;e&&n(e)&&!o(i,e)&&a.call(e),o(i,e)||(e=i,n(i)&&r.call(i))}),t.on("selection:cleared",function(){e&&n(e)&&a.call(e),e=null}),t.lineCustomControlPointsEnabled=!0}}function o(t,e){return e&&e.ctp&&(e.ctp[0]===t||e.ctp[1]===t)}function n(t){for(var e=0;e<g.length;e++)if(t.type===g[e])return!0;return!1}function r(){this.set({hasControls:!1,hasBorders:!1});var t=s.cornerSize;this.ctp=[v(t,this,0),v(t,this,1)],p.call(this),this.on("moving",c),this.on("removed",l),this.canvas.renderAll()}function a(){this.ctp[0].line=null,this.ctp[1].line=null,this.ctp[0].remove(),this.ctp[1].remove(),this.ctp=void 0,this.off("moving"),this.off("removed")}function c(){p.call(this)}function l(){this.ctp&&this.ctp[0].remove()}function h(){var t=this.line;t.set("x"+(this.id+1),this.left),t.set("y"+(this.id+1),this.top),t.setCoords(),t.canvas.renderAll()}function u(){var t=this.line;if(t){var e;e=t.ctp[0]!==this?t.ctp[0]:t.ctp[1],e.line=null,e.remove(),t.remove()}}function p(){d.call(this),f.call(this),this.ctp[0].set("left",this.get("x1")),this.ctp[0].set("top",this.get("y1")),this.ctp[1].set("left",this.get("x2")),this.ctp[1].set("top",this.get("y2")),this.ctp[0].setCoords(),this.ctp[1].setCoords()}function d(){var t=this.get("x1")+.5*(this.get("x2")-this.get("x1")),e=this.get("y1")+.5*(this.get("y2")-this.get("y1")),i=this.left-t,s=this.top-e;this.set("x1",i+this.x1),this.set("y1",s+this.y1),this.set("x2",i+this.x2),this.set("y2",s+this.y2)}function f(){function t(t,e,i,s,o){var n=Math.cos(o),r=Math.sin(o);return[n*(t-i)-r*(e-s)+i,r*(t-i)+n*(e-s)+s]}if(0!==this.get("angle")){var e=this.get("angle")/180*Math.PI,i=this.get("left"),s=this.get("top"),o=t(this.get("x1"),this.get("y1"),i,s,e),n=t(this.get("x2"),this.get("y2"),i,s,e);this.set({x1:o[0],y1:o[1],x2:n[0],y2:n[1],angle:0})}}function v(t,e,i){var o=new fabric.Rect({width:t,height:t,strokeWidth:0,stroke:s.controlPointColor,fill:s.controlPointColor,hasControls:!1,hasBorders:!1,originX:"center",originY:"center",line:e,id:i});return e.canvas.add(o),o.on("moving",h),o.on("removed",u),o}var g=["line","arrow"];s.controlPointColor="#bcd2ff",s.cornerSize=12,i.exports=s}),require.register("scripts/fabric-extensions/multi-touch-support",function(t,e,i){i.exports=function(t){function e(t){return"line"===t.type||"arrow"===t.type}function i(){return t.getActiveObject()||t.getActiveGroup()}function s(t,e){t.set({lockMovementX:e,lockMovementY:e,lockScalingX:e,lockScalingY:e})}function o(e,i,s){t.fire("object:"+i,{target:e,e:s}),e.fire(i,{e:s})}function n(t){u=t.originX,p=t.originY;var e=t.getCenterPoint();t.originX="center",t.originY="center",t.left=e.x,t.top=e.y}function r(t){var e=t.translateToOriginPoint(t.getCenterPoint(),u,p);t.originX=u,t.originY=p,t.left=e.x,t.top=e.y}if("undefined"!=typeof Hammer&&fabric.isTouchSupported){var a=new Hammer.Manager(t.upperCanvasEl);a.add(new Hammer.Pinch);var c,l,h,u,p;a.on("pinchstart",function(){var t=i();t&&!e(t)&&(s(t,!0),c=t.get("angle"),l=t.get("scaleX"),h="center"!==t.originX||"center"!==t.originY,h&&n(t))}),a.on("pinchmove",function(t){var s=i();s&&!e(s)&&(s.set({scaleX:t.scale*l,scaleY:t.scale*l,angle:c+t.rotation}),o(s,"scaling",t.srcEvent),o(s,"rotating",t.srcEvent),s.get("scaleX")!==t.scale*l&&(l=1/t.scale))}),a.on("pinchend",function(){var t=i();t&&!e(t)&&(h&&r(t),s(t,!1))})}}}),require.register("scripts/fabric-extensions/rescale-2-resize",function(t,e,i){function s(t){t.width=t.width*t.scaleX+t.strokeWidth*(t.scaleX-1),t.height=t.height*t.scaleY+t.strokeWidth*(t.scaleY-1),t.scaleX=1,t.scaleY=1}var o=(e("scripts/tools/shape-tools/line-tool"),{rect:function(t){s(t)},ellipse:function(t){s(t),t.rx=Math.abs(t.width/2),t.ry=Math.abs(t.height/2)},line:function(t){s(t),t.x1>t.x2?(t.x1=t.left+t.width,t.x2=t.left):(t.x2=t.left+t.width,t.x1=t.left),t.y1>t.y2?(t.y1=t.top+t.height,t.y2=t.top):(t.y2=t.top+t.height,t.y1=t.top)},arrow:function(t){this.line(t)},path:function(t){for(var e=0;e<t.path.length;e++)t.path[e][1]*=t.scaleX,t.path[e][2]*=t.scaleY,t.path[e][3]*=t.scaleX,t.path[e][4]*=t.scaleY;s(t)}}),n=$.extend(!0,{},o,{"i-text":function(t){t.set({fontSize:t.get("fontSize")*t.get("scaleX"),strokeWidth:t.get("strokeWidth")*t.get("scaleX"),scaleX:1,scaleY:1}),t.setCoords()}});i.exports=function(t){t.on("object:scaling",function(t){var e=t.target,i=e.type;o[i]&&o[i](e)}),t.on("object:modified",function(t){var e=t.target,i=e.type;1===e.scaleX&&1===e.scaleY||!n[i]||n[i](e)}),fabric.Group.prototype.lockUniScaling=!0,t.on("before:selection:cleared",function(t){var e=t.target;if("group"===e.type&&1!==e.scaleX)for(var i,s=e.scaleX,o=e.getObjects(),r=0;r<o.length;r++)void 0!==n[o[r].type]&&(i=o[r].strokeWidth,o[r].strokeWidth=0,o[r].scaleX=s,o[r].scaleY=s,n[o[r].type](o[r]),o[r].strokeWidth=i*s,o[r].scaleX=1/s,o[r].scaleY=1/s)})}}),require.register("scripts/inherit",function(t,e,i){i.exports=function(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,t.super=e.prototype}}),require.register("scripts/jquery-longpress",function(){!function(t){t.fn.longPress=function(e,i){return this.on("mousedown touchstart",function(s){var o;o=setTimeout(function(){e.call(this,s)},i||150),t(window).one("mouseup touchend touchcancel touchleave",function(){clearTimeout(o)})})}}(jQuery)}),require.register("scripts/tool",function(t,e,i){function s(t,e){this.name=t||"Tool",this.master=e,this.canvas=e.canvas,this.active=!1,this.singleUse=!1,this._listeners=[],this._stateListeners=[]}s.prototype.setActive=function(t){return this.singleUse?void console.warn("This is a single use tool. It was not activated."):this.active===t?t:(this.active=t,t===!0?this.activate():this.deactivate(),t)},s.prototype.activate=function(){for(var t=0;t<this._listeners.length;t++){var e=this._listeners[t].trigger,i=this._listeners[t].action;this.canvas.on(e,i)}},s.prototype.activateAgain=function(){},s.prototype.use=function(){},s.prototype.deactivate=function(){for(var t=0;t<this._listeners.length;t++){{var e=this._listeners[t].trigger;this._listeners[t].action}this.canvas.off(e)}},s.prototype.addEventListener=function(t,e){this._listeners.push({trigger:t,action:e})},s.prototype.removeEventListener=function(t){for(var e=0;e<this._listeners.length;e++)if(t==this._listeners[e].trigger)return this._listeners.splice(e,1)},i.exports=s}),require.register("scripts/tools/delete-tool",function(t,e,i){function s(t,e){n.call(this,t,e),this.singleUse=!0;var i=this;e.$element.keydown(function(t){8===t.keyCode&&(t.preventDefault(),i.use())})}var o=e("scripts/inherit"),n=e("scripts/tool");o(s,n),s.prototype.use=function(){var t=this.canvas;t.getActiveObject()?t.remove(t.getActiveObject()):t.getActiveGroup()&&(t.getActiveGroup().forEachObject(function(e){t.remove(e)}),t.discardActiveGroup().renderAll())},i.exports=s}),require.register("scripts/tools/select-tool",function(t,e,i){function s(t,e){n.call(this,t,e),this.canvas.on("object:selected",function(t){t.target.set(a),this.canvas.renderAll()}.bind(this)),r.controlPointColor="#bcd2ff",r.cornerSize=a.cornerSize}var o=e("scripts/inherit"),n=e("scripts/tool"),r=e("scripts/fabric-extensions/line-custom-control-points"),a={cornerSize:fabric.isTouchSupported?22:12,transparentCorners:!1};o(s,n),s.BASIC_SELECTION_PROPERTIES=a,s.prototype.activate=function(){s.super.activate.call(this),this.setSelectable(!0),this.selectLastObject()},s.prototype.deactivate=function(){s.super.deactivate.call(this),this.setSelectable(!1),this.canvas.deactivateAllWithDispatch()},s.prototype.setSelectable=function(t){this.canvas.selection=t;for(var e=this.canvas.getObjects(),i=e.length-1;i>=0;i--)e[i].selectable=t},s.prototype.selectLastObject=function(){var t=this.canvas.getObjects();t.length>0&&this.canvas.setActiveObject(t[t.length-1])},i.exports=s}),require.register("scripts/tools/shape-tool",function(t,e,i){function s(t,e){n.call(this,t,e);var i=this;this.addEventListener("mouse:down",function(t){i.mouseDown(t)}),this.addEventListener("mouse:move",function(t){i.mouseMove(t)}),this.addEventListener("mouse:up",function(t){i.mouseUp(t)}),this.down=!1,this._firstAction=!1,this._locked=!0}{var o=e("scripts/inherit"),n=e("scripts/tool");e("scripts/util")}o(s,n),s.prototype.minSize=7,s.prototype.defSize=30,s.prototype.activate=function(){s.super.activate.call(this),this.down=!1,this.canvas.defaultCursor="crosshair"},s.prototype.activateAgain=function(){},s.prototype.exit=function(){this.down=!1,this.master.changeOutOfTool(),this.canvas.defaultCursor="default"},s.prototype.mouseDown=function(t){this.down=!0,this._locked||this._firstAction||void 0===t.target||this.exit()},s.prototype.mouseMove=function(){},s.prototype.mouseUp=function(){this.down=!1},s.prototype.actionComplete=function(t){t&&(t.selectable=!this._locked),this._locked||this._firstAction&&(this._firstAction=!1,this._setAllObjectsSelectable(!0))},s.prototype.setCentralOrigin=function(t){var e=t.stroke?t.strokeWidth:0;t.set({left:t.left+(t.width+e)/2,top:t.top+(t.height+e)/2,originX:"center",originY:"center"})},s.prototype._setFirstActionMode=function(){this._firstAction=!0,this._setAllObjectsSelectable(!1)},s.prototype._setAllObjectsSelectable=function(t){for(var e=this.canvas.getObjects(),i=e.length-1;i>=0;i--)e[i].selectable=t},i.exports=s}),require.register("scripts/tools/shape-tools/basic-shape-tool",function(t,e,i){function s(t,e,i){r.call(this,t,e),this._type=a[i],this._shapeKlass=fabric.util.getKlass(this._type.fabricType)}function o(t){return t>=0?1:-1}var n=e("scripts/inherit"),r=e("scripts/tools/shape-tool"),a=(e("scripts/util"),{rect:{fabricType:"rect"},square:{fabricType:"rect",uniform:!0},ellipse:{fabricType:"ellipse",radius:!0},circle:{fabricType:"ellipse",uniform:!0,radius:!0}});n(s,r),s.prototype.mouseDown=function(t){if(s.super.mouseDown.call(this,t),this.active){var e=this.canvas.getPointer(t.e),i=e.x,o=e.y;this.curr=new this._shapeKlass({top:o,left:i,width:0,height:0,selectable:!1,lockUniScaling:this._type.uniform,fill:this.master.state.fill,stroke:this.master.state.stroke,strokeWidth:this.master.state.strokeWidth}),this.canvas.add(this.curr)}},s.prototype.mouseMove=function(t){if(s.super.mouseMove.call(this,t),this.down!==!1){var e=this.canvas.getPointer(t.e),i=e.x-this.curr.left,n=e.y-this.curr.top;this._type.uniform&&(Math.abs(i)<Math.abs(n)?n=Math.abs(i)*o(n):i=Math.abs(n)*o(i)),this.curr.set({width:i,height:n}),this._type.radius&&this.curr.set({rx:Math.abs(i/2),ry:Math.abs(n/2)}),this.canvas.renderAll()}},s.prototype.mouseUp=function(t){s.super.mouseUp.call(this,t),this._processNewShape(this.curr),this.canvas.renderAll(),this.actionComplete(this.curr),this.curr=void 0},s.prototype._processNewShape=function(t){t.width<0&&(t.left=t.left+t.width,t.width=-t.width),t.height<0&&(t.top=t.top+t.height,t.height=-t.height),this.setCentralOrigin(t),Math.max(t.width,t.height)<this.minSize&&(t.set("width",this.defSize),t.set("height",this.defSize),t.set("top",t.get("top")-t.get("height")/2+t.get("strokeWidth")),t.set("left",t.get("left")-t.get("width")/2+t.get("strokeWidth")),this._type.radius&&(t.set("rx",this.defSize/2),t.set("ry",this.defSize/2))),t.setCoords()},i.exports=s}),require.register("scripts/tools/shape-tools/free-draw",function(t,e,i){function s(t,e){n.call(this,t,e);var i=this;i.canvas.freeDrawingBrush.color=this.master.state.stroke,i.canvas.freeDrawingBrush.width=this.master.state.strokeWidth,this.master.on("state:changed",function(){i.canvas.freeDrawingBrush.color=i.master.state.stroke,i.canvas.freeDrawingBrush.width=i.master.state.strokeWidth}),this.addEventListener("mouse:down",function(t){i.mouseDown(t)}),this.addEventListener("mouse:up",function(t){i.mouseUp(t)})}var o=e("scripts/inherit"),n=e("scripts/tools/shape-tool");o(s,n),s.prototype.mouseDown=function(t){s.super.mouseDown.call(this,t),this.active&&(this.canvas.isDrawingMode||(this.canvas.isDrawingMode=!0,this.canvas._onMouseDownInDrawingMode(t.e)))},s.prototype.mouseUp=function(t){var e=this.canvas.getObjects(),i=e[e.length-1];this.curr=i,s.super.mouseUp.call(this,t),this._locked||(this.canvas.isDrawingMode=!1),this.actionComplete(i),this.curr=void 0},s.prototype.deactivate=function(){s.super.deactivate.call(this),this.canvas.isDrawingMode=!1},i.exports=s}),require.register("scripts/tools/shape-tools/line-tool",function(t,e,i){function s(t,e,i,s){n.call(this,t,e),i=i||"line",this._lineKlass=fabric.util.getKlass(i),this._lineOptions=s,a(this.canvas)}var o=e("scripts/inherit"),n=e("scripts/tools/shape-tool"),r=(e("scripts/tools/select-tool"),e("scripts/util")),a=e("scripts/fabric-extensions/line-custom-control-points");e("scripts/fabric-extensions/arrow"),o(s,n),s.prototype.mouseDown=function(t){if(s.super.mouseDown.call(this,t),this.active){var e=this.canvas.getPointer(t.e),i=e.x,o=e.y;this.curr=new this._lineKlass([i,o,i,o],$.extend(!0,{originX:"center",originY:"center",selectable:!1,stroke:this.master.state.stroke,strokeWidth:this.master.state.strokeWidth},this._lineOptions)),this.canvas.add(this.curr)}},s.prototype.mouseMove=function(t){if(s.super.mouseMove.call(this,t),this.down!==!1){var e=this.canvas.getPointer(t.e),i=e.x,o=e.y;this.curr.set("x2",i),this.curr.set("y2",o),this.canvas.renderAll()}},s.prototype.mouseUp=function(t){s.super.mouseUp.call(this,t),this._processNewShape(this.curr),this.canvas.renderAll(),this.actionComplete(this.curr),this.curr=void 0},s.prototype._processNewShape=function(t){var e=t.get("x1"),i=t.get("y1"),s=t.get("x2"),o=t.get("y2");r.dist(e-s,i-o)<this.minSize&&(s=e+this.defSize,o=i+this.defSize,t.set("x2",s),t.set("y2",o)),t.setCoords()},i.exports=s}),require.register("scripts/tools/shape-tools/text-tool",function(t,e,i){function s(t,e){n.call(this,t,e),this.exitTextEditingOnFirstClick()}var o=e("scripts/inherit"),n=e("scripts/tools/shape-tool");o(s,n),s.prototype.mouseDown=function(t){if(!t.target||!t.target.isEditing){s.super.mouseDown.call(this,t);var e=this.canvas.findTarget(t.e);if(e&&"i-text"===e.type)return void this.editText(e,t.e);if(this.active&&!t.e._dt_doNotCreateNewTextObj){var i=this.canvas.getPointer(t.e),o=i.x,n=i.y,r=new fabric.IText("",{left:o,top:n,lockUniScaling:!0,fontFamily:"Arial",fontSize:4*this.master.state.strokeWidth,fill:this.master.state.stroke});this.actionComplete(r),this.canvas.add(r),this.editText(r,t.e)}}},s.prototype.deactivate=function(){s.super.deactivate.call(this),this.exitTextEditing()},s.prototype.exitTextEditing=function(){var t=this.canvas.getActiveObject();t&&t.isEditing&&this.canvas.deactivateAllWithDispatch()},s.prototype.editText=function(t,e){this.canvas.setActiveObject(t),t.enterEditing(),t.setCursorByClick(e),this.exitTextEditingOnFirstClick()},s.prototype.exitTextEditingOnFirstClick=function(){function t(t){if(e.active){var s=i.findTarget(t),o=i.getActiveObject();s!==o&&o&&o.isEditing&&(i.deactivateAllWithDispatch(),t._dt_doNotCreateNewTextObj=!0,o.selectable=!e._locked)}}var e=this,i=this.canvas;i.upperCanvasEl.parentElement.addEventListener("mousedown",t,!0),i.upperCanvasEl.parentElement.addEventListener("touchstart",t,!0)},i.exports=s}),require.register("scripts/ui/basic-button",function(t,e,i){function s(t,e,i){this.ui=e,this.dt=i,this.name=t.name,this.palette=t.palette,this.onInit=t.onInit,this.$element=$("<div>").addClass("dt-btn").addClass(t.classes).appendTo(e.getPalette(t.palette).$element),this.$label=$("<span>").text(t.label).appendTo(this.$element),t.onClick&&this.$element.on("mousedown touchstart",function(s){t.onClick.call(this,s,e,i),s.preventDefault()}.bind(this)),t.onLongPress&&this.$element.longPress(function(s){t.onLongPress.call(this,s,e,i),s.preventDefault()}.bind(this)),t.onStateChange&&i.on("state:changed",function(e){t.onStateChange.call(this,e)}.bind(this)),t.onToolChange&&i.on("tool:changed",function(e){t.onToolChange.call(this,e)}.bind(this)),t.activatesTool&&(this.$element.on("mousedown touchstart",function(e){i.chooseTool(t.activatesTool),e.preventDefault()}.bind(this)),i.on("tool:changed",function(e){e===t.activatesTool?this.$element.addClass("dt-active"):this.$element.removeClass("dt-active")}.bind(this))),t.reflectsTools&&i.on("tool:changed",function(i){-1!==t.reflectsTools.indexOf(i)?(this.setActive(!0),this.setLabel(e.getButton(i).getLabel())):(this.setActive(!1),this.$element.removeClass("dt-active"))}.bind(this))}e("scripts/jquery-longpress"),s.prototype.setLabel=function(t){this.$label.text(t)},s.prototype.getLabel=function(){return this.$label.text()},s.prototype.click=function(){this.$element.mousedown()},s.prototype.setActive=function(t){t?this.$element.addClass("dt-active"):this.$element.removeClass("dt-active")},s.prototype.setLocked=function(t){t?this.$element.addClass("dt-locked"):this.$element.removeClass("dt-locked")},i.exports=s}),require.register("scripts/ui/color-button",function(t,e,i){function s(t,e,i){var s;s="stroke"===t.type?function(){this.dt.setStrokeColor(t.color),this.dt.setSelectionStrokeColor(t.color)}:function(){this.dt.setFillColor(t.color),this.dt.setSelectionFillColor(t.color)},t.onClick=s,n.call(this,t,e,i),this.setBackground(t.color)}var o=e("scripts/inherit"),n=e("scripts/ui/basic-button");o(s,n),s.prototype.setBackground=function(t){return t?void this.$element.css("background",t):void this.$element.addClass("dt-transparent")},i.exports=s}),require.register("scripts/ui/fill-button",function(t,e,i){function s(t,e,i){t.label="S",n.call(this,t,e,i),$("<div>").addClass("dt-color").appendTo(this.$element)}var o=e("scripts/inherit"),n=e("scripts/ui/basic-button");o(s,n),s.prototype.setColor=function(t){t?this.$element.find(".dt-color").removeClass("dt-no-color"):this.$element.find(".dt-color").addClass("dt-no-color"),this.$element.find(".dt-color").css("background",t)},i.exports=s}),require.register("scripts/ui/line-width-button",function(t,e,i){function s(t,e,i){t.onClick=function(){this.dt.setStrokeWidth(t.width),this.dt.setSelectionStrokeWidth(t.width)},t.onStateChange=function(e){e.strokeWidth===t.width?this.$element.addClass("dt-active"):this.$element.removeClass("dt-active")},n.call(this,t,e,i),$("<div>").addClass("dt-line-width-icon").appendTo(this.$element),this.setLineWidth(t.width)}var o=e("scripts/inherit"),n=e("scripts/ui/basic-button");o(s,n),s.prototype.setLineWidth=function(t){return 0===t?void this.$element.find(".dt-line-width-icon").addClass("dt-no-stroke"):void this.$element.find(".dt-line-width-icon").css("width",t)},i.exports=s}),require.register("scripts/ui/palette",function(t,e,i){function s(t,e){this.ui=e,this.name=t.name,this.permanent=!!t.permanent,this.anchor=t.anchor,this.$element=$("<div>").addClass("dt-palette").addClass(t.vertical?"dt-vertical":"dt-horizontal"),this.permanent||this.$element.hide()}s.prototype.toggle=function(){this.$element.is(":visible")?this._hide():this._show()},s.prototype._show=function(){if(this._position(),this.$element.show(),!this.permanent){var t=this;setTimeout(function(){$(window).one("mousedown touchstart",function(){t.$element.is(":visible")&&t._hide()})},16)}},s.prototype._hide=function(){this.$element.hide()},s.prototype._position=function(){var t=this.anchor&&this.ui.getButton(this.anchor);if(t){var e=t.$element.position();this.$element.css({position:"absolute",top:e.top,left:e.left+t.$element.outerWidth()})}},i.exports=s}),require.register("scripts/ui/stroke-button",function(t,e,i){function s(t,e,i){t.label="S",n.call(this,t,e,i),this.$element.addClass("dt-stroke-color");var s=$("<div>").addClass("dt-color").appendTo(this.$element);$("<div>").addClass("dt-inner1").appendTo(s),$("<div>").addClass("dt-inner2").appendTo(s)}var o=e("scripts/inherit"),n=e("scripts/ui/basic-button");o(s,n),s.prototype.setColor=function(t){t?this.$element.find(".dt-color").removeClass("dt-no-color"):this.$element.find(".dt-color").addClass("dt-no-color"),this.$element.find(".dt-color").css("background",t)},i.exports=s}),require.register("scripts/ui/ui-definition",function(t,e,i){var s=e("scripts/ui/stroke-button"),o=e("scripts/ui/fill-button"),n=e("scripts/ui/color-button"),r=e("scripts/ui/line-width-button"),a=["","#efefef","#e66665","#75b792","#076bb6","#ffd605","#f47d43","#ae70af","#a9b2b1","#333333"],c=[1,2,4,8,12,16,20],l={palettes:[{name:"main",permanent:!0,vertical:!0},{name:"lines",anchor:"linesPalette"},{name:"shapes",anchor:"shapesPalette"},{name:"strokeColors",anchor:"strokeColorPalette"},{name:"fillColors",anchor:"fillColorPalette"},{name:"strokeWidths",anchor:"strokeWidthPalette"}],buttons:[{label:"s",activatesTool:"select",palette:"main"},{name:"linesPalette",classes:"dt-expand",reflectsTools:["line","arrow","doubleArrow"],palette:"main",onInit:function(){this.setLabel(this.ui.getFirstPaletteButton("lines").getLabel())},onClick:function(){this.ui.getFirstPaletteButton("lines").click()},onLongPress:function(){this.ui.togglePalette("lines")}},{name:"shapesPalette",classes:"dt-expand",reflectsTools:["rect","ellipse","square","circle"],palette:"main",onInit:function(){this.setLabel(this.ui.getFirstPaletteButton("shapes").getLabel())},onClick:function(){this.ui.getFirstPaletteButton("shapes").click()},onLongPress:function(){this.ui.togglePalette("shapes")}},{name:"free",label:"F",activatesTool:"free",palette:"main"},{name:"text",label:"T",activatesTool:"text",palette:"main"},{name:"strokeColorPalette",buttonClass:s,classes:"dt-expand",palette:"main",onInit:function(){this.setColor(this.dt.state.stroke)},onStateChange:function(t){this.setColor(t.stroke)},onClick:function(){this.ui.togglePalette("strokeColors")}},{name:"fillColorPalette",buttonClass:o,classes:"dt-expand",palette:"main",onInit:function(){this.setColor(this.dt.state.fill)},onStateChange:function(t){this.setColor(t.fill)},onClick:function(){this.ui.togglePalette("fillColors")}},{name:"strokeWidthPalette",label:"w",classes:"dt-expand",palette:"main",onClick:function(){this.ui.togglePalette("strokeWidths")}},{name:"trash",label:"d",activatesTool:"trash",palette:"main",onInit:function(){this.setLocked(!0),this.dt.canvas.on("object:selected",function(){this.setLocked(!1)}.bind(this)),this.dt.canvas.on("selection:cleared",function(){this.setLocked(!0)}.bind(this))}},{name:"line",label:"L",activatesTool:"line",palette:"lines"},{name:"arrow",label:"A",activatesTool:"arrow",palette:"lines"},{name:"doubleArrow",label:"D",activatesTool:"doubleArrow",palette:"lines"},{name:"rect",label:"R",activatesTool:"rect",palette:"shapes"},{name:"ellipse",label:"E",activatesTool:"ellipse",palette:"shapes"},{name:"square",label:"S",activatesTool:"square",palette:"shapes"},{name:"circle",label:"C",activatesTool:"circle",palette:"shapes"}]};a.forEach(function(t){l.buttons.push({buttonClass:n,color:t,type:"stroke",palette:"strokeColors"}),l.buttons.push({buttonClass:n,color:t,type:"fill",palette:"fillColors"})}),c.forEach(function(t){l.buttons.push({buttonClass:r,width:t,palette:"strokeWidths"})}),i.exports=l}),require.register("scripts/ui/ui-manager",function(t,e,i){function s(t){this.drawingTool=t,this.$tools=$("<div>").addClass("dt-tools").prependTo(t.$element),this._palettes={},this._buttons={},this._firstPaletteButton={},this._processUIDefinition(r);
for(var e in this._buttons){var i=this._buttons[e];i.onInit&&i.onInit.call(i,this,t)}}var o=e("scripts/ui/basic-button"),n=e("scripts/ui/palette"),r=e("scripts/ui/ui-definition");s.prototype._processUIDefinition=function(t){this.$tools.empty(),t.palettes.forEach(this._createPalette.bind(this)),t.buttons.forEach(this._createButton.bind(this))},s.prototype.getButton=function(t){return this._buttons[t]},s.prototype.getPalette=function(t){return this._palettes[t]},s.prototype.togglePalette=function(t){this._palettes[t].toggle()},s.prototype.getFirstPaletteButton=function(t){return this._firstPaletteButton[t]},s.prototype._createPalette=function(t){var e=new n(t,this);e.$element.appendTo(this.$tools),this._palettes[e.name]=e},s.prototype._createButton=function(t){var e=t.buttonClass||o,i=new e(t,this,this.drawingTool);this._buttons[i.name]=i,this._firstPaletteButton[i.palette]||(this._firstPaletteButton[i.palette]=i)},i.exports=s}),require.register("scripts/util",function(t,e,i){i.exports={dist:function(t,e){var i=Math.pow(t,2),s=Math.pow(e,2);return Math.sqrt(i+s)}}}),window.DrawingTool=require("scripts/drawing-tool");