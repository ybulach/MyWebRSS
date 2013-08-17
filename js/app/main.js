// Filename: main.js
// The main app stuff

define([
	'backbone', 'app/router', 'views/Status'
], function(Backbone, Router, StatusView) {
	var initialize = function() {
		// Configuration
		window.mywebrss = "https://localhost/mywebrss/api";
		window.refresh_interval = 60;
		$.localStorage("articles_per_page", 20);
		
		// Default values
		$.localStorage("autorefresh_cnt", 0);
		$.localStorage("status", false);
		$.localStorage("feed", null);
		
		if(!$.localStorage("email"))
			$.localStorage("email", null);
		
		$("nav > *").hide();
		
		// Persona account stuff
		navigator.id.watch({
			loggedInUser: $.localStorage("email"),
			onlogin: function(assertion) {
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/login",
					data: {assertion: assertion},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong assertion
							if(data.error == "assertion") {
								status.setMessage("Bad assertion");
								navigator.id.logout();
							}
							// Unknown error
							else
								status.setMessage(data.error);
							
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Add the email and redirect to Home
						$.localStorage('email', data.email);
						$.localStorage('token', data.token);
						
						window.location = "#";
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
						navigator.id.logout();
					}
				});
			},
			onlogout: function() {
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/logout",
					data: {token: $.localStorage('token')},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Unknown error
							if(data.error != "token") {
								status.setMessage(data.error);
								return;
							}
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Delete the token and redirect to Home
						$.localStorage("token", null);
						$.localStorage('email', null);
						
						window.location = "#";
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
					}
				});
			},
			onready: function() {
				// Create the Router
				Router.initialize();
			}
		});
	}
	
	return {
		initialize: initialize
	};
});
