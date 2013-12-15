// Google Maps&StreetView Presenter 1.2
// (c) stefan.barasso@loki.sk

// define a javascript namespace for the object to prevent script collisions
gW = (typeof gW == "undefined") ? {} : gW;

// this is the Google Maps API developer key, unique to every domain. more info: http://code.google.com/intl/sk/apis/maps/signup.html
gW.Key = "INSERT API KEY HERE";

// if set to false, no map is shown
gW.MapEnabled = true;
// sets the default adress for a single instance
gW.DefaultAdress = "Westminster, London, England";
// default map type. can be G_NORMAL_MAP, G_SATELLITE_MAP, G_HYBRID_MAP
gW.DefaultMapType = "G_HYBRID_MAP";
// the default width and height of the map window
gW.DefaultMapHeight = "500px";
gW.DefaultMapWidth = "400px";
// the default zoom level (optimal is ~16)
gW.DefaultZoomLevel = 16;
// the default id for the map DIV. note that the result id will have the form gw_mapX, where X is the instance counter
gW.DefaultMapHolder = "gw_map";
// default class name for the map DIV
gW.DefaultMapClass = "gw_map";

// if set to false, no markers will be shown on any map
gW.DisplayMarkers = true;

// if set to false, street view is not shown
gW.StreetViewEnabled = true;
// if set to true, the street view will be active at startup
gW.StreetViewActive = true;
// default width and height of the street view window
gW.DefaultStreetViewHeight = "500px";
gW.DefaultStreetViewWidth = "400px";
// the default id for the street view DIV. note that the result id will have the form gw_streetviewX, where X is the instance counter
gW.DefaultStreetViewHolder = "gw_streetview";
// default class name for the street view DIV
gW.DefaultStreetViewClass = "gw_streetview";

// default class name for the DIV that holds map and street view
gW.DefaultLayerClass = "gw_default";

// if set to true, the script will try to automaticly compute the size for maps. experimental
gW.ComputeLayerSize = false;

// internal variables, please do not change until you know what you're doing
// the loading phase of the google maps API. 0 - not loaded, 1 - loading, 2 - loaded
gW.APIPhase = 0;
// instance counter
gW.Counter = 0;
// instance holder
gW.Instances = new Array();

// this function handles the queue for google maps instance creation. the instances can't load parallel
// because the asynchronous ajax calls terminates map loading in some cases (firefox)
gW.Queue = function()
{
    // if google API is loading, skip execution
	if (gW.APIPhase==1)
    {
        return;
    }
    
	// traverse the instances
	for (i in gW.Instances)
    {
        // if a instance is not executed, execute it
		if (!gW.Instances[i]._isExecuted)
        {
            gW.Instances[i].LoadAPI();
            break;
        }
    }
}

// this function creates a Marker with a specified text
// if directions == true, it will add a link for directions
gW.CreateMarker = function(point, html, directions, content)
{
	var marker = new GMarker(point);
	var out = "";
	
	out += html;
	if (directions)
	{
		out += "<form action='http://maps.google.com/maps' method='get' target='_blank'>" +
			   "<br/>Get directions from address:<br/>" +
			   "<input type='text' size='25' maxlength='40' name='saddr'' id='saddr' value='' /><br/>" +
			   "<input value='Get Directions' type='submit'>" +
			   "<input type='hidden' name='daddr' value='" + point.lat() + "," + point.lng() + "'/></form>";
	}
	
	content.html = out;

	GEvent.addListener(marker, "click", function() {
		marker.openInfoWindowHtml(out);
	});

	return marker;
}

