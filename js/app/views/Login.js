// Filename: LoginView.js

define([
	'backbone', 'views/Status', 'text!templates/Login.html'
], function(Backbone, StatusView, LoginTemplate) {
	var LoginView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// Redirect to home page if we are already connected
			if($.localStorage("token")) {
				alert("You are already connected. Redirecting to Home page.");
				window.location = "#";
			}
		},
		
		render: function(){
			$("#page-title").html("Login");
			this.$el.html(LoginTemplate);
			
			$("#login-submit").click(function(event) {
				event.preventDefault();
				
				$("#login-submit").attr("disabled", "disabled");
				navigator.id.request();
			});
		},
	});
	
	return LoginView;
});
