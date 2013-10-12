// Filename: ArticlesCollection.js

define([
	'backbone', 'models/Article'
], function(Backbone, ArticleModel) {
	var ArticlesCollection = Backbone.Collection.extend({
		model: ArticleModel,
		feed_name: "",
		feed: null,
		page: 0,
		
		// Refresh the articles list
		// Return: callback({ success: int, error: string })
		refresh: function(callback) {
			if(!callback || (typeof(callback) != "function") || !$.localStorage("token"))
				return;
			
			var result = { success: 0, error: "" };
			var collection = this;
			
			// Delete all articles if we start a new page
			if(this.page === 0) {
				this.reset();
				this.feed_name = "";
			}
			
			// Get the list of feeds
			$.ajax({
				dataType: "json",
				url: window.mywebrss + "/feed/show",
				data: {token: $.localStorage("token"), feed: collection.feed, articles_count: window.articles_per_page, page: collection.page},
				success: function(data) {
					// Check error
					if(!data.success) {
						result.error = data.error;
						callback(result);
						return;
					}
					
					// Create a new ArticlesCollection
					var feeds = new ArticlesCollection();
					
					// Get the feed name if given
					if(data.feed)
						collection.feed_name = data.feed;
					
					$(data.result).each(function(id, feed) {
						feeds.add(new ArticleModel(feed));
					});
					
					// Add a new page
					collection.add(data.result);
					
					result.success = 1;
					callback(result);
				},
				error: function() {
					result.error = "server";
					callback(result);
				}
			});
		},
		
		// Delete the feed
		// Return: callback({ success: int, error: string })
		delete: function(callback) {
			if(!callback || (typeof(callback) != "function") || !$.localStorage("token"))
				return;
			
			var result = { success: 0, error: "" };
			var collection = this;
			
			// Get the list of feeds
			$.ajax({
				dataType: "json",
				url: window.mywebrss + "/feed/delete",
				data: {token: $.localStorage("token"), feed: collection.feed},
				success: function(data) {
					// Check error
					if(!data.success) {
						result.error = data.error;
						callback(result);
						return;
					}
					
					// Delete the articles
					collection.reset();
					
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
	
	return ArticlesCollection;
});
