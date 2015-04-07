// Filename: ArticleView.js

define([
	'backbone', 'views/Status', 'text!templates/Article.html', 'models/Article'
], function(Backbone, StatusView, ArticleTemplate, ArticleModel) {
	var ArticleView = Backbone.View.extend({
		el: $("#sidepage"),
		article: null,
		api: null,
		feed: null,
		model: new ArticleModel(),
		
		initialize: function() {
			this.template = ArticleTemplate;
			
			// Show the buttons
			$("#button-back").show();
			$("#button-previous").show();
			$("#button-next").show();
			
			// Back to the feed
			var view = this;
			$("#button-back").click(function() {
				if(view.feed != 0)
					window.location = "#feed/" + view.api + "/" + view.feed;
				else
					window.location = "#";
			});
		},
		
		render: function(){
			$("#button-previous").attr("disabled", "disabled");
			$("#button-next").attr("disabled", "disabled");
			
			// Change the content
			$("#sidepage-title").html(this.model.attributes.feed);
			this.$el.html(_.template(this.template, this.model.toJSON()));
			
			// Handle the previous and next buttons
			if(window.articles && this.article) {
				var view = this;
				
				// Get the current ID in the array
				for(var i = 0; i < window.articles.length; i++) {
					if(window.articles.at(i).attributes.id == this.article)
						break;
				}
				
				// Previous button
				if(i > 0) {
					$("#button-previous").click(function() {
						window.location = "#feed/" + view.api + "/" + view.feed + "/" + window.articles.at(i-1).attributes.id;
					});
					$("#button-previous").removeAttr("disabled", "");
				}
				if(i < window.articles.length-1) {
					$("#button-next").click(function() {
						window.location = "#feed/" + view.api + "/" + view.feed + "/" + window.articles.at(i+1).attributes.id;
						console.log(window.articles.at(i+1).attributes.id);
					});
					$("#button-next").removeAttr("disabled", "");
				}
			}
			
			// Open the links in the browser
			$("#sidepage a").attr("target", "_blank");
		},
		
		loadArticle: function(api, feed, id) {
			this.article = id;
			this.api = api;
			this.feed = feed;
			
			if(api >= window.apis.length)
				return;
			
			if(!window.articles || !this.article) {
				$("#button-back").click();
				return;
			}
			
			// Get the current ID in the array
			for(var i = 0; i < window.articles.length; i++) {
				if(window.articles.at(i).id == this.article)
					break;
			}
			
			// Set the article
			if((i >= 0) && (i < window.articles.length)) {
				delete this.model;
				this.model = window.articles.at(i);
				this.render();
			}
			else {
				$("#button-back").click();
				return;
			}
			
			// Mark the article as read
			if(window.articles.at(i).attributes.status == "new") {
				window.apis.at(api).article_unread(this.article, function(success) {
					if(success) {
						// Change the status of the article in the collection
						window.articles.models[i].attributes.status = "";
						window.articles.save();

						// Refresh the views
						window.router.render();
					}
				});
			}
		}
	});
	
	return ArticleView;
});
