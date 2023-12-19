jQuery(document).ready(function() {
    "use strict";
    trx_addons_sc_recent_news_init();
    trx_addons_admin_init();
	TRX_ADDONS_STORAGE['vc_init_counter'] = 0;
	trx_addons_init_actions();    
});


// Fullheight elements init
function trx_addons_sc_fullheight_init(e, container) {
	"use strict";

	if (arguments.length < 2) var container = jQuery('body');
	if (container===undefined || container.length === undefined || container.length == 0) return;

	container.find('.trx_addons_stretch_height').each(function () {
		"use strict";
		var fullheight_item = jQuery(this);
		// If item now invisible
		if (jQuery(this).parents('div:hidden,article:hidden').length > 0) {
			return;
		}
		var wh = 0;
		var fullheight_row = jQuery(this).parents('.vc_row-o-full-height');
		if (fullheight_row.length > 0) {
			wh = fullheight_row.css('height') != 'auto' ? fullheight_row.height() : 'auto';
		} else {
			if (screen.height > 1000) {
				var adminbar = jQuery('#wpadminbar');
				wh = jQuery(window).height() - (adminbar.length > 0 ? adminbar.height() : 0);
			} else
				wh = 'auto';
		}
		if (wh == 'auto' || wh > 0) fullheight_item.height(wh);
	});
}

 // Anchor
jQuery(document).on('action.init_shortcodes', function(e, container) {
	"use strict";

	var toc_menu = jQuery('#toc_menu');
	if (toc_menu.length == 0) trx_addons_build_page_toc();
	
	toc_menu = jQuery('#toc_menu:not(.inited)');
	if (toc_menu.length == 0) return;
	
	var toc_menu_items = toc_menu.addClass('inited').find('.toc_menu_item');
	trx_addons_detect_active_toc();
	
	var wheel_busy = false, wheel_time = 0;
	
	// One page mode for menu links (scroll to anchor)
	// Old case: toc_menu.on('click', 'a', function(e) {
	// New case (allow add class 'toc_menu_item' in any menu to enable scroll):
	jQuery('.toc_menu_item > a').on('click', function(e) {
		"use strict";
		var href = jQuery(this).attr('href');
		if (href===undefined) return;
		var pos = href.indexOf('#');
		if (pos < 0 || href.length == 1) return;
		if (jQuery(href.substr(pos)).length > 0) {
			var loc = window.location.href;
			var pos2 = loc.indexOf('#');
			if (pos2 > 0) loc = loc.substring(0, pos2);
			var now = pos==0;
			if (!now) now = loc == href.substring(0, pos);
			if (now) {
				wheel_busy = true;
				setTimeout(function() { wheel_busy = false; }, trx_addons_browser_is_ios() ? 1200 : 100);
				trx_addons_document_animate_to(href.substr(pos), function() {
					if (TRX_ADDONS_STORAGE['update_location_from_anchor']==1) trx_addons_document_set_location(pos==0 ? loc + href : href); 
				});
				e.preventDefault();
				return false;
			}
		}
	});
	
	// Change active element then page is scrolled
	jQuery(window).on('scroll', function() {
		"use strict";
		// Mark current item
		trx_addons_mark_active_toc();
	});
	trx_addons_mark_active_toc();

	if (TRX_ADDONS_STORAGE['scroll_to_anchor'] == 1) {
		var wheel_stop = false;
		jQuery(document).on('action.stop_wheel_handlers', function(e) {
			"use strict";
			wheel_stop = true;
		});
		jQuery(document).on('action.start_wheel_handlers', function(e) {
			"use strict";
			wheel_stop = false;
		});
		jQuery(window).bind('mousewheel DOMMouseScroll', function(e) {
			if (screen.width < 960 || jQuery(window).width() < 960 || wheel_stop || trx_addons_browser_is_ios()) {
				return;
			}
			if (wheel_busy || wheel_time == e.timeStamp) {
				e.preventDefault();
				return false;
			}
			wheel_time = e.timeStamp;
			var wheel_dir = e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? -1 : 1;
			var items = trx_addons_detect_active_toc();
			var doit = false;
			if (wheel_dir == -1) {			// scroll up
				doit = true;
				setTimeout(function() {
					if (items.prev >= 0)
						toc_menu_items.eq(items.prev).find('a').trigger('click');
					else
						trx_addons_document_animate_to(0);
				}, 10);
			} else {						// scroll down
				if (items.next >= 0) {
					doit = true;
					setTimeout(function() {
						toc_menu_items.eq(items.next).find('a').trigger('click');
					}, 10);
				}
			}
			// Set busy flag while animating
			if (doit) {
				wheel_busy = true;
				setTimeout(function() { wheel_busy = false; }, trx_addons_browser_is_ios() ? 1200 : 100);
				e.preventDefault();
				return false;
			}
		});	
	}

	// Detect active TOC item
	function trx_addons_detect_active_toc() {
		"use strict";
		var items = {
			loc: '',
			current: [],
			prev: -1,
			next: -1
		};
		toc_menu_items.each(function(idx) {
			"use strict";
			var id = jQuery(this).find('a').attr('href');
			var pos = id.indexOf('#');
			if (pos < 0 || id.length == 1) return;
			var loc = window.location.href;
			var pos2 = loc.indexOf('#');
			if (pos2 > 0) loc = loc.substring(0, pos2);
			var now = pos==0;
			if (!now) now = loc == href.substring(0, pos);
			if (!now) return;
			var off = jQuery(id).offset().top;
			var id_next  = jQuery(this).next().find('a').attr('href');
			var off_next = id_next ? jQuery(id_next).offset().top : 1000000;
			var scroll_offset = jQuery(window).scrollTop();
			if (off > scroll_offset + 50) {
				if (items.next < 0) items.next = idx;
			} else if (off < scroll_offset - 50)
				items.prev = idx;
			if (off < scroll_offset + jQuery(window).height()*0.8 && scroll_offset < off_next - 50) {
				items.current.push(idx);
				if (items.loc == '') items.loc = pos==0 ? loc + id : id;
			}
		});
		return items;
	}
	
	// Mark active TOC item
	function trx_addons_mark_active_toc() {
		"use strict";
		var items = trx_addons_detect_active_toc();
		toc_menu_items.removeClass('toc_menu_item_active');
		for (var i=0; i<items.current.length; i++) {
			toc_menu_items.eq(items.current[i]).addClass('toc_menu_item_active');
			// Comment next line if on your device page jump when scrolling
			if (items.loc!='' && TRX_ADDONS_STORAGE['update_location_from_anchor']==1 && !trx_addons_browser_is_mobile() && !trx_addons_browser_is_ios() && !wheel_busy)
				trx_addons_document_set_location(items.loc);
		}
	}
});


// Build page TOC from the tag's id
function trx_addons_build_page_toc() {
	"use strict";

	var toc = '', toc_count = 0;

	jQuery('[id^="toc_menu_"],.sc_anchor').each(function(idx) {
		"use strict";
		var obj = jQuery(this);
		var obj_id = obj.attr('id') || ('sc_anchor_'+Math.random()).replace('.', '');
		var row = obj.parents('.wpb_row');
		if (row.length == 0) row = obj.parent();
		var row_id = row.length>0 && row.attr('id')!=undefined && row.attr('id')!='' ? row.attr('id') : '';
		var id = row_id || obj_id.substr(10);
		if (row.length>0 && row_id == '') {
			row.attr('id', id);
		}
		var url = obj.data('url');
		var icon = obj.data('icon') || 'toc_menu_icon_default';
		var title = obj.attr('title');
		var description = obj.data('description');
		var separator = obj.data('separator');
		toc_count++;
		toc += '<div class="toc_menu_item'+(separator=='yes' ? ' toc_menu_separator' : '')+'">'
			+ (title || description 
				? '<a href="' + (url ? url : '#'+id) + '" class="toc_menu_description">'
						+ (title ? '<span class="toc_menu_description_title">' + title + '</span>' : '')
						+ (description ? '<span class="toc_menu_description_text">' + description + '</span>' : '')
					+ '</a>' 
				: '')
			+ '<a href="' + (url ? url : '#'+id) + '" class="toc_menu_icon '+icon+'">'+'</a>'
			+ '</div>';
	});

	if (toc_count > 0)
		jQuery('body').append('<div id="toc_menu" class="toc_menu"><div class="toc_menu_inner">'+toc+'</div></div>');
}

// Countdown


jQuery(document).on('action.init_hidden_elements', trx_addons_sc_countdown_init);
jQuery(document).on('action.init_shortcodes', trx_addons_sc_countdown_init);

