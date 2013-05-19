// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router'
], function(Backbone, Router) {
	var initialize = function() {
		window.mywebrss = "http://192.168.0.12/mywebrss/api";
		
		// Create the Router
		Router.initialize();
	}
	
	return {
		initialize: initialize
	};
});
