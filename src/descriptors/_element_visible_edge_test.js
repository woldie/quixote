// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var ElementEdge = require("./element_edge.js");
var ElementVisibleEdge = require("./element_visible_edge.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var PositionDescriptor = require("./position_descriptor.js");

describe("ElementVisibleEdge", function() {
	var frame;

	var top;
	var right;
	var bottom;
	var left;

	var visibleTop;
	var visibleRight;
	var visibleBottom;
	var visibleLeft;

	beforeEach(function() {
		frame = reset.frame;
	});

	describe("visible in the presence of borders, margin, and padding", function() {
		var borderClip;

		beforeEach(function() {
			borderClip = frame.add(
				"<div id='borderClip' style='background-color: red; position: absolute; margin: 10px; border: black solid 10px; padding: 10px; clip: rect(10px 90px 90px 10px);'>" +
					"<div id='body' style='position: relative; background-color: blue; width: 60px; height: 60px;'></div>" +
				"</div>",
				"borderClip"
			);

			top = ElementEdge.top(borderClip);
			right = ElementEdge.right(borderClip);
			bottom = ElementEdge.bottom(borderClip);
			left = ElementEdge.left(borderClip);

			visibleTop = ElementVisibleEdge.top(borderClip);
			visibleRight = ElementVisibleEdge.right(borderClip);
			visibleBottom = ElementVisibleEdge.bottom(borderClip);
			visibleLeft = ElementVisibleEdge.left(borderClip);
		});

		it("is a position descriptor", function() {
			assert.implements(visibleTop, PositionDescriptor);
		});

		it("resolves to visible rect that includes bounding client rect top/left", function() {
			var TOP = 10;  // the margins are outside the bounding client rect
			var LEFT = 10;

			var VISIBLE_TOP = 10 + TOP;
			var VISIBLE_BOTTOM = 90 + TOP;
			var VISIBLE_LEFT = 10 + LEFT;
			var VISIBLE_RIGHT = 90 + LEFT;

			assert.objEqual(visibleTop.value(), Position.y(VISIBLE_TOP), "top");
			assert.objEqual(visibleRight.value(), Position.x(VISIBLE_RIGHT), "right");
			assert.objEqual(visibleBottom.value(), Position.y(VISIBLE_BOTTOM), "bottom");
			assert.objEqual(visibleLeft.value(), Position.x(VISIBLE_LEFT), "left");
		});

		it("can differ on element width/height and element visible rect width/height", function() {
			var VISIBLE_WIDTH = 80;
			var VISIBLE_HEIGHT = 80;
			var WIDTH = 100;
			var HEIGHT = 100;

			// this is testing the width/height of the visible rectangle, which can be smaller than the offsetWidth/offsetHeight
			assert.objEqual(visibleBottom.value().minus(visibleTop.value()), Position.y(VISIBLE_HEIGHT), "visible height");
			assert.objEqual(visibleRight.value().minus(visibleLeft.value()), Position.x(VISIBLE_WIDTH), "visible width");

			assert.objEqual(bottom.value().minus(top.value()), Position.y(HEIGHT), "height");
			assert.objEqual(right.value().minus(left.value()), Position.x(WIDTH), "width");
		});
	});

	describe("visible in the face of relative units", function() {
		var borderClip;

		beforeEach(function() {
			borderClip = frame.add(
				"<div id='borderClip' style='position: absolute; background-color: red; border: black solid 9px; clip: rect(1.500em 5.313em 90px 15pt);'>" +
					"<div id='body' style='position: relative; background-color: blue; width: 100px; height: 100px;'></div>" +
				"</div>",
				"borderClip"
			);

			top = ElementEdge.top(borderClip);
			right = ElementEdge.right(borderClip);
			bottom = ElementEdge.bottom(borderClip);
			left = ElementEdge.left(borderClip);

			visibleTop = ElementVisibleEdge.top(borderClip);
			visibleRight = ElementVisibleEdge.right(borderClip);
			visibleBottom = ElementVisibleEdge.bottom(borderClip);
			visibleLeft = ElementVisibleEdge.left(borderClip);
		});

		it("with the default font-size, resolves to value", function() {
			// see to the clip css style in the borderClip tag above
			var VISIBLE_TOP = 24;      // 1.500em == 24px
			var VISIBLE_BOTTOM = 90;   // 90px
			var VISIBLE_LEFT = 20;     // 15pt == 20px
			var VISIBLE_RIGHT = 85;    // 5.313em == 85px

			assert.objEqual(visibleTop.value(), Position.y(VISIBLE_TOP), "top");
			assert.objEqual(visibleRight.value(), Position.x(VISIBLE_RIGHT), "right");
			assert.objEqual(visibleBottom.value(), Position.y(VISIBLE_BOTTOM), "bottom");
			assert.objEqual(visibleLeft.value(), Position.x(VISIBLE_LEFT), "left");
		});

		it("with a shrunken font-size on body, all the relative sizes also shrink", function() {
			// set the font-size on the body tag, it will affect how all relative sizes are computed
			// this sets the font-size to 10px, which should
			frame.toDomElement().contentWindow.document.getElementsByTagName("body")[0].style.fontSize = "62.5%";

			// The clip css style in the borderClip tag above, with relative size units shrunk by 62.5%
			var VISIBLE_TOP = 15;      // 1.500em == 24px * 62.5% == 15px
			var VISIBLE_BOTTOM = 90;   // 90px (unchanged by the relative sizing changes)
			var VISIBLE_LEFT = 20;     // 15pt == 20px (pt are absolute units, unchanged by the relative sizing changes)
			var VISIBLE_RIGHT = 53;    // 5.313em == 85px * 62.5% == 53px

			assert.objEqual(visibleTop.value(), Position.y(VISIBLE_TOP), "top");
			assert.objEqual(visibleRight.value(), Position.x(VISIBLE_RIGHT), "right");
			assert.objEqual(visibleBottom.value(), Position.y(VISIBLE_BOTTOM), "bottom");
			assert.objEqual(visibleLeft.value(), Position.x(VISIBLE_LEFT), "left");
		});
	});
});