// Skills init
function trx_addons_sc_countdown_init(e, container) {
	"use strict";

	if (arguments.length < 2) var container = jQuery('body');

	container.find('.sc_countdown:not(.inited)').each(function () {
		"use strict";
		jQuery(this).addClass('inited');

		var id = jQuery(this).attr('id');
		var curDate = new Date(); 
		var curDateTimeStr = curDate.getFullYear()
								+ '-' + (curDate.getMonth()<9 ? '0' : '') + (curDate.getMonth()+1) 
								+ '-' + (curDate.getDate()<10 ? '0' : '') + curDate.getDate()
								+ ' ' + (curDate.getHours()<10 ? '0' : '') + curDate.getHours()
								+ ':' + (curDate.getMinutes()<10 ? '0' : '') + curDate.getMinutes()
								+ ':' + (curDate.getSeconds()<10 ? '0' : '') + curDate.getSeconds();
		var interval = 1;	//jQuery(this).data('interval');
		var endDateStr = jQuery(this).data('date');
		var endDateParts = endDateStr.split('-');
		var endTimeStr = jQuery(this).data('time');
		var endTimeParts = endTimeStr.split(':');
		if (endTimeParts.length < 3) endTimeParts[2] = '00';
		var endDateTimeStr = endDateStr+' '+endTimeStr;
		if (curDateTimeStr < endDateTimeStr) {
			jQuery(this).find('.sc_countdown_placeholder').countdown({
				until: new Date(endDateParts[0], endDateParts[1]-1, endDateParts[2], endTimeParts[0], endTimeParts[1], endTimeParts[2]), 
				tickInterval: interval,
				onTick: trx_addons_sc_countdown
			}); 
		} else {
			jQuery(this).find('.sc_countdown_placeholder').countdown({
				since: new Date(endDateParts[0], endDateParts[1]-1, endDateParts[2], endTimeParts[0], endTimeParts[1], endTimeParts[2]), 
				tickInterval: interval,
				onTick: trx_addons_sc_countdown
			}); 
		}
	});
}


// Countdown update
function trx_addons_sc_countdown(dt) {
	"use strict";
	var counter = jQuery(this).parent();
	for (var i=3; i<dt.length; i++) {
		var v = (dt[i]<10 ? '0' : '') + dt[i];
		var item = counter.find('.sc_countdown_item').eq(i-3);
		var digits = item.find('.sc_countdown_digits span').addClass('hide');
		for (var ch=v.length-1; ch>=0; ch--) {
			digits.eq(ch+(i==3 && v.length<3 ? 1 : 0)).removeClass('hide').text(v.substr(ch, 1));
		}
		trx_addons_sc_countdown_update_canvas(item, dt[i]);
	}
}


function trx_addons_sc_countdown_update_canvas(item, value) {

	var canvas = item.find('canvas');
	if (canvas.length == 0) return;
	
	var digits = canvas.next();
	var brd = parseInt(digits.css('border-top-width'));
	var w = Math.ceil(digits.width()+2*brd);

	var needRepaint = false;
	if (canvas.attr('width') != w) {
		needRepaint = true;
		canvas.attr({
			'width': w,
			'height': w
		});
	}

	if (item.data('old-value') == value && !needRepaint) return;
	item.data('old-value', value);
	
	var percent = value * 100 / canvas.data('max-value');
	var angle = 360 * percent / 100;
	var Ar = angle * Math.PI / 180;

	var canvas_dom = canvas.get(0);
    var context = canvas_dom.getContext('2d');
	var r = (w - brd) / 2;
    var cx = w / 2;
    var cy = w / 2;

    context.beginPath();
	context.clearRect(0, 0, w, w);
    context.arc(cx, cy, r, 0, Ar, false);
    context.imageSmoothingEnabled= true;
    context.lineWidth = brd;
    context.strokeStyle = canvas.data('color');
    context.stroke();
}


//Contact form

jQuery(document).on('action.init_shortcodes', function(e, container) {
	"use strict";
	
	// Contact form validate and submit
	if (container.find('.sc_form_form:not(.contact_1):not(.inited)').length > 0) {
		container.find('.sc_form_form:not(.contact_1):not(.inited)')
			.addClass('inited')
			.submit(function(e) {
				"use strict";
				sc_form_validate(jQuery(this));
				e.preventDefault();
				return false;
			});
	}

	// Mark field as 'filled'
	jQuery('[class*="sc_input_hover_"] input, [class*="sc_input_hover_"] textarea').each(function() {
		"use strict";
		sc_form_mark_filled(jQuery(this));
	});
	jQuery('[class*="sc_input_hover_"] input, [class*="sc_input_hover_"] textarea').on('blur change', function() {
		"use strict";
		sc_form_mark_filled(jQuery(this));
	});
	jQuery('input, textarea, select').on('change', function() {
		"use strict";
		jQuery(this).removeClass('trx_addons_field_error');
	});
});

// Mark fields
function sc_form_mark_filled(field) {
	"use strict";
	if (field.val()!='')
		field.addClass('filled');
	else
		field.removeClass('filled');
}

// Validate form
function sc_form_validate(form){
	"use strict";
	var url = form.attr('action');
	if (url == '') return false;
	form.find('input').removeClass('trx_addons_error_field');
	var error = trx_addons_form_validate(form, {
			rules: [
				{
					field: "name",
					min_length: { value: 1,	 message: TRX_ADDONS_STORAGE['msg_field_name_empty'] },
				},
				{
					field: "email",
					min_length: { value: 1,	 message: TRX_ADDONS_STORAGE['msg_field_email_empty'] },
					mask: { value: TRX_ADDONS_STORAGE['email_mask'], message: TRX_ADDONS_STORAGE['msg_field_email_not_valid'] }
				},
				{
					field: "message",
					min_length: { value: 1,  message: TRX_ADDONS_STORAGE['msg_field_text_empty'] },
				}
			]
		});

	if (!error && url!='#') {
		jQuery.post(url, {
			action: "send_sc_form",
			nonce: TRX_ADDONS_STORAGE['ajax_nonce'],
			data: form.serialize()
		}).done(function(response) {
			"use strict";
			var rez = {};
			try {
				rez = JSON.parse(response);
			} catch(e) {
				rez = { error: TRX_ADDONS_STORAGE['msg_ajax_error'] };
				console.log(response);
			}
			var result = form.find(".trx_addons_message_box").toggleClass("trx_addons_message_box_error", false).toggleClass("trx_addons_message_box_success", false);
			if (rez.error === '') {
				form.get(0).reset();
				result.addClass("trx_addons_message_box_success").html(TRX_ADDONS_STORAGE['msg_send_complete']);
			} else {
				result.addClass("trx_addons_message_box_error").html(TRX_ADDONS_STORAGE['msg_send_error'] + ' ' + rez.error);
			}
			result.fadeIn().delay(3000).fadeOut();
		});
	}
	return !error;
}



// Init Icons
jQuery(document).on('action.init_shortcodes', function(e, container) {
	"use strict";
	
	var time = 50;
	container.find('.sc_icon_type_svg:not(.inited)').each(function(idx) {
		"use strict";
		var cont = jQuery(this);
		var id = cont.addClass('inited').attr('id');
		if (id === undefined) {
			id = 'sc_icons_'+Math.random();
			id = id.replace('.', '');
		} else
			id += '_'+idx;
		cont.find('svg').attr('id', id);
		setTimeout( function(){
			cont.css('visibility', 'visible');
			var obj = new Vivus(id, {type: 'async', duration: 20});
			cont.data('svg_obj', obj);
			cont.parent().hover(
				function() {
					cont.data('svg_obj').reset().play();
				},
				function() {
				}
			);
		}, time);
		time += 300;
	});
});


// Init Widget Recent News: Categories dropdown
function trx_addons_sc_recent_news_init() {
	"use strict";
	jQuery('.sc_recent_news_header_category_item_more').on('click', function() {
		"use strict";
		jQuery(this).toggleClass('opened').find('.sc_recent_news_header_more_categories').slideToggle();
	});
}

// Skills
jQuery(document).on('action.init_hidden_elements', trx_addons_sc_skills_init);
jQuery(document).on('action.init_shortcodes', trx_addons_sc_skills_init);
jQuery(window).on('scroll', trx_addons_sc_skills_init);

