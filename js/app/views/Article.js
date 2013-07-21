// Filename: ArticleView.js

define([
	'backbone', 'views/Status', 'text!templates/Article.html', 'models/Article'
], function(Backbone, StatusView, ArticleTemplate, ArticleModel) {
	var ArticleView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = ArticleTemplate;
			
			// Redirect to the login page if necessary
			if(!$.localStorage("token"))
				window.location = "#login";
			
			// Show the buttons
			$("#button-back").show();
			//$("#button-refresh").show();
			$("#button-previous").show();
			$("#button-next").show();
			
			// Refresh the article
			var view = this;
			/*$("#button-refresh").click(function() {
				view.refresh_article();
			});*/
			
			// Back to the feed
			$("#button-back").click(function() {
				if($.localStorage("feed"))
					window.location = "#feed/" + $.localStorage("feed");
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
			//$("#button-refresh").show();
			
			// Change the content
			var content = "<h1>Loading</h1>";
			if(this.model) {
				if($.localStorage("feed") === 0)
					$("#page-title").html($("#home").html());
				else
					$("#page-title").html(this.model.attributes.feed);
				
				content = _.template(this.template, this.model.toJSON());
			}
			
			this.$el.html(content);
			
			// Handle the previous and next buttons
			if($.localStorage("collection") && this.article) {
				var collection = _.toArray($.localStorage("collection"));
				
				// Get the current ID in the array
				for(var i = 0; i < collection.length; i++) {
					if(collection[i].id == this.article)
						break;
				}
				
				// Previous button
				if(i > 0) {
					$("#button-previous").click(function() {
						window.location = "#article/" + collection[i-1].id;
					});
					$("#button-previous").removeAttr("disabled", "");
				}
				if(i < collection.length-1) {
					$("#button-next").click(function() {
						window.location = "#article/" + collection[i+1].id;
					});
					$("#button-next").removeAttr("disabled", "");
				}
			}
			
			// Open the links in the browser
			$("#page a").attr("target", "_blank");
		},
		
		loadArticle: function(id) {
			this.article = id;
			this.refresh_article();
		},
		
		refresh_article: function() {
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
			else
				$("#button-back").click();
			
			// Mark the article as unread
			if(this.model && (this.model.attributes.status == "new")) {
				var view = this;
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/article/unread",
					data: {token: $.localStorage("token"), article: view.article},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong token
							if(data.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							// Unknown error
							else
								status.setMessage(data.error);
							
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
						view.render();
					}
				});
			}
		}
	});
	
	return ArticleView;
});
