// Filename: FeedsCollection.js

define([
	'backbone', 'models/Feed'
], function(Backbone, FeedModel) {
	var FeedsCollection = Backbone.Collection.extend({
		model: FeedModel,
		unread_total: 0,
		
		// Refresh the feeds list
		// Return: callback({ success: int, error: string })
		refresh: function(callback) {
			if(!callback || (typeof(callback) != "function") || !$.localStorage("token"))
				return;
			
			var result = { success: 0, error: "" };
			var collection = this;
			
			// Get the list of feeds
			$.ajax({
				dataType: "json",
				url: window.mywebrss + "/feed/list",
				data: {token: $.localStorage("token")},
				success: function(data) {
					// Check error
					if(!data.success) {
						result.error = data.error;
						callback(result);
						return;
					}
					
					// Create a new FeedsCollection
					var feeds = new FeedsCollection();
					
					var unread_total = 0;
					$(data.result).each(function(id, feed) {
						unread_total += parseInt(feed.unread);
						feeds.add(new FeedModel(feed));
					});
					collection.unread_total = unread_total;
					
					collection.reset(data.result);
					
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
	
	return FeedsCollection;
});
