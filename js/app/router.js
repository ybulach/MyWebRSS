// Filename: router.js
// The Backbone Router

define([
	'backbone',
	'views/Settings', 'views/AddFeed', 'views/Feed', 'views/Login', 'views/Logout', 'views/Article', 'views/Menu', 'views/About'
], function(Backbone, SettingsView, AddFeedView, FeedView, LoginView, LogoutView, ArticleView, MenuView, AboutView) {
	// Create a new view
	function createView(View) {
		// Hide buttons and delete all events
		$("[role=region] button").hide();
		$("[role=region] button:not(#button-menu)").unbind('click');
		
		if(!$.localStorage("token"))
			$("nav > *").hide();
		else
			$("nav > *").show();
		
		$("#page-title").html("Loading");
		$("#page").empty();
		$("#page").html("<h1>Loading</h1>");
		
		if(window.autorefresh_cnt)
			clearTimeout(window.autorefresh_cnt), window.autorefresh_cnt = 0;
		
		var view = new View();
		view.render();
		return view;
	}
	
	var AppRouter = Backbone.Router.extend({
		routes: {
			// Define some URL routes
			'login': 'showLogin',
			'logout': 'showLogout',
			'about': 'showAbout',
			'settings': 'showSettings',
			'addfeed': 'showAddFeed',
			'feed/:api/:id': 'showFeed',
			'article/:api/:id': 'showArticle',
			'': 'showHome',
			
			// Default page
			'*path': 'defaultPage'
		},
		
		defaultPage: function() {
			window.location = "#";
		},
		
		showLogin: function() {
			createView(LoginView);
		},
		
		showLogout: function() {
			createView(LogoutView);
		},
		
		showAbout: function() {
			createView(AboutView);
		},
		
		showSettings: function() {
			createView(SettingsView);
		},
		
		showAddFeed: function() {
			createView(AddFeedView);
		},
		
		showFeed: function(api, id) {
			var view = createView(FeedView);
			view.loadFeed(api, id);
		},
		
		showArticle: function(api, id) {
			var view = createView(ArticleView);
			view.loadArticle(api, id);
		},
		
		showHome: function() {
			var view = createView(FeedView);
			view.loadFeed(null, 0);
		}
	});
	
	var initialize = function() {
		// Create the Router
		var app_router = new AppRouter();
		
		// The menu is static (in all views)
		new MenuView();
		
		Backbone.history.start();
		
		return app_router;
	};
	
	return {
		initialize: initialize
	};
});
