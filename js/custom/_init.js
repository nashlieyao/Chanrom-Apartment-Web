/* global jQuery:false */
/* global WINDSOR_STORAGE:false */

jQuery(document).ready(function() {
	"use strict";
	WINDSOR_STORAGE['theme_init_counter'] = 0;
	windsor_init_actions();
});


// Theme init actions
function windsor_init_actions() {
	"use strict";

	if (WINDSOR_STORAGE['vc_edit_mode'] && jQuery('.vc_empty-placeholder').length==0 && WINDSOR_STORAGE['theme_init_counter']++ < 30) {
		setTimeout(windsor_init_actions, 200);
		return;
	}
	
	windsor_ready_actions();
	windsor_resize_actions();
	windsor_scroll_actions();

	// Resize handlers
	jQuery(window).resize(function() {
		"use strict";
		windsor_resize_actions();
	});

	// Add resize on VC action vc-full-width-row
	jQuery(document).on('vc-full-width-row', function(e, el) {
		windsor_resize_actions();
	});
	
	// Check fullheight elements
	jQuery(document).on('action.init_hidden_elements', windsor_stretch_height);
	jQuery(document).on('action.init_shortcodes', windsor_stretch_height);

	// Scroll handlers
	jQuery(window).scroll(function() {
		"use strict";
		windsor_scroll_actions();
	});
}



