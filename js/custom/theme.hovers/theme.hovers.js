// Called from the main 'ready' event
jQuery(document).on('action.ready', function(e) {

	// Slide effect for main menu
	if (WINDSOR_STORAGE['menu_hover']=='slide_line' || WINDSOR_STORAGE['menu_hover']=='slide_box') {
		setTimeout(function() {
			"use strict";
			jQuery('#menu_main').spasticNav({
				style: WINDSOR_STORAGE['menu_hover']=='slide_line' ? 'line' : 'box',
				color: WINDSOR_STORAGE['menu_hover_color'],
				colorOverride: false
			});
		}, 500);
	}
});

// Buttons decoration (add 'hover' class)
// Attention! Not use cont.find('selector')! Use jQuery('selector') instead!
jQuery(document).on('action.init_hidden_elements', function(e, cont) {
	if (WINDSOR_STORAGE['button_hover'] && WINDSOR_STORAGE['button_hover']!='default') {
		jQuery('button:not(.search_submit):not([class*="sc_button_hover_"]),\
				.theme_button:not([class*="sc_button_hover_"]),\
				.sc_item_button > a:not([class*="sc_button_hover_"]):not([class*="sc_button_simple"]),\
				.sc_form_field button:not([class*="sc_button_hover_"]),\
				.sc_price_link:not([class*="sc_button_hover_"]),\
				.sc_action_item_link:not(.sc_action_item_link_over):not([class*="sc_button_hover_"]),\
				.more-link:not([class*="sc_button_hover_"]),\
				.trx_addons_hover_content .trx_addons_hover_links a:not([class*="sc_button_hover_"]),\
				.trx_addons_tabs .trx_addons_tabs_titles li a:not([class*="sc_button_hover_"]),\
				.windsor_tabs .windsor_tabs_titles li a:not([class*="sc_button_hover_"]),\
				.woocommerce #respond input#submit:not([class*="sc_button_hover_"]),\
				.woocommerce .button:not([class*="shop_cart"]):not([class*="sc_button_hover_"]),\
				.woocommerce-page .button:not([class*="shop_cart"]):not([class*="sc_button_hover_"]),\
				#buddypress a.button:not([class*="sc_button_hover_"])\
				').addClass('sc_button_hover_'+WINDSOR_STORAGE['button_hover']);
		if (WINDSOR_STORAGE['button_hover']!='arrow') {
			jQuery('input[type="submit"]:not([class*="sc_button_hover_"]),\
					input[type="button"]:not([class*="sc_button_hover_"]),\
					.vc_tta-accordion .vc_tta-panel-heading .vc_tta-controls-icon:not([class*="sc_button_hover_"]),\
					.vc_tta-color-grey.vc_tta-style-classic .vc_tta-tab > a:not([class*="sc_button_hover_"]),\
					.single-product div.product .trx-stretch-width .woocommerce-tabs .wc-tabs li a,\
					.woocommerce nav.woocommerce-pagination ul li a:not([class*="sc_button_hover_"]),\
					.tribe-events-button:not([class*="sc_button_hover_"]),\
					#tribe-bar-views .tribe-bar-views-list .tribe-bar-views-option a:not([class*="sc_button_hover_"]),\
					.tribe-bar-mini #tribe-bar-views .tribe-bar-views-list .tribe-bar-views-option a:not([class*="sc_button_hover_"]),\
					.tribe-events-cal-links a:not([class*="sc_button_hover_"]),\
					.tribe-events-sub-nav li a:not([class*="sc_button_hover_"]),\
					.isotope_filters_button:not([class*="sc_button_hover_"]),\
					.trx_addons_scroll_to_top:not([class*="sc_button_hover_"]),\
					.sc_promo_modern .sc_promo_link2:not([class*="sc_button_hover_"]),\
					.socials_wrap:not(.socials_footer_wrap):not(.socials_type_drop) .social_icons:not([class*="sc_button_hover_"]),\
					.post_item_single .post_content .post_meta .post_share .social_item a:not([class*="sc_button_hover_"]),\
					.slider_swiper .slider_prev:not([class*="sc_button_hover_"]),\
					.slider_swiper .slider_next:not([class*="sc_button_hover_"]),\
					.sc_slider_controller_titles .slider_controls_wrap > a:not([class*="sc_button_hover_"]),\
					.tagcloud > a:not([class*="sc_button_hover_"])\
					').addClass('sc_button_hover_'+WINDSOR_STORAGE['button_hover']);
		}
		// Add alter styles of buttons
		jQuery('.sc_slider_controller_titles .slider_controls_wrap > a:not([class*="sc_button_hover_style_"])\
				').addClass('sc_button_hover_style_default');
		jQuery('.trx_addons_hover_content .trx_addons_hover_links a:not([class*="sc_button_hover_style_"]),\
				.single-product ul.products li.product .post_data .button:not([class*="sc_button_hover_style_"])\
				').addClass('sc_button_hover_style_inverse');
		jQuery('.post_item_single .post_content .post_meta .post_share .social_item a:not([class*="sc_button_hover_style_"]),\
				.woocommerce #respond input#submit.alt:not([class*="sc_button_hover_style_"]),\
				.woocommerce a.button.alt:not([class*="sc_button_hover_style_"]),\
				.woocommerce button.button.alt:not([class*="sc_button_hover_style_"]),\
				.woocommerce input.button.alt:not([class*="sc_button_hover_style_"])\
				').addClass('sc_button_hover_style_hover');
		jQuery('.woocommerce .woocommerce-message .button:not([class*="sc_button_hover_style_"]),\
				.woocommerce .woocommerce-info .button:not([class*="sc_button_hover_style_"])\
				').addClass('sc_button_hover_style_alter');
		jQuery('.sidebar .trx_addons_tabs .trx_addons_tabs_titles li a:not([class*="sc_button_hover_style_"]),\
				.windsor_tabs .windsor_tabs_titles li a:not([class*="sc_button_hover_style_"]),\
				.widget_tag_cloud a:not([class*="sc_button_hover_style_"]),\
				.widget_product_tag_cloud a:not([class*="sc_button_hover_style_"])\
				').addClass('sc_button_hover_style_alterbd');
		jQuery('.vc_tta-accordion .vc_tta-panel-heading .vc_tta-controls-icon:not([class*="sc_button_hover_style_"]),\
				.vc_tta-color-grey.vc_tta-style-classic .vc_tta-tab > a:not([class*="sc_button_hover_style_"]),\
				.single-product div.product .trx-stretch-width .woocommerce-tabs .wc-tabs li a:not([class*="sc_button_hover_style_"]),\
				.sc_action_item_event .sc_action_item_link:not([class*="sc_button_hover_style_"]),\
				.slider_prev:not([class*="sc_button_hover_style_"]),\
				.slider_next:not([class*="sc_button_hover_style_"]),\
				.trx_addons_video_player.with_cover .video_hover:not([class*="sc_button_hover_style_"]),\
				.trx_addons_tabs .trx_addons_tabs_titles li a:not([class*="sc_button_hover_style_"])\
				').addClass('sc_button_hover_style_dark');
		// Remove hover class
		jQuery('.mejs-controls button,\
				.widget_contacts .social_icons\
				').removeClass('sc_button_hover_'+WINDSOR_STORAGE['button_hover']);

	}
	
});

