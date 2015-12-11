// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var assert = require("../util/assert.js");
var ClipStyle = require("./clip_style.js");

// from http://stackoverflow.com/questions/3922139/add-css-to-head-with-javascript
function addStylesheetToDom(css) {
	var head = document.getElementsByTagName('head')[0];
	var s = document.createElement('style');
	s.setAttribute('type', 'text/css');
	if (s.styleSheet) {   // IE
		s.styleSheet.cssText = css;
	} else {                // the world
		s.appendChild(document.createTextNode(css));
	}
	head.appendChild(s);

	return s;
}

describe("ClipStyle", function() {
	var grandparentElement;
	var parentElement;
	var element;
	var stylesheet;

	beforeEach(function () {
		grandparentElement = document.createElement("div");
		parentElement = document.createElement("div");
		element = document.createElement("div");

		parentElement.appendChild(element);
		grandparentElement.appendChild(parentElement);
		document.getElementsByTagName("body")[0].appendChild(grandparentElement);

		stylesheet = addStylesheetToDom(".clipClass { " +
			"position: absolute; " +
			"clip: rect(10px 90px 90px 10px); " +
			"clip: rect(10px, 90px, 90px, 10px); " +
		"}");
	});

	afterEach(function () {
		grandparentElement.parentNode.removeChild(grandparentElement);
		stylesheet.parentNode.removeChild(stylesheet);
	});

	describe("normalize", function() {
		it("clip style not set", function () {
			element.setAttribute("style", "position: absolute; width: 100px; height: 100px;");

			var clipRect = ClipStyle.normalize(window, element);

			assert.equal(clipRect, null, "no clip rect set, null returned from ClipStyle.normalize");
		});

		it("clip style set to all auto", function () {
			element.setAttribute("style", "position: absolute; width: 100px; height: 100px; " +
				"clip: rect(auto auto auto auto); " +
				"clip: rect(auto, auto, auto, auto);");

			var clipRect = ClipStyle.normalize(window, element);

			assert.equal(clipRect.top, 0, "top == bounding rect top");
			assert.equal(clipRect.bottom, 100, "bottom == bounding rect bottom");
			assert.equal(clipRect.left, 0, "left == bounding rect left");
			assert.equal(clipRect.right, 100, "right == bounding rect right");
			assert.equal(clipRect.width, 100, "width == bounding rect width");
			assert.equal(clipRect.height, 100, "height == bounding rect height");
		});

		it("clip style does not apply unless position is absolute or fixed", function () {
			element.setAttribute("style", "position: relative; width: 100px; height: 100px; " +
				"clip: rect(auto auto auto auto); " +
				"clip: rect(auto, auto, auto, auto);");

			var clipRect = ClipStyle.normalize(window, element);
			assert.equal(clipRect, null, "clip styles do not apply to position: relative");
		});

		it("clip style set to some auto, some inside the bounding rect", function () {
			element.setAttribute("style", "position: absolute; width: 100px; height: 100px; " +
				"clip: rect(10px auto 90px 10px); " +
				"clip: rect(10px, auto, 90px, 10px);");

			var clipRect = ClipStyle.normalize(window, element);

			assert.equal(clipRect.top, 10, "top == 10");
			assert.equal(clipRect.bottom, 90, "bottom == 90");
			assert.equal(clipRect.left, 10, "left == 10");
			assert.equal(clipRect.right, 100, "right == bounding rect right");
			assert.equal(clipRect.width, 90, "width == 100-10");
			assert.equal(clipRect.height, 80, "height == 90-10");
		});

		it("clip style set to some outside, some inside the bounding rect", function () {
			element.setAttribute("style", "position: absolute; width: 100px; height: 100px; " +
				"clip: rect(-50px 85px 250px 35px); " +
				"clip: rect(-50px, 85px, 250px, 35px);");

			var clipRect = ClipStyle.normalize(window, element);

			assert.equal(clipRect.top, -50, "top == -50");
			assert.equal(clipRect.bottom, 250, "bottom == 250");
			assert.equal(clipRect.left, 35, "left == 35");
			assert.equal(clipRect.right, 85, "right == 85");
			assert.equal(clipRect.width, 50, "width == 85-35");
			assert.equal(clipRect.height, 300, "height == 250-(-50)");
		});

		it("clip does not cascade", function () {
			parentElement.setAttribute("style", "position: absolute; width: 100px; height: 100px; " +
				"clip: rect(-50px 85px 250px 35px); " +
				"clip: rect(-50px, 85px, 250px, 35px);");

			element.setAttribute("style", "position: absolute; width: 100px; height: 100px;");

			var clipRect = ClipStyle.normalize(window, element);
			assert.equal(clipRect, null, "element does not have a clip style set by its parent");
		});

		it("clip style can be inherit'ed by immediate child, clip rect not offset by child's top and left", function () {
			parentElement.setAttribute("style", "position: absolute; width: 100px; height: 100px; " +
				"clip: rect(-50px 85px 250px 35px); " +
				"clip: rect(-50px, 85px, 250px, 35px);");

			element.setAttribute("style", "position: absolute; top: 15px; left: 15px; width: 100px; height: 100px; " +
				"clip: inherit;");

			var clipRect = ClipStyle.normalize(window, element);

			assert.equal(clipRect.top, -50, "top == -50");
			assert.equal(clipRect.bottom, 250, "bottom == 250");
			assert.equal(clipRect.left, 35, "left == 35");
			assert.equal(clipRect.right, 85, "right == 85");
			assert.equal(clipRect.width, 50, "width == 85-35");
			assert.equal(clipRect.height, 300, "height == 250-(-50)");
		});

		it("clip style inherit on a child only works if position is absolute on the child", function () {
			parentElement.setAttribute("style", "position: absolute; width: 100px; height: 100px; " +
				"clip: rect(-50px 85px 250px 35px); " +
				"clip: rect(-50px, 85px, 250px, 35px);");

			element.setAttribute("style", "position: relative; width: 100px; height: 100px; " +
				"clip: inherit;");

			var clipRect = ClipStyle.normalize(window, element);

			assert.equal(clipRect, null, "clip was inherited, but not active, due to position: relative");
		});
	});
});