// Skills init
function trx_addons_sc_skills_init(e, container) {
	"use strict";

	if (arguments.length < 2) var container = jQuery('body');

	var scrollPosition = jQuery(window).scrollTop() + jQuery(window).height();

	container.find('.sc_skills_item:not(.inited)').each(function () {
		"use strict";
		var skillsItem = jQuery(this);
		// If item now invisible
		if (jQuery(this).parents('div:hidden,article:hidden').length > 0) {
			return;
		}
		var scrollSkills = skillsItem.offset().top;
		if (scrollPosition > scrollSkills) {
			var init_ok = true;
			var skills = skillsItem.parents('.sc_skills').eq(0);
			var type = skills.data('type');
			var total = (type=='pie' && skills.hasClass('sc_skills_compact_on')) 
							? skillsItem.find('.sc_skills_data .pie') 
							: skillsItem.find('.sc_skills_total').eq(0);
			var start = parseInt(total.data('start'));
			var stop = parseInt(total.data('stop'));
			var maximum = parseInt(total.data('max'));
			var startPercent = Math.round(start/maximum*100);
			var stopPercent = Math.round(stop/maximum*100);
			var ed = total.data('ed');
			var speed = parseInt(total.data('speed'));
			var step = parseInt(total.data('step'));
			var duration = parseInt(total.data('duration'));
			if (isNaN(duration)) duration = Math.ceil(maximum/step)*speed;
			
			if (type == 'bar') {
				var dir = skills.data('dir');
				var count = skillsItem.find('.sc_skills_count').eq(0);
				if (dir=='horizontal')
					count.css('width', startPercent + '%').animate({ width: stopPercent + '%' }, duration);
				else if (dir=='vertical')
					count.css('height', startPercent + '%').animate({ height: stopPercent + '%' }, duration);
				trx_addons_sc_skills_animate_counter(start, stop, speed, step, ed, total);
			
			} else if (type == 'counter') {
				trx_addons_sc_skills_animate_counter(start, stop, speed, step, ed, total);

			} else if (type == 'pie') {
				if (window.Chart) {
					var steps = parseInt(total.data('steps'));
					var bg_color = total.data('bg_color');
					var border_color = total.data('border_color');
					var cutout = parseInt(total.data('cutout'));
					var easing = total.data('easing');
					var options = {
						segmentShowStroke: border_color!='',
						segmentStrokeColor: border_color,
						segmentStrokeWidth: border_color!='' ? 1 : 0,
						percentageInnerCutout: cutout,
						animationSteps: steps,
						animationEasing: easing,
						animateRotate: true,
						animateScale: false,
					};
					var pieData = [];
					total.each(function() {
						"use strict";
						var color = jQuery(this).data('color');
						var stop = parseInt(jQuery(this).data('stop'));
						var stopPercent = Math.round(stop/maximum*100);
						pieData.push({
							value: stopPercent,
							color: color
						});
					});
					if (total.length == 1) {
						trx_addons_sc_skills_animate_counter(start, stop, Math.round(1500/steps), step, ed, total);
						pieData.push({
							value: 100-stopPercent,
							color: bg_color
						});
					}
					var canvas = skillsItem.find('canvas');
					canvas.attr({width: skillsItem.width(), height: skillsItem.width()}).css({width: skillsItem.width(), height: skillsItem.height()});
					new Chart(canvas.get(0).getContext("2d")).Doughnut(pieData, options);
				} else
					init_ok = false;
			}
			if (init_ok) skillsItem.addClass('inited');
		}
	});
}

// Skills counter animation
function trx_addons_sc_skills_animate_counter(start, stop, speed, step, ed, total) {
	"use strict";
	start = Math.min(stop, start + step);
	total.text(start+ed);
	if (start < stop) {
		setTimeout(function () {
			trx_addons_sc_skills_animate_counter(start, stop, speed, step, ed, total);
		}, speed);
	}
}


function trx_addons_admin_init() {
	"use strict";

	// Media selector
	TRX_ADDONS_STORAGE['media_id'] = '';
	TRX_ADDONS_STORAGE['media_frame'] = [];
	TRX_ADDONS_STORAGE['media_link'] = [];
	jQuery('.widget-liquid-right,.widgets-holder-wrap,.form-field,.trx_addons_options_item_field').on('click', '.trx_addons_media_selector', function(e) {
		trx_addons_show_media_manager(this);
		e.preventDefault();
		return false;
	});

	// Standard WP Color Picker
	if (jQuery('.trx_addons_color_selector').length > 0) {
		jQuery('.trx_addons_color_selector').wpColorPicker({
			// you can declare a default color here,
			// or in the data-default-color attribute on the input
			//defaultColor: false,
	
			// a callback to fire whenever the color changes to a valid color
			change: function(e, ui){
				jQuery(e.target).val(ui.color).trigger('change');
			},
	
			// a callback to fire when the input is emptied or an invalid color
			clear: function(e) {
				jQuery(e.target).prev().trigger('change')
			},
	
			// hide the color picker controls on load
			//hide: true,
	
			// show a group of common colors beneath the square
			// or, supply an array of colors to customize further
			//palettes: true
		});
	}

	// Refresh categories when post type is changed
	jQuery('.widget-liquid-right,.widgets-holder-wrap').on('change', '.widgets_param_post_type_selector', function() {
		"use strict";
		var cat_fld = jQuery(this).parent().next().find('select');
		var cat_lbl = jQuery(this).parent().next().find('label');
		trx_addons_fill_categories(this, cat_fld, cat_lbl);
		return false;
	});
}

// Show WP Media manager to select image
function trx_addons_show_media_manager(el) {
	"use strict";

	TRX_ADDONS_STORAGE['media_id'] = jQuery(el).attr('id');
	TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']] = jQuery(el);
	// If the media frame already exists, reopen it.
	if ( TRX_ADDONS_STORAGE['media_frame'][TRX_ADDONS_STORAGE['media_id']] ) {
		TRX_ADDONS_STORAGE['media_frame'][TRX_ADDONS_STORAGE['media_id']].open();
		return false;
	}

	// Create the media frame.
	TRX_ADDONS_STORAGE['media_frame'][TRX_ADDONS_STORAGE['media_id']] = wp.media({
		// Popup layout (if comment next row - hide filters and image sizes popups)
		frame: 'post',
		// Set the title of the modal.
		title: TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']].data('choose'),
		// Tell the modal to show only images.
		library: {
			type: TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']].data('type') ? TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']].data('type') : 'image'
		},
		// Multiple choise
		multiple: TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']].data('multiple')===true ? 'add' : false,
		// Customize the submit button.
		button: {
			// Set the text of the button.
			text: TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']].data('update'),
			// Tell the button not to close the modal, since we're
			// going to refresh the page when the image is selected.
			close: true
		}
	});

	// When an image is selected, run a callback.
	TRX_ADDONS_STORAGE['media_frame'][TRX_ADDONS_STORAGE['media_id']].on( 'insert select', function(selection) {
		"use strict";
		// Grab the selected attachment.
		var field = jQuery("#"+TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']].data('linked-field')).eq(0);
		var attachment = null, attachment_url = '';
		if (TRX_ADDONS_STORAGE['media_link'][TRX_ADDONS_STORAGE['media_id']].data('multiple')===true) {
			TRX_ADDONS_STORAGE['media_frame'][TRX_ADDONS_STORAGE['media_id']].state().get('selection').map( function( att ) {
				attachment_url += (attachment_url ? "\n" : "") + att.toJSON().url;
			});
			var val = field.val();
			attachment_url = val + (val ? "\n" : '') + attachment_url;
		} else {
			attachment = TRX_ADDONS_STORAGE['media_frame'][TRX_ADDONS_STORAGE['media_id']].state().get('selection').first().toJSON();
			attachment_url = attachment.url;
			var sizes_selector = jQuery('.media-modal-content .attachment-display-settings select.size');
			if (sizes_selector.length > 0) {
				var size = trx_addons_get_listbox_selected_value(sizes_selector.get(0));
				if (size != '') attachment_url = attachment.sizes[size].url;
			}
		}
		field.val(attachment_url);
		if (attachment_url.indexOf('.jpg') > 0 || attachment_url.indexOf('.png') > 0 || attachment_url.indexOf('.gif') > 0) {
			var preview = field.siblings('.trx_addons_options_field_preview');
			if (preview.length != 0) {
				if (preview.find('img').length == 0)
					preview.append('<img src="'+attachment_url+'">');
				else 
					preview.find('img').attr('src', attachment_url);
			} else {
				preview = field.siblings('img');
				if (preview.length != 0)
					preview.attr('src', attachment_url);
			}
		}
		field.trigger('change');
	});

	// Finally, open the modal.
	TRX_ADDONS_STORAGE['media_frame'][TRX_ADDONS_STORAGE['media_id']].open();
	return false;
}


// Fill categories in specified field
function trx_addons_fill_categories(fld, cat_fld, cat_lbl) {
	"use strict";
	var cat_value = cat_fld.val();
	cat_lbl.append('<span class="sc_refresh iconaddons-spin3 animate-spin"></span>');
	var pt = jQuery(fld).val();
	// Prepare data
	var data = {
		action: 'trx_addons_change_post_type',
		nonce: TRX_ADDONS_STORAGE['ajax_nonce'],
		post_type: pt
	};
	jQuery.post(TRX_ADDONS_STORAGE['ajax_url'], data, function(response) {
		"use strict";
		var rez = {};
		try {
			rez = JSON.parse(response);
		} catch (e) {
			rez = { error: TRX_ADDONS_STORAGE['msg_ajax_error'] };
			console.log(response);
		}
		if (rez.error === '') {
			var opt_list = '';
			for (var i in rez.data.ids) {
				opt_list += '<option class="'+rez.data.ids[i]+'" value="'+rez.data.ids[i]+'"'+(rez.data.ids[i]==cat_value ? ' selected="selected"' : '')+'>'+rez.data.titles[i]+'</option>';
			}
			cat_fld.html(opt_list);
			cat_lbl.find('span').remove();
		}
	});
	return false;
}

jQuery(window).on('beforeunload', function() {
	"use strict";
	// Show preloader
	if (jQuery.browser && !jQuery.browser.safari) jQuery('#page_preloader').css({display: 'block', opacity: 0}).animate({opacity:0.8}, 300);
});


