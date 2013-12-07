/*****************************************************************************
	SLIDER REVOLUTION
******************************************************************************/
$(document).ready(function() {
	if ($.fn.cssOriginal!=undefined)
	$.fn.css = $.fn.cssOriginal;
	$('.fullwidthbanner').revolution(
		{
			delay:9000,
			startwidth:1170,
			startheight:610,
			onHoverStop:"on",	
			navigationType:"none",		
			soloArrowLeftHOffset:0,
			soloArrowLeftVOffset:0,
			soloArrowRightHOffset:0,
			soloArrowRightVOffset:0,
			touchenabled:"on",			
			fullWidth:"on",
			shadow:0					
		});
});		