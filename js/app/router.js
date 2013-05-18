// Filename: router.js
// The Backbone Router

define([
	'backbone',
	'views/Home', 'views/Settings', 'views/AddFeed', 'views/Feed', 'views/Login', 'views/Logout', 'views/Signin', 'views/Article', 'views/Menu'
], function(Backbone, HomeView, SettingsView, AddFeedView, FeedView, LoginView, LogoutView, SigninView, ArticleView, MenuView) {
	// Create a new view
	function createView(View) {
		// Hide buttons and delete all events
		$("[role=region] button").hide();
		$("[role=region] button:not(#button-menu)").unbind('click');
		
		$("#page-title").html("Loading");
		$("#page").html("Loading");
		
		var view = new View();
		view.render();
	}
	
	var AppRouter = Backbone.Router.extend({
		routes: {
			// Define some URL routes
			'login': 'showLogin',
			'logout': 'showLogout',
			'signin': 'showSignin',
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
		
		showSignin: function() {
			createView(SigninView);
		},
		
		showSettings: function() {
			createView(SettingsView);
		},
		
		showAddFeed: function() {
			createView(AddFeedView);
		},
		
		showFeed: function(id) {
			createView(FeedView);
		},
		
		showArticle: function(id) {
			createView(ArticleView);
		},
		
		showHome: function(actions) {
			createView(HomeView);
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