// Init actions
function trx_addons_init_actions() {
	"use strict";

	if (TRX_ADDONS_STORAGE['vc_edit_mode'] > 0 && jQuery('.vc_empty-placeholder').length==0 && TRX_ADDONS_STORAGE['vc_init_counter']++ < 30) {
		setTimeout(trx_addons_init_actions, 200);
		return;
	}
	
	// Hide preloader
	jQuery('#page_preloader').animate({opacity:0}, 800, function() {
								jQuery(this).css( {display: 'none'} );
								jQuery(this).remove();
								});

	// Check for Retina display
	if (trx_addons_is_retina()) {
		trx_addons_set_cookie('trx_addons_is_retina', 1, 365);
	}


	// Add ready actions to the hidden elements actions
	jQuery(document).on('action.init_hidden_elements', trx_addons_ready_actions);

	// Init core actions
	trx_addons_ready_actions();
	trx_addons_resize_actions();
	trx_addons_scroll_actions();

	// Resize handlers
	jQuery(window).resize(function() {
		"use strict";
		trx_addons_resize_actions();
	});

	// Add resize on VC action vc-full-width-row
	jQuery(document).on('vc-full-width-row', function(e, el) {
		trx_addons_resize_actions();
	});

	// Scroll handlers
	jQuery(window).scroll(function() {
		"use strict";
		trx_addons_scroll_actions();
	});
}



