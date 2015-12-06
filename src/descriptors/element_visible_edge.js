// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var shim = require("../util/shim.js");
var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var PositionDescriptor = require("./position_descriptor.js");
var ElementSize = require("./element_size.js");
var StyleUtil = require("../util/style_util.js");

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

	var clipPosition = this.getRawClipPosition();

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

var UNSET_CLIP_STYLES = [ "", "auto", "unset", "initial" ];
var CLIP_RECT_PATTERN = /rect[\s]*\([\s]*([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s,]+)[\s]*\)/;

ElementClipEdge.prototype.getRawClipPosition = function getRawClipPosition() {
	ensure.signature(arguments, []);

	var domElement = this._element.toDomElement();
	var clipRect = normalizedClip(domElement);

	var boundingRect = StyleUtil.getRawBoundingRect(domElement);

	var visibleRect = {
		left: boundingRect.left + clipRect.left,
		right: boundingRect.left + clipRect.right,

		top: boundingRect.top + clipRect.top,
		bottom: boundingRect.top + clipRect.bottom
	};

	visibleRect.width = visibleRect.right - visibleRect.left;
	visibleRect.height = visibleRect.bottom - visibleRect.top;

	return visibleRect;
};

ElementClipEdge.prototype.computeClipTopPxHeight = function computeClipTopPxHeight(lengthExpr) {
	if(lengthExpr === "auto") {
		return 0;
	}

	return StyleUtil.computeCssPxForLengthInElement(this._element.toDomElement(), lengthExpr);
};

ElementClipEdge.prototype.computeClipRightPxWidth = function computeClipRightPxWidth(lengthExpr) {
	var domElement = this._element.toDomElement();

	if(lengthExpr === "auto") {
		// "auto" for clip rect's right component will be the width of the element, enclosing the borders but not the
		// margins.  offsetWidth gives us this value

		return domElement.offsetWidth;
	}

	return StyleUtil.computeCssPxForLengthInElement(domElement, lengthExpr);
};

ElementClipEdge.prototype.computeClipBottomPxHeight = function computeClipBottomPxHeight(lengthExpr) {
	var domElement = this._element.toDomElement();

	if(lengthExpr === "auto") {
		// "auto" for clip rect's bottom component will be the height of the element, enclosing the borders but not the
		// margins.  offsetHeight gives us this value

		return domElement.offsetHeight;
	}

	return StyleUtil.computeCssPxForLengthInElement(domElement, lengthExpr);
};

ElementClipEdge.prototype.computeClipLeftPxWidth = function computeClipLeftPxWidth(lengthExpr) {
	if(lengthExpr === "auto") {
		return 0;
	}

	return StyleUtil.computeCssPxForLengthInElement(this._element.toDomElement(), lengthExpr);
};

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
