// Filename: ArticlesCollection.js

define([
	'backbone', 'models/Article'
], function(Backbone, ArticleModel) {
	var ArticlesCollection = Backbone.Collection.extend({
		model: ArticleModel
	});
	
	return ArticlesCollection;
});
