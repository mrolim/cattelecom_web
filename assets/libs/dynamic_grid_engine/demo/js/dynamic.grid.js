/*
	Dynamic Grid v1.0
	Author: Nikolay Dyankov
	Site: http://www.nikolaydyankovdesign.com
	Email: me@nikolaydyankov.com
*/


(function($) {
	//////////////////////////////////
	// <CORE>
	//////////////////////////////////
	var tmp = new Array(), grid;
	
	var supports = (function() {
		var div = document.createElement('div');
		vendors = 'Khtml Ms O Moz Webkit'.split(' ');
		
		len = vendors.length;
		return function(prop) {  
			if ( prop in div.style ) return true;
			
			prop = prop.replace(/^[a-z]/, function(val) {  
				return val.toUpperCase();  
			});
			
			while(len--) {  
			      if ( vendors[len] + prop in div.style ) {  
			            return true;  
			      }  
			   }
			
			return false;
		};
	})();	
	if (supports('transform')) { }
	
	function log(val) {
		if (console.log) {
			console.log(val);
		}
	}
	function rand(min, max) {
		return Math.random()*(max - min) + min;
	}
	function is_event_within_area(e, a) {
		if (e.pageX > a.offset().left && 
			e.pageX < a.offset().left + a.width() &&
			e.pageY > a.offset().top &&
			e.pageY < a.offset().top + a.height()) {
			return true;
		}
		return false;
	}

	function DGGrid(root, options, content) {
		// Options
		this.O = options;
		
		// Data
		this.cells = content;
		this.nCells = content.length;
		this.html = '';
		this.lastColumnRows = 99999;
		this.lastColumnDirection = -1;
		this.fluidWidth = false;
		
		this.interval = false;
		
		// Objects
		this.columns = new Array();
		
		// Elements
		this.root = root;
		this.wrap = 0;
	}
	DGGrid.prototype.init = function() {
		this.O.height += this.O.padding;
		this.height = this.O.height;
		
		if (this.O.width == undefined) {
			this.root.wrapInner('<div id="dg-temp"></div>');
			var temp = $('#dg-temp');
			this.O.width = temp.width();
			this.width = this.O.width;
			this.fluidWidth = true;
			temp.remove();
		}
		
		this.add_columns();
		this.put_html();
		this.link_elements();
		this.set_styles();
		this.init_animations();
		this.mouse_events();
		this.touch_events();
		this.window_events();
	}
	DGGrid.prototype.add_columns = function() {
		var columns = new Array();
		
		for (var i=0; i<this.O.cols; i++) {
			columns[i] = new Array();
		}
		
		var j = 0;
		for (i=0; i<this.nCells; i++) {
			columns[j].push(this.cells[i]);
			j = (j == this.O.cols - 1) ? 0 : j + 1;
		}
		
		for (i=0; i<this.O.cols; i++) {
			this.columns[i] = new DGColumn(this, columns[i], i, this.O);
			this.columns[i].init();
		}
	}
	DGGrid.prototype.put_html = function() {
		var html = '';
		
		html += '<div class="dg-wrap">';
		html += '	<div class="dg-wrap-inner">';
		
		for (var j=0; j<this.O.cols; j++) {
			html += this.columns[j].html;
		}

		html += '	</div>';		
		html += '</div>';
		
		this.root.html(html);
	}
	DGGrid.prototype.link_elements = function() {
		var i = 0, j = 0, root = this;

		this.wrap = this.root.find('.dg-wrap');
		this.inner = this.wrap.find('.dg-wrap-inner');
		
		this.root.find('.dg-column-wrap').each(function() {
			root.columns[i].root = $(this);

			j = 0;			
			$(this).find('.dg-cell-wrap').each(function() {
				root.columns[i].cells[j].root = $(this);
				root.columns[i].cells[j].img = $(this).find('img');
				j++;
			});
			
			i++;
		});
	}
	DGGrid.prototype.set_styles = function() {
		this.wrap.css({
			"width" : this.O.width,
			"height" : this.O.height - this.O.padding
		});
		this.inner.css({
			"height" : this.O.height
		});
		
		// Call each DGColumn to set it's styles
		for (var i=0; i<this.O.cols; i++) {
			this.columns[i].set_styles();
		}
	}
	DGGrid.prototype.init_animations = function() {
		for (var i=0; i<this.O.cols; i++) {
			this.columns[i].init_animation();
		}
		
		this.start();
	}
	DGGrid.prototype.start = function() {
		if (this.interval != false) {
			clearInterval(this.interval);
		}
		
		var index = 0;
		var root = this;
		this.interval = setInterval(function() {
			if (root.O.cols > 1) {
				index++;
				if (index == root.O.cols) {
					index = 0;
				}
				while (!root.columns[index].animated) {
					index++;
					if (index == root.O.cols) {
						index = 0;
					}
				}
			}
			root.columns[index].advance();
		}, this.O.interval);
	}
	DGGrid.prototype.pause = function() {
		clearInterval(this.interval);
	}
	DGGrid.prototype.mouse_events = function() {
		var root = this;
		this.inner.on('mouseover', function(e) {
			if (is_event_within_area(e, root.inner) && !root.paused) {
				root.paused = true;
				root.pause();
			}
		});
		this.inner.on('mouseout', function(e) {
			if (!is_event_within_area(e, root.inner) && root.paused) {
				root.paused = false;
				root.start();
			}
		});
	}
	DGGrid.prototype.touch_events = function() {
		
	}
	DGGrid.prototype.window_events = function() {
		var root = this;
		
		$(window).on('resize', function() {
			if (root.fluidWidth) {
				root.O.width = root.root.width();
			}
			root.set_styles();
		});
	}
	
	function DGColumn(grid, cells, index, options) {
		this.O = options;
	
		// Objects
		this.parent = grid;
		this.cells = cells;
		this.nCells = this.cells.length;
		
		// Data
		this.index = index;
		this.html = '';
		this.width = 0;
		this.height = 0;
		this.left = 0;
		this.top = 0;
		this.heights = new Array();
		this.positions = new Array();
		
		this.rows = 0;
		
		// Animations
		this.direction = -this.parent.lastColumnDirection;
		this.position = (this.direction == 1) ? 0 : this.nCells - this.rows - 1;
		this.animated = false;
		
		// Elements
		this.root = 0;
		
		// Increment variables
		this.parent.lastColumnDirection = this.direction;
	}
	DGColumn.prototype.init = function() {
		this.set_heights();
		this.set_positions();
		this.set_cells();
		this.set_html();
	}
	DGColumn.prototype.set_heights = function() {
		var tmpAr = new Array();
		
		// Get number of rows for this column
		this.rows = Math.round(rand(this.O.min_rows, this.O.max_rows));
		if (this.rows == this.parent.lastColumnRows && this.O.min_rows != this.O.max_rows) {
			while (this.rows == this.parent.lastColumnRows) {
				this.rows = Math.round(rand(this.O.min_rows, this.O.max_rows));
			}			
		}
		this.parent.lastColumnRows = this.rows;
		
		// Set a base height for each image
		if (this.nCells < this.rows) {
			this.rows = this.nCells;
		}
		
		for (var i=0; i<this.rows; i++) {
			tmpAr[i] = Math.ceil(this.parent.height / this.rows);
		}
		
		// If O.random_heights is true, scramble the heights
		if (this.O.random_heights && this.rows > 1) {
			// var steps = O.max_rows * 10;
			// var step = Math.ceil(O.height / steps);
			var step = 10;

			var min = 80;
			var sum = 0;
			var hSum = 0;
			for (i=0; i < this.rows; i++) {
				tmpAr[i] = 50;
				sum++;
				hSum += 50;
			}
			while (hSum < this.O.height) {
				tmpAr[Math.round(rand(0, this.rows - 1))] += step;
				sum++;
				hSum += step;
			}
			if (hSum > this.O.height) {
				var temp = tmpAr[this.rows - 1];
				tmpAr[this.rows - 1] = temp - (hSum - this.O.height);
			}
		}
		// Fill the rest of the array "heights"
		var j = 0;
		for (i=0; i < this.nCells; i++) {
			this.heights[i] = tmpAr[j];
			j = (j == this.rows - 1) ? 0 : j + 1;
		}
		
	}
	DGColumn.prototype.set_positions = function() {
		this.positions[0] = 0;
		this.positions[1] = this.heights[0];
		for (var i=1; i<this.nCells; i++) {
			this.positions[i+1] = this.positions[i] + this.heights[i];
		}
	}
	DGColumn.prototype.set_cells = function() {
		var tmp = new Array();
		
		for (var i=0; i<this.nCells; i++) {
			tmp[i] = new DGCell(this, this.cells[i].content, this.heights[i], this.O);
			tmp[i].init();
		}
		
		this.cells = tmp;
	}
	DGColumn.prototype.set_html = function() {
		this.html = '';
		
		this.html += '<div class="dg-column-wrap">';
		
		for (var j=0; j<this.nCells; j++) {
			this.html += this.cells[j].html;
		}
		
		this.html += '</div>';
	}
	DGColumn.prototype.set_styles = function() {
		// Call each DGCell to set it's styles
		for (var i=0; i<this.nCells; i++) {
			this.cells[i].set_styles();
		}
		this.width = Math.round((this.O.width-(this.O.padding * (this.O.cols-1))) / this.O.cols);
		this.left = this.index * this.width + (this.O.padding*this.index);
		this.height = this.root.height();
		
		this.top = (this.direction == 1) ? 0 : - (this.height - this.O.height);

		this.root.css({
			"width" : this.width,
			"left" : this.left,
			"top" : this.top
		});
	}
	DGColumn.prototype.init_animation = function() {
		if (this.nCells <= this.rows) return;

		this.animated = true;
		
		this.position = (this.direction == 1) ? 0 : this.nCells - this.rows;

		if (this.direction == -1) {
			this.position = this.nCells - this.rows;
			this.root.css({
				"top" : -this.positions[this.position]
			});
		}
	}
	DGColumn.prototype.advance = function() {
		if (!this.animated) return;
		
		if (this.direction == 1) {
			this.position += 1;
		} else {
			this.position -= 1;
		}
		
		this.root.animate({ "top" : -this.positions[this.position] }, { duration : this.O.speed, easing : this.O.easing });
		if (this.position > this.nCells - this.rows - 1 || this.position <= 0) {
			this.direction = -this.direction;
		}
	}
	
	function DGCell(parent, content, height, options) {
		this.O = options;
		
		// Objects
		this.parent = parent;
		
		// Data
		this.content = content;
		
		this.html = '';
		
		this.width = this.O.width / this.O.cols;
		this.height = height;
		
		// Elements
		this.root = 0;
	}
	DGCell.prototype.init = function() {
		this.html = this.get_html();
	}
	DGCell.prototype.get_html = function() {
		var html = '';
		
		html += '<div class="dg-cell-wrap">';
		html += '	<div class="dg-add-content-wrap">';
		
		html += this.get_additional_content();
		
		html += '	</div>';
		html += '	<div class="dg-main-content-inner-wrap">';
		
		html += this.get_main_content();
		
		html += '	</div>';
		html += '</div>';		
		
		return html;
	}
	DGCell.prototype.set_styles = function() {
		this.root.css({
			"height" : this.height
		});
		this.root.find('.dg-main-content-inner-wrap').css({ 
			"height" : this.height - this.O.padding, 
			"margin-bottom" : this.O.padding
		});
		
		this.imgWidth = this.root.find('img').width();
		this.imgHeight = this.root.find('img').height();
		
		this.init_content();
	}
	DGCell.prototype.get_main_content = function() { return ''; }
	DGCell.prototype.get_additional_content = function() { return ''; }	
	DGCell.prototype.init_content = function() { return; }
	
	//////////////////////////////////
	// </CORE>
	//////////////////////////////////
	
	// REDEFINED METHODS
	DGCell.prototype.get_main_content = function() {
		var html = this.content;
		return html;
	}
	DGCell.prototype.get_additional_content = function() {
	}
	DGCell.prototype.init_content = function() {
	}
	
	$.fn.dynamicGrid = function(options) {
		var D = {
			src : undefined,
			width : undefined,
			height : 400,
			cols : 3,
			min_rows : 2,
			max_rows : 3,
			random_heights : true,
			padding: 1,
			interval : 2000,
			speed : 250,
			easing : ''
		};

		O = $.extend(true, D, options);
		
		return this.each(function() {
			// Load the source content for the plugin. This will be individual for 
			// each variation of the plugin. 
			// The source content will be fed to the DGGrid class and then
			// each DGCell will get it's content from the source content.
			var root = $(this);
			
			if (O.src == undefined) {
				O.src = root;
			}
			
			// Parse HTML code
			var i = 0;
			O.src.find('.dg-cell').each(function() {
				tmp[i] = $(this);
				tmp[i].content = $(this).html();
				i++;
			});
			// Initialize
			grid = new DGGrid(root, O, tmp);
			grid.init();
		});
	}
})(jQuery);


jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */