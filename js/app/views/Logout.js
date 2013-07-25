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
			
			$("#logout-submit").click(function() {
				$("#logout-submit").attr("disabled", "disabled");
				
				var view = this;
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/logout",
					data: {token: $.localStorage("token")},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong token
							if(data.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							// Unknown error
							else
								status.setMessage(data.error);
							
							$("#logout-submit").removeAttr("disabled");
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Delete the token and redirect to Home
						$.localStorage('token', null);
						window.location = "index.html";
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
						
						$("#logout-submit").removeAttr("disabled");
					}
				});
			});
		},
	});
	
	return LogoutView;
});
