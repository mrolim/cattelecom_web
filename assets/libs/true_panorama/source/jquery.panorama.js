/**
 * @name jquery.panorama.js
 * @author Sandi http://codecanyon.net/user/Sandi
 * @version v1.0
 * @date 2013
 * @category jQuery plugin
**/




;(function($) {
	
	
	function panoramaEffect($thisObj, params) {
				
		var effect=this;
		
		var settings = jQuery.extend({},{
			
			//DEFAULT SETTINGS
			
			size		: false,	//true (fullscreen), width/height ratio, or false (image height)			
			speed		: 20,		//speed px/sec
			move		: 200,		//max speed px/sec on mouse move
			gravity		: 400,  	//max speed px/sec on mobile device movement
			wheel		: 1,		//sensitivity on mouse wheel					
			drag		: 1,		//sensitivity on drag			
			attenuation	: 4,		//attenuation koefficient
			fade		: 400,		//fade
			fps			: 60		//default fps limit
					
			
	
		} ,params);
					
		
		//variables
		var vx=0;
		var dx=0;
		var dw;
		var maxWidth;
		var maxHeight;
		var currentWidth=0;
		var container;		
		var images_settings;		
		var imageLoading;
		var initComplete;
		var targetv;
		var firstImageLoaded=false;
		
		
		//mouse related vars
		var timerId=-1;
		var timeoutID=-1;	
		var resizeTimer;
		var pressed=false;					
		var mousex;
		var touch = null;		
		var touchStart = 0;			
		var frameRate;
		var attenuation=true;
		var didScroll=false;
		
		var gamma, beta; //mobile angles
		
		if (typeof Date.now == "undefined") {
			Date.now = function(){return new Date().getTime();};
		}		
		var lastActionTime = Date.now();
		
		
		
		
		/* ------ INIT FUNCTIONS ------ */
		
		//init panorama
		var init = function () {						
			
			initComplete=false;			
			images_settings=new Array();	
				
			var bg = $thisObj.css('backgroundImage');
			var $title=$thisObj.find('.panorama_titel').css('position', 'relative').remove();
			var $preloader=$thisObj.find('.panorama_preloader').css('position', 'relative').remove();
			$title.find('img').bind('dragstart', function(event) { event.preventDefault(); });
			
			$thisObj.find('img').each(function(){
				if(this.src){ images_settings.push({path: this.src}); this.src='';}
				else if($(this).data('src')) images_settings.push({path: $(this).data('src')});
			});	
			
			//in case user provided not correct values
			checkSettings();
			
			//update style
			$thisObj.css({
				'overflow'	: 'hidden',
				'position'	: 'relative',				
				'padding'	: '0px'	,
				'backgroundImage': 'none'				
			});	
			
			if(settings['size']===true){
				$thisObj.css({					
					'position'	: 'fixed',				
					'margin'	: '0px'	,
					'width': '100%',				
					'top': '0px',				
					'left': '0px'				
				});	
			}
			
			container=$('<div></div>').css({				
				'overflow'	: 'hidden',
				'top'	: '0px'	,			
				'left'	: '0px'	,	
				'position'	: 'absolute',		
				'padding'	: '0px'	,			
				'margin'	: '0px'				
			});	
						
			$thisObj.empty().append(container, $preloader);
			
			
			$('<div class="panorama_pattern"></div>')
			.css({				
				'width'	: '100%',				
				'height'	: '100%',				
				'background-image'	: bg,				
				'position'	: 'absolute',		
				'top'	: '0px'	,			
				'left'	: '0px'	,			
				'padding'	: '0px'	,			
				'margin'	: '0px'				
			})
			.appendTo($thisObj);	
			
			$thisObj.append($title);
						
			
			//init variables	
			touch = ( 'ontouchstart' in document.documentElement ) ? true : false;			
			if(touch) settings['fade']=false; //no fade effect on mobile			
			calculateRate();			
			targetv=vx;
			
		
			//init on resize
			$(window).resize(function(){			
				initOrientationControl(false);
				stopTimer();
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(onresize, 100);
			});
			
			onresize();			
			initComplete=true;
			
		}
		
		
		// on window resize
		var onresize = function(){			
			if(settings['size']===true){
				//fullscreen
				var brd=parseFloat($thisObj.css('borderWidth'))*2;
				if(isNaN(brd) || !brd) brd=0;
				maxHeight=$(window).height()-brd;
				maxWidth=$(window).width()-brd;
				$thisObj.height(maxHeight);
				$thisObj.width(maxWidth);
				updateSize();
				
			}else if(settings['size']<0){
				//height in pixels
				maxWidth=$thisObj.width();
				var newH=-settings['size'];
				if(maxHeight!=newH){
					maxHeight=newH;
					$thisObj.height(maxHeight);
					updateSize();
				}				
			}else if(settings['size']>0){
				//w/h ratio
				maxWidth=$thisObj.width();
				var newH=maxWidth/settings['size'];	
				if(maxHeight!=newH){
					maxHeight=newH;
					$thisObj.height(maxHeight);
					updateSize();
				}		
			}else maxWidth=$thisObj.width();
			
			loadNextImage(1,false);
			if(initComplete){
				initOrientationControl();
				startTimer();
			}
		};
		
		
		
		
		/* ------ INIT MOUSE/DEVICE CONTROL ------ */
				
		// init controls
		var initControls = function () {		
						
			if (!touch){
				//desktop
				$thisObj.unbind('mousedown mouseup mouseleave mousemove mousewheel DOMMouseScroll MozMousePixelScroll wheel scroll', mouseHandler);				
				if(settings['drag']){
					$thisObj.bind('mousedown', mouseHandler );	
				}
				if(settings['wheel']){					
					$thisObj.bind('mousewheel DOMMouseScroll MozMousePixelScroll wheel', mouseHandler );	
				}
				if(settings['move'] || settings['drag']){
					$thisObj.bind('mousemove mouseleave', mouseHandler );					
					onMouseLieveWindow(true);					
				}
			}
			else{
				//mobile
				$thisObj.unbind('touchstart touchend touchmove', mouseHandler);
				if(settings['drag'] || settings['move']){
					$thisObj.bind( 'touchstart touchend touchmove', mouseHandler );					
				}
				
				// orientation support
				initOrientationControl();
			}
			
			
			
			//win8 touch, cant test, support disabled
			//if (window.navigator.msPointerEnabled) {
			//	xxxxx.addEventListener("MSPointerDown", mouseHandler, false);
			//}
			
		}
		
		var initOrientationControl = function(flag){
			var eventname=false;
			
			if (window.DeviceOrientationEvent) eventname='deviceorientation';
			else if (window.OrientationEvent) eventname='MozOrientation';
			
			if(eventname){
				window.removeEventListener(eventname, mouseHandler,false);
				if(settings['gravity'] && flag!==false){
					window.addEventListener(eventname, mouseHandler,false);
				}
			}
		}
		
		
		var onMouseLieveWindow = function(flag){			
			if (document.addEventListener) {
				if(flag) document.addEventListener("mouseout", mouseHandler, false);
				else document.removeEventListener("mouseout", mouseHandler, false);
			}
			else if (document.attachEvent) {
				if(flag) document.attachEvent("onmouseout", mouseHandler);
				else document.detachEvent("onmouseout", mouseHandler);
			}			
		}
		
		
		//CONTROL HANDLER (MOST IMPORTANT PART)
		var mouseHandler = function (e){
			e = e ? e : window.event;
			
			switch (e.type){
			 	
			//	case 'scroll': didScroll=true; break;
				
				case 'mousemove':
					
					var now=Date.now();
					if (lastActionTime + frameRate > now && !pressed) return;
					
				case 'touchmove':			
					
					attenuation=false;
					var x=getMouseCoordinates(e);
					
					
					
					if(pressed){
						vx=(x-mousex)*settings['drag'];				
						mousex=x;
						if((settings['drag'] && e.type=='mousemove') || e.type=='touchmove'){						
							if(placeLayerTo(vx,true)) removeImgs();
						}
						//onEnterFrame();						
					}else if(settings['move']){						
						var scroll = $('html').scrollLeft();
						if (! scroll) scroll = $('body').scrollLeft();
						x += - $thisObj.offset().left + scroll;										
						targetv=(2*x/maxWidth-1)*settings['move']/settings['fps'];
						//vx=(2*x/maxWidth-1)*settings['move']/settings['fps'];
						//targetv=vx;						
						startTimer();						
					}
										
					calculateDw(vx);	
					lastActionTime = now;					
					break;
				
				case 'mousewheel':
				case 'MozMousePixelScroll':
				case 'wheel':
				case 'DOMMouseScroll':
					
					if(!e.detail && !e.wheelDelta){e = e.originalEvent;} 					
					var delta = e.wheelDelta || -e.detail;
					
					if(!delta) break;									
					delta=Math.abs(settings['wheel'])*((settings['wheel']*delta>0)?1000:-1000)/settings['fps'];
					
					if(vx*delta>0) vx+=delta/3;
					else vx=delta/3;					
					vx=setLimit(vx, Math.abs(settings['wheel'])*1000/settings['fps']);
					
					targetv=(vx>0?1:-1)*Math.abs(settings['speed'])/settings['fps'];
					
					lastActionTime = Date.now()+1000;
					attenuation=true;
					startTimer();
					
					if (e.preventDefault) e.preventDefault();
					e.returnValue = false;					
					break;
				
				case 'touchstart':										
				case 'mousedown': 

					//if (touchStart + frameRate*2 > Date.now()) return;
					vx=0;
					targetv=0;
				
					stopTimer();
					pressed=true;
					mousex=getMouseCoordinates(e);
					
					if(e.type=='mousedown'){						
						$thisObj.unbind('mouseup mousemove', mouseHandler)							
						.bind('mouseup mousemove', mouseHandler)
						.css('cursor','move');
					}
					
					//touchStart = Date.now();
					lastActionTime = Date.now()-500;
					break;
				
					
				case 'mouseout':
				case 'onmouseout':
				
					var from = e.relatedTarget || e.toElement;
					if (!from || from.nodeName == "HTML"){}
					else return;				
										
				case 'mouseleave':				
					targetv=(vx>0?1:-1)*Math.abs(settings['speed'])/settings['fps'];
				
				case 'touchend':		
				case 'mouseup':	
				
					if(e.type=='mouseup' || e.type=='mouseleave'){
						$thisObj.unbind('mouseup mousemove', mouseHandler)					
						.css('cursor','auto');
						if(settings['move']) $thisObj.bind('mousemove', mouseHandler);					
					}
										
					pressed=false;
					attenuation=true;
					
					if(vx!=0){						
						//calculateDw(vx);	
						startTimer();			
					}else if(e.type=='mouseup'){
						//calculateRate();
						targetv=vx;
					}
						
					
					if(e.type=='mouseup' || e.type=='touchend') lastActionTime = Date.now()+1000;
					break;
				
				case 'MozOrientation': 
					e.gamma=eventData.x*90;
					e.beta=-eventData.y*90;
				
				case 'deviceorientation': 
					
					if (lastActionTime + frameRate*3 > Date.now() || pressed) return;					
					attenuation=false;
																		
					var x=0;
					switch (window.orientation){
						
						case 90:
							x=Math.max(-0.5, Math.min(0.5, e.beta/90));								
							break;							
						case -90:								
							x=-Math.max(-0.5, Math.min(0.5, e.beta/90));								
							break;
						case 180:				
							x=Math.max(-0.5, Math.min(0.5, e.gamma/90));								
							break;							
						case 0:
						default:	
							if (e.gamma < -90 || e.gamma > 90) 
							e.gamma = Math.abs(e.gamma)/e.gamma * (180 - Math.abs(e.gamma));					
							x=Math.max(-45, Math.min(45, e.gamma))/90;								
							break;
					}
				
					//if angle less then 3
					if(Math.abs(x)<0.033){
						attenuation=true; 
						targetv=vx;
						if(vx==0) stopTimer();
						return;
					}
					
					targetv = 2*x*settings['gravity']/settings['fps'];						
					startTimer();
					lastActionTime = Date.now();					
					break;
				
			}
			//end of switch
		}
		
		
		
		// Get the coordinates based on input type
		var getMouseCoordinates = function( evt ){
			if(touch){				
				if(evt.type!='touchstart') evt.preventDefault();				
				var tch = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];							
				return tch.pageX;			
			}else {				
				return evt.clientX;					
			}			
		}
		
		
		
		/* ------ ON ENTER FRAME ------ */
		
		// move panorama
		var onEnterFrame = function (){
			
			maxWidth=$thisObj.width(); //fix for frames/colorbox
			var fr=Math.abs(vx)*settings['fps'];
			
			// if its too slow - stop it			
            if(fr<1 && vx==targetv) {vx=0;targetv=0;stopTimer();}
			
			
			
			if(attenuation){				
				//attenuation
				var spmod=Math.abs(settings['speed']);
				//var spmod=Math.abs(targetv);
				if(fr!=spmod){
					vx*=(1+(fr<spmod?1:-1)*settings['attenuation']/settings['fps']);								
					if((fr<spmod && settings['fps']*Math.abs(vx)>spmod) || (fr>spmod && settings['fps']*Math.abs(vx)<spmod)){
						vx=setLimit(vx,spmod/settings['fps']);
						attenuation=false;						
					}
					calculateDw(vx);	
				}else{
					attenuation=false;					
				}
			}else if(vx!=targetv){				
				vx-=Math.min(1,8/settings['fps'])*(vx-targetv);
				if(Math.abs(vx-targetv)*settings['fps']<1){
					vx=targetv;
				}				
			}
				
			
			//if we really moved the image
			if(placeLayerTo(vx,true)) removeImgs();
			
			
		}
		
				
		// place to coordinate
		var placeLayerTo = function(x, isRelative){	
			
			
			if(isRelative){				
				x+=dx;
				dx=x-Math.round(x); //save part of pixel to move next frame
				
				//if no move needed
				if(Math.abs(Math.round(x))<1){return false;}
				
				var xold=container[0].style.left;
				x+=parseFloat(xold);				
			}
			
			container[0].style.left=Math.round(x)+'px';	
			return true;
		}
        
		
		
		
		/* ------ START/STOP functions------ */
				
		// start timer 
		var startTimer = function(){
			
			deletePause();			
			//start
			if(timerId==-1){
				timerId=setInterval(onEnterFrame, frameRate);				
			}			
		}
		
		
		// stop timer
		var stopTimer = function(){			
			clearInterval(timerId);
            timerId = -1;
		}
		
		
		//delete pause
		var deletePause = function(){			
			//clear pause if any
			if(timeoutID!=-1){			
				clearTimeout(timeoutID);
				timeoutID=-1;
			}
		}
		
		
		
		
		/* ------ SMART IMAGE LOAD (suitable for multiple images)------ */
		
		
		//for correct positioning, in case if images are loaded after initialization
		var loadNextImage = function(direction, showNow){			
			//if busy
			if(imageLoading) return;
			
			
			
			//no img - no effect			
			if(images_settings.length==0){ stopTimer(); return;}
			
			var i=0;
			
			//if we have enought img - dont load more
			if(direction>0){
				if(parseFloat(container[0].style.left)+currentWidth-maxWidth>dw) return;
				else if(container[0].lastChild){ 					
					
					i=$(container[0].lastChild).data('index');
					i=getIndex(i,1);											
				}
			}else{
				if(-parseFloat(container[0].style.left)>dw) return;				
				else if(container[0].firstChild){
					
					i=$(container[0].firstChild).data('index');
					i=getIndex(i,-1);								
				}				
			}
			
			//if was loaded before
			if(images_settings[i].img){					
				var $img=(images_settings[i].img).clone(true).attr('src', images_settings[i].path);//.hide()
								
				if(direction>0) container.append($img);					
				else container.prepend($img);				
								
				if(settings['size']) updateSize($img[0]);	
				else{
					currentWidth+=$img[0].width;				
					container.width(currentWidth);
				}
				
				if(direction<0){					
					placeLayerTo(-$img[0].width, true);									
				}
				
				showImage($img,showNow,direction);
				loadNextImage(direction, showNow);
				return;
			}
			
			
			//if was not loaded before
			var $img=$('<img>')
			.bind('dragstart', function(event) { event.preventDefault(); })
			.css({
				'float'	: 'left',
				'padding'	: '0px',
				'margin'	: '0px',
				'vertical-align'	:'top',
				'top':'0px',
				'border:':'0',
				'border-style':'none'
			}).data('index',i);
			
			images_settings[i].img=$img.clone(true);
			imageLoading=true;
			
			$img.error(function(){
				images_settings.splice(i, 1);
				imageLoading=false;
				loadNextImage(direction, showNow);					
			})
			.one('load',function () {				
				var that=$(this);
				if(direction>0) container.append(that);					
				else container.prepend(that);
				
				updateSize(this);
							
				showImage(that,showNow,direction);
								
				if(direction<0) placeLayerTo(-this.width, true);
				
				if(!firstImageLoaded){	
					$thisObj.find('.panorama_preloader').remove();
					firstImageLoaded=true;
					initControls();			//init mouse controls
					startTimer();
				}
				
				imageLoading=false;
				loadNextImage(direction, showNow);
				
			})
			.attr('src', images_settings[i].path)
			.each(function () {			
				var that=$(this);				
				//that.hide();
				if (this.complete && this.width>0 && this.height>0) {
					that.trigger('load'); //trigger load						
				}				
			});	

		}
		
		
		
		/* ------ HELPERS ------ */

		var getIndex = function(i,di){
			if(di>0) return (i>=images_settings.length-1)?0:(i+1);
			else return (i<=0)?(images_settings.length-1):(i-1);
		}
		
		
		var setLimit = function(value, limit){			
			if(Math.abs(value)>Math.abs(limit)){
				value=(value<0?-1:1)*limit;					
			}
			return value;
		}
		
		var getW = function(){
			var w=0;
			container.children('img').each(function(){
				w+=this.width;
			});
			return w;
		}
		
				
		// update sizes (stratch images if necessary)
		var updateSize = function(newImage){			
			
			if(settings['size']){				
				if(!maxHeight) return;
				
				if(typeof newImage == 'undefined'){
					var $imgs=container.find('img');
					currentWidth=0;						
				}
				else var $imgs=$(newImage);
				
				
				//if nothing to resize
				if(!$imgs.length) return;
				
				var minscale=1;
				
				$imgs.each(function(){						
					if(this.height){				
						var scale=maxHeight/this.height;
						minscale=Math.min(minscale,scale);
						this.width=this.width*scale;
						//if(typeof newImage == 'undefined') 
						currentWidth+=this.width;
					}
				});
				
				if(typeof newImage == 'undefined'){
					var x=parseInt(container[0].style.left)*minscale;				
					placeLayerTo(x, false);
				}
				
				//if(typeof newImage == 'undefined') 
				container.width(currentWidth);
				
				return;
			}
			
			
			//if no size provided - use image height
			if(typeof maxHeight=='undefined'){
				maxHeight=newImage.height;
				
				if(typeof newImage != 'undefined'){
					currentWidth+=newImage.width;
					container.width(currentWidth);
				}
				
				$thisObj.height(maxHeight);	//on mobile makes fig resized somehow				
				return;
			}
			
			
			
			//if more then one image - use minimal height and cut the rest			
			maxHeight=Math.min(maxHeight, newImage.height);			
			if($thisObj.height()!=maxHeight){				
				$thisObj.animate({height: maxHeight}, 300);
			}
			
		}
		
		
		//remove img if necessary
		var removeImgs = function(){
			var x=parseFloat(container[0].style.left);	
			if(vx<0){
				var first=container[0].firstChild;
				if(first.width<-x) {					
					placeLayerTo(first.width,true);
					$(first).remove();		
					currentWidth=getW();
					container.width(currentWidth);
				}			
			
				if(x+currentWidth-maxWidth<dw) loadNextImage(1,false);				
			}
			else if(vx>0){			
				var last=container[0].lastChild;
				if(x-last.width+currentWidth>maxWidth) {	
					$(last).remove();
					currentWidth=getW();
					container.width(currentWidth);
				}
				
				if(-x<dw) loadNextImage(-1,false);
			}			
		}
		
		
		
		//show loaded images
		var showImage=function(img, showNow,direction){			
						
			if(showNow || settings['fade']<=0 || !isVisible(img[0],direction)){
				img.show();
			}else{
				//img;
				img.hide().fadeIn(settings['fade'], function(){
					   if(typeof jQuery.browser == 'obgect')
					   if(jQuery.browser.msie) img[0].style.removeAttribute('filter'); //to fix IE problem
				});
			}			
		}
		
		
		//check if image visible
		var isVisible = function(img,direction){			
			var xi=currentWidth-img.width;			
			var x=parseInt(container[0].style.left);
			if(x+xi>maxWidth) return false;
			if(direction>0) return true;
			if(x+img.width<0) return false;
			return true;			
		}
		
	
		
		// converts strings to boolean or number
		var parseValue = function (x) {				
			if(typeof x == 'string'){
				var lower=x.toLowerCase();
				if(lower==String("false") || lower==String("no")) return false;
				if(lower==String("true") || lower==String("fullscreen")) return true;
				if(lower.indexOf("px") === -1) return false;
				lower=parseInt(lower);
				if(isNaN(lower)) return false;
				return -lower;
			}
			
			var ret=parseFloat(x);
			if(isNaN(ret)==false) return ret;
			
			return x;
		}
		
		
		//confirm settings (fool proof)
		var checkSettings = function(){				
			for(var i in settings) settings[i]=parseValue(settings[i]);				
			if(settings['fps']<1) settings['fps']=1;					
			if(settings['fadein']<0) settings['fadein']=0;		
			if(settings['attenuation']<0) settings['attenuation']=0;
			if(typeof settings['size'] == 'string') settings['size']=false;
			else if(settings['size']!==true && settings['size']!==false) settings['size']=(settings['size']==0)?false:(settings['size']);
		}
		
		
		var calculateRate = function(){
			frameRate = Math.round(1000 / settings['fps']);			
			vx=-settings['speed']/settings['fps'];
			calculateDw(settings['speed']);	
		}
		
		var calculateDw = function(v){
			dw=Math.max(200,Math.abs(v*2));	
		}
		
			
		
		/* ------ PUBLIC FUNCTIONS ------ 
			option(property, value)
			pause(t:Number)
			play(speed:Number)
			destroy()
		*/
				
				
		//options set/get
		this.option = function(prop, n){	
			//fool proof
			if(typeof prop != 'undefined'){
				
				prop=prop.replace(/^\s+|\s+$/g, "");				
				if(typeof settings[prop] === 'undefined') return $thisObj;			
				if(typeof n == 'undefined') return settings[prop];
				
				var oldValue=settings[prop];
				
				if(typeof n == 'string'){
					n=n.replace(/^\s+|\s+$/g, '');					
					settings[prop]=parseValue(n);
				}else if(typeof n == 'boolean' || typeof n == 'number' || typeof n == 'function') settings[prop]=n;
				
				//if value didnt change - do nothing
				if(oldValue===settings[prop] || prop=='size') return;
				
				//check settings
				checkSettings();
				
				//do some action on update settings
				if(prop=='fps' || prop=='speed'){					
					calculateRate();
					if(prop=='speed') targetv=vx;
					stopTimer();
					startTimer();
				}
				else if(prop=='move' || prop=='wheel' || prop=='drag'){
					initControls();
				}
				else if(prop=='gravity'){initOrientationControl();}	

			}
		}
				
		
				
		//pause
		this.pause = function(t){			
			if(timerId!=-1){
				stopTimer();
				if(t>0){	
					deletePause(); 
					timeoutID=setTimeout(startTimer,t);
				}
			}
		}
		
		
		//play
		this.play = function(speed){
			if(!isNaN(parseFloat(speed))){
				speed=parseFloat(speed);
				vx=-speed/settings['fps'];				
				calculateDw(speed);	
				targetv=(vx>0?1:-1)*Math.abs(targetv);
			}
			
			
			
			attenuation=true;
			startTimer();
		}
		
		//destroy it
		this.destroy = function(){
			stopTimer();			
			$thisObj.find('img').unbind().removeData();
			$thisObj.unbind();			
			onMouseLieveWindow(false);
			initOrientationControl(false);
			$(window).unbind('scroll', mouseHandler);
			$thisObj.images_settings = null;
			$thisObj.removeData(plugin);
		}
		
		
		/* ------ INIT panorama ------ */		
		init();
				
	}

	
	
	/* ------ ENTRY POINT  ------ */
	
	// plugin name
	var plugin = 'panorama';
	
	// magic starts here
	$.fn[plugin] = function(settings) {		
		if (this.length == 0) return false;
		
		var methodName = arguments[0];
		
		if (typeof methodName === 'string') { 			
								
			var $thisObj= $(this);
			var instance= $thisObj.data(plugin);					
			if(typeof instance[settings] === 'function'){
				var args = Array.prototype.slice.call(arguments, 1);
				return instance[settings].apply($thisObj[0], args);
			}
					
		}else if (typeof settings === "object" || !settings){
			return this.each(function (){
				var $thisObj= $(this);
				var instance= $thisObj.data(plugin);
				//create 
				if (typeof settings === 'object' || !settings){											
					return $thisObj.data(plugin,  new panoramaEffect($thisObj, settings));	
				}
			});
		
		}
		
	};
		
	
	/////////// YES! I DID IT! AGAIN :) ////////////
	
	
})(jQuery);