// Theme first load actions
//==============================================
function windsor_ready_actions() {
	"use strict";

	// Add scheme class and js support
    //------------------------------------
	document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/,'js');
	if (document.documentElement.className.indexOf(WINDSOR_STORAGE['site_scheme'])==-1)
		document.documentElement.className += ' ' + WINDSOR_STORAGE['site_scheme'];

	// Init background video
    //------------------------------------
	if (WINDSOR_STORAGE['background_video'] && jQuery('.top_panel.with_bg_video').length > 0) {
		// After mejs init
		setTimeout(function() {
			jQuery('.top_panel.with_bg_video').prepend('<video id="background_video" loop muted></video>');
			var bv = new Bideo();
			bv.init({
				// Video element
				videoEl: document.querySelector('#background_video'),
				
				// Container element
				container: document.querySelector('.top_panel'),
				
				// Resize
				resize: true,
				
				// autoplay: false,
				
				isMobile: window.matchMedia('(max-width: 768px)').matches,
				
				playButton: document.querySelector('#background_video_play'),
				pauseButton: document.querySelector('#background_video_pause'),
				
				// Array of objects containing the src and type
				// of different video formats to add
				// For example:
				//	src: [
				//			{	src: 'night.mp4', type: 'video/mp4' }
				//			{	src: 'night.webm', type: 'video/webm;codecs="vp8, vorbis"' }
				//		]
				src: [
					{
						src: WINDSOR_STORAGE['background_video'],
						type: 'video/'+windsor_get_file_ext(WINDSOR_STORAGE['background_video'])
					}
				],
				
				// What to do once video loads (initial frame)
				onLoad: function () {
					//document.querySelector('#background_video_cover').style.display = 'none';
				}
			});
		}, 10);
	}

	// Tabs
    //------------------------------------
	if (jQuery('.windsor_tabs:not(.inited)').length > 0 && jQuery.ui && jQuery.ui.tabs) {
		jQuery('.windsor_tabs:not(.inited)').each(function () {
			"use strict";
			// Get initially opened tab
			var init = jQuery(this).data('active');
			if (isNaN(init)) {
				init = 0;
				var active = jQuery(this).find('> ul > li[data-active="true"]').eq(0);
				if (active.length > 0) {
					init = active.index();
					if (isNaN(init) || init < 0) init = 0;
				}
			} else {
				init = Math.max(0, init);
			}
			// Init tabs
			jQuery(this).addClass('inited').tabs({
				active: init,
				show: {
					effect: 'fadeIn',
					duration: 300
				},
				hide: {
					effect: 'fadeOut',
					duration: 300
				},
				create: function( event, ui ) {
				    if (ui.panel.length > 0) jQuery(document).trigger('action.init_hidden_elements', [ui.panel]);
				},
				activate: function( event, ui ) {
				    if (ui.newPanel.length > 0) jQuery(document).trigger('action.init_hidden_elements', [ui.newPanel]);
				}
			});
		});
	}
	// AJAX loader for the tabs
	jQuery('.windsor_tabs_ajax').on( "tabsbeforeactivate", function( event, ui ) {
		"use strict";
		if (ui.newPanel.data('need-content')) windsor_tabs_ajax_content_loader(ui.newPanel, 1, ui.oldPanel);
	});
	// AJAX loader for the pages in the tabs
	jQuery('.windsor_tabs_ajax').on( "click", '.nav-links a', function(e) {
		"use strict";
		// var panel = jQuery(this).parents('.windsor_tabs_content');
		// var page = 1;
		// var href = jQuery(this).attr('href');
		// var pos = -1;
		// if ((pos = href.lastIndexOf('/page/')) != -1 ) {
		// 	page = Number(href.substr(pos+6).replace("/", ""));
		// 	if (!isNaN(page)) page = Math.max(1, page);
		// }
		// windsor_tabs_ajax_content_loader(panel, page);
		// e.preventDefault();
		return false;
	});


	// Menu
    //----------------------------------------------

	// Prepare menus
	// if (WINDSOR_STORAGE['menu_cache']) windsor_prepare_cached_menus();
	
	// Add TOC in the side menu
	if (jQuery('.menu_side_inner').length > 0 && jQuery('#toc_menu').length > 0)
		jQuery('#toc_menu').appendTo('.menu_side_inner');

	// Add arrows in mobile menu and WooCommerce categories on homepages
	jQuery('.menu_mobile .menu-item-has-children > a, body:not(.woocommerce) .widget_area:not(.footer_wrap) .widget_product_categories ul.product-categories .has_children > a').append('<span class="open_child_menu"></span>');

	// Side menu open/close
	jQuery('.menu_side_button').on('click', function(e){
		"use strict";
		jQuery(this).parent().toggleClass('opened');
		e.preventDefault();
		return false;
	});

	// Mobile menu open/close
	jQuery('.menu_mobile_button,.menu_mobile_description').on('click', function(e){
		"use strict";
		jQuery('.menu_mobile_overlay').fadeIn();
		jQuery('.menu_mobile').addClass('opened');
		jQuery(document).trigger('action.stop_wheel_handlers');
		e.preventDefault();
		return false;
	});
	jQuery(document).on('keypress', function(e) {
		"use strict";
		if (e.keyCode == 27) {
			if (jQuery('.menu_mobile.opened').length == 1) {
				jQuery('.menu_mobile_overlay').fadeOut();
				jQuery('.menu_mobile').removeClass('opened');
				jQuery(document).trigger('action.start_wheel_handlers');
				e.preventDefault();
				return false;
			}
		}
	});;
	jQuery('.menu_mobile_close, .menu_mobile_overlay').on('click', function(e){
		"use strict";
		jQuery('.menu_mobile_overlay').fadeOut();
		jQuery('.menu_mobile').removeClass('opened');
		jQuery(document).trigger('action.start_wheel_handlers');
		e.preventDefault();
		return false;
	});

	// Open/Close submenu in the mobile menu
	jQuery('.menu_mobile, body:not(.woocommerce) .widget_area:not(.footer_wrap) .widget_product_categories').on('click', 'li a,li a .open_child_menu, ul.product-categories.plain li a .open_child_menu', function(e) {
		"use strict";
		var $a = jQuery(this).hasClass('open_child_menu') ? jQuery(this).parent() : jQuery(this);
		if ($a.parent().hasClass('menu-item-has-children') || $a.parent().hasClass('has_children')) {
			if ($a.attr('href')=='#' || jQuery(this).hasClass('open_child_menu')) {
				if ($a.siblings('ul:visible').length > 0)
					$a.siblings('ul').slideUp().parent().removeClass('opened');
				else {
					jQuery(this).parents('li').siblings('li').find('ul:visible').slideUp().parent().removeClass('opened');
					$a.siblings('ul').slideDown().parent().addClass('opened');
				}
			}
		}
		if (jQuery(this).hasClass('open_child_menu') || $a.attr('href')=='#') {
			e.preventDefault();
			return false;
		}
	});
	
	// Header menu
	if (jQuery('ul#menu_header').length > 0) {
		if (jQuery('ul#menu_header ul').length == 0) {
			jQuery('ul#menu_header').addClass('inited');
		}
	}
	
	// Init superfish menus
	windsor_init_sfmenu('ul#menu_main,ul#menu_header:not(.inited)');
	if (jQuery('ul#menu_main').hasClass('inited')) jQuery('.menu_main_nav_area').addClass('menu_show');
	if (jQuery('ul#menu_header').hasClass('inited')) jQuery('.menu_header_nav_area').addClass('menu_show');

	// Click on the logo on home page - scroll to top action
	jQuery('.logo').on('click', function(e){
		"use strict";
		if (jQuery(this).attr('href') == '#') {
			windsor_document_animate_to(0);
			e.preventDefault();
			return false;
		}
	});
	
	// Store height of the top panel
	WINDSOR_STORAGE['top_panel_height'] = 0;	//Math.max(0, jQuery('.top_panel_navi').height());



	// Search form
    //----------------------------------------------
	if (jQuery('.search_wrap:not(.inited)').length > 0) {
		jQuery('.search_wrap:not(.inited)').each(function() {
			"use strict";
			var ajax_timer = null;
			jQuery(this).addClass('inited');
			// Key is pressed
			jQuery(this).find('.search_field').on('keyup', function(e) {
				"use strict";
				if (jQuery(this).parents('.top_panel_navi').length > 0) {
					var search_field = jQuery(this);
					var search_wrap = search_field.parents('.search_wrap');
					// ESC is pressed
					if (e.keyCode == 27) {
						windsor_search_close(search_wrap);
						e.preventDefault();
						return;
					}
					// Change icon after the search field on any key is pressed
					if (!search_wrap.hasClass('search_style_fullscreen')) {
						if (search_field.val() != '') {
							if (!search_field.siblings('.search_submit').hasClass('icon-search'))
								search_field.siblings('.search_submit').removeClass('icon-cancel').addClass('icon-search');
						} else {
							if (!search_field.siblings('.search_submit').hasClass('icon-cancel'))
								search_field.siblings('.search_submit').removeClass('icon-search').addClass('icon-cancel');
						}
					}
					// AJAX search
					if (search_wrap.hasClass('search_ajax')) {
						var s = search_field.val();
						if (ajax_timer) {
							clearTimeout(ajax_timer);
							ajax_timer = null;
						}
						if (s.length >= 4) {
							ajax_timer = setTimeout(function() {
								jQuery.post(WINDSOR_STORAGE['ajax_url'], {
									action: 'ajax_search',
									nonce: WINDSOR_STORAGE['ajax_nonce'],
									text: s
								}).done(function(response) {
									"use strict";
									clearTimeout(ajax_timer);
									ajax_timer = null;
									var rez = {};
									try {
										rez = JSON.parse(response);
									} catch (e) {
										rez = { error: WINDSOR_STORAGE['search_error'] };
										console.log(response);
									}
									var msg = rez.error === '' ? rez.data : rez.error;
									search_field.parents('.search_ajax').find('.search_results_content').empty().append(rez.data);
									search_field.parents('.search_ajax').find('.search_results').fadeIn();
								});
							}, 500);
						}
					}
				}
			});
			// Click "Search submit"
			jQuery(this).find('.search_submit').on('click', function(e) {
				"use strict";
				var search_wrap = jQuery(this).parents('.search_wrap');
				if (search_wrap.find('.search_field').val() != '' && (jQuery(this).parents('.top_panel_navi').length == 0 || search_wrap.hasClass('search_opened')))
					search_wrap.find('form').get(0).submit();
				else if (jQuery(this).parents('.top_panel_navi').length > 0) {
					if (search_wrap.hasClass('search_opened')) {
						windsor_search_close(search_wrap);
					} else {
						search_wrap.addClass('search_opened');
						if (search_wrap.find('.search_field').val() == '' && !search_wrap.hasClass('search_style_fullscreen'))
							search_wrap.find('.search_submit').removeClass('icon-search').addClass('icon-cancel');
						setTimeout(function() { search_wrap.find('.search_field').get(0).focus(); }, 500);
					}
				}
				e.preventDefault();
				return false;
			});
			// Click "Search close"
			jQuery(this).find('.search_close').on('click', function(e) {
				"use strict";
				windsor_search_close(jQuery(this).parents('.search_wrap'));
				e.preventDefault();
				return false;
			});
			// Click "Close search results"
			jQuery(this).find('.search_results_close').on('click', function(e) {
				"use strict";
				jQuery(this).parent().fadeOut();
				e.preventDefault();
				return false;
			});
			// Click "More results"
			jQuery(this).on('click', '.search_more', function(e) {
				"use strict";
				if (jQuery(this).parents('.search_wrap').find('.search_field').val() != '')
					jQuery(this).parents('.search_wrap').find('form').get(0).submit();
				e.preventDefault();
				return false;
			});
		});
	}
	
	// Close search field (remove class 'search_opened' and close search results)
	function windsor_search_close(search_wrap) {
		if (search_wrap.parents('.top_panel_navi').length > 0) {
			search_wrap.removeClass('search_opened');
			if (search_wrap.find('.search_submit').hasClass('icon-cancel'))
				search_wrap.find('.search_submit').removeClass('icon-cancel').addClass('icon-search');
			search_wrap.find('.search_results').fadeOut();
		}
	}


	// Widgets decoration
    //----------------------------------------------

	// Decorate nested lists in widgets and side panels
	jQuery('.widget ul > li').each(function() {
		"use strict";
		if (jQuery(this).find('ul').length > 0) {
			jQuery(this).addClass('has_children');
		}
	});

	// Archive widget decoration
	jQuery('.widget_archive a').each(function() {
		"use strict";
		var val = jQuery(this).html().split(' ');
		if (val.length > 1) {
			val[val.length-1] = '<span>' + val[val.length-1] + '</span>';
			jQuery(this).html(val.join(' '))
		}
	});


	// Forms validation
    //----------------------------------------------

	jQuery("select:not(.esg-sorting-select)").wrap('<div class="select_container"></div>');

	// Comment form
	jQuery("form#commentform").submit(function(e) {
		"use strict";
		var rez = windsor_comments_validate(jQuery(this));
		if (!rez)
			e.preventDefault();
		return rez;
	});

	jQuery("form").on('keypress', '.error_field', function() {
		if (jQuery(this).val() != '')
			jQuery(this).removeClass('error_field');
	});

	// WooCommerce
    //----------------------------------------------

	// Change display mode
	jQuery('.woocommerce,.woocommerce-page').on('click', '.windsor_shop_mode_buttons a', function(e) {
		"use strict";
		var mode = jQuery(this).hasClass('woocommerce_thumbs') ? 'thumbs' : 'list';
		jQuery.cookie('windsor_shop_mode', mode, {expires: 365, path: '/'});
		jQuery(this).siblings('input').val(mode).parents('form').get(0).submit();
		e.preventDefault();
		return false;
	});
	// Add buttons to quantity
	jQuery('.woocommerce div.quantity,.woocommerce-page div.quantity').append('<span class="q_inc"></span><span class="q_dec"></span>');
	jQuery('.woocommerce div.quantity').on('click', '>span', function(e) {
		"use strict";
		var f = jQuery(this).siblings('input');
		if (jQuery(this).hasClass('q_inc')) {
			f.val(Math.max(0, parseInt(f.val()))+1);
		} else {
			f.val(Math.max(1, Math.max(0, parseInt(f.val()))-1));
		}
		e.preventDefault();
		return false;
	});
	// Add stretch behaviour to WooC tabs area
	jQuery('.single-product .woocommerce-tabs').wrap('<div class="trx-stretch-width"></div>');
	jQuery('.trx-stretch-width').wrap('<div class="trx-stretch-width-wrap scheme_default"></div>');
	jQuery('.trx-stretch-width').after('<div class="trx-stretch-width-original"></div>');
	windsor_stretch_width();
		

	// Pagination
    //------------------------------------

	// Load more
	jQuery('.nav-links-more a').on('click', function(e) {
		"use strict";
		// if (WINDSOR_STORAGE['load_more_link_busy']) return;
		// WINDSOR_STORAGE['load_more_link_busy'] = true;
		// var more = jQuery(this);
		// var page = Number(more.data('page'));
		// var max_page = Number(more.data('max-page'));
		// if (page >= max_page) {
		// 	more.parent().hide();
		// 	return;
		// }
		// more.parent().addClass('loading');
		// jQuery.get(location.href, {
		// 	paged: page+1
		// }).done(function(response) {
		// 	"use strict";
		// 	var container = jQuery('.content > .posts_container').eq(0);
		// 	var content = jQuery(response).find('.content > .posts_container');
		// 	if (content.length > 0 && container.length > 0) {
		// 		var items = jQuery(content.html());
		// 		container.append(items);
		// 		if (container.hasClass('portfolio_wrap')) {
		// 			container.masonry( 'appended', items );
		// 		}
		// 		more.data('page', page+1).parent().removeClass('loading');
		// 		// Remove TOC if exists (rebuild on init_shortcodes)
		// 		jQuery('#toc_menu').remove();
		// 		// Trigger actions to init new elements
		// 		WINDSOR_STORAGE['init_all_mediaelements'] = true;
		// 		jQuery(document).trigger('action.init_shortcodes', [container]);
		// 		jQuery(document).trigger('action.init_hidden_elements', [container]);
		// 	}
		// 	if (page+1 >= max_page)
		// 		more.parent().hide();
		// 	else
		// 		WINDSOR_STORAGE['load_more_link_busy'] = false;
		// 	// Fire 'window.scroll' after clearing busy state
		// 	jQuery(window).trigger('scroll');
		// });
		// e.preventDefault();
		return false;
	});

	// Infinite scroll
    jQuery(document).on('action.scroll_actions', function(e) {
		"use strict";
		if (WINDSOR_STORAGE['load_more_link_busy']) return;
		var container = jQuery('.content > .posts_container').eq(0);
		var inf = jQuery('.nav-links-infinite');
		if (inf.length == 0) return;
		if (container.offset().top + container.height() < jQuery(window).scrollTop() + jQuery(window).height()*1.5)
			inf.find('a').trigger('click');
	});
		

	// Other settings
    //------------------------------------

	jQuery(document).trigger('action.ready');

	// Init post format specific scripts
	jQuery(document).on('action.init_hidden_elements', windsor_init_post_formats);

	// Init hidden elements (if exists)
	jQuery(document).trigger('action.init_hidden_elements', [jQuery('body').eq(0)]);
	
} //end ready




