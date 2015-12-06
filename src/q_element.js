// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementClipEdge = require("./descriptors/element_visible_edge.js");
var ElementClipSize = require("./descriptors/element_visible_size.js");
var Center = require("./descriptors/center.js");
var ElementSize = require("./descriptors/element_size.js");
var Assertable = require("./assertable.js");
var StyleUtil = require("./util/style_util.js");

var Me = module.exports = function QElement(domElement, frame, nickname) {
	var QFrame = require("./q_frame.js");    // break circular dependency
	ensure.signature(arguments, [ Object, QFrame, String ]);

	this._domElement = domElement;
	this._nickname = nickname;

	this.frame = frame;

	// properties
	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.center = Center.x(this.left, this.right, "center of '" + nickname + "'");
	this.middle = Center.y(this.top, this.bottom, "middle of '" + nickname + "'");

	this.width = ElementSize.x(this);
	this.height = ElementSize.y(this);

	this.clip = {};  // ElementClipDisabled descriptor rather than plain old object here?

	this.clip.top = ElementClipEdge.top(this);
	this.clip.right = ElementClipEdge.right(this);
	this.clip.bottom = ElementClipEdge.bottom(this);
	this.clip.left = ElementClipEdge.left(this);
	this.clip.center = Center.x(this.clip.left, this.clip.right, "center of clip for '" + nickname + "'");
	this.clip.middle = Center.y(this.clip.top, this.clip.bottom, "middle of clip for '" + nickname + "'");
	this.clip.width = ElementClipSize.x(this.clip.left, this.clip.right, "width of clip for '" + nickname + "'");
	this.clip.height = ElementClipSize.y(this.clip.top, this.clip.bottom, "height of clip for '" + nickname + "'");
};
Assertable.extend(Me);

Me.prototype.getRawStyle = function getRawStyle(styleName) {
	ensure.signature(arguments, [ String ]);

	// WORKAROUND Firefox 40.0.3: must use frame's contentWindow (ref https://bugzilla.mozilla.org/show_bug.cgi?id=1204062)
	return StyleUtil.getRawCssStyle(this.frame.toDomElement().contentWindow, this._domElement, styleName);
};

Me.prototype.getRawPosition = function getRawPosition() {
	ensure.signature(arguments, []);

	return StyleUtil.getRawBoundingRect(this._domElement);
};

Me.prototype.toDomElement = function toDomElement() {
	ensure.signature(arguments, []);
	return this._domElement;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "'" + this._nickname + "'";
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);
	return this._domElement === that._domElement;
};
