// Filename: SettingsView.js

define([
	'backbone'
], function(Backbone) {
	var SettingsView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// Show the buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Settings");
			$("#page").html("Settings");
		}
	});
	
	return SettingsView;
});