// Scroll actions
//==============================================

// Do actions when page scrolled
function windsor_scroll_actions() {
	"use strict";

	var scroll_offset = jQuery(window).scrollTop();
	var adminbar_height = Math.max(0, jQuery('#wpadminbar').height());

	if (WINDSOR_STORAGE['top_panel_height'] == 0)	WINDSOR_STORAGE['top_panel_height'] = jQuery('.top_panel_navi').outerHeight();

	// Call theme/plugins specific action (if exists)
    //----------------------------------------------
    jQuery(document).trigger('action.scroll_actions');

	// Fix/unfix top panel
	if (!jQuery('body').hasClass('mobile_layout') && !jQuery('body').hasClass('menu_style_side') && !jQuery('body').hasClass('header_position_under')) {
		var slider_height = 0;
		if (scroll_offset <= slider_height + WINDSOR_STORAGE['top_panel_height']) {
			if (jQuery('body').hasClass('top_panel_fixed')) {
				jQuery('body').removeClass('top_panel_fixed');
				jQuery('.top_panel_navi').removeClass('state_fixed');
			}
		} else if (scroll_offset > slider_height + WINDSOR_STORAGE['top_panel_height']) {
			if (!jQuery('body').hasClass('top_panel_fixed') && jQuery(document).height() > jQuery(window).height()*1.5) {
				jQuery('.top_panel_fixed_wrap').height(WINDSOR_STORAGE['top_panel_height']);
				jQuery('.top_panel_navi').css('marginTop', '-150px').animate({'marginTop': 0}, 500);
				jQuery('.top_panel_navi').addClass('state_fixed');
				jQuery('body').addClass('top_panel_fixed');
			}
		}
	}
	
	// Fix/unfix sidebar
	// windsor_fix_sidebar();

	// Shift top and footer panels when header position equal to 'Under content'
	if (jQuery('body').hasClass('header_position_under1') && !windsor_browser_is_mobile()) {
		var delta = 50;
		var adminbar = jQuery('#wpadminbar');
		var adminbar_height = adminbar.length == 0 && adminbar.css('position') == 'fixed' ? 0 : adminbar.height();
		var header = jQuery('.top_panel');
		var header_height = header.height();
		var mask = header.find('.top_panel_mask');
		if (mask.length==0) {
			header.append('<div class="top_panel_mask"></div>');
			mask = header.find('.top_panel_mask');
		}
		if (scroll_offset > adminbar_height) {
			var offset = scroll_offset - adminbar_height;
			if (offset <= header_height) {
				var mask_opacity = Math.max(0, Math.min(0.8, (offset-delta)/header_height));
				header.css('top', Math.round(offset/1.2)+'px');
				mask.css({
					'opacity': mask_opacity,
					'display': offset==0 ? 'none' : 'block'
				});
			} else if (parseInt(header.css('top')) != 0) {
				header.css('top', Math.round(offset/1.2)+'px');
			}
		} else if (parseInt(header.css('top')) != 0) {
			header.css('top', '0px');
			mask.css({
				'opacity': 0,
				'display': 'none'
			});
		}
		var footer = jQuery('.site_footer_wrap');
		var footer_height = Math.min(footer.height(), jQuery(window).height());
		var footer_visible = (scroll_offset + jQuery(window).height()) - (header.outerHeight() + jQuery('.page_content_wrap').outerHeight());
		if (footer_visible > 0) {
			mask = footer.find('.top_panel_mask');
			if (mask.length==0) {
				footer.append('<div class="top_panel_mask"></div>');
				mask = footer.find('.top_panel_mask');
			}
			if (footer_visible <= footer_height) {
				var mask_opacity = Math.max(0, Math.min(0.8, (footer_height - footer_visible)/footer_height));
				footer.css('top', -Math.round((footer_height - footer_visible)/1.2)+'px');
				mask.css({
					'z-index': 0,
					'opacity': mask_opacity,
					'display': footer_height - footer_visible <= 0 ? 'none' : 'block'
				});
			} else if (parseInt(footer.css('top')) != 0) {
				footer.css('top', 0);
				mask.css({
					'opacity': 0,
					'display': 'none'
				});
			}
		}
	}
	
	// Scroll actions for animated elements
	jQuery('[data-animation^="animated"]:not(.animated)').each(function() {
		"use strict";
		if (jQuery(this).offset().top < jQuery(window).scrollTop() + jQuery(window).height())
			jQuery(this).addClass(jQuery(this).data('animation'));
	});
}



