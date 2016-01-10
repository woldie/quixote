// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var shim = require("../util/shim.js");
var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var PositionDescriptor = require("./position_descriptor.js");
var ElementSize = require("./element_size.js");
var ElementEdge = require("./element_edge.js");
var StyleUtil = require("../util/style_util.js");
var ClipStyle = require("../normalize/clip_style.js");
var Pixels = require("../values/pixels.js");
var NoPixels = require("../values/no_pixels.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

function ElementVisibleEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement, String ]);

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._element = element;
	this._position = position;
}

PositionDescriptor.extend(ElementVisibleEdge);

ElementVisibleEdge.top = factoryFn(TOP);
ElementVisibleEdge.right = factoryFn(RIGHT);
ElementVisibleEdge.bottom = factoryFn(BOTTOM);
ElementVisibleEdge.left = factoryFn(LEFT);

var OPPOSITE_EDGES = {};
OPPOSITE_EDGES[TOP] = BOTTOM;
OPPOSITE_EDGES[BOTTOM] = TOP;
OPPOSITE_EDGES[LEFT] = RIGHT;
OPPOSITE_EDGES[RIGHT] = LEFT;

function notVisibleEdge(positionName) {
	return Position[(positionName === RIGHT || positionName === LEFT) ? 'x' : 'y'](new NoPixels());
}

ElementVisibleEdge.prototype.value = function value() {
	ensure.signature(arguments, []);

	// TODO: min/max display, visibility, opacity, overflow, clip, and clip-path (throw if other than
	// rect detected)  Need a way to express a non-visible edge

	var domElement = this._element.toDomElement();
	var parentWindow = this._element.frame.toDomElement().contentWindow;

	var isVisibilityHidden = StyleUtil.getRawCssStyle(parentWindow, domElement, "visibility") === "hidden";
	var isDisplayNone = StyleUtil.getRawCssStyle(parentWindow, domElement, "display") === "none";
	var isOpacityZero = parseFloat(StyleUtil.getRawCssStyle(parentWindow, domElement, "opacity")) === 0;

	if(isVisibilityHidden || isDisplayNone || isOpacityZero) {
		return notVisibleEdge(this._position);
	}

	var clipEdgeOffsets = ClipStyle.normalize(parentWindow, domElement);
	var clipEdgeOffset = clipEdgeOffsets[this._position].toPixels();
	var elementEdgePosition = this._element[this._position].value().toPixels();

	// We default the clip edge that is returned to the element's edge position, in Pixels
	var elementVisibleEdgePosition = elementEdgePosition;

	// is the clipEdge not is defined as an instance of NoPixels?
	if(!(clipEdgeOffset instanceof NoPixels)) {
		var elementEdgeOppositePosition = this._element[OPPOSITE_EDGES[this._position]].value().toPixels();

		// if the element is fully clipped in x or y, then the edge is not visible
		if(clipEdgeOffsets.width.toPixels().compare(Pixels.ZERO) <= 0 || clipEdgeOffsets.height.toPixels().compare(Pixels.ZERO) <= 0) {
			return notVisibleEdge(this._position);
		}

		// when clip style is active, then clamp the visible edge between the clip rect edge and the element edges
		var edgePlusClipOffset;
		switch(this._position) {
			case LEFT:
			case TOP:
				edgePlusClipOffset = elementEdgePosition.plus(clipEdgeOffset);
				elementVisibleEdgePosition = Pixels.min(Pixels.max(edgePlusClipOffset, elementEdgePosition), elementEdgeOppositePosition);
				break;
			case RIGHT:
			case BOTTOM:
				edgePlusClipOffset = elementEdgeOppositePosition.plus(clipEdgeOffset);
				elementVisibleEdgePosition = Pixels.max(Pixels.min(edgePlusClipOffset, elementEdgePosition), elementEdgeOppositePosition);
				break;
		}
	}

	if (this._position === RIGHT || this._position === LEFT) return Position.x(elementVisibleEdgePosition);
	else return Position.y(elementVisibleEdgePosition);
};

ElementVisibleEdge.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "clip " + this._position + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new ElementVisibleEdge(element, position);
	};
}

// default module export
module.exports = ElementVisibleEdge;
