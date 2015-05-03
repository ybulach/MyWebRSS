// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router', 'views/Status', 'collections/APIs', 'collections/Articles'
], function(Backbone, Router, StatusView, APIsCollection, ArticlesCollection) {
	var initialize = function() {
		// Configuration
		window.refresh_interval = 60;
		window.articles_per_page = 20;
		
		// Default values
		window.autorefresh_cnt = 0;
		window.statusShown = false;
		$.ajaxSettings.timeout = 30000;	// Timeout of 30s
		
		if(!$.localStorage("feed"))
			$.localStorage("feed", null);

		window.apis = new APIsCollection();
		window.apis.fetch();
		
		window.articles = new ArticlesCollection();
		window.articles.fetch();
		
		// Create the Router
		window.router = new Router();
	}
	
	return {
		initialize: initialize
	};
});