// Page first load actions
//==============================================
function trx_addons_ready_actions(e, container) {
	"use strict";

	if (arguments.length < 2) var container = jQuery('body');

	// Tabs
    //------------------------------------
	if (container.find('.trx_addons_tabs:not(.inited)').length > 0 && jQuery.ui && jQuery.ui.tabs) {
		container.find('.trx_addons_tabs:not(.inited)').each(function () {
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


	// Accordion
    //------------------------------------
	if (container.find('.trx_addons_accordion:not(.inited)').length > 0 && jQuery.ui && jQuery.ui.accordion) {
		container.find('.trx_addons_accordion:not(.inited)').each(function () {
			"use strict";
			// Get headers selector
			var accordion = jQuery(this);
			var headers = accordion.data('headers');
			if (headers===undefined) headers = 'h5';
			// Get height style
			var height_style = accordion.data('height-style');
			if (height_style===undefined) height_style = 'content';
			// Get initially opened tab
			var init = accordion.data('active');
			var active = false;
			if (isNaN(init)) {
				init = 0;
				var active = accordion.find(headers+'[data-active="true"]').eq(0);
				if (active.length > 0) {
					while (!active.parent().hasClass('trx_addons_accordion')) {
						active = active.parent();
					}
					init = active.index();
					if (isNaN(init) || init < 0) init = 0;
				}
			} else {
				init = Math.max(0, init);
			}
			// Init accordion
			accordion.addClass('inited').accordion({
				active: init,
				header: headers,
				heightStyle: height_style,
				create: function( event, ui ) {
					if (ui.panel.length > 0) {
						jQuery(document).trigger('action.init_hidden_elements', [ui.panel]);
					} else if (active !== false && active.length > 0) {
						// If headers and panels wrapped into div
						active.find('>'+headers).trigger('click');
					}
				},
				activate: function( event, ui ) {
					if (ui.newPanel.length > 0) jQuery(document).trigger('action.init_hidden_elements', [ui.newPanel]);
				}
			});
		});
	}


	// Sliders
    //----------------------------------------------
	jQuery(document).trigger('action.init_sliders', [container]);


	// Shortcodes
    //----------------------------------------------
	jQuery(document).trigger('action.init_shortcodes', [container]);


	// Video player
    //----------------------------------------------
	if (container.find('.trx_addons_video_player.with_cover .video_hover:not(.inited)').length > 0) {
		container.find('.trx_addons_video_player.with_cover .video_hover:not(.inited)')
			.addClass('inited')
			.on('click', function(e) {
				"use strict";

				jQuery(this).parents('.trx_addons_video_player')
					.addClass('video_play')
					.find('.video_embed').html(jQuery(this).data('video'));

				// If video in the slide
				var slider = jQuery(this).parents('.slider_swiper');
				if (slider.length > 0) {
					var id = slider.attr('id');
					TRX_ADDONS_STORAGE['swipers'][id].stopAutoplay();
				}

				jQuery(window).trigger('resize');
				e.preventDefault();
				return false;
			});
	}


	// Popups
    //----------------------------------------------
	if (TRX_ADDONS_STORAGE['popup_engine'] == 'pretty') {
		container.find("a[href$='jpg']:not(.inited),a[href$='jpeg']:not(.inited),a[href$='png']:not(.inited),a[href$='gif']:not(.inited)").attr('rel', 'prettyPhoto[slideshow]');
		var images = container.find("a[rel*='prettyPhoto']:not(.inited):not(.esgbox):not([data-rel*='pretty']):not([rel*='magnific']):not([data-rel*='magnific'])").addClass('inited');
		try {
			images.prettyPhoto({
				social_tools: '',
				theme: 'facebook',
				deeplinking: false
			});
		} catch (e) {};
	} else if (TRX_ADDONS_STORAGE['popup_engine']=='magnific') {
		container.find("a[href$='jpg']:not(.inited),a[href$='jpeg']:not(.inited),a[href$='png']:not(.inited),a[href$='gif']:not(.inited)").attr('rel', 'magnific');
		var images = container.find("a[rel*='magnific']:not(.inited):not(.esgbox):not(.prettyphoto):not([rel*='pretty']):not([data-rel*='pretty'])").addClass('inited');
		try {
			images.magnificPopup({
				type: 'image',
				mainClass: 'mfp-img-mobile',
				closeOnContentClick: true,
				closeBtnInside: true,
				fixedContentPos: true,
				midClick: true,
				//removalDelay: 500, 
				preloader: true,
				tLoading: TRX_ADDONS_STORAGE['msg_magnific_loading'],
				gallery:{
					enabled: true
				},
				image: {
					tError: TRX_ADDONS_STORAGE['msg_magnific_error'],
					verticalFit: true
				},
				zoom: {
					enabled: true,
					duration: 300,
                    easing: 'ease-in-out',
					opener: function(openerElement) {
						// openerElement is the element on which popup was initialized, in this case its <a> tag
						// you don't need to add "opener" option if this code matches your needs, it's defailt one.
						if (!openerElement.is('img')) {
							if (openerElement.parents('.trx_addons_hover').find('img').length > 0)
								openerElement = openerElement.parents('.trx_addons_hover').find('img');
							else if (openerElement.siblings('img').length > 0)
								 openerElement = openerElement.siblings('img');
							else if (openerElement.parent().parent().find('img').length > 0)
								 openerElement = openerElement.parent().parent().find('img');
						}
						return openerElement; 
					}
				},
				callbacks: {
					beforeClose: function(){
						jQuery('.mfp-figure figcaption').hide();
						jQuery('.mfp-figure .mfp-arrow').hide();
					}
				}
			});
		} catch (e) {};
	}


	// Likes counter
	//---------------------------------------------
	if (container.find('.post_counters_likes:not(.inited),.comment_counters_likes:not(.inited)').length > 0) {
		container.find('.post_counters_likes:not(.inited),.comment_counters_likes:not(.inited)')
			.addClass('inited')
			.on('click', function(e) {
				"use strict";
				// var button = jQuery(this);
				// var inc = button.hasClass('enabled') ? 1 : -1;
				// var post_id = button.hasClass('post_counters_likes') ? button.data('postid') :  button.data('commentid');
				// var cookie_likes = trx_addons_get_cookie(button.hasClass('post_counters_likes') ? 'trx_addons_likes' : 'trx_addons_comment_likes');
				// if (cookie_likes === undefined || cookie_likes===null) cookie_likes = '';
				// jQuery.post(TRX_ADDONS_STORAGE['ajax_url'], {
				// 	action: button.hasClass('post_counters_likes') ? 'post_counter' : 'comment_counter',
				// 	nonce: TRX_ADDONS_STORAGE['ajax_nonce'],
				// 	post_id: post_id,
				// 	likes: inc
				// }).done(function(response) {
				// 	"use strict";
				// 	var rez = {};
				// 	try {
				// 		rez = JSON.parse(response);
				// 	} catch (e) {
				// 		rez = { error: TRX_ADDONS_STORAGE['msg_ajax_error'] };
				// 		console.log(response);
				// 	}
				// 	if (rez.error === '') {
				// 		var counter = rez.counter;
				// 		if (inc == 1) {
				// 			var title = button.data('title-dislike');
				// 			button.removeClass('enabled trx_addons_icon-heart-empty').addClass('disabled trx_addons_icon-heart');
				// 			cookie_likes += (cookie_likes.substr(-1)!=',' ? ',' : '') + post_id + ',';
				// 		} else {
				// 			var title = button.data('title-like');
				// 			button.removeClass('disabled trx_addons_icon-heart').addClass('enabled trx_addons_icon-heart-empty');
				// 			cookie_likes = cookie_likes.replace(','+post_id+',', ',');
				// 		}
				// 		button.data('likes', counter).attr('title', title).find(button.hasClass('post_counters_likes') ? '.post_counters_number' : '.comment_counters_number').html(counter);
				// 		trx_addons_set_cookie(button.hasClass('post_counters_likes') ? 'trx_addons_likes' : 'trx_addons_comment_likes', cookie_likes, 365);
				// 	} else {
				// 		alert(TRX_ADDONS_STORAGE['msg_error_like']);
				// 	}
				// });
				// e.preventDefault();
				return false;
			});
	}


	// Socials share
    //----------------------------------------------
	if (container.find('.socials_share .socials_caption:not(.inited)').length > 0) {
		container.find('.socials_share .socials_caption:not(.inited)').each(function() {
			"use strict";
			jQuery(this).addClass('inited').on('click', function(e) {
				"use strict";
				jQuery(this).siblings('.social_items').fadeToggle();
				e.preventDefault();
				return false;
			});
		});
	}
	if (container.find('.socials_share .social_items:not(.inited)').length > 0) {
		container.find('.socials_share .social_items:not(.inited)').each(function() {
			"use strict";
			jQuery(this).addClass('inited').on('click', '.social_item_popup > a.social_icons', function(e) {
				"use strict";
				var url = jQuery(this).data('link');
				window.open(url, '_blank', 'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=480, height=400, toolbar=0, status=0');
				e.preventDefault();
				return false;
			});
		});
	}
	
	
	// Widgets decoration
    //----------------------------------------------

	// Decorate nested lists in widgets and side panels
	container.find('.widget ul > li').each(function() {
		"use strict";
		if (jQuery(this).find('ul').length > 0) {
			jQuery(this).addClass('has_children');
		}
	});

	// Archive widget decoration
	container.find('.widget_archive a:not(.inited)').addClass('inited').each(function() {
		"use strict";
		var val = jQuery(this).html().split(' ');
		if (val.length > 1) {
			val[val.length-1] = '<span>' + val[val.length-1] + '</span>';
			jQuery(this).html(val.join(' '))
		}
	});
		

	// Other settings
    //------------------------------------

	// Scroll to top button
	container.find('.trx_addons_scroll_to_top:not(.inited)').addClass('inited').on('click', function(e) {
		"use strict";
		jQuery('html,body').animate({
			scrollTop: 0
		}, 'slow');
		e.preventDefault();
		return false;
	});
	
} //end ready




// Scroll actions
//==============================================

// Do actions when page scrolled
function trx_addons_scroll_actions() {
	"use strict";

	var scroll_offset = jQuery(window).scrollTop();
	var scroll_to_top_button = jQuery('.trx_addons_scroll_to_top');
	var adminbar_height = Math.max(0, jQuery('#wpadminbar').height());

	// Scroll to top button show/hide
	if (scroll_to_top_button.length > 0) {
		if (scroll_offset > 100)
			scroll_to_top_button.addClass('show');
		else
			scroll_to_top_button.removeClass('show');
	}

	// Scroll actions for animated elements
	jQuery('[data-animation^="animated"]:not(.animated)').each(function() {
		"use strict";
		if (jQuery(this).offset().top < scroll_offset + jQuery(window).height())
			jQuery(this).addClass(jQuery(this).data('animation'));
	});
}



// Resize actions
//==============================================

// Do actions when page scrolled
function trx_addons_resize_actions(cont) {
	"use strict";
	if (window.trx_addons_resize_sliders) trx_addons_resize_sliders(cont);
	trx_addons_resize_video(cont);
}



// Fit video frames to document width
function trx_addons_resize_video(cont) {
	if (cont===undefined) cont = jQuery('body');
	cont.find('video').each(function() {
		"use strict";
		var video = jQuery(this).eq(0);
		var ratio = (video.data('ratio')!=undefined ? video.data('ratio').split(':') : [16,9]);
		ratio = ratio.length!=2 || ratio[0]==0 || ratio[1]==0 ? 16/9 : ratio[0]/ratio[1];
		var mejs_cont = video.parents('.mejs-video');
		var w_attr = video.data('width');
		var h_attr = video.data('height');
		if (!w_attr || !h_attr) {
			w_attr = video.attr('width');
			h_attr = video.attr('height');
			if (!w_attr || !h_attr) return;
			video.data({'width': w_attr, 'height': h_attr});
		}
		var percent = (''+w_attr).substr(-1)=='%';
		w_attr = parseInt(w_attr);
		h_attr = parseInt(h_attr);
		var w_real = Math.round(mejs_cont.length > 0 ? Math.min(percent ? 10000 : w_attr, mejs_cont.parents('div,article').width()) : video.width()),
			h_real = Math.round(percent ? w_real/ratio : w_real/w_attr*h_attr);
		if (parseInt(video.attr('data-last-width'))==w_real) return;
		if (mejs_cont.length > 0 && mejs) {
			trx_addons_set_mejs_player_dimensions(video, w_real, h_real);
		}
		if (percent) {
			video.height(h_real);
		} else {
			video.attr({'width': w_real, 'height': h_real}).css({'width': w_real+'px', 'height': h_real+'px'});
		}
		video.attr('data-last-width', w_real);
	});
	cont.find('.video_frame iframe').each(function() {
		"use strict";
		var iframe = jQuery(this).eq(0);
		if (iframe.attr('src').indexOf('soundcloud')>0) return;
		var ratio = (iframe.data('ratio')!=undefined 
						? iframe.data('ratio').split(':') 
						: (iframe.parent().data('ratio')!=undefined 
							? iframe.parent().data('ratio').split(':') 
							: (iframe.find('[data-ratio]').length>0 
								? iframe.find('[data-ratio]').data('ratio').split(':') 
								: [16,9]
								)
							)
						);
		ratio = ratio.length!=2 || ratio[0]==0 || ratio[1]==0 ? 16/9 : ratio[0]/ratio[1];
		var w_attr = iframe.attr('width');
		var h_attr = iframe.attr('height');
		if (!w_attr || !h_attr) {
			return;
		}
		var percent = (''+w_attr).substr(-1)=='%';
		w_attr = parseInt(w_attr);
		h_attr = parseInt(h_attr);
		var pw = iframe.parent().width(),
			ph = iframe.parent().height(),
			w_real = pw,
			h_real = Math.round(percent ? w_real/ratio : w_real/w_attr*h_attr);
		if (iframe.parent().css('position') == 'absolute' && h_real > ph) {
			h_real = ph;
			w_real = Math.round(percent ? h_real*ratio : h_real*w_attr/h_attr)
		}
		if (parseInt(iframe.attr('data-last-width'))==w_real) return;
		iframe.css({'width': w_real+'px', 'height': h_real+'px'});
		iframe.attr('data-last-width', w_real);
	});
}


// Set Media Elements player dimensions
function trx_addons_set_mejs_player_dimensions(video, w, h) {
	"use strict";
	if (mejs) {
		for (var pl in mejs.players) {
			if (mejs.players[pl].media.src == video.attr('src')) {
				if (mejs.players[pl].media.setVideoSize) {
					mejs.players[pl].media.setVideoSize(w, h);
				}
				mejs.players[pl].setPlayerSize(w, h);
				mejs.players[pl].setControlsSize();
			}
		}
	}
}


// Init and resize sliders

jQuery(document).on('action.init_sliders', trx_addons_init_sliders);
jQuery(document).on('action.init_hidden_elements', trx_addons_init_hidden_sliders);

// Init sliders with engine=swiper
function trx_addons_init_sliders(e, container) {
	"use strict";

	// Create Swiper Controllers
	if (container.find('.sc_slider_controller:not(.inited)').length > 0) {
		container.find('.sc_slider_controller:not(.inited)')
			.each(function () {
				"use strict";
				var controller = jQuery(this).addClass('inited');
				var slider_id = controller.data('slider-id');
				if (!slider_id) return;
				
				var controller_id = controller.attr('id');
				if (controller_id == undefined) {
					controller_id = 'sc_slider_controller_'+Math.random();
					controller_id = controller_id.replace('.', '');
					controller.attr('id', controller_id);
				}

				jQuery('#'+slider_id+' .slider_swiper').attr('data-controller', controller_id);

				var controller_style = controller.data('style');
				var controller_effect = controller.data('effect');
				var controller_interval = controller.data('interval');
				var controller_height = controller.data('height');
				var controller_per_view = controller.data('slides-per-view');
				var controller_space = controller.data('slides-space');
				var controller_controls = controller.data('controls');

				var controller_html = '';
				jQuery('#'+slider_id+' .swiper-slide')
					.each(function (idx) {
						"use strict";
						var slide = jQuery(this);
						var image = slide.data('image');
						var title = slide.data('title');
						var cats = slide.data('cats');
						var date = slide.data('date');
						controller_html += '<div class="swiper-slide"'
												+ ' style="'
														+ (image !== undefined ? 'background-image: url('+image+');' : '')
														+ '"'
												+ '>'
												+ '<div class="sc_slider_controller_info">'
													+ '<span class="sc_slider_controller_info_number">'+(idx < 9 ? '0' : '')+(idx+1)+'</span>'
													+ '<span class="sc_slider_controller_info_title">'+title+'</span>'
												+ '</div>'
											+ '</div>';
					});
				controller.html('<div id="'+controller_id+'_outer"'
									+ ' class="slider_swiper_outer slider_style_controller'
												+ ' slider_outer_' + (controller_controls == 1 ? 'controls slider_outer_controls_side' : 'nocontrols')
												+ ' slider_outer_nopagination'
												+ ' slider_outer_' + (controller_per_view==1 ? 'one' : 'multi')
												+ '"'
									+ '>'
										+ '<div id="'+controller_id+'_swiper"'
											+' class="slider_swiper swiper-slider-container'
													+ ' slider_' + (controller_controls == 1 ? 'controls slider_controls_side' : 'nocontrols')
													+ ' slider_nopagination'
													+ ' slider_notitles'
													+ ' slider_noresize'
													+ ' slider_' + (controller_per_view==1 ? 'one' : 'multi')
													+ '"'
											+ ' data-slides-min-width="100"'
											+ ' data-controlled-slider="'+slider_id+'"'
											+ (controller_effect !== undefined ? ' data-effect="' + controller_effect + '"' : '')
											+ (controller_interval !== undefined ? ' data-interval="' + controller_interval + '"' : '')
											+ (controller_per_view !== undefined ? ' data-slides-per-view="' + controller_per_view + '"' : '')
											+ (controller_space !== undefined ? ' data-slides-space="' + controller_space + '"' : '')
											+ (controller_height !== undefined ? ' style="height:'+controller_height+'"' : '')
										+ '>'
											+ '<div class="swiper-wrapper">'
												+ controller_html
											+ '</div>'
										+ '</div>'
										+ (controller_controls == 1
											? '<div class="slider_controls_wrap"><a class="slider_prev swiper-button-prev" href="#"></a><a class="slider_next swiper-button-next" href="#"></a></div>'
											: ''
											)
									+ '</div>'
				);
			});
	}
				

	// Swiper Slider
	if (container.find('.slider_swiper:not(.inited)').length > 0) {
		container.find('.slider_swiper:not(.inited)')
			.each(function () {
				"use strict";

				// If slider inside the invisible block - exit
				if (jQuery(this).parents('div:hidden,article:hidden').length > 0)
					return;
				
				// Check attr id for slider. If not exists - generate it
				var slider = jQuery(this);
				var id = slider.attr('id');
				if (id == undefined) {
					id = 'swiper_'+Math.random();
					id = id.replace('.', '');
					slider.attr('id', id);
				}
				var cont = slider.parent().hasClass('slider_swiper_outer') ? slider.parent().attr('id', id+'_outer') : slider;
				var cont_id = cont.attr('id');

				// If this slider is controller for the other slider
				var is_controller = slider.parents('.sc_slider_controller').length > 0;
				var controller_id = slider.data('controller');
				
				// Enum all slides
				slider.find('.swiper-slide').each(function(idx) {
					jQuery(this).attr('data-slide-number', idx);
				});

				// Show slider, but make it invisible
				slider.css({
					'display': 'block',
					'opacity': 0
					})
					.addClass(id)
					.addClass('inited')
					.data('settings', {mode: 'horizontal'});		// VC hook

				// Min width of the slides in swiper (used for validate slides_per_view on small screen)
				var smw = slider.data('slides-min-width');
				if (smw == undefined) {
					smw = 250;
					slider.attr('data-slides-min-width', smw);
				}

				// Validate Slides per view on small screen
				var width = slider.width();
				if (width == 0) width = slider.parent().width();
				var spv = slider.data('slides-per-view');
				if (spv == undefined) {
					spv = 1;
					slider.attr('data-slides-per-view', spv);
				}
				if (width / spv < smw) spv = Math.max(1, Math.floor(width / smw));

				// Space between slides
				var space = slider.data('slides-space');
				if (space == undefined) space = 0;
				
				// Autoplay interval
				var interval = slider.data('interval');
				if (isNaN(interval)) interval = 0;
					
				if (TRX_ADDONS_STORAGE['swipers'] === undefined) TRX_ADDONS_STORAGE['swipers'] = {};

				TRX_ADDONS_STORAGE['swipers'][id] = new Swiper('.'+id, {
					calculateHeight: !slider.hasClass('slider_height_fixed'),
					resizeReInit: true,
					autoResize: true,
				    effect: slider.data('effect') ? slider.data('effect') : 'slide',
					pagination: slider.hasClass('slider_pagination') ? '#'+cont_id+' .slider_pagination_wrap' : false,
				    paginationClickable: slider.hasClass('slider_pagination') ? '#'+cont_id+' .slider_pagination_wrap' : false,
				    paginationType: slider.hasClass('slider_pagination') && slider.data('pagination') ? slider.data('pagination') : 'bullets',
			        nextButton: slider.hasClass('slider_controls') ? '#'+cont_id+' .slider_next' : false,
			        prevButton: slider.hasClass('slider_controls') ? '#'+cont_id+' .slider_prev' : false,
			        autoplay: slider.hasClass('slider_noautoplay') || interval==0	? false : parseInt(interval),
        			autoplayDisableOnInteraction: true,
					initialSlide: 0,
					slidesPerView: spv,
					loopedSlides: spv,
					spaceBetween: space,
					speed: 600,
					centeredSlides: false,	//is_controller,
					loop: true,				//!is_controller
					grabCursor: !is_controller,
					slideToClickedSlide: is_controller,
					touchRatio: is_controller ? 0.2 : 1,
					onSlideChangeStart: function (swiper) {
						// Change outside title
						cont.find('.slider_titles_outside_wrap .active').removeClass('active').fadeOut();
						// Update controller or controlled slider
						var controlled_slider = jQuery('#'+slider.data(is_controller ? 'controlled-slider' : 'controller')+' .slider_swiper');
						var controlled_id = controlled_slider.attr('id');
						if (TRX_ADDONS_STORAGE['swipers'][controlled_id] && jQuery('#'+controlled_id).attr('data-busy')!=1) {
							slider.attr('data-busy', 1);
							setTimeout(function() { slider.attr('data-busy', 0); }, 300);
							var slide_number = jQuery(swiper.slides[swiper.activeIndex]).data('slide-number');
							var slide_idx = controlled_slider.find('[data-slide-number="'+slide_number+'"]').index();
							TRX_ADDONS_STORAGE['swipers'][controlled_id].slideTo(slide_idx);
						}
					},
					onSlideChangeEnd: function (swiper) {
						// Change outside title
						var titles = cont.find('.slider_titles_outside_wrap .slide_info');
						if (titles.length==0) return;
						//titles.eq((swiper.activeIndex-1)%titles.length).addClass('active').fadeIn();
						titles.eq(jQuery(swiper.slides[swiper.activeIndex]).data('slide-number')).addClass('active').fadeIn(300);
						// Remove video
						cont.find('.trx_addons_video_player.with_cover.video_play').removeClass('video_play').find('.video_embed').empty();
						// Unlock slider/controller
						slider.attr('data-busy', 0);
					}
				});
				
				slider.attr('data-busy', 1).animate({'opacity':1}, 'fast');
				setTimeout(function() { slider.attr('data-busy', 0); }, 300);
			});
	}
}


// Init previously hidden sliders with engine=swiper
function trx_addons_init_hidden_sliders(e, container) {
	"use strict";
	// Init sliders in this container
	trx_addons_init_sliders(e, container);
	// Check slides per view on current window size
	trx_addons_resize_sliders(container);
}

// Sliders: Resize
function trx_addons_resize_sliders(container) {
	"use strict";

	if (container === undefined) container = jQuery('body');
	container.find('.slider_swiper.inited').each(function() {
		"use strict";
		
		// If slider in the hidden block - don't resize it
		if (jQuery(this).parents('div:hidden,article:hidden').length > 0) return;

		var id = jQuery(this).attr('id');
		var slider_width = jQuery(this).width();
		var slide = jQuery(this).find('.swiper-slide').eq(0);
		var slide_width = slide.width();
		var slide_height = slide.height();
		var last_width = jQuery(this).data('last-width');
		if (isNaN(last_width)) last_width = 0;
		var ratio = jQuery(this).data('ratio');
		if (ratio===undefined || (''+ratio).indexOf(':')<1) {
			ratio = slide_height > 0 ? slide_width+':'+slide_height : "16:9";
			jQuery(this).attr('data-ratio', ratio);
		}
		ratio = ratio.split(':');
		var ratio_x = !isNaN(ratio[0]) ? Number(ratio[0]) : 16;
		var ratio_y = !isNaN(ratio[1]) ? Number(ratio[1]) : 9;
		
		// Resize slider
		if ( !jQuery(this).hasClass('slider_noresize') ) {
			jQuery(this).height( Math.floor(slide_width/ratio_x*ratio_y) );
		}

		// Change slides_per_view
		if (TRX_ADDONS_STORAGE['swipers'][id].params.slidesPerView != 'auto') {
			if (last_width==0 || last_width!=slider_width) {
				var smw = jQuery(this).data('slides-min-width');
				var spv = jQuery(this).data('slides-per-view');
				if (slider_width / spv < smw) spv = Math.max(1, Math.floor(slider_width / smw));
				jQuery(this).data('last-width', slider_width);
				if (TRX_ADDONS_STORAGE['swipers'][id].params.slidesPerView != spv) {
					TRX_ADDONS_STORAGE['swipers'][id].params.slidesPerView = spv;
					TRX_ADDONS_STORAGE['swipers'][id].params.loopedSlides = spv;
					//TRX_ADDONS_STORAGE['swipers'][id].reInit();
				}
				TRX_ADDONS_STORAGE['swipers'][id].onResize();
			}
		}
	});
}

// JS utilities

/* Cookies manipulations
---------------------------------------------------------------- */

function trx_addons_get_cookie(name) {
	"use strict";
	var defa = arguments[1]!=undefined ? arguments[1] : null;
	var start = document.cookie.indexOf(name + '=');
	var len = start + name.length + 1;
	if ((!start) && (name != document.cookie.substring(0, name.length))) {
		return defa;
	}
	if (start == -1)
		return defa;
	var end = document.cookie.indexOf(';', len);
	if (end == -1)
		end = document.cookie.length;
	return unescape(document.cookie.substring(len, end));
}


function trx_addons_set_cookie(name, value, expires, path, domain, secure) {
	"use strict";
	var expires = arguments[2]!=undefined ? arguments[2] : 0;
	var path    = arguments[3]!=undefined ? arguments[3] : '/';
	var domain  = arguments[4]!=undefined ? arguments[4] : '';
	var secure  = arguments[5]!=undefined ? arguments[5] : '';
	var today = new Date();
	today.setTime(today.getTime());
	if (expires) {
		expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date(today.getTime() + (expires));
	document.cookie = name + '='
			+ escape(value)
			+ ((expires) ? ';expires=' + expires_date.toGMTString() : '')
			+ ((path)    ? ';path=' + path : '')
			+ ((domain)  ? ';domain=' + domain : '')
			+ ((secure)  ? ';secure' : '');
}


function trx_addons_del_cookie(name, path, domain) {
	"use strict";
	var path   = arguments[1]!=undefined ? arguments[1] : '/';
	var domain = arguments[2]!=undefined ? arguments[2] : '';
	if (trx_addons_get_cookie(name))
		document.cookie = name + '=' + ((path) ? ';path=' + path : '')
				+ ((domain) ? ';domain=' + domain : '')
				+ ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}



/* ListBox and ComboBox manipulations
---------------------------------------------------------------- */

function trx_addons_clear_listbox(box) {
	"use strict";
	for (var i=box.options.length-1; i>=0; i--)
		box.options[i] = null;
}

function trx_addons_add_listbox_item(box, val, text) {
	"use strict";
	var item = new Option();
	item.value = val;
	item.text = text;
    box.options.add(item);
}

function trx_addons_del_listbox_item_by_value(box, val) {
	"use strict";
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].value == val) {
			box.options[i] = null;
			break;
		}
	}
}

function trx_addons_del_listbox_item_by_text(box, txt) {
	"use strict";
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].text == txt) {
			box.options[i] = null;
			break;
		}
	}
}

