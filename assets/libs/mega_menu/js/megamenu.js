// Item Name : Mega Menu Reloaded
// Item URI : http://codecanyon.net/item/mega-menu-reloaded/1593152
// Author URI : http://codecanyon.net/user/Pixelworkshop/
// Version : 2.0



(function ($) {



    var settings = {
		menu_speed_show : 300, // Time (in milliseconds) to show a drop down
		menu_speed_hide : 200, // Time (in milliseconds) to hide a drop down
		menu_speed_delay : 200, // Time (in milliseconds) before showing a drop down
		menu_effect : 'open_close_slide', // Drop down effect, choose between 'hover_fade', 'hover_slide', 'click_fade', 'click_slide', 'open_close_fade', 'open_close_slide'
		menu_easing : 'jswing', // Easing Effect : 'easeInQuad', 'easeInElastic', etc.
		menu_click_outside : 0, // Clicks outside the drop down close it (1 = true, 0 = false)
		menu_show_onload : 0, // Drop down to show on page load (type the number of the drop down, 0 for none)
		menubar_trigger : 0, // Show the menu trigger (button to show / hide the menu bar), only for the fixed version of the menu (1 = show, 0 = hide)
		menubar_hide : 0, // Hides the menu bar on load (1 = hide, 0 = show)
        menu_responsive : 1, // Enables mobile-specific script
        menu_carousel : 0, // Enable / disable carousel
        menu_carousel_groups : 0, // Number of groups of elements in the carousel
        hoverIntentConfig:{ // HoverIntent Configuration
            sensitivity:2, // number = sensitivity threshold (must be 1 or higher)
            interval:100, // number = milliseconds for onMouseOver polling interval
            over:megaMenuOver, // function = onMouseOver callback (REQUIRED)
            timeout:200, // number = milliseconds delay before onMouseOut
            out:megaMenuOut // function = onMouseOut callback (REQUIRED)
        }
    };


    var methods = {
        

        init:function (options) {


            settings = $.extend(1, settings, options);


            return this.each(function () {


				var	megaMenu = $(this),
					menuItem = $(megaMenu).children('li'),
					menuItemSpan = $(menuItem).children('span'),
					menuDropDown = $(menuItem).children('.megamenu_fullwidth');
					menuDropDownScroller = $('.megamenu_scroller_container');
                    menuButton = $('.megamenu_button');

                if(options.menu_carousel === 1){
                    megaMenuCarousel();
                }
				if(options.menu_click_outside === 1){
					megaMenuClickOutside();
				}
				if ((menuDropDownScroller.length > 0)) {
					$(menuDropDownScroller).nanoScroller({alwaysVisible: true});                    
	            }   
				
				$(menuDropDown).css('left', '0').hide();

                megaMenuTabs();


                // Mobile Devices

                if (("ontouchstart" in document.documentElement) && (settings.menu_responsive === 1)) {


                    if ($(window).width() < 768) {
                        $(menuDropDown).css({'left':'0', 'top':'auto'}).hide();
                        $(menuItem).hide(0);
                        $(menuButton).show(0);
                        $(menuButton).children('span').hammer().on('tap', function () {
                            $(menuButton).toggleClass('megamenu_button_active')
                            $(menuItem).not(":eq(0)").toggle(0);
                        });
                    }

                    $(menuItem).toggleClass('noactive');

                    $(menuItem).children('span').hammer().on('tap', function () {
                        
                        var $this = $(this);
                        $this.parent(menuItem).toggleClass('active noactive')
                            .find(menuDropDown).toggle(0).end()
                            .siblings().addClass('noactive').removeClass('active')
                            .find(menuDropDown).hide(0);
                        return false;
                        
                    });

                    $(document).hammer().on('tap', function () {
                        $(menuItem).addClass('noactive');
                        $(menuDropDown).hide(0);
                    });
                    $(megaMenu).hammer().on('tap', function (event) {
                        event.stopPropagation();
                    });
                    $(window).bind('orientationchange', function () {
                        $(menuItem).addClass('noactive');
                        $(menuDropDown).hide(0);
                    });

                    return;


                } 


                // Desktop Computers

                else {


                    megaMenuDropDownPosition();

                    $(window).resize(function() {
                        megaMenuDropDownPosition();
                    });

                    $(menuButton).click(function () {
                        $(menuButton).toggleClass('megamenu_button_active');
                        $(menuItem).not(":eq(0)").toggle(0);
                    });

    				if( options.menubar_trigger === 1 ) {
    					megamenuBarHide = options.menubar_hide;
    					megaMenuTrigger();
    				}

                    switch (settings.menu_effect) {

                        case 'open_close_fade':
                        var menuEffectShow = 'fadeToggle',
                            menuEffectHide = 'fadeOut';
                        break;
                        case 'open_close_slide':
                        var menuEffectShow = 'slideToggle',
                            menuEffectHide = 'slideUp';
                        break;
                        case 'open_close_toggle':
                        var menuEffectShow = 'toggle',
                            menuEffectHide = 'hide';
                        break;

                    }
                        
                    switch (settings.menu_effect) {

                        case 'hover_fade':
                        case 'hover_slide':
                        case 'hover_toggle':
                        case 'click_fade':
                        case 'click_slide':
                        case 'click_toggle':
                            $(menuItem).hoverIntent(settings.hoverIntentConfig);
                        break;

                        case 'open_close_fade':
                        case 'open_close_slide':
                        case 'open_close_toggle':

                            $('.megamenu > li:nth-child(' + settings.menu_show_onload + ')')
                                .find(menuDropDown).show()
                                .closest(menuItem).toggleClass('active');

                            $(menuItem).unbind('mouseenter mouseleave').click(function () {

                                var $this = $(this);
                                $this.siblings().removeClass('active')
                                    .find(menuDropDown)[menuEffectHide](settings.menu_speed_hide);
                                $this.toggleClass('active')
                                    .find(menuDropDown).first()
                                    .delay(settings.menu_speed_delay)[menuEffectShow](settings.menu_speed_show)
                                    .click(function (event) {
                                        event.stopPropagation();
                                    });

                            });

                        break;
                    
                    }


                }


            }); // End each

        },

        update:function (options) {
            settings = $.extend(1, settings, options);
        }

    };



	$.fn.megaMenuReloaded = function (method) {


        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('No found method ' + method);
        }


    };


    function megaMenuDropDownPosition() {

        if (($(window).width() < 768) && (settings.menu_responsive === 1)) {
            $('.megamenu').children('li').css({'display':'none'});
            $('.megamenu_button').css({'display':'block'});
        }

        else {
            $('.megamenu').children('li').css({'display':'inline'});
            $('.megamenu_button').css({'display':'none'});
        }

    }


    function megaMenuOver() {

        var $this = $(this),
            dropDown = $('.megamenu_fullwidth',this);
        
        switch (settings.menu_effect) {
            case 'hover_fade':
                $(dropDown).fadeIn(settings.menu_speed_show);
            break;
            case 'hover_slide':
                $(dropDown).slideDown(settings.menu_speed_show);
            break;
            case 'hover_toggle':
                $(dropDown).show(settings.menu_speed_show);
            break;
            case 'click_fade':
                $this.click(function () {
                    $(dropDown).fadeIn(settings.menu_speed_show);
                });
            break;
            case 'click_slide':
                $this.click(function () {
                    $(dropDown).slideDown(settings.menu_speed_show);
                });
            break;
            case 'click_toggle':
                $this.click(function () {
                    $(dropDown).show(settings.menu_speed_show);
                });
            break;

        }

    }


    function megaMenuOut() {
    
        var $this = $(this),
            dropDown = $('.megamenu_fullwidth',this);

        switch (settings.menu_effect) {
            case 'hover_fade':
            case 'click_fade':
                $(dropDown).fadeOut(settings.menu_speed_hide);
            break;
            case 'hover_slide':
            case 'click_slide':
                $(dropDown).slideUp(settings.menu_speed_hide);
            break;
            case 'hover_toggle':
            case 'click_toggle':
                $(dropDown).toggle(settings.menu_speed_hide);
            break;

        }

    }
	
	
	function megaMenuTrigger(){
		
		var megaMenuBar = $('.megamenu_fixed');
		
		$(megaMenuBar).after('<a id="megamenu_trigger" href="#"></a>');
		
		if( megamenuBarHide === 1 ) {
			$(megaMenuBar).hide(0);
			$('#megamenu_trigger').toggleClass("active");
		}
		
		$('#megamenu_trigger').click(function() {
			$(megaMenuBar).slideToggle(300);
			$(this).toggleClass("active");
			return false;
		});
		
	}
	
	
	function megaMenuClickOutside(){
		
		$(document).click(function(){
			$('.megamenu').children('li').removeClass('active');
			$('.megamenu_fullwidth').hide(0);
		});
		
		$('.megamenu').click(function(event){
			event.stopPropagation();
		});
		
	}
    
    
    /**
     * Simple Carousel
     * Copyright (c) 2010 Tobias Zeising, http://www.aditu.de
     * Licensed under the MIT license
     * 
     * http://code.google.com/p/simple-carousel/
     * Version 0.3
     */
    function megaMenuCarousel(){
        
        var megaMenu = $('.megamenu');

        $(megaMenu).append('<span class="megamenu_carousel_prev"></span><span class="megamenu_carousel_next"></span>');

        var defaults = {
            width:$('.megamenu_wrapper').width(),
            visible:1,
            next: $('.megamenu_carousel_next'),
            prev: $('.megamenu_carousel_prev'),
            current: 0,
            items: 2,
            slidespeed: 600
        };
        var width = defaults.width;
        
        $(megaMenu).wrap('<div class="megamenu_carousel_frame"></div>');
        
        var container = $(megaMenu).parent('.megamenu_carousel_frame');

        var slide = function(dir, click) {
        
            if(dir=="next") {
                defaults.current += defaults.visible;
                if(defaults.current>=defaults.items)
                    defaults.current = 0;
            } else if(dir=="prev") {
                defaults.current -= defaults.visible;
                if(defaults.current<0)
                    defaults.current = (defaults.visible==1) ? defaults.items-1 : defaults.items-defaults.visible+(defaults.visible-(defaults.items%defaults.visible));
            } else {
                defaults.current = dir;
            }
            
            $(megaMenu).animate( {marginLeft: -1.0*defaults.current*defaults.width}, defaults.slidespeed );
            
        }
            
        if(defaults.next!=false)
            defaults.next.click(function() {
                slide('next',true);
            });
            
        if(defaults.prev!=false)
            defaults.prev.click(function() {
                slide('prev',true);
            });        

    }
    
    
    function megaMenuTabs(){
        
        $('.megamenu_tabs').each(function(index, value) { 
                
            var menuTabs = $(this);
                menuTabsNav = menuTabs.find(".megamenu_tabs_nav > li > a");

            menuTabsNav.click(function() {
            
                var menuTabsLinkCurrent = menuTabs.find("a.current").attr("href").substring(1),
                    $menuTabsLink = $(this),
                    menuTabsLinkID = $menuTabsLink.attr("href").substring(1);

                if ((menuTabsLinkID != menuTabsLinkCurrent) && ( menuTabs.find(":animated").length == 0)) {
                                        
                    menuTabs.find(".megamenu_tabs_nav li a").removeClass("current");
                    $menuTabsLink.addClass("current");

                    menuTabs.find("#"+menuTabsLinkCurrent).fadeOut(300, function() {

                        menuTabs.find("#"+menuTabsLinkID).fadeIn(300);
                        var newHeight = menuTabs.find("#"+menuTabsLinkID).height();

                    });
                    
                }   
                
                return false;
                
            });

        }); 
        
    }



})(jQuery);