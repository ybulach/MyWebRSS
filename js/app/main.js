// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router'
], function(Backbone, Router) {
	var initialize = function() {
		window.mywebrss = "https://api.mywebrss.net";
		$.localStorage("autorefresh_cnt", 0);
		
		// Create the Router
		Router.initialize();
	}
	
	return {
		initialize: initialize
	};
});