function trx_addons_find_listbox_item_by_value(box, val) {
	"use strict";
	var idx = -1;
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].value == val) {
			idx = i;
			break;
		}
	}
	return idx;
}

function trx_addons_find_listbox_item_by_text(box, txt) {
	"use strict";
	var idx = -1;
	for (var i=0; i<box.options.length; i++) {
		if (box.options[i].text == txt) {
			idx = i;
			break;
		}
	}
	return idx;
}

function trx_addons_select_listbox_item_by_value(box, val) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		box.options[i].selected = (val == box.options[i].value);
	}
}

function trx_addons_select_listbox_item_by_text(box, txt) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		box.options[i].selected = (txt == box.options[i].text);
	}
}

function trx_addons_get_listbox_values(box) {
	"use strict";
	var delim = arguments[1] ? arguments[1] : ',';
	var str = '';
	for (var i=0; i<box.options.length; i++) {
		str += (str ? delim : '') + box.options[i].value;
	}
	return str;
}

function trx_addons_get_listbox_texts(box) {
	"use strict";
	var delim = arguments[1] ? arguments[1] : ',';
	var str = '';
	for (var i=0; i<box.options.length; i++) {
		str += (str ? delim : '') + box.options[i].text;
	}
	return str;
}

function trx_addons_sort_listbox(box)  {
	"use strict";
	var temp_opts = new Array();
	var temp = new Option();
	for(var i=0; i<box.options.length; i++)  {
		temp_opts[i] = box.options[i].clone();
	}
	for(var x=0; x<temp_opts.length-1; x++)  {
		for(var y=(x+1); y<temp_opts.length; y++)  {
			if(temp_opts[x].text > temp_opts[y].text)  {
				temp = temp_opts[x];
				temp_opts[x] = temp_opts[y];
				temp_opts[y] = temp;
			}  
		}  
	}
	for(var i=0; i<box.options.length; i++)  {
		box.options[i] = temp_opts[i].clone();
	}
}