// this is the main function for map creation. for full description look at the start of this file or in the documentation
gW.Create = function(o)
{
    // define a new instance of the map/sw object
	this._obj = {
        Adress : gW.DefaultAdress,
    
        StreetView : null,
		StreetViewEnabled : gW.StreetViewEnabled,
        StreetViewHolder : gW.DefaultStreetViewHolder,
        StreetViewHeight : gW.DefaultStreetViewHeight,
        StreetViewWidth : gW.DefaultStreetViewWidth,
		StreetViewActive : gW.StreetViewActive,
		StreetViewClass : gW.DefaultStreetViewClass,
		StartingYaw : -1,
		StartingPitch : -1,
		CaptureYP : false, // set 'true' to allow capturing of current yaw and pitch
		CurrentYaw : -1,
		CurrentPitch : -1,
    
        Map : null,
		MapEnabled : gW.MapEnabled,
        MapType : gW.DefaultMapType,
        MapHolder : gW.DefaultMapHolder,
        ZoomLevel : gW.DefaultZoomLevel,
        MapHeight : gW.DefaultMapHeight,
        MapWidth : gW.DefaultMapWidth,
		MapClass : gW.DefaultMapClass,
        
		Markers : {},
    
        // this is the url for google maps api
		GoogleMapsURL : "http://www.google.com/jsapi?key={KEY}&callback={CALLBACK}",
		LayerClass : gW.DefaultLayerClass,
		ComputeLayerSize : gW.ComputeLayerSize,
		
		_instance : "gW_" + gW.Counter,
		_counter : gW.Counter,
		_isExecuted : false,
    
        // this function will try to load the google maps API
		LoadAPI : function(){
			// add the new instance to the window object to be avaliable for callbacks
			eval("window." + this._instance + " = this;");

			// if google api is loaded, skip new loading and initialize the instance
			if (gW.APIPhase==2)
			{
                this.Initialize();
				return;
			}
            else if (gW.APIPhase==1) // if the api is still loading, terminate
            {
                return;
            }
            else // if the api is not loaded, load it
            {
				gW.APIPhase = 1; // api is loading
                // load google maps api on demand
				var script = document.createElement("script");
                script.src = this.GoogleMapsURL.replace("{KEY}", gW.Key).replace("{CALLBACK}", this._instance + ".Initialize");
                script.type = "text/javascript";
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        },
    
    
        // this function initializes the google maps api
		Initialize : function(){
			var self = eval("window." + this._instance);
			this._self = self;
			// if the api is initialized, create the map
			if (gW.APIPhase==2)
			{
				self.CreateUI();
			}
			else // if the api is not initialized, initialize it..
			{
				google.load("maps", "2", {"callback" : function(){
					self.CreateUI(); // ..and create the map
				}});
			}
        },
		
		// this function will create the actual map and street view
		CreateUI : function(){
			gW.APIPhase = 2; // api is loaded
			var self = eval("window." + this._instance);
				
			if (GBrowserIsCompatible()) // check if the browser is compatible with google maps
               {
                   var geocoder = new GClientGeocoder(); // adress decoder
                   geocoder.getLatLng(self.Adress, function(point){ // gets the coordinates for the adress
					if (self.MapEnabled) // if the map is enabled, draw it
					{
						var mapHolder = document.getElementById(self.MapHolder);
						if (self.ComputeLayerSize) // experimental. automatic size
						{
							mapHolder.style.height = self.MapHeight;
							mapHolder.style.width = self.MapWidth;
						}
							
						// create the actual map
						var map = new GMap2(mapHolder);
						map.setMapType(eval(self.MapType)); // we have to eval the type as it's a variable
						map.setUIToDefault();
						map.setCenter(point, self.ZoomLevel);
                        map.getContainer().style.overflow="hidden";
						self.Map = map;
						
						// display markers
						if (gW.DisplayMarkers)
						{
							for (i in self.Markers)
							{
								var m = self.Markers[i];
								geocoder.getLatLng(m.Adress, function(p){
									// specify empty Text attribute if no attribute is provided
									typeof m.Text == "undefined" ? m.Text = "" : void(0);
									typeof m.Directions == "undefined" ? m.Directions = false : void(0);
									// box the variable to a object
									var content = {html : m.Text};
									// create the marker (content is boxed - it will be passed as a reference)
									var marker = gW.CreateMarker(p, m.Text, m.Directions, content);
									map.addOverlay(marker);
									if (m.DisplayText)
									{
										marker.openInfoWindowHtml(content.html);
									}
								});
							}
						}
					}
						
					if (self.StreetViewEnabled) // if the street view is enabled, draw it
					{
						var swHolder = document.getElementById(self.StreetViewHolder);
						if (self.ComputeLayerSize) // experimental. automatic size
						{
							swHolder.style.height = self.StreetViewHeight;
							swHolder.style.width = self.StreetViewWidth;
						}

						var myPano = new GStreetviewPanorama(swHolder);
							
						if (self.MapEnabled) // if the map is loaded, add the street view overlay
						{
							svOverlay = new GStreetviewOverlay();
							map.addOverlay(svOverlay);
							
							// add a click handler to the map for street view
							GEvent.addListener(map, "click", function(overlay, latlng){
								myPano.setLocationAndPOV(latlng);
							});
						}
							
						// check if the street view will be displayed on startup
						if (self.StreetViewActive)
						{
							// if a Yaw and Pitch is defined for the street view, use it and set the view
							if (self.StartingYaw!=-1 && self.StartingPitch!=-1)
							{
								myPano.setLocationAndPOV(point, {yaw: self.StartingYaw, pitch: self.StartingPitch});
							}
							else
							{
								myPano.setLocationAndPOV(point);
							}

							if (self.CaptureYP)
							{
								self.CurrentYaw = self.StartingYaw;
								self.CurrentPitch = self.StartingPitch;

								// listener reacts to the yawchanged event on the streetview panorama
								GEvent.addListener(myPano, "yawchanged", function(yaw) {
									self.CurrentYaw = yaw;
								});
								
								// listener reacts to pitchchanged even on street view panorama
								GEvent.addListener(myPano, "pitchchanged", function(pitch) {
									self.CurrentPitch = pitch;
								});
							}

						}
						self.StreetView = myPano;
					}
				});
                self._isExecuted = true; // the instance is executed
                gW.Queue(self); // continue the queue
				}
		}
		
    }
    
    
	// check if the parameter is a object
	if (typeof(o)=="object")
	{
		// dynamicly change attributes
		for (param in o)
		{
			try
			{
				eval("this._obj." + param + " = o[param];");
			}
			catch(ex)
			{
				// an error occured, check settings
				// debugger;
			}
		}
	}
	
	// check if the layers for map/sv are already avaliable. if not, create them
	if ((!document.getElementById(this._obj.MapHolder) && this._obj.MapEnabled)
		|| (!document.getElementById(this._obj.StreetViewHolder) && this._obj.StreetViewEnabled))
	{
		// if ComputeLayerSize is enabled, all sizes will be computed automaticly. this is an experimental feature
		var layerWidth = parseFloat(this._obj.StreetViewWidth) + parseFloat(this._obj.MapWidth);
		var layerHeight = (parseFloat(this._obj.StreetViewHeight) > parseFloat(this._obj.MapHeight) ? 
						   parseFloat(this._obj.StreetViewHeight) : parseFloat(this._obj.MapHeight));
		
		!this._obj.MapEnabled ? layerWidth = layerWidth - this._obj.MapWidth : void(0);
		!this._obj.StreetViewEnabled ? layerWidth = layerWidth - this._obj.StreetViewWidth : void(0);

		!this._obj.MapEnabled ? layerHeight = this._obj.StreetViewHeight : void(0);
		!this._obj.StreetViewEnabled ? layerHeight = this._obj.MapHeight : void(0);
		var style = "style='width:" + layerWidth + "px;height:" + layerHeight + "px'";
		
		if (!this._obj.ComputeLayerSize)
		{
			style = "";
		}
		
		var htm = "<div class='" + this._obj.LayerClass + "' " + style + ">";
		
		if (!document.getElementById(this._obj.MapHolder) && this._obj.MapEnabled)
		{
			this._obj.MapHolder = this._obj.MapHolder + gW.Counter;
			htm += "<div id='" + this._obj.MapHolder + "' class='" + this._obj.MapClass + "'></div>";
		}
		if (!document.getElementById(this._obj.StreetViewHolder) && this._obj.StreetViewEnabled)
		{
			this._obj.StreetViewHolder = this._obj.StreetViewHolder + gW.Counter;
			htm += "<div id='" + this._obj.StreetViewHolder + "' class='" + this._obj.StreetViewClass + "'></div>";
		}
		
		htm += "</div>"
		
		document.write(htm);
	}
	
	// push the new instance to the queue
	gW.Instances.push(this._obj);
    gW.Counter++;
    // execute workflow
	this._obj.LoadAPI();
	// return the new instance
	return this._obj;
}
