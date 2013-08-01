// Filename: ArticleModel.js

define([
	'backbone'
], function(Backbone) {
	var ArticleModel = Backbone.Model.extend({
		defaults: {
			id: 0,
			feed: "",
			title: "Default",
			description: "Default Article",
			url: "http://",
			image: "http://",
			date: 0,
			status: ""
		},
		
		// Mark the article as read
		// Return: callback({ success: int, error: string })
		unread: function(callback) {
			if(!callback || (typeof(callback) != "function") || !$.localStorage("token"))
				return;
			
			var result = { success: 0, error: "" };
			var model = this;
			
			if(this.attributes.status != "new") {
				result.error = "status";
				callback(result);
				return;
			}
			
			// Get the list of feeds
			$.ajax({
				dataType: "json",
				url: window.mywebrss + "/article/unread",
				data: {token: $.localStorage("token"), article: model.id},
				success: function(data) {
					// Check error
					if(!data.success) {
						result.error = data.error;
						callback(result);
						return;
					}
					
					model.status = "new";
					
					result.success = 1;
					callback(result);
				},
				error: function() {
					result.error = "server";
					callback(result);
				}
			});
		}
	});
	
	return ArticleModel;
});
