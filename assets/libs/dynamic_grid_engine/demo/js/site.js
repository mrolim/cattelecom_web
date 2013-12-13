(function ($, undefined) {
	$(document).ready(function() {
		$('#grid1').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 3,
			'min_rows' : 2,
			'max_rows' : 3,
			'interval' : 1500,
			'easing' : 'easeOutCubic',
			'speed' : 1000
		});
		$('#grid2').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 3,
			'width' : 600,
			'min_rows' : 2,
			'max_rows' : 2,
			'random_heights' : false,
			'interval' : 1500
		});
		$('#grid3').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 2,
			'min_rows' : 2,
			'max_rows' : 2,
			'interval' : 1500,
			'random_heights' : false,
			'width' : 400
		});
		$('#grid4').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 1,
			'min_rows' : 2,
			'max_rows' : 2,
			'interval' : 1500,
			'random_heights' : false,
			'width' : 200
		});
		$('#grid5').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 1,
			'min_rows' : 4,
			'max_rows' : 4,
			'interval' : 1500,
			'random_heights' : false,
			'width' : 100
		});
		$('#grid6').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 4,
			'min_rows' : 1,
			'max_rows' : 1,
			'interval' : 1500,
			'width' : 400,
			'height' : 100,
			'random_heights' : false
		});
		$('#grid7').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 1,
			'min_rows' : 1,
			'max_rows' : 1,
			'width' : 600,
			'height' : 250,
			'interval' : 2500
		});
		$('#grid8').dynamicGrid({
			'src' : $('#grid1'),
			'cols' : 4,
			'min_rows' : 1,
			'max_rows' : 2,
			'height' : 400,
			'interval' : 2500,
			'random_heights' : false
		});
	});

	function example3() {
		$('#grid-destination').find('#grid1').remove();
		$('#grid-destination').html($('#grid-src').html());
		$('#grid-destination').find
	}
	function example4() {
		$('#grid-destination').find('#grid1').remove();
		$('#grid-destination').html($('#grid-src').html());
		$('#grid-destination').find
	}
	function example5() {
		$('#grid-destination').find('#grid1').remove();
		$('#grid-destination').html($('#grid-src').html());
		
	}
	function example6() {
		$('#grid-destination').find('#grid1').remove();
		$('#grid-destination').html($('#grid-src').html());
		$('#grid-destination').find
	}
	function example7() {
		$('#grid-destination').find('#grid1').remove();
		$('#grid-destination').html($('#grid-src').html());
		$('#grid-destination').find
	}
	function example8() {
		$('#grid-destination').find('#grid1').remove();
		$('#grid-destination').html($('#grid-src').html());
		$('#grid-destination').find
	}
	
}(jQuery));