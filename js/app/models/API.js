// Filename: APIModel.js

define([
	'backbone', 'views/Status', 'collections/Feeds', 'collections/Articles'
], function(Backbone, StatusView, FeedsCollection, ArticlesCollection) {
	var APIModel = Backbone.Model.extend({
		defaults: {
			name: "Default API",
			short_name: "default",
			url: "none",
			loggedIn: "",
			authentication: "none",
			
			// Persona API stuff
			//token: null,
			
			// Login/Pass API
			//username: null,
			//password: null
		},
		
		// Throw an error
		throw_error: function(error) {
			var message = "";
			
			// Not connected to this API
			if(error == "loggedIn")
				message = "You are not connected to this API. Please login again";
			// Wrong token (MyWebRSS)
			else if(error == "token") {
				this.attributes.token = null;
				this.attributes.loggedIn = "";
				message = "You are no longer connected to MyWebRSS. Please login again";
			}
			// Wrong assertion (Persona)
			else if(data.error == "assertion") {
				message = "Bad assertion";
				navigator.id.logout();
			}
			// Wrong article ID
			else if(error == "article")
				message = "This article was not found. Can't end the action";
			// Wrong feed ID
			else if(error == "feed")
				message = "This feed was not found or is not correct. Can't end the action";
			// Server error
			else if(error == "server")
				message = "Can't contact the server. Try again later";
			// Unknown error
			else
				message = "Unknown error: " + error;
			
			(new StatusView()).setMessage("[ERROR] " + this.attributes.name + "<br/>" + message);
		},
		
		// Find the API position in the collection
		get_id: function() {
			var current_api = this;
			for(i = 0; i < window.apis.length; i++) {
				if(current_api == window.apis.at(i))
					return i;
			}
			
			return null;
		},
		
		/////////////////////////////////////////////////////////////////////
		// Functions to be overwritten by childs
		/////////////////////////////////////////////////////////////////////
		// Refresh the list of articles
		// Return: callback(bool, ArticlesCollection, string)
		article_list: function(feed, page, callback) {
			callback(false, new ArticlesCollection(), "");
		},
		
		// Mark the article as read
		// Return: callback(bool)
		article_unread: function(article, callback) {
			callback(false);
		},
		
		// Add a new feed
		// Return: callback(bool, int)
		feed_add: function(url, callback) {
			callback(false, 0);
		},
		
		// Delete the feed
		// Return: callback(bool)
		feed_delete: function(feed, callback) {
			callback(false);
		},
		
		// Get the list of feeds
		// Return: callback(bool, FeedsCollection)
		feed_list: function(callback) {
			callback(false, new FeedsCollection());
		},
		
		/////////////////////////////////////////////////////////////////////
		// Functions to be created by childs if authentication is needed
		/////////////////////////////////////////////////////////////////////
		// Login to the API
		// Return: callback(bool)
		//login: function(..., callback) {
		//	callback(false);
		//},
		
		// Logout of the API
		// Return: callback(bool)
		//logout: function(callback) {
		//	callback(false);
		//}
	});
	
	return APIModel;
});