// Resize actions
//==============================================

// Do actions when page scrolled
function windsor_resize_actions(cont) {
	"use strict";
	windsor_check_layout();
	// windsor_fix_sidebar();
	windsor_fix_footer();
	windsor_stretch_width(cont);
	windsor_stretch_height(null, cont);
	windsor_vc_row_fullwidth_to_boxed(cont);
	if (WINDSOR_STORAGE['menu_stretch']) windsor_stretch_sidemenu();
}


// Stretch sidemenu (if present)
function windsor_stretch_sidemenu() {
	"use strict";
	var toc_items = jQuery('.menu_side_wrap .toc_menu_item');
	if (toc_items.length < 5) return;
	var toc_items_height = jQuery(window).height() - jQuery('.menu_side_wrap .logo').outerHeight() - toc_items.length;
	var th = Math.floor(toc_items_height / toc_items.length);
	var th_add = toc_items_height - th*toc_items.length;
	toc_items.find(".toc_menu_description,.toc_menu_icon").css({
		'height': th+'px',
		'lineHeight': th+'px'
	});
	toc_items.eq(0).find(".toc_menu_description,.toc_menu_icon").css({
		'height': (th+th_add)+'px',
		'lineHeight': (th+th_add)+'px'
	});
}

// Check for mobile layout
function windsor_check_layout() {
	"use strict";
	if (jQuery('body').hasClass('no_layout'))
		jQuery('body').removeClass('no_layout');
	var w = window.innerWidth;
	if (w == undefined) 
		w = jQuery(window).width()+(jQuery(window).height() < jQuery(document).height() || jQuery(window).scrollTop() > 0 ? 16 : 0);
	if (WINDSOR_STORAGE['mobile_layout_width'] >= w) {
		if (!jQuery('body').hasClass('mobile_layout')) {
			jQuery('body').removeClass('top_panel_fixed desktop_layout').addClass('mobile_layout');
			jQuery('.top_panel_navi').removeClass('state_fixed');
		}
	} else {
		if (!jQuery('body').hasClass('desktop_layout')) {
			jQuery('body').removeClass('mobile_layout').addClass('desktop_layout');
			jQuery('.menu_mobile').removeClass('opened');
			jQuery('.menu_mobile_overlay').hide();
		}
	}
	// Switch popup menu / hierarchical list on product categories list placed in sidebar
	var cat_menu = jQuery('body:not(.woocommerce) .widget_area:not(.footer_wrap) .widget_product_categories ul.product-categories');
	var sb = cat_menu.parents('.widget_area');
	if (sb.length > 0 && cat_menu.length > 0) {
		if (sb.width() == sb.parents('.content_wrap').width()) {
			if (cat_menu.hasClass('inited')) {
				cat_menu.removeClass('inited').addClass('plain').superfish('destroy');
				cat_menu.find('ul.animated').removeClass('animated').addClass('no_animated');
			}
		} else {
			if (!cat_menu.hasClass('inited')) {
				cat_menu.removeClass('plain').addClass('inited');
				cat_menu.find('ul.no_animated').removeClass('no_animated').addClass('animated');
				windsor_init_sfmenu('body:not(.woocommerce) .widget_area:not(.footer_wrap) .widget_product_categories ul.product-categories');
			}
		}
	}
}

