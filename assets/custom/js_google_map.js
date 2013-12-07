/*****************************************************************************
	GOOGLE MAP - ADD YOUR ADDRESS HERE
******************************************************************************/	
$(window).load(function() {
	$(".google-maps").gmap3({
    marker:{     
address:"23, Mornington Crescent, London",  options:{icon: "img/marker.png"}},
    map:{
      options:{
styles: [ {
stylers: [
{ "visibility": "on" }, { "saturation": -70 }, { "gamma": 1 }]
}],
        zoom: 14,
		scrollwheel: false,
		mapTypeControl: false,
		streetViewControl: false,
		scalControl: false,
		draggable: false}
		}
	});	
});	
