// Filename: ArticleModel.js

define([
	'backbone'
], function(Backbone) {
	var ArticleModel = Backbone.Model.extend({
		defaults: {
			id: 0,
			title: "Default",
			description: "Default Article",
			url: "http://",
			image: "http://",
			date: 0,
			status: ""
			//status: "new"
		}
	});
	
	return ArticleModel;
});
