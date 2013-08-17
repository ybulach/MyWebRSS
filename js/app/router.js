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
		
		if($.localStorage("autorefresh_cnt"))
			clearTimeout($.localStorage("autorefresh_cnt")), $.localStorage("autorefresh_cnt", 0);
		
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
			'feed/:id': 'showFeed',
			'article/:id': 'showArticle',
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
		
		showFeed: function(id) {
			var view = createView(FeedView);
			view.loadFeed(id);
		},
		
		showArticle: function(id) {
			var view = createView(ArticleView);
			view.loadArticle(id);
		},
		
		showHome: function() {
			var view = createView(FeedView);
			view.loadFeed(0);
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
