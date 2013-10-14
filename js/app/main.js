// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router', 'views/Status', 'collections/APIs'
], function(Backbone, Router, StatusView, APIsCollection) {
	var initialize = function() {
		// Configuration
		window.refresh_interval = 60;
		window.articles_per_page = 20;
		
		// Default values
		window.autorefresh_cnt = 0;
		window.statusShown = false;
		
		if(!$.localStorage("feed"))
			$.localStorage("feed", null);
		
		window.apis = new APIsCollection();
		apis.fetch();
		
		// Create the Router
		Router.initialize();
	}
	
	return {
		initialize: initialize
	};
});
