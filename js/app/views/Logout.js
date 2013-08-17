// Filename: LogoutView.js

define([
	'backbone', 'views/Status', 'text!templates/Logout.html'
], function(Backbone, StatusView, LogoutTemplate) {
	var LogoutView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// Redirect to login page if we are not connected
			if(!$.localStorage("token")) {
				alert("You are not connected. Redirecting to Login page.");
				window.location = "#login";
			}
			
			// Show buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Logout");
			this.$el.html(LogoutTemplate);
			
			$("#logout-submit").click(function(event) {
				event.preventDefault();
				
				$("#logout-submit").attr("disabled", "disabled");
				navigator.id.logout();
			});
		},
	});
	
	return LogoutView;
});
