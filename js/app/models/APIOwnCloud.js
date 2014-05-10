// Filename: APIOwnCloud.js

define([
	'models/API', 'collections/Feeds', 'models/Feed', 'collections/Articles', 'models/Article'
], function(APIModel, FeedsCollection, FeedModel, ArticlesCollection, ArticleModel) {
	var APIOwnCloudModel = APIModel.extend({
		defaults: {
			name: "OwnCloud News API",
			short_name: "owncloud",
			url: "https://myowncloud.com",
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
		
		// Handle HTTP errors
		handle_error: function(error) {
			if(error.status == 401)
				return "credentials";
			else
				return JSON.parse(error.response).message;
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
			
			// There are diffents arguments for Home page
			var type = 0;
			var getRead = true;
			if(feed === 0) {
				type = 3;
				getRead = false;
			}
			
			$.ajax({
				type: "GET",
				dataType: "json",
				url: this.attributes.url + "/index.php/apps/news/api/v1-2/items",
				data: {batchSize : window.articles_per_page, offset: page*window.articles_per_page, type: type, id: feed, getRead: getRead},
				success: function(data) {
					// Create a new ArticlesCollection
					$(data.items).each(function(id, article) {
						// Status
						var status = "";
						if(article.unread)
							status = "new";
						
						// Create the ArticleModel
						articles.add(new ArticleModel({
							id: article.id,
							api: api.get_id(),
							title: article.title,
							description: article.body,
							url: article.url,
							date: article.pubDate,
							status: status
						}));
					});
					
					callback(true, articles, "");
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false, articles, "");
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(api.attributes.username + ':' + api.attributes.password));
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
			
			$.ajax({
				type: "PUT",
				dataType: "json",
				url: this.attributes.url + "/index.php/apps/news/api/v1-2/items/" + article + "/read",
				success: function(data) {
					callback(true);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false);
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(api.attributes.username + ':' + api.attributes.password));
				}
			});
		},
		
		// Add a new feed
		// Return: callback(bool, int)
		feed_add: function(url, callback) {
			var api = this;
			
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, 0);
				return;
			}
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/index.php/apps/news/api/v1-2/feeds",
				data: {url: url, folderId: 0},
				success: function(data) {
					callback(true, data.feeds[0].id);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false, 0);
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(api.attributes.username + ':' + api.attributes.password));
				}
			});
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
			
			$.ajax({
				type: "DELETE",
				dataType: "json",
				url: this.attributes.url + "/index.php/apps/news/api/v1-2/feeds/" + feed,
				success: function(data) {
					callback(true);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false);
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(api.attributes.username + ':' + api.attributes.password));
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
			
			$.ajax({
				type: "GET",
				dataType: "json",
				url: this.attributes.url + "/index.php/apps/news/api/v1-2/feeds",
				success: function(data) {
					// Create a new FeedsCollection
					$(data.feeds).each(function(id, feed) {
						feeds.unread_total += parseInt(feed.unreadCount);
						feeds.add(new FeedModel({
							id: feed.id,
							title: feed.title,
							unread: feed.unreadCount
						}));
					});
					
					callback(true, feeds);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false, feeds);
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(api.attributes.username + ':' + api.attributes.password));
				}
			});
		},
		
		// Login to the API
		// Return: callback(bool)
		login: function(username, password, callback) {
			this.attributes.loggedIn = username;
			this.attributes.username = username;
			this.attributes.password = password;
			this.save();
			
			callback(true);
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
	
	return APIOwnCloudModel;
});
