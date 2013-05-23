// Filename: SigninView.js

define([
	'backbone', 'text!templates/Signin.html'
], function(Backbone, SigninTemplate) {
	var SigninView = Backbone.View.extend({
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
			$("#page-title").html("Signin");
			this.$el.html(SigninTemplate);
			
			$("#signin-submit").click(function() {
				var view = this;
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/signin",
					data: {email: $("#signin-email").val(), password: $("#signin-password").val(), confirm_password: $("#signin-password-confirm").val()},
					success: function(data) {
						// Check error
						if(!data.success) {
							// Wrong email
							if(data.error == "email") {
								alert("Bad email address");
								$("#signin-email").focus();
							}
							else if(data.error == "password") {
								alert("Bad password");
								$("#signin-password").focus();
							}
							else if(data.error == "confirm_password") {
								alert("Password are differents");
								$("#signin-password-confirm").focus();
							}
							// Unknown error
							else
								alert(data.error);
							
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Add the token and redirect to Home
						$.localStorage('token', data.token);
						window.location = "index.html";
					},
					error: function() {
						alert("Can't contact the server");
					}
				});
			});
		},
	});
	
	return SigninView;
});
