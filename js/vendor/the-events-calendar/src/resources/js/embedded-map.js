/**
 * Sets up one or more embedded maps.
 */
if ( "function" === typeof jQuery ) jQuery( document ).ready( function( $ ) {
	var mapHolder,
	    position,
	    venueObject,
	    venueAddress,
	    venueCoords,
	    venueTitle;

	// The tribeEventsSingleMap object must be accessible (as it contains the venue address data etc)
	if ( "undefined" === typeof tribeEventsSingleMap ) return;

	/**
	 * Determine whether to use long/lat coordinates (these are preferred) or the venue's street
	 * address.
	 */
	function prepare() {
		if ( false !== venueCoords ) useCoords();
		else useAddress();
	}



	/**
	 * Setup the map and apply a marker.
	 *
	 * Note that for each individual map, the actual map object can be accessed via the
	 * tribeEventsSingleMap object. In simple cases (ie, where there is only one map on
	 * the page) that means you can access it and change its properties via:
	 *
	 *     tribeEventsSingleMap.addresses[0].map
	 *
	 * Where there are multiple maps - such as in a custom list view with a map per
	 * event - tribeEventsSingleMap.addresses can be iterated through and changes made
	 * on an map-by-map basis.
	 */


	// Iterate through available addresses and set up the map for each
	$.each( tribeEventsSingleMap.addresses, function( index, venue ) {
		mapHolder = document.getElementById( "tribe-events-gmap-" + index );
		if ( null !== mapHolder ) {
			venueObject  = "undefined" !== typeof venue ? venue: {};
			venueAddress = "undefined" !== typeof venue.address ? venue.address : false;
			venueCoords  = "undefined" !== typeof venue.coords  ? venue.coords  : false;
			venueTitle   = venue.title;
			prepare();
		}
	});
});