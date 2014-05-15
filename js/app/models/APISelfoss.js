// Filename: APISelfossModel.js

define([
	'models/API', 'collections/Feeds', 'models/Feed', 'collections/Articles', 'models/Article'
], function(APIModel, FeedsCollection, FeedModel, ArticlesCollection, ArticleModel) {
	var APISelfossModel = APIModel.extend({
		defaults: {
			name: "Selfoss API",
			short_name: "selfoss",
			url: "https://myselfoss.com",
			loggedIn: "",
			authentication: "credentials",
			
			// Login/Pass API
			username: null,
			password: null
		},
		
		initialize: function() {
			var api = this;
			
			if(this.attributes.loggedIn == "")
				this.attributes.loggedIn = null;
		},
		
		// Refresh the list of articles
		// Return: callback(bool, ArticlesCollection, string)
		article_list: function(feed, page, callback) {
			var articles = new ArticlesCollection();
			var api = this;
			
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, articles, "");
				return;
			}
			
			// Authentication is optional
			var parameters = {};
			if(this.attributes.username && this.attributes.password) {
				parameters.username = this.attributes.username;
				parameters.password = this.attributes.password;
			}
			
			// Get the good feed
			if(feed === 0)
				parameters.type = "unread";
			else
				parameters.source = feed;
			
			parameters.offset = page*window.articles_per_page;
			parameters.items = window.articles_per_page;
			
			$.ajax({
				dataType: "json",
				url: this.attributes.url + "/items",
				data: parameters,
				success: function(data) {
					// Create a new ArticlesCollection
					$(data).each(function(id, article) {
						var status = (article.unread === "1") ? "new" : "";
						
						articles.add(new ArticleModel({
							id: article.id,
							api: api.get_id(),
							title: article.title,
							description: article.content,
							url: article.link,
							date: Math.round(Date.parse(article.datetime) / 1000),
							status: status
						}));
					});
					
					callback(true, articles, data.feed);
				},
				error: function() {
					api.throw_error("server");
					callback(false, articles, "");
				}
			});
		},
		
		// Mark the article as read
		// Return: callback(bool)
		article_unread: function(article, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false);
				return;
			}
			
			var api = this;
			
			// Authentication is optional
			var parameters = {};
			if(this.attributes.username && this.attributes.password) {
				parameters.username = this.attributes.username;
				parameters.password = this.attributes.password;
			}
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/mark/" + article,
				data: parameters,
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error("server");
						callback(false);
						return;
					}
					
					callback(true);
				},
				error: function() {
					api.throw_error("server");
					callback(false);
				}
			});
		},
		
		// Add a new feed
		// Return: callback(bool, int)
		feed_add: function(url, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, 0);
				return;
			}
			
			var api = this;
			
			// Authentication is optional
			var parameters = {};
			/*if(this.attributes.username && this.attributes.password) {
				parameters.username = this.attributes.username;
				parameters.password = this.attributes.password;
			}*/
			
			parameters.title = url;
			parameters.tags = "";
			parameters.spout = "spouts_rss_feed";
			parameters.url = url;
			parameters.ajax=true;
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/source",
				data: parameters,
				success: function(data) {
					console.log(data);
					
					// Check error
					if(!data.success) {
						api.throw_error("server");
						callback(false, 0);
						return;
					}
					
					callback(true, data.id);
				},
				error: function() {
					api.throw_error("server");
					callback(false, 0);
				}
			});
			
			callback(false, 0);
		},
		
		// Delete the feed
		// Return: callback(bool)
		feed_delete: function(feed, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false);
				return;
			}
			
			var api = this;
			
			// Authentication is optional
			var parameters = {};
			if(this.attributes.username && this.attributes.password) {
				parameters.username = this.attributes.username;
				parameters.password = this.attributes.password;
			}
			
			$.ajax({
				type: "DELETE",
				dataType: "json",
				url: this.attributes.url + "/source/" + feed,
				data: parameters,
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error("server");
						callback(false);
						return;
					}
					
					callback(true);
				},
				error: function() {
					api.throw_error("server");
					callback(false);
				}
			});
		},
		
		// Get the list of feeds
		// Return: callback(bool, FeedsCollection)
		feed_list: function(callback) {
			var feeds = new FeedsCollection();
			var api = this;
			
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, feeds);
				return;
			}
			
			// Authentication is optional
			var parameters = {};
			if(this.attributes.username && this.attributes.password) {
				parameters.username = this.attributes.username;
				parameters.password = this.attributes.password;
			}
			
			// List the feeds
			$.ajax({
				dataType: "json",
				url: this.attributes.url + "/sources/list",
				data: parameters,
				success: function(data) {
					// Get unread count
					$.ajax({
						dataType: "json",
						url: api.attributes.url + "/sources/stats",
						data: parameters,
						success: function(stats) {
							// Create a new FeedsCollection
							$(data).each(function(id, feed) {
								feeds.unread_total += parseInt(stats[id].unread);
								feeds.add(new FeedModel({
									id: feed.id,
									title: feed.title,
									error: feed.error,
									unread: stats[id].unread
								}));
							});
							
							callback(true, feeds);
						},
						error: function() {
							api.throw_error("server");
							callback(false, feeds);
						}
					});
				},
				error: function() {
					api.throw_error("server");
					callback(false, feeds);
				}
			});
		},
		
		// Login to the API
		// Return: callback(bool)
		login: function(username, password, callback) {
			var api = this;
			
			// Don't use credentials
			if(!username || !password) {
				this.attributes.loggedIn = "Anonymous";
				this.attributes.username = null;
				this.attributes.password = null;
				api.save();
				
				callback(true);
				return;
			}
			
			// Check login
			$.ajax({
				dataType: "json",
				url: api.attributes.url + "/login",
				data: {username: username, password: password},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error("credentials");
						callback(false);
						return;
					}
					
					// Add the email and the token
					api.attributes.loggedIn = username;
					api.attributes.username = username;
					api.attributes.password = password;
					api.save();
					
					callback(true);
				},
				error: function() {
					api.throw_error("server");
					callback(false);
				}
			});
		},
		
		// Logout of the API
		// Return: callback(bool)
		logout: function(callback) {
			this.attributes.loggedIn = null;
			this.attributes.username = null;
			this.attributes.password = null;
			this.save();
			
			callback(true);
		}
	});
	
	return APISelfossModel;
});
