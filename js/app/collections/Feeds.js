// Filename: FeedsCollection.js

define([
	'backbone', 'models/Feed'
], function(Backbone, FeedModel) {
	var FeedsCollection = Backbone.Collection.extend({
		model: FeedModel
	});
	
	return FeedsCollection;
});
