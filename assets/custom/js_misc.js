// carousel quotes speed, tooltip, nav collapde, modal box
jQuery('.carousel2').carousel({ interval: 4000})
$('[data-toggle="tooltip"]').tooltip({ 'placement': 'top' })
jQuery('.navbar .nav > li > a').click(function(){
jQuery('.navbar .in').removeClass('in').addClass('collapse').css('height', '0');
$('.modal').bigmodal('hide');
});
