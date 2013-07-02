// Filename: SigninView.js

define([
	'backbone', 'views/Status', 'text!templates/Signin.html'
], function(Backbone, StatusView, SigninTemplate) {
	var SigninView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// Redirect to home page if we are already connected
			if($.localStorage("token")) {
				alert("You are already connected. Redirecting to Home page.");
				window.location = "index.html";
			}
		},
		
		render: function(){
			$("#page-title").html("Signin");
			this.$el.html(SigninTemplate);
			
			$("#signin-submit").click(function() {
				$("#signin-submit").attr("disabled", "disabled");
				
				var view = this;
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/signin",
					data: {email: $("#signin-email").val(), password: $("#signin-password").val(), confirm_password: $("#signin-password-confirm").val()},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong email
							if(data.error == "email") {
								status.setMessage("Bad email address");
								$("#signin-email").focus();
							}
							else if(data.error == "password") {
								status.setMessage("Bad password");
								$("#signin-password").focus();
							}
							else if(data.error == "confirm_password") {
								status.setMessage("Passwords are different");
								$("#signin-password-confirm").focus();
							}
							// Unknown error
							else
								status.setMessage(data.error);
							
							$("#signin-submit").removeAttr("disabled");
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
						
						$("#signin-submit").removeAttr("disabled");
					}
				});
			});
		},
	});
	
	return SigninView;
});
