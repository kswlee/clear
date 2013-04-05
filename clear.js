/*
* jQuery plug-in for CLEAR UI clone
*/ 

(function($) {
	'use strict';

var 
	_itemList = [],
	_data = null,
	_options = {
		itemHeight: 50,
		padding: 10,
	},
	
	_tempWrap = null,

	_wrap = function(e) {
		if (e.originalEvent === undefined) return;
		if (e.originalEvent.touches === undefined) return;
		if (e.originalEvent.touches.length <= 0) return;

		e.pageX = e.originalEvent.touches[0].pageX;
		e.pageY = e.originalEvent.touches[0].pageY;
	},

	getItemColor = function(index) {
		var basicCount = 6;
		var len = Math.max($('.inner').length, basicCount);
		//index %= 9;
		var r = 217, g = 0, b = 21; // 220, 28, 23 
		var r_ = r + 3 * basicCount, g_ = g + 28 * basicCount, b_ = b + 2 * basicCount;

		r = ((r_ - r) / len) * index + r;
		g = ((g_ - g) / len) * index + g;
		b = ((b_ - b) / len) * index + b;

		r = parseInt(Math.min(r, 255), 10); g = parseInt(Math.min(g, 255), 10); b = parseInt(Math.min(b, 255), 10);
		var rgb ="rgb("+r+","+g+","+b+")";		
		return rgb;
	},

	_itemStyle = {				
		'color': 'white',
		'font-size': '23px',
		'font-family': 'helvetica',
		'position': 'absolute',
		'left': 0,
		'top': 0,
		'width': '100%',
		'height': _options.itemHeight,
		'-webkit-transition': 'top 0.3s',		
	},
	
	_createItem = function(parent, item) {
		var divItem = $('<div class="outer"><div class="inner"></div</div>')
			.css(_itemStyle);
			//.disableSelection();
			// inner item

		divItem.find(".inner")
			.disableSelection()
			.html(item.content)
			.css(_itemStyle)
			.css({
				'padding-top': _options.padding,
				'padding-left': _options.padding,
				'width': parent.width() - _options.padding,
				'height': _options.itemHeight - _options.padding - 2,
				'border-top': 'solid 1px rgba(255, 255, 255, 0.1)',
				'border-bottom': 'solid 1px rgba(0, 0, 0, 0.1)',
				'text-decoration': item.checked? 'line-through' : '',
			});

		if (item.edit) {
			divItem.find(".inner").attr('contentEditable', true);
			divItem.find(".inner").enableSelection();
			divItem.find(".inner").focus();

		}

		return divItem;
	},

	PI = Math.PI, 

	rad = function(degrees) {
		return degrees/180*PI;
	};

	$.Clear = function(el, options) {
		this.element = $(el);
		//this.element.disableSelection();
		this.initItems(options.data);
		this.bindEvents();
		return this;
	};

	$.Clear.prototype.removeTransition = function(remove) {
		var children = this.element.children();
		for (var i = 0; i < children.length; ++i) {
			$(children[i])
				.css('-webkit-transition', remove? '' : 'top 0.3s');
		}		
	};

	$.Clear.prototype.createExpandedItem = function(index) {
		this._tempWrap = $('<div><div class="top"><span></span></div><div class="bottom"><span></span></div></div>')
		.css({
			'position': 'absolute',
			'top': index * _options.itemHeight,
			'left': 0,
			'z-index': 99999,
			'width': this.element.width(),
			'height': _options.itemHeight,
		})
		.transformStyle($.TRANSFORM.TRANSFORM_STYLE.PRESERVE_3D)
		.perspectiveOrigin('50% 50%')
		.perspective('450px')
		.disableSelection()
		.insertBefore(this.element);

		this._tempWrap.find('span').html('Pinch to create');
		this._tempWrap.children()
		//.html('Pinch to create')
		.css({
			'color': 'white',
			'font-size': '23px',
			'position': 'absolute',
			'padding-top': _options.padding,
			'padding-left': _options.padding,
			'top': 0, 
			'left': 0,
			'width': this.element.width() - _options.padding,
			'height': _options.itemHeight - _options.padding,
			'background-color': getItemColor(index),		
			'background-image': 'rgba(0,0,0,0.7)',
			'-webkit-transform-origin-y': '0%',
			'-webkit-transform': 'rotateX(-90deg)',
			'clip': 'rect(0px,480px,25px,0px)'
		})
		.disableSelection();

		this._tempWrap.find('.bottom')
			.css({
				'top': -_options.itemHeight / 2,
				'background-color': getItemColor(index),
				'-webkit-transform-origin-y': '100%',
				'-webkit-transform': 'rotateX(90deg)',
				'clip': 'rect(25px,480px,50px,0px)'});

		$('<div class="topMask" style="position:absolute;left:0px;top:0px;width:100%;height:100%"></div>')
			.css({
				'padding-top': _options.padding,
				'padding-left': _options.padding,
				'top': 0, 
				'left': 0,
				'width': this.element.width() - _options.padding,
				'height': _options.itemHeight - _options.padding,
				'background': 'black',
				'opacity': 1,
			})
			.appendTo(this._tempWrap.find(".top"));

		$('<div class="bottomMask" style="position:absolute;left:0px;top:0px;width:100%;height:100%"></div>')
			.css({
				'padding-top': _options.padding,
				'padding-left': _options.padding,
				'top': 0, 
				'left': 0,
				'width': this.element.width() - _options.padding,
				'height': _options.itemHeight - _options.padding,
				'background': 'black',
				'opacity': 0.5,
			})
			.appendTo(this._tempWrap.find(".bottom"));			
	};	

	$.Clear.prototype.expandingItem = function(index, relativePos, mode) {
		if (relativePos < 0) relativePos = 0;
		relativePos = Math.min(relativePos, _options.itemHeight);
		var progrss = relativePos / _options.itemHeight;
		var opacityTop = 0.5 - 0.5 * progrss;
		var opacityBottom = 0.65 - 0.65 * progrss;

		if (mode == 'bottom_only') {
			this._tempWrap.find(".top").hide();
			this._tempWrap.find(".bottom").css('clip', '');
		} else if (mode == 'top_only') {
			this._tempWrap.find(".bottom").hide();
			this._tempWrap.find(".top").css('clip', '');
		}

		var deg = 90 - (90 * (relativePos / _options.itemHeight));		
		var edge = (_options.itemHeight / 2) * Math.cos(rad(deg)) * 2 - 1;
		this._tempWrap.find(".top").transform({rotateX: -1 * deg + 'deg'});
		this._tempWrap.find(".bottom").transform({rotateX: deg + 'deg'});
		this._tempWrap.find(".bottom").top(-_options.itemHeight + edge);
		this._tempWrap.find(".topMask").css('opacity', opacityTop);
		this._tempWrap.find(".bottomMask").css('opacity', opacityBottom);

		this._tempWrap.find('span').html((progrss > 0.5)? "Release to create item" : "Pinch to create");
 		
		var children = this.element.children();
		for (var i = index; i < children.length; ++i) {
			$(children[i]).top(_options.itemHeight * i + edge);
		}
	};
	
	$.Clear.prototype.addBottomItem = function() {
		var index = this.element.children().length;
		this.createExpandedItem(index);

		var self = this;
		var pos = 0;
		var tempWrap = this._tempWrap;
		var _f = function() {
			pos += 3;
			self.expandingItem(index, pos, 'top_only');
			if (pos >= _options.itemHeight) {
				self.appendItem({content:'default', checked: false, edit: true});
				tempWrap.remove();
				tempWrap = null;
				return;
			} else {
				window.setTimeout(_f, 10);
			}
		};
		window.setTimeout(_f, 10);
	};

	$.Clear.prototype.bindEvents = function() {
		$(document.body).bind_('mousedown', $.proxy(function(e){
			if (e.target == document.body)
				this.addBottomItem();
		}, this));
	};	

	$.Clear.prototype.bindEvents = function() {
		var activeIndex = -1;
		var beginPos = 0;
		var _onMove = $.proxy(function(e) {					
			_wrap(e);
			var relative = e.pageY - beginPos;			
			this.expandingItem(activeIndex, relative);
			e.preventDefault();
			e.stopPropagation();			
			return false;
		}, this);

		this.element.bind_('mousedown', $.proxy(function(e){
			_wrap(e);
			this.removeTransition(true);			
			activeIndex = $(e.target).data('index') | $(e.target).parent().data('index');
			this.createExpandedItem(activeIndex);
			beginPos = e.pageY;
			$(document.body).bind_('mousemove', _onMove);
		}, this));

		$(document.body).bind_('mouseup', $.proxy(function(e){
			_wrap(e);
			$(document.body).unbind_('mousemove', _onMove);
			this.removeTransition(false);
						
			var children = this.element.children();
			for (var i = 0; i < children.length; ++i) {
				$(children[i]).top(_options.itemHeight * i);
			}
			
			if (this._tempWrap != null) {
				this._tempWrap.remove();
				this._tempWrap = null;
				this._tempTop = null;
				this._tempBottom = null;
			}
		}, this));

		$(document.body).bind_('swipeone', $.proxy(function(e, param){
			console.log('swipeone ' + e);
		}, this));
	};

	$.Clear.prototype.initItems = function(items) {
		if (items === undefined) {
			return;
		}

		for (var i = 0; i < items.length; ++i) {
			this.appendItem(items[i]);
		}
	};

	$.Clear.prototype.focusItem = function(index) {
		var items = this.element.children();
		var offset = 0;_options.itemHeight * index * -1;
		for (var i = 0; i < items.length; ++i) {
			var top = parseInt($(items[i]).css('top'), 10);
			$(items[i]).css('top', top + offset);
			if (index != i) {
				$(items[i]).css({'opacity': 0.4});
			}
		}
	}

	$.Clear.prototype.appendItem = function(item) {
		this.insertItem(-1, item);

		if (item.edit) {
			this.focusItem(this.element.children().length - 1);
		}
	};

	$.Clear.prototype.insertItem = function(pos, item) {		
		var divItem = _createItem(this.element, item);

		var top = 0;
		var targetItem = null;
		if (pos == -1) {			
			divItem.appendTo(this.element);
			divItem.css('top', _options.itemHeight * (this.element.children().length - 1));
			this.element.css('height', _options.itemHeight * (this.element.children().length));
		} else {
			targetItem = $(this.element.children()[pos]);
			divItem.insertBefore(targetItem);
		}

		if (pos >= 0) divItem.css('top', _options.itemHeight * pos);
		this.element.css('height', _options.itemHeight * (this.element.children().length));

		var children = this.element.children();
		for (var i = 0; i < children.length; ++i) {
			$(children[i])
				.data('index', i)
				.css('top', _options.itemHeight * i)
				.css('background', getItemColor(i));
		}
	};

	$.Clear.prototype.removeItem = function() {
	}

	$.Clear.prototype.doneItem = function(pos, unDone) {
		var target = $(this.element.children()[pos]);
		target
			.css('text-decoration', unDone? '' : 'line-through')
			.css('background', unDone? getItemColor(pos) : 'rgb(40,40,40)');
	}

	// this should return element itself to achieve jQuery chain
	$.fn.clear = function( options ) { 
		var inst = new $.Clear(this, options);
		this.data('clear', inst);
		return this;
	}

	// ********************************************
	// utility 
	$.fn.disableSelection = function() {
        return this.each(function(){
            $(this).attr('unselectable', 'on')
                 .css('user-select', 'none')
                 //.on('selectstart', false);
        });
    };

    $.fn.enableSelection = function() {
        return this.each(function(){
            $(this).attr('unselectable', 'on')
                 .css('user-select', '')
                 //.on('selectstart', true);
        });
    };

    $.fn.top = function(top) {
    		return this.each(function(){
    			var $this = $(this);
    			$this.css('top', top);
    		});
    };

    $.fn.textDecoration = function(lineThrough) {
    	return this.each(function(){
    		var $this = $(this);
    		$this.css('text-decoration', lineThrough? 'line-through' : '');
    	});
    };

    // eventType [, eventData] , handler(eventObject)
    $.fn.bind_ = function() {
    	var mapping = {
    		'mousedown': 'touchstart',
    		'mousemove': 'touchmove',
    		'mouseup': 'touchend',
    	};

    	var args = arguments;
    	if ($.browser.mobile) {
    		args[0] = mapping[args[0]] || args[0];
    	}

    	return this.each(function() {    		
    		$(this).bind.apply($(this), args);
    	});
    };

	$.fn.unbind_ = function() {
    	var mapping = {
    		'mousedown': 'touchstart',
    		'mousemove': 'touchmove',
    		'mouseup': 'touchend',
    	};

    	var args = arguments;
    	if ($.browser.mobile) {
    		args[0] = mapping[args[0]] || args[0];
    	}

    	return this.each(function() {    		
    		$(this).unbind.apply($(this), args);
    	});
    };    

})(jQuery);

/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){jQuery.browser.mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);