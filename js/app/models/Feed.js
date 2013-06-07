// Filename: FeedModel.js

define([
	'backbone'
], function(Backbone) {
	var FeedModel = Backbone.Model.extend({
		defaults: {
			id: 0,
			title: "Default",
			description: "Default Feed",
			unread: 0
		}
	});
	
	return FeedModel;
});
