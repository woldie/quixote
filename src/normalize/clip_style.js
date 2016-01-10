// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// normalized clip CSS style

var ensure = require("../util/ensure.js");
var StyleUtil = require("../util/style_util.js");
var Size = require("../values/size.js");
var Position = require("../values/position.js");
var NoPixels = require("../values/no_pixels.js");

function computeClipTopPxHeight(domElement, lengthExpr) {
	if(lengthExpr === "auto") {
		return 0;
	}

	return StyleUtil.computeCssPxForLengthInElement(domElement, lengthExpr);
}

function computeClipRightPxWidth(domElement, lengthExpr) {
	if(lengthExpr === "auto") {
		// "auto" for clip rect's right component will be the width of the element, enclosing the borders but not the
		// margins.  offsetWidth gives us this value

		return domElement.offsetWidth;
	}

	return StyleUtil.computeCssPxForLengthInElement(domElement, lengthExpr);
}

function computeClipBottomPxHeight(domElement, lengthExpr) {
	if(lengthExpr === "auto") {
		// "auto" for clip rect's bottom component will be the height of the element, enclosing the borders but not the
		// margins.  offsetHeight gives us this value

		return domElement.offsetHeight;
	}

	return StyleUtil.computeCssPxForLengthInElement(domElement, lengthExpr);
}

function computeClipLeftPxWidth(domElement, lengthExpr) {
	if(lengthExpr === "auto") {
		return 0;
	}

	return StyleUtil.computeCssPxForLengthInElement(domElement, lengthExpr);
}

var UNSET_CLIP_STYLES = [ "", "auto" ];
var CLIP_RECT_PATTERN = /rect[\s]*\([\s]*([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s]+)[\s]*\)/;

var ClipStyle;

function noClipStyles() {
	return {
		top: Position.y(NoPixels.create()),
		bottom: Position.y(NoPixels.create()),
		height: Size.create(NoPixels.create()),

		left: Position.x(NoPixels.create()),
		right: Position.x(NoPixels.create()),
		width: Size.create(NoPixels.create())
	};
}

ClipStyle = {
	// **
	// * Compute the normalized edges of the domElement's clip rectangle in CSS pixel units
	// *
	// * <p>The clip rectangle is relative to the top-left of the domElement's bounding client rectangle
	// * rather than the page top-left origin
	// *
	// * @param {Window} parentWindow window that domElement belongs to
	// * @param {(Element|Node)} domElement the element to compute the normalized clip rectangle for
	// * @returns {{top: CssLength, bottom: CssLength, height: Size, left: CssLength, right: CssLength, width: Size}} clip
	// * rectangle in CSS pixel units, relative to the top-left of domElement's bounding client rect
	// */
	normalize : function normalize(parentWindow, domElement) {
		// we can assume clip does not apply unless CSS position is "absolute" or "fixed"
		var positionStyle = StyleUtil.getRawCssStyle(parentWindow, domElement, "position");
		if(positionStyle !== "absolute" && positionStyle !== "fixed") {
			return noClipStyles();
		}

		var computedClipStyle = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip");

		// auto is the same as clip not being set at all
		if (computedClipStyle === "auto") {
			return noClipStyles();
		}

		if (computedClipStyle === "") {
			// As a fallback for IE8 for when it can't fork over the original clip css style, try generating a clip rect
			// using clip components that currentStyle may have.  If we see non-empty strings for all four components, we'll
			// build out a clip rect expression here ...

			var assignedClipStyle = domElement.style.clip;
			var clipLeft = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-left");
			var clipRight = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-right");
			var clipBottom = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-bottom");
			var clipTop = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-top");

			// IE8 workaround:  if computed and assigned clipStyles don't evaluate to anything and top, bottom, left, and
			// right were "auto", then clip style was not set on the element
			if (!computedClipStyle && !assignedClipStyle && clipTop === "auto" && clipBottom === "auto" &&
				clipLeft === "auto" && clipRight === "auto") {
				return noClipStyles();
			}

			// IE8: As long as all four edges have something set, then we can contrive a computed clip style
			if (clipLeft && clipRight && clipBottom && clipTop) {
				computedClipStyle = "rect(" + clipTop + " " + clipRight + " " + clipBottom + " " + clipLeft + ")";
			}
		}

		for (var i = 0, ii = UNSET_CLIP_STYLES.length; i < ii; i++) {
			if (UNSET_CLIP_STYLES[i] === computedClipStyle) {
				return noClipStyles();
			}
		}

		var matches = computedClipStyle.match(CLIP_RECT_PATTERN);
		if (!matches) {
			ensure.unreachable("Unknown clip css style: " + computedClipStyle);
		}

		// values in a clip's rect may be a css length or "auto" which means "clip at the element's border's edge"
		var clipTopPx = computeClipTopPxHeight(domElement, matches[1]);
		var clipRightPx = computeClipRightPxWidth(domElement, matches[2]);
		var clipBottomPx = computeClipBottomPxHeight(domElement, matches[3]);
		var clipLeftPx = computeClipLeftPxWidth(domElement, matches[4]);

		return {
			top: Position.y(clipTopPx),
			bottom: Position.y(clipBottomPx),
			height: Size.create(clipBottomPx - clipTopPx),

			left: Position.x(clipLeftPx),
			right: Position.x(clipRightPx),
			width: Size.create(clipRightPx - clipLeftPx)
		};
	}
};

module.exports = ClipStyle;
