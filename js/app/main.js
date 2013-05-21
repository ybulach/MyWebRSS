// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router'
], function(Backbone, Router) {
	var initialize = function() {
		window.mywebrss = "https://api.mywebrss.net";
		
		// Create the Router
		Router.initialize();
	}
	
	return {
		initialize: initialize
	};
});
