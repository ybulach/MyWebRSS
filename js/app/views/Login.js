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
				window.location = "index.html";
			}
			
			// Hide the menu
			//$("#region").attr("data-state", "none");
		},
		
		render: function(){
			$("#page-title").html("Login");
			this.$el.html(LoginTemplate);
			
			$("#login-submit").click(function() {
				var view = this;
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/login",
					data: {email: $("#login-email").val(), password: $("#login-password").val()},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong email
							if(data.error == "email") {
								status.setMessage("Bad email address");
								$("#login-email").focus();
							}
							else if(data.error == "password") {
								status.setMessage("Bad password");
								$("#login-password").focus();
							}
							// Unknown error
							else
								status.setMessage(data.error);
							
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Add the token and redirect to Home
						$.localStorage('token', data.token);
						window.location = "index.html";
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
					}
				});
			});
		},
	});
	
	return LoginView;
});
