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
		}
	});
	
	return ArticleModel;
});
