// Filename: AboutView.js

define([
	'backbone', 'text!templates/About.html'
], function(Backbone, AboutTemplate) {
	var AboutView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = AboutTemplate;
			
			// Show buttons
			if($.localStorage("token"))
				$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("About");
			this.$el.html(_.template(this.template));
		},
	});
	
	return AboutView;
});
