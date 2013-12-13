/**
 * @name jquery.real-parallax.js
 * @author Sandi http://codecanyon.net/user/Sandi
 * @version v1.0
 * @date 2012
 * @category jQuery plugin
**/

;(function($) {
	
	
	function parallaxEffect($thisObj, params) {
				
		var effect=this;
		
		var settings = jQuery.extend({},{
			
			//DEFAULT SETTINGS
			
			width				: $thisObj.width(), 	//width  is taken from width  of the element
            height				: $thisObj.height(), 	//height is taken from height of the element
            			
			enableMouse			: true,
			activateOnClick		: false,	//if true - effect will appear only on click
			sensitivityX		: 0.5,		//if sensitivity=0 no parallax effect will be applied
			sensitivityY		: 0.4,		//negative values invert mouse
			easingCoefficient	: 7,		//bigger value - slower/smoother movement
			
			autoZCoordinate		: true,		//if true - Z-coordinates will be assigned automatically (between +100 and -100)
			useCustomZ			: true,		//if false - provided Z-coordinates will be rewritten to auto values (between +100 and -100)
			focusZ				: 0 		//objects with z>focusZ move in opposite direction
					
		} ,params);
					
		
		//variables
		var targetX=0;
		var targetY=0;		
		var currentX=0;
		var currentY=0;
				
		var layers;				
		var number_of_layers;
		var layers_settings;
		var timerId=-1;
		var timeoutID=-1;
		var chain = new Array();	
		var linkedParallaxes = new Array();	
		var chainStarted=false;
		var loopChain=false;		
		var cssPosition;
		
				
		/* ------ INIT FUNCTIONS ------ */
		
		//init parallax
		var init = function () {
			
			//update size
			$thisObj.width(settings['width']);
			$thisObj.height(settings['height']);
			
			//init variables						
			layers = $thisObj.children('div');
			number_of_layers=layers.length;
			layers_settings=new Array();
			cssPosition=$thisObj.css('position');
			
			//preventing possible problems with positioning
			if(cssPosition=='static')	$thisObj.css('position', 'relative');
						
			//update style			
			layers.css('padding', '0');
			layers.css('margin', '0');
			layers.css('position', 'absolute');
			
			
			
			//get settings of each layer and start parallax			
			parseLayersSettings();				
			fadeInImages();
			setLayersZ();				
			initControls();
			
			//possible problems with positioning avoided
			if(cssPosition=='static') $thisObj.css('position', 'static');
		
			
			
		}
		
				
		// get and store settings of each layer
		var parseLayersSettings = function (){
			var xym=$thisObj.offset();
			
			for (var i=0; i<number_of_layers; i++){
				layers_settings[i]={};				
								
				//z-coordinate
				var z = parseFloat(jQuery(layers[i]).data("z"));
				if(!isNaN(z)) layers_settings[i]['z']=z;
				
				//foolprove for lock property
				var lock = jQuery(layers[i]).data("lock");
				if(lock!=undefined){
					if(typeof lock == 'string') lock=lock.replace(/^\s+|\s+$/g, "").toLowerCase();						
					if(lock!="false" && lock!=false && lock!="no") 
						layers_settings[i]['locked']=true;
				}else layers_settings[i]['locked']=false;
				
				
								
				/* // can parse any data-settings (possible extention for future)				
				var settings_string = jQuery(layers[i]).data("settings");
				if(settings_string!=undefined && settings_string!=''){					
					settings_string=settings_string.replace(/^\s+|\s+$/g, "").toLowerCase();
					var settings_array = settings_string.split(",");
					for (var j=0; j<settings_array.length; j++){
						var name_val=settings_array[j].split(":");						
						if(name_val.length>=2){
							layers_settings[i][name_val[0]]=parseValue(name_val[1]);						
						}
					}
				}	
				*/
				
				
				var id=jQuery(layers[i]).attr("id");
				if(id!=undefined) layers_settings[i]['id']=id;
								
				var xy=$(layers[i]).offset();
				
				
				
				layers_settings[i]['x']=(xy.left-xym.left);
				layers_settings[i]['y']=(xy.top-xym.top);
			
				placeLayerTo(i,layers_settings[i]['x'],layers_settings[i]['y']);
				
			}	
		
		}
		
			
		// set Z coordinates of layers if needed
		var setLayersZ = function(){			
			var z=100;
			var dz=-2*z/number_of_layers;
			for (var i=0; i<number_of_layers; i++){
				if(settings['autoZCoordinate']==true){
					if(settings['useCustomZ'] && layers_settings[i]['z']!=undefined){
						layers_settings[i]['z']=layers_settings[i]['z'];
					}else{
						layers_settings[i]['z']=z;
						z+=dz;
					}
				}else{					
					if(layers_settings[i]['z']==undefined)
						layers_settings[i]['z']=settings['focusZ'];					
				}
			}			
		}
		
		
		// init controls
		var initControls = function () {		
			$thisObj.unbind('mousemove', mouseMove);
			$thisObj.unbind('mousedown', mouseMove);
			if(settings['enableMouse']==true){
				if(settings['activateOnClick']==true) $thisObj.bind('mousedown', mouseMove);
				else $thisObj.bind('mousemove', mouseMove);
			}
		}
		
		
		
		
		/* ------ OTHER FUNCTIONS ------ */
		
		// converts strings to boolean or number
		var parseValue = function (x) {
			if(x==String("false") || x==String("no")) return false;
			else if(x==String("true") || x==String("yes")) return true;
			else return parseFloat(x);
		}
		
		
		// convert string to coordinate
		var parseCoordinate = function(n){
			return n!='auto'?parseFloat(n):0;
		}
				
		
		// on mouse move
		var mouseMove = function (e) {
			
			if (settings['sensitivityX']!=0) {
				var scroll = $('html').scrollLeft();
				if (! scroll) scroll = $('body').scrollLeft();
				var x = e.clientX - $thisObj.offset().left + scroll;
				if (x > settings['width']) x = settings['width'];
				else if (x<0) x = 0;
				
				targetX = x-settings['width']/2;			
			}
			
			if (settings['sensitivityY']!=0) {
                var scroll = $('html').scrollTop();
				if (! scroll) scroll = $('body').scrollTop();
				var y = e.clientY - $thisObj.offset().top + scroll;
				if (y > settings['height']) y = settings['height'];
				else if (y <0) y = 0;

				targetY = y-settings['height']/2;
			}
			

			//interrupt chain on mouse move
			if(chainStarted==true) effect.stopChain();
			
			startTimer();
			
			//send command to enother parallax
			sendToLinked('mouseToRatio', {x:x/settings['width'], y:y/settings['height']});
			
			
		}
		
		
		// start timer 
		var startTimer = function(){
			deletePause();
			
			//start
			if(timerId==-1){
				timerId=setInterval(onEnterFrame, 20);
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
		
		
		// place layer i to x, y coordinates
		var placeLayerTo = function(i, x, y){
			//slow
			//jQuery(layers[i]).css('left', x);
			//jQuery(layers[i]).css('top',  y);
			
			//about 2 times faster
			layers[i].style.left=x+'px';
			layers[i].style.top=y+'px';
			
		}
        
		
		// move layers
		var onEnterFrame = function (){
			var dx=(targetX-currentX);
			var dy=(targetY-currentY);
			
			 // if its too slow - stop it
            if(Math.abs(dx)<1 && Math.abs(dy)<1) {
				stopTimer();
				continueChain();
            }			
			
			currentX+=dx/(1+settings['easingCoefficient']);
			currentY+=dy/(1+settings['easingCoefficient']);
			
			for (var i=0; i<number_of_layers; i++){				
				if(layers_settings[i]['locked']==true) continue;
				
				var koef=0.01*(layers_settings[i]['z']-settings['focusZ']);				
				placeLayerTo(i, layers_settings[i]['x']-currentX*settings['sensitivityX']*koef, layers_settings[i]['y']-currentY*settings['sensitivityY']*koef);
							
			}
			
		}
		
	
		// fadein loaded images
		var fadeInImages = function(){		
			for (var i=0; i<number_of_layers; i++){
				//check if images are loaded 				
				$(layers[i]).find('>img').hide().one('load',function () {					
					$(this).fadeIn(800, function(){
										   if (jQuery.browser.msie) this.style.removeAttribute('filter'); //to fix IE problem
									});					
				}).each(function () {				
					if (this.complete && this.width>0) {						
						//$(this).show(); //show it immediately
						$(this).trigger('load'); //trigger load
					}
					//this line is not necessary, no need to show not loaded images?
					//else setTimeout(function() {$(this).trigger('load');}, 1000);
				});			
			}
		}
		
	
		// get next action in chain
		var getNext = function(){			
			if(chain.length>0){
				var action=chain.shift();
				if(loopChain==true) chain.push(action);
				return action;
			}else return false;
		}
		
		
		// continue the chain of actions
		var continueChain = function(){			
			if(chainStarted==true){
				effect.startChain(loopChain);
			}
		}
		
	
		//send command to linked parallaxes
		var sendToLinked = function (command, params){
			if(linkedParallaxes.length>0){
				for(var i=0;i<linkedParallaxes.length;i++){	
					$('#'+linkedParallaxes[i])[plugin](command, params);
				}
			}
		}
	
		
		
		/* ------ PUBLIC PARALLAX FUNCTIONS ------ 
			option(property:String, value) 
			
			pause(t:Number)
			unpause()
			triggerPause()
			stop()
			enableMouse(b:boolean)
			mouseTo({x:number, y:number})
			mouseToRatio({x:number, y:number})
			mouseToRandom()
			reset()
			centerTo({id:'id', align:'TL', offx:number, offy:number})
		
			addToChain(function:String, params)
			clearChain()			
			startChain(loop:Boolean)
			stopChain()
		
			linkWith("anotherParallaxID")
			resetLinks()
		
		*/
				
		
		//options set/get
		this.option = function(prop, n){	
			//fool proof
			if(typeof prop != 'undefined'){
				prop=prop.replace(/^\s+|\s+$/g, "");
				if(prop=='enableMouse' || prop=="activateOnClick"){
					if(typeof n == 'undefined') return settings[prop];
					settings[prop]=Boolean(n);
					initControls(); 
					if(prop=='enableMouse') continueChain();
				}else if(settings[prop]!=undefined){
					if(typeof n != 'undefined' && !isNaN(parseFloat(n))) settings[prop]=parseFloat(n);
					else return settings[prop];					
				}
			}
		}
		
		
		//set/get layers x,y,z,locked  by ID or layer number
		this.layer = function(id, opt){
			
			if (typeof id != 'undefined'){
				
				var i0=0;
				var i1=number_of_layers;
				var searchByLayerNumber=!isNaN(parseInt(id));
				
				if(searchByLayerNumber){
					i0=Math.min(parseInt(id),number_of_layers-1);
					i1=i0+1;
				}
								
				
				for (var i=i0; i<i1; i++){					
					if(searchByLayerNumber==true || layers_settings[i]['id']==id){
						
						if (typeof opt != 'undefined'){
							
							if(opt.x != undefined) layers_settings[i]['x']=opt.x;
							if(opt.y != undefined) layers_settings[i]['y']=opt.y;
							if(opt.z != undefined) layers_settings[i]['z']=opt.z;							
							if(opt.locked != undefined) layers_settings[i]['locked']=Boolean(opt.locked);
							onEnterFrame();
							
						}else return layers_settings[i];
						break;
					}					
				}
				
			}
		}
		
		
		//enable/disable mouse
		this.toggleMouse = function(){			
			settings['enableMouse']=!settings['enableMouse'];
			initControls(); 
			continueChain();
		}
		
		
		// PARALLAX CONTROL
		
		//pause parallax effect
		this.pause = function(t){			
			if(timerId!=-1){
				stopTimer();
				if(t>0){	
					deletePause(); 
					timeoutID=setTimeout(startTimer,t);
				}
			}else if(chainStarted==true){
				deletePause();
				timeoutID=setTimeout(continueChain,t);
			}
		}
		
		
		//update parallax effect
		this.update = function(){
			onEnterFrame();
		}
		
		
		//unpause parallax effect
		this.unpause = function(){
			startTimer();
		}
		
		
		//trigger pause 
		this.triggerPause = function(){
			if(timerId!=-1){
				stopTimer();
				//continueChain();
			}
			else startTimer();
		}
		
		
		//stop parallax effect
		this.stop = function(){
			targetX=currentX;
			targetY=currentY;
			continueChain();
		}
		
				
		//imitate mouse movement to x, y
		this.mouseTo = function (target) {			
			var x=targetX;
			var y=targetY;
			
			//if it contains coordinates
			if (typeof target == 'object'){
				if (!isNaN(parseFloat(target.x))) x=target.x-settings['width']/2;
				if (!isNaN(parseFloat(target.y))) y=target.y-settings['height']/2;
			}			
			
			targetX=x;
			targetY=y;
			
			startTimer();
		}
		
		
		//imitate mouse movement to x, y in %
		this.mouseToRatio = function (target) {			
			targetX=(target.x-0.5)*settings['width'];
			targetY=(target.y-0.5)*settings['height'];			
			startTimer();
		}
		
		
		//imitate mouse movement to random position
		this.mouseToRandom = function () {
			targetX=(0.5-Math.random())*settings['width'];
			targetY=(0.5-Math.random())*settings['height'];			
			startTimer();			
		}
		
		
		//imitate mouse movement to the center of frame
		this.reset = function () {			
			targetX=0;
			targetY=0;
			startTimer();
		}
		
		
		//center to layer
		this.centerTo = function (target) {			
			var x=targetX;
			var y=targetY;
			
			//search for layer by reference id
			if (typeof target == 'object' && typeof target.id != 'undefined' && target.id!=''){				
				for (var i=0; i<number_of_layers; i++){				
					if(layers_settings[i]['id']==target.id){
						var koef=0.01*(layers_settings[i]['z']-settings['focusZ']);
						if(koef!=0){
							
							var alignCoefficientX=1;
							var alignCoefficientY=1;
							
							var offsetX=0;
							var offsetY=0;
							
							//check align
							if (typeof target.align != 'undefined' && target.align!=''){
								target.align=target.align.toLowerCase();
								
								if(target.align.indexOf('l')!=-1) alignCoefficientX=0;
								else if(target.align.indexOf('r')!=-1) alignCoefficientX=2;
								
								if(target.align.indexOf('t')!=-1) alignCoefficientY=0;
								else if(target.align.indexOf('b')!=-1) alignCoefficientY=2;
							}
							
							//check offset
							if(!isNaN(parseFloat(target.offx))) offsetX=parseFloat(target.offx);
							if(!isNaN(parseFloat(target.offy))) offsetY=parseFloat(target.offy);
							
							
							if(settings['sensitivityX']!=0)
								x=(layers_settings[i]['x'] - offsetX - 0.5*(settings['width']-(alignCoefficientX)*jQuery(layers[i]).width()))/(koef*settings['sensitivityX']);
													
							if(settings['sensitivityY']!=0)
								y=(layers_settings[i]['y'] - offsetY - 0.5*(settings['height']-(alignCoefficientY)*jQuery(layers[i]).height()))/(koef*settings['sensitivityY']);
						}						
						break;
						
					}	
				}	
			}
			
			targetX=x;
			targetY=y;
			startTimer();
		}
				
		
		
		
		// functions to work with the chain of actions
		this.addToChain = function (){
			if(arguments[0] != undefined){
				if(arguments[1] != undefined) chain.push({method:arguments[0], parameters:arguments[1]});
				else chain.push({method:arguments[0]});				
				//alert("added  "+arguments[0]+"  "+arguments[1]);
			}
		}
				
		this.clearChain = function (){
			chain=[];
		}
		
		this.startChain = function (b){
			loopChain=Boolean(b);			
			chainStarted=true;
			action=getNext();			
			
			
			//alert(action['method']+" "+action['parameters'])
			if(action!=false){
				if(action['parameters']!= undefined) effect[action['method']](action['parameters']);
				else effect[action['method']]();

			}else{
				chainStarted=false;
			}
			
		}
		
		this.stopChain = function (){
			chainStarted=false;
			deletePause(); 
			if(timerId!=-1){
				stopTimer();
			}
		}
		
		
		
		// functions to work with linked parallaxes
		this.linkWith = function(){
			var links=Array.prototype.slice.apply(arguments);
			linkedParallaxes.push(links);			
		}
		
		this.resetLinks = function (){
			linkedParallaxes=[];
		}
		
		
		
		
		
		/* ------ INIT PARALLAX ------ */
		
		init();
		
		
	}

	
	
	/* ------ ENTRY POINT  ------ */
	
	// plugin name
	var plugin = 'parallax';
	
	// everything starts here
	$.fn[plugin] = function(settings) {
		
		var args = arguments;
		var $thisObj;
		var instance;
		
		if (this.length == 0) return false;
		
		$thisObj = $(this);
		instance = $thisObj.data(plugin);
		
		if (!instance) {			
			//create parallax
			if (typeof settings === 'object' || !settings){
				return $thisObj.data(plugin,  new parallaxEffect($thisObj, settings));	
			}
		} else {
			//interact with parallax by calling its functions			
			if (instance[settings]) {				
				return instance[settings].apply(this, Array.prototype.slice.call(args, 1));
			}
		}

	};
	
	
	
})(jQuery); 