// Stretch area to full window width
function windsor_stretch_width(cont) {
	"use strict";
	if (cont===undefined) cont = jQuery('body');
	cont.find('.trx-stretch-width').each(function() {
		"use strict";
		var $el = jQuery(this);
		var $el_cont = $el.parents('.page_wrap');
		var $el_cont_offset = 0;
		if ($el_cont.length == 0) 
			$el_cont = jQuery(window);
		else
			$el_cont_offset = $el_cont.offset().left;
		var $el_full = $el.next('.trx-stretch-width-original');
		var el_margin_left = parseInt( $el.css( 'margin-left' ), 10 );
		var el_margin_right = parseInt( $el.css( 'margin-right' ), 10 );
		var offset = $el_cont_offset - $el_full.offset().left - el_margin_left;
		var width = $el_cont.width();
		if (!$el.hasClass('inited')) {
			$el.addClass('inited invisible');
			$el.css({
				'position': 'relative',
				'box-sizing': 'border-box'
			});
		}
		$el.css({
			'left': offset,
			'width': $el_cont.width()
		});
		if ( !$el.hasClass('trx-stretch-content') ) {
			var padding = Math.max(0, -1*offset);
			var paddingRight = Math.max(0, width - padding - $el_full.width() + el_margin_left + el_margin_right);
			$el.css( { 'padding-left': padding + 'px', 'padding-right': paddingRight + 'px' } );
		}
		$el.removeClass('invisible');
	});
}

