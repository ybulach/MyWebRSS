// Filename: SettingsView.js

define([
	'backbone', 'text!templates/Settings.html'
], function(Backbone, SettingsTemplate) {
	var SettingsView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = SettingsTemplate;
			
			// Redirect to the login page if necessary
			if(!$.localStorage("token"))
				window.location = "#login";
			
			// Show the buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Settings");
			$("#page").html(_.template(this.template));
			
			// Auto-refresh
			$("#check-autorefresh").prop("checked", $.localStorage("autorefresh"));
			
			$("#check-autorefresh").click(function() {
				$.localStorage("autorefresh", $("#check-autorefresh").is(":checked"));
				
				// Disable auto-refresh
				if(!$.localStorage("autorefresh")) {
					if($.localStorage("autorefresh_cnt"))
						clearTimeout($.localStorage("autorefresh_cnt")), $.localStorage("autorefresh_cnt", 0);
				}
			});
			
			// Change password
			$("#settings-password").click(function() {
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/password",
					data: {token: $.localStorage("token"), old_password: $("#settings-password-old").val(), password: $("#settings-password-new").val(), confirm_password: $("#settings-password-confirm").val()},
					success: function(data) {
						// Check error
						if(!data.success) {
							// Wrong token
							if(data.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							else if(data.error == "old_password") {
								alert("Bad password");
								$("#settings-password-old").focus();
							}
							else if(data.error == "password") {
								alert("Bad new password");
								$("#settings-password-new").focus();
							}
							else if(data.error == "confirm_password") {
								alert("New passwords are different");
								$("#settings-password-confirm").focus();
							}
							// Unknown error
							else
								alert(data.error);
							
							return;
						}
						
						alert("Password changed with success");
						window.location = "#settings";
					},
					error: function() {
						alert("Can't contact the server");
					}
				});
			});
		}
	});
	
	return SettingsView;
});
