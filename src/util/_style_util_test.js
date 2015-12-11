// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var assert = require("./assert.js");
var ensure = require("./ensure.js");
var StyleUtil = require("./style_util.js");

describe("StyleUtil", function() {
	var grandparentElement;
	var parentElement;
	var element;

	beforeEach(function() {
		grandparentElement = document.createElement("div");
		parentElement = document.createElement("div");
		element = document.createElement("div");

		parentElement.appendChild(element);
		grandparentElement.appendChild(parentElement);
		document.getElementsByTagName("body")[0].appendChild(grandparentElement);
	});

	afterEach(function() {
		grandparentElement.parentNode.removeChild(grandparentElement);
	});

	it("can compute px exactly as set", function () {
		element.setAttribute("style", "");

		assert.equal(StyleUtil.computeCssPxForLengthInElement(element, "500px"), 500, "px 1:1 with px");
	});

	it("can convert pt to px", function () {
		element.setAttribute("style", "");

		assert.equal(StyleUtil.computeCssPxForLengthInElement(element, "200pt"), 266, "pt 1:1.3 with px");
	});

	it("can convert em to px", function () {
		grandparentElement.setAttribute("style", "font-size: 9px;");  // reset em to 1:9 px
		parentElement.setAttribute("style", "");
		element.setAttribute("style", "");

		assert.equal(StyleUtil.computeCssPxForLengthInElement(element, "1em"), 9, "em 1:9 with px");
	});

	it("can convert em to px, em is a relative unit affected by font-size", function () {
		grandparentElement.setAttribute("style", "font-size: 16px;");  // reset em to 1:16 px
		parentElement.setAttribute("style", "font-size: 1.2em");  // multiply em to be 1.2 times larger, em 1:19.2 with px
		element.setAttribute("style", "");

		assert.equal(StyleUtil.computeCssPxForLengthInElement(element, "1em"), 19.2, "em 1:19.2 with px");
	});

	it("can convert em to px, em is a relative unit", function () {
		grandparentElement.setAttribute("style", "font-size: 16px;");  // reset em to 1:16 px
		parentElement.setAttribute("style", "font-size: 1.2em");  // multiply em to be 1.2 times larger, em 1:19.2 with px
		element.setAttribute("style", "font-size: 1.2em");  // multiply em to be 1.2 times larger, em 1:23.04 with px

		assert.inRange(StyleUtil.computeCssPxForLengthInElement(element, "1em"), 23.0, 23.1, "em 1:~23.04 with px");
	});
});