// Stretch area to the full window height
function windsor_stretch_height(e, cont) {
	"use strict";
	if (cont===undefined) cont = jQuery('body');
	cont.find('.trx-stretch-height').each(function () {
		"use strict";
		var fullheight_item = jQuery(this);
		// If item now invisible
		if (jQuery(this).parents('div:hidden,article:hidden').length > 0) {
			return;
		}
		var wh = 0;
		var fullheight_row = jQuery(this).parents('.vc_row-o-full-height');
		if (fullheight_row.length > 0) {
			wh = fullheight_row.height();
		} else {
			if (screen.width > 1000) {
				var adminbar = jQuery('#wpadminbar');
				wh = jQuery(window).height() - (adminbar.length > 0 ? adminbar.height() : 0);
			} else
				wh = 'auto';
		}
		if (wh=='auto' || wh > 0) fullheight_item.height(wh);
	});
}
	
// Recalculate width of the vc_row[data-vc-full-width="true"] when content boxed or menu_style=='left|right'
function windsor_vc_row_fullwidth_to_boxed(row) {
	"use strict";
	if (jQuery('body').hasClass('body_style_boxed') || jQuery('body').hasClass('menu_style_side')) {
		if (row === undefined) row = jQuery('.vc_row[data-vc-full-width="true"]');
		var width_content = jQuery('.page_wrap').width();
		var width_content_wrap = jQuery('.page_content_wrap  .content_wrap').width();
		var indent = ( width_content - width_content_wrap ) / 2;
		var rtl = jQuery('html').attr('dir') == 'rtl';
		row.each( function() {
			"use strict";
			var mrg = parseInt(jQuery(this).css('marginLeft'));
			jQuery(this).css({
				'width': width_content,
				'left': rtl ? 'auto' : -indent-mrg,
				'right': rtl ? -indent-mrg : 'auto',
				'padding-left': indent+mrg,
				'padding-right': indent+mrg
			});
			if (jQuery(this).attr('data-vc-stretch-content')) {
				jQuery(this).css({
					'padding-left': 0,
					'padding-right': 0
				});
			}
		});
	}
}


// Fix/unfix footer
function windsor_fix_footer() {
	"use strict";
	if (jQuery('body').hasClass('header_position_under') && !windsor_browser_is_mobile()) {
		var ft = jQuery('.site_footer_wrap');
		if (ft.length > 0) {
			var ft_height = ft.outerHeight(false),
				pc = jQuery('.page_content_wrap'),
				pc_offset = pc.offset().top,
				pc_height = pc.height();
			if (pc_offset + pc_height + ft_height < jQuery(window).height()) {
				if (ft.css('position')!='absolute') {
					ft.css({
						'position': 'absolute',
						'left': 0,
						'bottom': 0,
						'width' :'100%'
					});
				}
			} else {
				if (ft.css('position')!='static') {
					ft.css({
						'position': 'static',
						'left': 'auto',
						'bottom': 'auto'
					});
				}
			}
		}
	}
}


