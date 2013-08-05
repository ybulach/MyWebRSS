// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router'
], function(Backbone, Router) {
	var initialize = function() {
		// Configuration
		window.mywebrss = "https://api.mywebrss.net";
		window.refresh_interval = 60;
		$.localStorage("articles_per_page", 20);
		
		// Default values
		$.localStorage("autorefresh_cnt", 0);
		$.localStorage("status", false);
		$.localStorage("feed", null);
		
		// Create the Router
		Router.initialize();
	}
	
	return {
		initialize: initialize
	};
});
