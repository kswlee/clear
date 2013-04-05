/*
* jQuery plug-in for CSS3 transform
*/ 

(function($) {

'use strict';

$.TRANSFORM = {
	TRANSFORM_STYLE: {
		FLAT: 'flat',
		PRESERVE_3D: 'preserve-3d',
	},
};

var defaultOptions = {
	translateX: 0,
	translateY: 0,
	translateZ: 0,
	scaleX: 1,
	scaleY: 1,
	scaleZ: 1,
	rotateX: 0,
	rotateY: 0,
	rotateZ: 0,
};

$.fn.transform = function(transform) {
	var temp = jQuery.extend({}, defaultOptions);
	var o = $.extend(temp, transform);
	var styleString = "";
	$.map(o, function(value, key) {
		var unit = '';
		if (key.indexOf("translate") >= 0) {
			unit = 'px';
			value = parseInt(value, 10);
		}
		styleString += (key + "(" + value + unit + ") ");
	});
	
	return this.each(function(){
		$(this).css('transform', styleString);
	});
};

$.fn.transformOrigin = function(origin) {
	return this.each(function(){
		$(this).css('transform-origin', origin);
	});
};

$.fn.transformStyle = function(style) { // TRANSFORM_STYLE
	return this.each(function(){
		$(this).css('transform-style', style);
	});
};

$.fn.perspective = function(perspective) {
	return this.each(function(){
		$(this).css('perspective', perspective);
	});
};

$.fn.perspectiveOrigin = function(origin) {
	return this.each(function(){
		$(this).css('perspective-origin', origin);
	});
};

})(jQuery);