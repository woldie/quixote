// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var shim = require("../util/shim.js");
var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var PositionDescriptor = require("./position_descriptor.js");
var ElementSize = require("./element_size.js");
var StyleUtil = require("../util/style_util.js");
var ClipStyle = require("../normalize/clip_style.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

function ElementClipEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement, String ]);

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._element = element;
	this._position = position;
}

PositionDescriptor.extend(ElementClipEdge);

ElementClipEdge.top = factoryFn(TOP);
ElementClipEdge.right = factoryFn(RIGHT);
ElementClipEdge.bottom = factoryFn(BOTTOM);
ElementClipEdge.left = factoryFn(LEFT);

ElementClipEdge.prototype.value = function value() {
	ensure.signature(arguments, []);

	// TODO: min/max display, visibility, opacity, overflow, clip, and clip-path (throw if other than
	// rect detected)  Need a way to express a non-visible edge

	var domElement = this._element.toDomElement();
	var parentWindow = this._element.frame.toDomElement().contentWindow;

	var clipPosition = getRawClipPosition(parentWindow, domElement);
	var isVisibilityHidden = StyleUtil.getRawCssStyle(parentWindow, domElement, "visibility") === "hidden";
	var isDislplayNone = StyleUtil.getRawCssStyle(parentWindow, domElement, "display") === "none";
	var isOpacityZero = parseFloat(StyleUtil.getRawCssStyle(parentWindow, domElement, "opacity")) === 0;

	// TODO:  rather than throw here, just don't min the visible boundaries
	if (!clipPosition) {
		throw new ClipNotAppliedException(ElementClipEdge.prototype.value,
			"clip " + this._position + " css style not applied to " + this._element);
	}

	var edge = clipPosition[this._position];
	var scroll = this._element.frame.getRawScrollPosition();

	if (this._position === RIGHT || this._position === LEFT) return Position.x(edge + scroll.x);
	else return Position.y(edge + scroll.y);
};

ElementClipEdge.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "clip " + this._position + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new ElementClipEdge(element, position);
	};
}

function getRawClipPosition(parentWindow, domElement) {
	var clipRect = ClipStyle.normalize(parentWindow, domElement);
	var boundingRect = StyleUtil.getRawBoundingRect(domElement);

	// return the clip rect adjusted relative to the document top/left
	var relativeClipRect = {
		left: boundingRect.left + clipRect.left,
		right: boundingRect.left + clipRect.right,

		top: boundingRect.top + clipRect.top,
		bottom: boundingRect.top + clipRect.bottom
	};

	relativeClipRect.width = relativeClipRect.right - relativeClipRect.left;
	relativeClipRect.height = relativeClipRect.bottom - relativeClipRect.top;

	return relativeClipRect;
}

// default module export
module.exports = ElementClipEdge;

function ClipNotAppliedException(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
}

ClipNotAppliedException.prototype = shim.Object.create(Error.prototype);
ClipNotAppliedException.prototype.constructor = ClipNotAppliedException;
ClipNotAppliedException.prototype.name = "ClipNotAppliedException";

exports.ClipNodeAppliedException = ClipNotAppliedException;
