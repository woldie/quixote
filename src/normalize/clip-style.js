// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// normalized clip CSS style

var ensure = require("../util/ensure");
var StyleUtil = require("../util/style_util");

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

var UNSET_CLIP_STYLES = [ "", "auto", "unset", "initial" ];
var CLIP_RECT_PATTERN = /rect[\s]*\([\s]*([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s,]+)[\s]*\)/;

var ClipStyle;

ClipStyle = {
	normalize : function normalize(parentWindow, domElement) {
		var clipStyle = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip");

		if (clipStyle === "") {
			// As a fallback for IE8 for when it can't fork over the original clip css style, try generating a clip rect
			// using clip components that currentStyle may have.  If we see non-empty strings for all four components, we'll
			// build out a clip rect expression here ...

			var clipLeft = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-left");
			var clipRight = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-right");
			var clipBottom = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-bottom");
			var clipTop = StyleUtil.getRawCssStyle(parentWindow, domElement, "clip-top");

			if (clipLeft && clipRight && clipBottom && clipTop) {
				clipStyle = "rect(" + clipTop + " " + clipRight + " " + clipBottom + " " + clipLeft + ")";
			}
		}

		for (var i = 0, ii = UNSET_CLIP_STYLES.length; i < ii; i++) {
			if (UNSET_CLIP_STYLES[i] === clipStyle) {
				return null;
			}
		}

		var matches = clipStyle.match(CLIP_RECT_PATTERN);
		if (!matches) {
			ensure.unreachable("Unknown clip css style: " + clipStyle);
		}

		// values in a clip's rect may be a css length or "auto" which means "clip over the edge's border"
		var clipTopPx = computeClipTopPxHeight(domElement, matches[1]);
		var clipRightPx = computeClipRightPxWidth(domElement, matches[2]);
		var clipBottomPx = computeClipBottomPxHeight(domElement, matches[3]);
		var clipLeftPx = computeClipLeftPxWidth(domElement, matches[4]);

		return {
			top: clipTopPx,
			bottom: clipBottomPx,
			height: clipBottomPx - clipTopPx,

			left: clipLeftPx,
			right: clipRightPx,
			width: clipRightPx - clipLeftPx
		};
	}
};

module.exports = ClipStyle;
