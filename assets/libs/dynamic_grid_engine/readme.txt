1. What is Dynamic Grid?

Dynamic Grid is a jQuery plugin with many potential uses. It's really good for a content slider, gallery, news feed, and much more.
The script generates an animated and responsive grid for you. Here are some of the options that you can play with:

- Number of columns
- Number of rows
- Random/fixed cell height
- Padding between columns
- Fluid/fixed width
- Height
- Easing effect
- Animation speed
- Animation interval

The script gives you a great deal of control over the behavior and the looks of the grid, which makes it super flexible and with many usage possibilities. The script gives you a strong foundation of the widget that you wish to create. From there on, filling and styling the content inside is all up you!



2. Requirements

- jQuery 1.7 or later
- Basic HTML/CSS/JS knowledge



3. Installation

Installing Dynamic Grid is as simple as including the .js and .css files to your page:

CSS:
<link rel="stylesheet" href="css/dynamic.grid.css" type="text/css" />

JS:
<script src="js/dynamic.grid.js"></script>

An important thing to note - make sure that you include the .js file after you include jQuery.



4. Using Dynamic Grid

There are two important aspects of making the grid work - you need to give it some content and you need to call the plugin.

	4.1. The Content
	
		The very least HTML code that the plugin requires looks like this:
	
		<div id="gridID">
			<div class="dg-cell"></div>
			<div class="dg-cell"></div>
			<div class="dg-cell"></div>
			<!-- More cells... -->
		</div>
	
		#gridID -> This is the root element of the grid. It will remain unchanged, meaning that no styles will be added to it. The entire markup for the grid will be put inside it.
		.dg-cell -> This is an element holding a single cell. The classname "dg-cell" is required. Also, this is the element in which you put the content for each cell.
	
	4.2. Calling the plugin
	
		The simplest way to call the plugin looks like this:
	
		$('#gridID').dynamicGrid({
			'src' : $('#gridID')
		});
	
		The element on which you call the plugin is the container in which the grid will be put. The option 'src' specifies where to take the content from. In our case, it's the same element #gridID.
	
		List of all available options:
	
		src 			-> The element from which content will be taken, also number of cells, etc. Default: undefined
		width			-> The total width of the grid. Leave blank if you need fluid width. Default: undefined
		height			-> The total height of the grid. Default: 400
		cols			-> The number of columns. Default: 3
		min_rows		-> The minimum number of visible cells at any time. The script generates a random number between this parameter and max_rows. Default: 2
		max_rows		-> The maximum number of visible cells at any time. The script generates a random number between this parameter and min_rows. Default: 3
		random_heights	-> Set this to "true" if you want the heights of cells to be random. Set it to "false" if you want the cells to have equal width. Default: true
		padding			-> The padding between the cells (in pixels). Default: 1
		interval		-> The frequency of the animation in milliseconds. Default: 2000
		speed			-> The transition speed of the animation in milliseconds. Default: 250
		easing			-> The easing effect for the animation. Default: undefined. Possible values: 
	
								swing, 
								easeInQuad, 
								easeOutQuad, 
								easeInOutQuad, 
								easeInCubic, 
								easeOutCubic,
								easeInOutCubic,
								easeInQuart,
								easeOutQuart,
								easeInOutQuart,
								easeInQuint,
								easeOutQuint,
								easeInOutQuint,
								easeInSine,
								easeOutSine,
								easeInOutSine,
								easeInExpo,
								easeOutExpo,
								easeInOutExpo,
								easeInCirc,
								easeOutCirc,
								easeInOutCirc,
								easeInElastic,
								easeOutElastic,
								easeInOutElastic,
								easeInBack,
								easeOutBack,
								easeInOutBack,
								easeInBounce,
								easeOutBounce,
								easeInOutBounce


5. Final Words

This is pretty much all there is to this plugin. It's really simple to use and in the same time gives you great control over the functionality.
If you like this plugin, the best way to support my work is to rate this script (from your Downloads page at CodeCanyon) and follow me on Twitter for updates and more cool stuff.

Support: http://support.nikolaydyankovdesign.com/

Thank you for buying Dynamic Grid and have fun with it!