// Fix/unfix sidebar
function windsor_fix_sidebar() {
	"use strict";
	var sb = jQuery('.sidebar');
	if (sb.length > 0) {

		// Unfix when sidebar is under content
		if (jQuery('.page_content_wrap .content_wrap .content').css('float') == 'none') {
			if (sb.css('position')=='fixed') {
				sb.css({
					'float': sb.hasClass('right') ? 'right' : 'left',
					'position': 'static'
				});
			}

		} else {

			var sb_height = sb.outerHeight() + 30;
			var content_height = sb.siblings('.content').outerHeight();
			var scroll_offset = jQuery(window).scrollTop();
			var top_panel_height = jQuery('.top_panel').length > 0 ? jQuery('.top_panel').outerHeight() : 0;
			var widgets_above_page_height = jQuery('.widgets_above_page_wrap').length > 0 ? jQuery('.widgets_above_page_wrap').height() : 0;
			var page_padding = parseInt(jQuery('.page_content_wrap').css('paddingTop'));
			if (isNaN(page_padding)) page_padding = 0;

			if (sb_height < content_height && 
				(sb_height >= jQuery(window).height() && scroll_offset + jQuery(window).height() > sb_height+top_panel_height+widgets_above_page_height+page_padding
				||
				sb_height < jQuery(window).height() && scroll_offset > top_panel_height+widgets_above_page_height+page_padding )
				) {
				
				// Fix when sidebar bottom appear
				if (sb.css('position')!=='fixed') {
					sb.css({
						'float': 'none',
						'position': 'fixed',
						'top': Math.min(0, jQuery(window).height() - sb_height) + 'px'
					});
				}
				
				// Detect horizontal position when resize
				var pos = jQuery('.page_content_wrap .content_wrap').position();
				pos = pos.left + Math.max(0, parseInt(jQuery('.page_content_wrap .content_wrap').css('paddingLeft'))) + Math.max(0, parseInt(jQuery('.page_content_wrap .content_wrap').css('marginLeft')));
				if (sb.hasClass('right'))
					sb.css({ 'right': pos });
				else
					sb.css({ 'left': pos });
				
				// Shift to top when footer appear
				var footer_top = 0;
				var footer_pos = jQuery('.site_footer_wrap').position();
				var widgets_below_page_pos = jQuery('.widgets_below_page_wrap').position();
				if (widgets_below_page_pos)
					footer_top = widgets_below_page_pos.top;
				else if (footer_pos)
					footer_top = footer_pos.top;
				if (footer_top > 0 && scroll_offset + jQuery(window).height() > footer_top)
					sb.css({
						'top': Math.min(top_panel_height+page_padding, jQuery(window).height() - sb_height - (scroll_offset + jQuery(window).height() - footer_top + 30)) + 'px'
					});
				else
					sb.css({
						'top': Math.min(top_panel_height+page_padding, jQuery(window).height() - sb_height) + 'px'
					});
				

			} else {

				// Unfix when page scrolling to top
				if (sb.css('position')=='fixed') {
					sb.css({
						'float': sb.hasClass('right') ? 'right' : 'left',
						'position': 'static',
						'top': 'auto',
						'left': 'auto',
						'right': 'auto'
					});
				}

			}
		}
	}
}





// Navigation
//==============================================

// Init Superfish menu
function windsor_init_sfmenu(selector) {
	"use strict";
	jQuery(selector).show().each(function() {
		"use strict";
		jQuery(this).addClass('inited').superfish({
			delay: 500,
			animation: {
				opacity: 'show'
			},
			animationOut: {
				opacity: 'hide'
			},
			speed: 		WINDSOR_STORAGE['menu_animation_in']!='none' ? 500 : 200,
			speedOut:	WINDSOR_STORAGE['menu_animation_out']!='none' ? 500 : 200,
			autoArrows: false,
			dropShadows: false,
			onBeforeShow: function(ul) {
				"use strict";
				if (jQuery(this).parents("ul").length > 1){
					var w = jQuery(window).width();  
					var par_offset = jQuery(this).parents("ul").offset().left;
					var par_width  = jQuery(this).parents("ul").outerWidth();
					var ul_width   = jQuery(this).outerWidth();
					if (par_offset+par_width+ul_width > w-20 && par_offset-ul_width > 0)
						jQuery(this).addClass('submenu_left');
					else
						jQuery(this).removeClass('submenu_left');
				}
				if (WINDSOR_STORAGE['menu_animation_in']!='none') {
					jQuery(this).removeClass('animated fast '+WINDSOR_STORAGE['menu_animation_out']);
					jQuery(this).addClass('animated fast '+WINDSOR_STORAGE['menu_animation_in']);
				}
			},
			onBeforeHide: function(ul) {
				"use strict";
				if (WINDSOR_STORAGE['menu_animation_out']!='none') {
					jQuery(this).removeClass('animated fast '+WINDSOR_STORAGE['menu_animation_in']);
					jQuery(this).addClass('animated fast '+WINDSOR_STORAGE['menu_animation_out']);
				}
			}
		});
	});
}

// Prepare menus (if menu cache is used)
function windsor_prepare_cached_menus() {
	"use strict";

	// Mark the current menu item and its parent items in the cached menus
	var menus = [
		jQuery('ul#menu_main'),
		jQuery('ul#menu_mobile')
	];
	var href = window.location.href;
	for (var m in menus) {
		if (menus[m].length==0) continue;
		menus[m].find('li').removeClass('current-menu-ancestor current-menu-parent current-menu-item current_page_item');
		menus[m].find('a[href="'+href+'"]').each(function(idx) {
			var li = jQuery(this).parent();
			li.addClass('current-menu-item');
			if (li.hasClass('menu-item-object-page')) li.addClass('current_page_item');
			var cnt = 0;
			while ((li = li.parents('li')).length > 0) {
				cnt++;
				li.addClass('current-menu-ancestor'+(cnt==1 ? ' current-menu-parent' : ''));
			}
		});
	}
}




// Post formats init
//=====================================================

function windsor_init_post_formats(e, cont) {
	"use strict";

	// MediaElement init
	windsor_init_media_elements(cont);
	
	// Video play button
	cont.find('.format-video .post_featured.with_thumb .post_video_hover:not(.inited)')
		.addClass('inited')
		.on('click', function(e) {
			"use strict";
			jQuery(this).parents('.post_featured')
				.addClass('post_video_play')
				.find('.post_video').html(jQuery(this).data('video'));
			jQuery(window).trigger('resize');
			e.preventDefault();
			return false;
		});
}