function trx_addons_get_listbox_selected_index(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected)
			return i;
	}
	return -1;
}

function trx_addons_get_listbox_selected_value(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected) {
			return box.options[i].value;
		}
	}
	return null;
}

function trx_addons_get_listbox_selected_text(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected) {
			return box.options[i].text;
		}
	}
	return null;
}

function trx_addons_get_listbox_selected_option(box) {
	"use strict";
	for (var i = 0; i < box.options.length; i++) {
		if (box.options[i].selected) {
			return box.options[i];
		}
	}
	return null;
}



/* Radio buttons manipulations
---------------------------------------------------------------- */

function trx_addons_get_radio_value(radioGroupObj) {
	"use strict";
	for (var i=0; i < radioGroupObj.length; i++)
		if (radioGroupObj[i].checked) return radioGroupObj[i].value;
	return null;
}

function trx_addons_set_radio_checked_by_num(radioGroupObj, num) {
	"use strict";
	for (var i=0; i < radioGroupObj.length; i++)
		if (radioGroupObj[i].checked && i!=num) radioGroupObj[i].checked=false;
		else if (i==num) radioGroupObj[i].checked=true;
}

function trx_addons_set_radio_checked_by_value(radioGroupObj, val) {
	"use strict";
	for (var i=0; i < radioGroupObj.length; i++)
		if (radioGroupObj[i].checked && radioGroupObj[i].value!=val) radioGroupObj[i].checked=false;
		else if (radioGroupObj[i].value==val) radioGroupObj[i].checked=true;
}



/* Form validation
---------------------------------------------------------------- */

/*
// Usage example:
var error = trx_addons_form_validate(jQuery(form_selector), {	// -------- Options ---------
	error_message_show: true,									// Display or not error message
	error_message_time: 5000,									// Time to display error message
	error_message_class: 'trx_addons_message_box_error',		// Class, appended to error message block
	error_message_text: 'Global error text',					// Global error message text (if not specify message in the checked field)
	error_fields_class: 'trx_addons_field_error',				// Class, appended to error fields
	exit_after_first_error: false,								// Cancel validation and exit after first error
	rules: [
		{
			field: 'author',																// Checking field name
			min_length: { value: 1,	 message: 'The author name can\'t be empty' },			// Min character count (0 - don't check), message - if error occurs
			max_length: { value: 60, message: 'Too long author name'}						// Max character count (0 - don't check), message - if error occurs
		},
		{
			field: 'email',
			min_length: { value: 7,	 message: 'Too short (or empty) email address' },
			max_length: { value: 60, message: 'Too long email address'},
			mask: { value: '^([a-z0-9_\\-]+\\.)*[a-z0-9_\\-]+@[a-z0-9_\\-]+(\\.[a-z0-9_\\-]+)*\\.[a-z]{2,6}$', message: 'Invalid email address'}
		},
		{
			field: 'comment',
			min_length: { value: 1,	 message: 'The comment text can\'t be empty' },
			max_length: { value: 200, message: 'Too long comment'}
		},
		{
			field: 'pwd1',
			min_length: { value: 5,	 message: 'The password can\'t be less then 5 characters' },
			max_length: { value: 20, message: 'Too long password'}
		},
		{
			field: 'pwd2',
			equal_to: { value: 'pwd1',	 message: 'The passwords in both fields must be equals' }
		}
	]
});
*/

