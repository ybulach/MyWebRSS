// Filename: LogoutView.js

define([
	'backbone', 'text!templates/Logout.html'
], function(Backbone, LogoutTemplate) {
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
			
			$("#logout-submit").click(function() {
				var view = this;
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/logout",
					data: {token: $.localStorage("token")},
					success: function(data) {
						// Check error
						if(!data.success) {
							// Wrong token
							if(data.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							// Unknown error
							else
								alert(data.error);
							
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Delete the token and redirect to Home
						$.localStorage('token', null);
						window.location = "index.html";
					},
					error: function() {
						alert("Can't contact the server");
					}
				});
			});
		},
	});
	
	return LogoutView;
});
