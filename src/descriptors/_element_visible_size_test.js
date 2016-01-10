// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var SizeDescriptor = require("./size_descriptor.js");
var ElementVisibleSize = require("./element_visible_size.js");
var ElementVisibleEdge = require("./element_visible_edge.js");
var Size = require("../values/size.js");
var NoPixels = require("../values/no_pixels.js");

describe("ElementVisibleSize", function() {

	var element;
	var visibleTop;
	var visibleRight;
	var visibleBottom;
	var visibleLeft;
	var visibleWidth;
	var visibleHeight;

	beforeEach(function() {
		var frame = reset.frame;
		frame.add(
			"<p id='element'>element</p>"
		);

		element = frame.get("#element");
		visibleTop =  ElementVisibleEdge.top(element);
		visibleRight = ElementVisibleEdge.right(element);
		visibleBottom = ElementVisibleEdge.bottom(element);
		visibleLeft = ElementVisibleEdge.left(element);

		visibleWidth = ElementVisibleSize.x(visibleLeft, visibleRight, "visible width for #element");
		visibleHeight = ElementVisibleSize.y(visibleTop, visibleBottom, "visible height for #element");
	});

	it("is a size descriptor", function() {
		assert.implements(visibleWidth, SizeDescriptor);
	});

	it("will return _description from toString", function() {
		assert.equal(visibleWidth.toString(), visibleWidth._description);
		assert.equal(visibleHeight.toString(), visibleHeight._description);
	});

	describe("clip style-related tests", function() {
		it("can compute visible when clip is either not set/or set to auto", function() {
			var WIDTH = 130;
			var HEIGHT = 60;

			var domElement = element.toDomElement();
			domElement.setAttribute("style", [
				"position: absolute",
				"left: 20px",
				"top: 20px",
				"width: 130px",
				"height: 60px",
				"clip: auto"
			].join(";"));

			assert.objEqual(visibleWidth.value(), Size.create(WIDTH), "width");
			assert.objEqual(visibleHeight.value(), Size.create(HEIGHT), "height");
		});

		it("will ignore auto clip edges when computing visible rect", function() {
			var WIDTH = 130;
			var HEIGHT = 60;

			var domElement = element.toDomElement();

			domElement.setAttribute("style", [
				"position: absolute",
				"left: 20px",
				"top: 20px",
				"width: 130px",
				"height: 60px",
				"border: solid 4px red",
				"margin: 16px",
				"padding: 8px",
				"box-sizing: content-box",
				"clip: rect(auto auto auto auto)",   // legacy ie clip format
				"clip: rect(auto, auto, auto, auto)" // modern browser clip format
			].join(";"));

			assert.objEqual(visibleWidth.value(), Size.create(WIDTH + (4*2) + (8*2)), "width includes padding and border");
			assert.objEqual(visibleHeight.value(), Size.create(HEIGHT + (4*2) + (8*2)), "height includes padding and border");
		});

		it("will clamp the element visible width/height when the clip rect goes inside the border box", function() {
			var domElement = element.toDomElement();

			domElement.setAttribute("style", [
				"position: absolute",
				"left: 20px",
				"top: 20px",
				"width: 25px",
				"height: 40px",
				"border: solid 4px red",
				"margin: 16px",
				"padding: 8px",
				"box-sizing: content-box",
				"clip: rect(15px 41px 30px 18px)",   // legacy ie clip format
				"clip: rect(15px, 41px, 30px, 18px)" // modern browser clip format
			].join(";"));

			assert.objEqual(visibleWidth.value(), Size.create(41 - 18), "width");
			assert.objEqual(visibleHeight.value(), Size.create(30 - 15), "height");
		});

		it("will go to NoPixels size when width or height are completely clipped", function() {
			var domElement = element.toDomElement();

			domElement.setAttribute("style", [
				"position: absolute",
				"width: 15px",
				"height: 20px",
				"border: solid 4px red",
				"margin: 16px",
				"padding: 8px",
				"box-sizing: content-box",
				"clip: rect(0 0 0 0)",   // legacy ie clip format
				"clip: rect(0, 0, 0, 0)" // modern browser clip format
			].join(";"));

			assert.objEqual(visibleWidth.value().toPixels(), NoPixels.create(), "no pixel width");
			assert.objEqual(visibleHeight.value().toPixels(), NoPixels.create(), "no pixel height");
		});

		it("will clamp visible width and height to the element edge when the clip rect goes outside the element bounds", function() {
			var domElement = element.toDomElement();

			domElement.setAttribute("style", [
				"position: absolute",
				"width: 15px",
				"height: 20px",
				"border: solid 3px red",
				"margin: 16px",
				"padding: 8px",
				"box-sizing: content-box",
				"clip: rect(-50px 50px 50px -50px)",   // top: -50, right: 50, bottom: 50, left: -50
				"clip: rect(-50px, 50px, 50px, -50px)"
			].join(";"));

			assert.objEqual(visibleWidth.value(), Size.create(15 + 6 + 16), "element visible width == element width, unaffected by clip outside element borders");
			assert.objEqual(visibleHeight.value(), Size.create(20 + 6 + 16), "element visible width == element width, unaffected by clip outside element borders");
		});
	});
});