function trx_addons_form_validate(form, opt) {
	"use strict";
	// Default options
	if (typeof(opt.error_message_show)=='undefined')		opt.error_message_show = true;
	if (typeof(opt.error_message_time)=='undefined')		opt.error_message_time = 5000;
	if (typeof(opt.error_message_class)=='undefined')		opt.error_message_class = 'trx_addons_message_box_error';
	if (typeof(opt.error_message_text)=='undefined')		opt.error_message_text = 'Incorrect data in the fields!';
	if (typeof(opt.error_fields_class)=='undefined')		opt.error_fields_class = 'trx_addons_field_error';
	if (typeof(opt.exit_after_first_error)=='undefined')	opt.exit_after_first_error = false;
	// Validate fields
	var error_msg = '';
	form.find(":input").each(function() {
		"use strict";
		if (error_msg!='' && opt.exit_after_first_error) return;
		for (var i = 0; i < opt.rules.length; i++) {
			if (jQuery(this).attr("name") == opt.rules[i].field) {
				var val = jQuery(this).val();
				var error = false;
				if (typeof(opt.rules[i].min_length) == 'object') {
					if (opt.rules[i].min_length.value > 0 && val.length < opt.rules[i].min_length.value) {
						if (error_msg=='') jQuery(this).get(0).focus();
						error_msg += '<p class="trx_addons_error_item">' + (typeof(opt.rules[i].min_length.message)!='undefined' ? opt.rules[i].min_length.message : opt.error_message_text ) + '</p>';
						error = true;
					}
				}
				if ((!error || !opt.exit_after_first_error) && typeof(opt.rules[i].max_length) == 'object') {
					if (opt.rules[i].max_length.value > 0 && val.length > opt.rules[i].max_length.value) {
						if (error_msg=='') jQuery(this).get(0).focus();
						error_msg += '<p class="trx_addons_error_item">' + (typeof(opt.rules[i].max_length.message)!='undefined' ? opt.rules[i].max_length.message : opt.error_message_text ) + '</p>';
						error = true;
					}
				}
				if ((!error || !opt.exit_after_first_error) && typeof(opt.rules[i].mask) == 'object') {
					if (opt.rules[i].mask.value != '') {
						var regexp = new RegExp(opt.rules[i].mask.value);
						if (!regexp.test(val)) {
							if (error_msg=='') jQuery(this).get(0).focus();
							error_msg += '<p class="trx_addons_error_item">' + (typeof(opt.rules[i].mask.message)!='undefined' ? opt.rules[i].mask.message : opt.error_message_text ) + '</p>';
							error = true;
						}
					}
				}
				if ((!error || !opt.exit_after_first_error) && typeof(opt.rules[i].equal_to) == 'object') {
					if (opt.rules[i].equal_to.value != '' && val!=jQuery(jQuery(this).get(0).form[opt.rules[i].equal_to.value]).val()) {
						if (error_msg=='') jQuery(this).get(0).focus();
						error_msg += '<p class="trx_addons_error_item">' + (typeof(opt.rules[i].equal_to.message)!='undefined' ? opt.rules[i].equal_to.message : opt.error_message_text ) + '</p>';
						error = true;
					}
				}
				if (opt.error_fields_class != '') jQuery(this).toggleClass(opt.error_fields_class, error);
			}

		}
	});
	if (error_msg!='' && opt.error_message_show) {
		var error_message_box = form.find(".trx_addons_message_box");
		if (error_message_box.length == 0) error_message_box = form.parent().find(".trx_addons_message_box");
		if (error_message_box.length == 0) {
			form.append('<div class="trx_addons_message_box"></div>');
			error_message_box = form.find(".trx_addons_message_box");
		}
		if (opt.error_message_class) error_message_box.toggleClass(opt.error_message_class, true);
		error_message_box.html(error_msg).fadeIn();
		setTimeout(function() { error_message_box.fadeOut(); }, opt.error_message_time);
	}
	return error_msg!='';
}




/* Document manipulations
---------------------------------------------------------------- */

// Animated scroll to selected id
function trx_addons_document_animate_to(id, callback) {
	"use strict";
	var oft = !isNaN(id) ? Number(id) : 0;
	if (isNaN(id)) {
		if (id.indexOf('#')==-1) id = '#' + id;
		var obj = jQuery(id).eq(0);
		if (obj.length == 0) return;
		oft = obj.offset().top;
	}
	var st  = jQuery(window).scrollTop();
	var speed = Math.min(1200, Math.max(300, Math.round(Math.abs(oft-st) / jQuery(window).height() * 300)));
	jQuery('body,html').stop(true).animate( {scrollTop: oft - jQuery('#wpadminbar').height() + 1}, speed, 'linear', callback);
}

// Change browser address without reload page
function trx_addons_document_set_location(curLoc){
	"use strict";
	if (history.pushState===undefined || navigator.userAgent.match(/MSIE\s[6-9]/i) != null) return;
	try {
		history.pushState(null, null, curLoc);
		return;
	} catch(e) {}
	location.href = curLoc;
}

// Add/Change arguments to the url address
function trx_addons_add_to_url(prm) {
	"use strict";
	var ignore_empty = arguments[1] !== undefined ? arguments[1] : true;
	var loc = location.href;
	var q = loc.indexOf('?');
	var attr = {};
	if (q > 0) {
		var qq = loc.substr(q+1).split('&');
		var parts = '';
		for (var i=0; i<qq.length; i++) {
			var parts = qq[i].split('=');
			attr[parts[0]] = parts.length>1 ? parts[1] : ''; 
		}
	}
	for (var p in prm) {
		attr[p] = prm[p];
	}
	loc = (q > 0 ? loc.substr(0, q) : loc) + '?';
	var i = 0;
	for (p in attr) {
		if (ignore_empty && attr[p]=='') continue;
		loc += (i++ > 0 ? '&' : '') + p + '=' + attr[p];
	}
	return loc;
}



/* Browsers detection
---------------------------------------------------------------- */

function trx_addons_browser_is_mobile() {
	"use strict";
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}
function trx_addons_browser_is_ios() {
	"use strict";
	return navigator.userAgent.match(/iPad|iPhone|iPod/i) != null || navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;
}
function trx_addons_is_retina() {
	"use strict";
	var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';
	return (window.devicePixelRatio > 1) || (window.matchMedia && window.matchMedia(mediaQuery).matches);
}



/* File functions
---------------------------------------------------------------- */

function trx_addons_get_file_name(path) {
	"use strict";
	path = path.replace(/\\/g, '/');
	var pos = path.lastIndexOf('/');
	if (pos >= 0)
		path = path.substr(pos+1);
	return path;
}

function trx_addons_get_file_ext(path) {
	"use strict";
	var pos = path.lastIndexOf('.');
	path = pos >= 0 ? path.substr(pos+1) : '';
	return path;
}



/* Image functions
---------------------------------------------------------------- */

// Return true, if all images in the specified container are loaded
function trx_addons_check_images_complete(cont) {
	"use strict";
	var complete = true;
	cont.find('img').each(function() {
		if (!complete) return;
		if (!jQuery(this).get(0).complete) complete = false;
	});
	return complete;
}



/* Strings
---------------------------------------------------------------- */
function trx_addons_replicate(str, num) {
	"use strict";
	var rez = '';
	for (var i=0; i<num; i++) {
		rez += str;
	}
	return rez;
}



/* Utils
---------------------------------------------------------------- */

// Generates a storable representation of a value
function trx_addons_serialize(mixed_val) {
	"use strict";
	var obj_to_array = arguments.length==1 || argument[1]===true;

	switch ( typeof(mixed_val) ) {

		case "number":
			if ( isNaN(mixed_val) || !isFinite(mixed_val) )
				return false;
			else
				return (Math.floor(mixed_val) == mixed_val ? "i" : "d") + ":" + mixed_val + ";";

		case "string":
			return "s:" + mixed_val.length + ":\"" + mixed_val + "\";";

		case "boolean":
			return "b:" + (mixed_val ? "1" : "0") + ";";

		case "object":
			if (mixed_val == null)
				return "N;";
			else if (mixed_val instanceof Array) {
				var idxobj = { idx: -1 };
				var map = [];
				for (var i=0; i<mixed_val.length; i++) {
					idxobj.idx++;
					var ser = trx_addons_serialize(mixed_val[i]);
					if (ser)
						map.push(trx_addons_serialize(idxobj.idx) + ser);
				}                                      
				return "a:" + mixed_val.length + ":{" + map.join("") + "}";
			} else {
				var class_name = trx_addons_get_class(mixed_val);
				if (class_name == undefined)
					return false;
				var props = new Array();
				for (var prop in mixed_val) {
					var ser = trx_addons_serialize(mixed_val[prop]);
					if (ser)
						props.push(trx_addons_serialize(prop) + ser);
				}
				if (obj_to_array)
					return "a:" + props.length + ":{" + props.join("") + "}";
				else
					return "O:" + class_name.length + ":\"" + class_name + "\":" + props.length + ":{" + props.join("") + "}";
			}

		case "undefined":
			return "N;";
	}
	return false;
}

// Returns the name of the class of an object
function trx_addons_get_class(obj) {
	"use strict";
	if (obj instanceof Object && !(obj instanceof Array) && !(obj instanceof Function) && obj.constructor) {
		var arr = obj.constructor.toString().match(/function\s*(\w+)/);
		if (arr && arr.length == 2) return arr[1];
	}
	return false;
}

// Hovers
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


// TRX ADDONS

jQuery(document).on('action.add_googlemap_styles', windsor_trx_addons_add_googlemap_styles);
jQuery(document).on('action.init_shortcodes', windsor_trx_addons_init);
jQuery(document).on('action.init_hidden_elements', windsor_trx_addons_init);

// Add theme specific styles to the Google map
function windsor_trx_addons_add_googlemap_styles(e) {
	TRX_ADDONS_STORAGE['googlemap_styles']['dark'] = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#13162b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#13162b"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#5fc6ca"},{"lightness":21}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#cccdd2"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#13162b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#ff0000"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#13162b"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#13162b"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#13162b"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#13162b"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#f4f9fc"},{"lightness":17}]}];
}


function windsor_trx_addons_init(e, container) {
	"use strict";
	if (arguments.length < 2) var container = jQuery('body');
	if (container===undefined || container.length === undefined || container.length == 0) return;

	container.find('.sc_countdown_item canvas:not(.inited)').addClass('inited').attr('data-color', WINDSOR_STORAGE['alter_link_color']);
}

// Composer
jQuery(document).on('action.ready', windsor_js_composer_init);
jQuery(document).on('action.init_shortcodes', windsor_js_composer_init);
jQuery(document).on('action.init_hidden_elements', windsor_js_composer_init);

function windsor_js_composer_init(e, container) {
	"use strict";
	if (arguments.length < 2) var container = jQuery('body');
	if (container===undefined || container.length === undefined || container.length == 0) return;

	container.find('.vc_message_box_closeable:not(.inited)').addClass('inited').on('click', function(e) {
		"use strict";
		jQuery(this).fadeOut();
		e.preventDefault();
		return false;
	});
}