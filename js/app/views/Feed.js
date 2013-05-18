// Filename: FeedView.js

define([
	'backbone'
], function(Backbone) {
	var FeedView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// Show the buttons
			$("#button-menu").show();
			$("#button-delete").show();
		},
		
		render: function(){
			$("#page-title").html("Feed");
			$("#page").html("Feed");
			
			$("#button-delete").click(function() { alert("test"); });
		}
	});
	
	return FeedView;
});
