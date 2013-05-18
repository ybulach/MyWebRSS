// Filename: ArticleView.js

define([
	'backbone'
], function(Backbone) {
	var ArticleView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// Show the buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Article");
			$("#page").html("Article");
		}
	});
	
	return ArticleView;
});
