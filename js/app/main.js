// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router'
], function(Backbone, Router) {
	var initialize = function() {
		// Configuration
		window.mywebrss = "https://api.mywebrss.net";
		window.refresh_interval = 60;
		
		// Default values
		$.localStorage("autorefresh_cnt", 0);
		$.localStorage("autorefresh_menu_cnt", 0);
		
		// Create the Router
		Router.initialize();
	}
	
	return {
		initialize: initialize
	};
});
