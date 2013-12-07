/*****************************************************************************
	CSS3 ANIMATIONS
*****************************************************************************/
	jQuery('.jumbotron').appear(function() {
		$('.jumbotron').each(function(){
			$(this).addClass("fadeIn");
		});
	});
	jQuery('.hi-icon').appear(function() {
		$('.hi-icon').each(function(){
			$(this).addClass("fadeIn");
		});
	});
	jQuery('.grid').appear(function() {
		$('.grid').each(function(){
			$(this).addClass("slideRight");
		});
	});
	jQuery('.grida').appear(function() {
		$('.grida').each(function(){
			$(this).addClass("fadeIn");
		});
	});
	jQuery('#myCarousel').appear(function() {
		$('#myCarousel').each(function(){
			$(this).addClass("fadeIn");
		});
	});
	
	jQuery('.carousel2').appear(function() {
		$('.carousel2').each(function(){
			$(this).addClass("slideUp");
		});
	});
	jQuery('.pricing').appear(function() {
		$('.pricing').each(function(){
			$(this).addClass("slideRight");
		});
	});
	jQuery('.soon').appear(function() {
		$('.soon').each(function(){
			$(this).addClass("bounce");
		});
	});
	jQuery('#bar-1, #bar-2, #bar-3, #bar-4').appear(function() {
		$('#bar-1, #bar-2, #bar-3, #bar-4').each(function(){
			$(this).addClass("slideUp");
		});
	});
