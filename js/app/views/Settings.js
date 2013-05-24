// Filename: SettingsView.js

define([
	'backbone', 'text!templates/Settings.html'
], function(Backbone, SettingsTemplate) {
	var SettingsView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = SettingsTemplate;
			
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
			});
			
			// Change password
			$("#settings-password").click(function() {
				alert("Not yet implemented");
			});
		}
	});
	
	return SettingsView;
});
