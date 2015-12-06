// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// normalized clip CSS style

module.exports = function clip(domElement) {
	var rect = this._element.getRawStyle("clip");

	if (rect === "") {
		// As a fallback for IE8 for when it can't fork over the original clip css style, try generating a clip rect
		// using clip components that currentStyle may have.  If we see non-empty strings for all four components, we'll
		// build out a clip rect expression here ...

		var clipLeft = this._element.getRawStyle("clip-left");
		var clipRight = this._element.getRawStyle("clip-right");
		var clipBottom = this._element.getRawStyle("clip-bottom");
		var clipTop = this._element.getRawStyle("clip-top");

		if (clipLeft && clipRight && clipBottom && clipTop) {
			rect = "rect(" + clipTop + " " + clipRight + " " + clipBottom + " " + clipLeft + ")";
		}
	}

	for (var i = 0, ii = UNSET_CLIP_STYLES.length; i < ii; i++) {
		if (UNSET_CLIP_STYLES[i] === rect) {
			return null;
		}
	}

	var matches = rect.match(CLIP_RECT_PATTERN);
	if (!matches) {
		ensure.unreachable("Unknown clip css style: " + rect);
	}

// values in a clip's rect may be a css length or "auto" which means "clip over the edge's border"
	var clipTopPx = this.computeClipTopPxHeight(matches[1]);
	var clipRightPx = this.computeClipRightPxWidth(matches[2]);
	var clipBottomPx = this.computeClipBottomPxHeight(matches[3]);
	var clipLeftPx = this.computeClipLeftPxWidth(matches[4]);

	return {

	};
};
