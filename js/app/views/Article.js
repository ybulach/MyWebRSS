// Filename: ArticleView.js

define([
	'backbone', 'views/Status', 'text!templates/Article.html', 'models/Article'
], function(Backbone, StatusView, ArticleTemplate, ArticleModel) {
	var ArticleView = Backbone.View.extend({
		el: $("#page"),
		article: null,
		api: null,
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
				if($.localStorage("feed"))
					window.location = "#feed/" + view.api + "/" + $.localStorage("feed");
				else
					window.location = "#";
			});
		},
		
		setModel: function(article) {
			if(typeof(article) != "object")
				return;
			
			delete this.model;
			this.model = article;
			this.render();
		},
		
		render: function(){
			$("#button-previous").attr("disabled", "disabled");
			$("#button-next").attr("disabled", "disabled");
			
			$("#page-title").html("Loading");
			
			// Change the content
			var content = "<h1>Loading</h1>";
			if(this.model) {
				if($.localStorage("feed") && ($.localStorage("feed") === 0))
					$("#page-title").html($("#home").html());
				else if($.localStorage("feed_name"))
					$("#page-title").html($.localStorage("feed_name"));
				
				content = _.template(this.template, this.model.toJSON());
			}
			
			this.$el.html(content);
			
			// Handle the previous and next buttons
			if($.localStorage("collection") && this.article) {
				var view = this;
				var collection = _.toArray($.localStorage("collection"));
				
				// Get the current ID in the array
				for(var i = 0; i < collection.length; i++) {
					if(collection[i].id == this.article)
						break;
				}
				
				// Previous button
				if(i > 0) {
					$("#button-previous").click(function() {
						window.location = "#article/" + view.api + "/" + collection[i-1].id;
					});
					$("#button-previous").removeAttr("disabled", "");
				}
				if(i < collection.length-1) {
					$("#button-next").click(function() {
						window.location = "#article/" + view.api + "/" + collection[i+1].id;
					});
					$("#button-next").removeAttr("disabled", "");
				}
			}
			
			// Open the links in the browser
			$("#page a").attr("target", "_blank");
		},
		
		loadArticle: function(api, id) {
			this.article = id;
			this.api = api;
			
			if(api >= window.apis.length)
				return;
			
			if(!$.localStorage("collection") || !this.article)
				$("#button-back").click();
			
			// Get the current ID in the array
			var collection = _.toArray($.localStorage("collection"));
			for(var i = 0; i < collection.length; i++) {
				if(collection[i].id == this.article)
					break;
			}
			
			// Set the article
			if((i >= 0) && (i < collection.length))
				this.setModel(new ArticleModel(collection[i]));
			else {
				$("#button-back").click();
				return;
			}
			
			// Mark the article as read
			window.apis.at(api).article_unread(this.article, function(success) {
				if(success) {
					// Change the status of the article in the collection
					collection[i].status = "";
					$.localStorage("collection", collection);
				}
			});
		}
	});
	
	return ArticleView;
});
