// Copyright (c) 2013-2014 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var ensure = require("./ensure");
var camelcase = require("../../vendor/camelcase-1.0.1-modified.js");
var StyleUtil;

// ** @const
var PX_TEST_CSS_STYLES = [
	"display: block;",
	"padding: 0;",
	"margin: 0;",
	"border: 0;",
	"visibility: hidden;",
	"position: absolute;",
	"height: 0;"
].join(" ");

function computeCssUnitToCssPxRatio(domElement, unit) {
	var parentElement,
		testEl,
		ratio;

	if (domElement && unit) {
		parentElement = domElement.parentNode;

		if (unit !== "px" && parentElement) {
			testEl = domElement.ownerDocument.createElement("span");
			testEl.setAttribute("style", PX_TEST_CSS_STYLES + "; width: 100" + unit + ";");

			// try to append testEl to domElement, and if that's not allowed due to tag type nesting restrictions, then
			// append it to the parent node
			try {
				domElement.appendChild(testEl);
			}
			catch(e) {
				try {
					parentElement = domElement.parentNode;
					parentElement.appendChild(testEl);
				}
				catch(e) {
					throw new Error("appendChild failed");
				}
			}

			ratio = testEl.offsetWidth / 100;
			testEl.parentNode.removeChild(testEl);
			return ratio;
		}
	}

	return 1;
}

// ** @const
var LENGTH_EXPR_PATTERN = /([\-\+]?[0-9\.]+)([a-zA-Z]+)/;

StyleUtil = {
	// **
	// * Get the raw css style string value for a named css style
	// * @param {Window} parentWindow the window that domElement belongs to
	// * @param {(Element|Node)} domElement element
	// * @param {string} styleName
	// * @returns {string} raw css style of the
	// */
	getRawCssStyle: function getRawCssStyle(parentWindow, domElement, styleName) {
		var styles;
		var result;

		if (window.getComputedStyle) {
			styles = parentWindow.getComputedStyle(domElement);
			result = styles.getPropertyValue(styleName);
		}
		else {
			// WORKAROUND IE 8: no getComputedStyle()
			styles = domElement.currentStyle;
			result = styles[camelcase(styleName)];
		}

		return result || "";
	},

	// **
	// * Compute the length in CSS pixels for lengthExpr in the context of domElement.
	// *
	// * <p>Relative or absolute CSS units are computed as CSS pixels in the context of an element's ancestry to the
	// * document root.  This utility computes the length in CSS pixels for lengthExpr by attaching a temporary DOM
	// * element to domElement's parent and then sets the width of the temporary element to lengthExpr.  Getting the
	// * computed pixel width of the temporary element yields the translated width of lengthExpr in domElement's context.
	// *
	// * @param {(Element|Node)} domElement
	// * @param {string} lengthExpr a CSS length expression consisting of a number followed by a CSS length unit code
	// *        (e.g. px, pt, em, in, cm ...)
	// */
	computeCssPxForLengthInElement: function computeCssPxForLengthInElement(domElement, lengthExpr) {
		var matches = lengthExpr.match(LENGTH_EXPR_PATTERN);

		if(!matches) {
			ensure.unreachable("CSS length expression expected, got " + lengthExpr);
		}

		// convert the parsed number part of the lengthExpr to px by multiplying it by the computed ratio of lengthExpr's
		// css unit to css px units.
		return parseFloat(matches[1]) * computeCssUnitToCssPxRatio(domElement, matches[2]);
	}
};

// **
// * @module util/StyleUtil
// */
module.exports = StyleUtil;
