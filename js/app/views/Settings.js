// Filename: SettingsView.js

define([
	'backbone', 'views/Status', 'text!templates/Settings.html'
], function(Backbone, StatusView, SettingsTemplate) {
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
					if(window.autorefresh_cnt)
						clearTimeout(window.autorefresh_cnt), window.autorefresh_cnt = 0;
				}
			});
		}
	});
	
	return SettingsView;
});