function windsor_init_media_elements(cont) {
	"use strict";
	if (WINDSOR_STORAGE['use_mediaelements'] && cont.find('audio:not(.inited),video:not(.inited)').length > 0) {
		if (window.mejs) {
			window.mejs.MepDefaults.enableAutosize = true;
			window.mejs.MediaElementDefaults.enableAutosize = true;
			cont.find('audio:not(.inited),video:not(.inited)').each(function() {
				"use strict";
				if (jQuery(this).parents('.mejs-mediaelement').length == 0 && (WINDSOR_STORAGE['init_all_mediaelements'] || (!jQuery(this).hasClass('wp-audio-shortcode') && !jQuery(this).hasClass('wp-video-shortcode') && !jQuery(this).parent().hasClass('wp-playlist')))) {
					var media_tag = jQuery(this);
					var settings = {
						enableAutosize: true,
						videoWidth: -1,		// if set, overrides <video width>
						videoHeight: -1,	// if set, overrides <video height>
						audioWidth: '100%',	// width of audio player
						audioHeight: 30,	// height of audio player
						success: function(mejs) {
							var autoplay, loop;
							if ( 'flash' === mejs.pluginType ) {
								autoplay = mejs.attributes.autoplay && 'false' !== mejs.attributes.autoplay;
								loop = mejs.attributes.loop && 'false' !== mejs.attributes.loop;
								autoplay && mejs.addEventListener( 'canplay', function () {
									mejs.play();
								}, false );
								loop && mejs.addEventListener( 'ended', function () {
									mejs.play();
								}, false );
							}
						}
					};
					jQuery(this).mediaelementplayer(settings);
				}
			});
		} else
			setTimeout(function() { windsor_init_media_elements(cont); }, 400);
	}
}


// Load the tab's content
function windsor_tabs_ajax_content_loader(panel, page, oldPanel) {
	"use strict";
	if (panel.html().replace(/\s/g, '')=='') {
		var height = oldPanel === undefined ? panel.height() : oldPanel.height();
		if (isNaN(height) || height < 100) height = 100;
		panel.html('<div class="windsor_tab_holder" style="min-height:'+height+'px;"></div>');
	} else
		panel.find('> *').addClass('windsor_tab_content_remove');
	panel.data('need-content', false).addClass('windsor_loading');
	jQuery.post(WINDSOR_STORAGE['ajax_url'], {
		nonce: WINDSOR_STORAGE['ajax_nonce'],
		action: 'windsor_ajax_get_posts',
		blog_template: panel.data('blog-template'),
		blog_style: panel.data('blog-style'),
		posts_per_page: panel.data('posts-per-page'),
		cat: panel.data('cat'),
		parent_cat: panel.data('parent-cat'),
		page: page
	}).done(function(response) {
		"use strict";
		panel.removeClass('windsor_loading');
		var rez = {};
		try {
			rez = JSON.parse(response);
		} catch (e) {
			rez = { error: WINDSOR_STORAGE['strings']['ajax_error'] };
			console.log(response);
		}
		if (rez.error !== '') {
			panel.html('<div class="windsor_error">'+rez.error+'</div>');
		} else {
			panel.prepend(rez.data).fadeIn(function() {
			    jQuery(document).trigger('action.init_shortcodes', [panel]);
			    jQuery(document).trigger('action.init_hidden_elements', [panel]);
				jQuery(window).trigger('scroll');
				setTimeout(function() {
					panel.find('.windsor_tab_holder,.windsor_tab_content_remove').remove();
					jQuery(window).trigger('scroll');
				}, 600);
			});
		}
	});
}


// Forms validation
//-------------------------------------------------------

// Comments form
function windsor_comments_validate(form) {
	"use strict";
	form.find('input').removeClass('error_field');
	var comments_args = {
		error_message_text: WINDSOR_STORAGE['strings']['error_global'],	// Global error message text (if don't write in checked field)
		error_message_show: true,									// Display or not error message
		error_message_time: 4000,									// Error message display time
		error_message_class: 'windsor_messagebox windsor_messagebox_style_error',	// Class appended to error message block
		error_fields_class: 'error_field',							// Class appended to error fields
		exit_after_first_error: false,								// Cancel validation and exit after first error
		rules: [
			{
				field: 'comment',
				min_length: { value: 1, message: WINDSOR_STORAGE['strings']['text_empty'] },
				max_length: { value: WINDSOR_STORAGE['message_maxlength'], message: WINDSOR_STORAGE['strings']['text_long']}
			}
		]
	};
	if (form.find('.comments_author input[aria-required="true"]').length > 0) {
		comments_args.rules.push(
			{
				field: 'author',
				min_length: { value: 1, message: WINDSOR_STORAGE['strings']['name_empty']},
				max_length: { value: 60, message: WINDSOR_STORAGE['strings']['name_long']}
			}
		);
	}
	if (form.find('.comments_email input[aria-required="true"]').length > 0) {
		comments_args.rules.push(
			{
				field: 'email',
				min_length: { value: 1, message: WINDSOR_STORAGE['strings']['email_empty']},
				max_length: { value: 60, message: WINDSOR_STORAGE['strings']['email_long']},
				mask: { value: WINDSOR_STORAGE['email_mask'], message: WINDSOR_STORAGE['strings']['email_not_valid']}
			}
		);
	}
	var error = windsor_form_validate(form, comments_args);
	return !error;
}
