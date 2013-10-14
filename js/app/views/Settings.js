// Filename: SettingsView.js

define([
	'backbone', 'views/Status', 'text!templates/Settings.html',
	'models/APIMyWebRSS'
], function(Backbone, StatusView, SettingsTemplate, APIMyWebRSSModel) {
	var SettingsView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = SettingsTemplate;
			
			// Show the buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Settings");
			this.$el.html(_.template(this.template, {apis: window.apis.toJSON()}));
			
			// Auto-refresh
			$("#check-autorefresh").prop("checked", $.localStorage("autorefresh"));
			
			$("#check-autorefresh").click(function() {
				$.localStorage("autorefresh", $("#check-autorefresh").is(":checked"));
				
				// Disable auto-refresh
				if(!$.localStorage("autorefresh")) {
					if(window.autorefresh_cnt)
						clearTimeout(window.autorefresh_cnt), window.autorefresh_cnt = 0;
				}
			});
			
			// Add an API
			$("#addapi-api").change(function() {
				// Hide or show the URL
				var api = $("#addapi-api").val();
				var url = "none";
				if(api == "mywebrss")
					url = "https://api.mywebrss.net";
				
				// Show the URL only it is needed
				if(url != "none") {
					$("#addapi-url > input").val(url);
					$("#addapi-url").show();
				}
				else {
					$("#addapi-url > input").val(url);
					$("#addapi-url").hide();
				}
			});
			
			$("#addapi-submit").click(function(event) {
				event.preventDefault();
				var status = new StatusView();
				
				var short_name = $("#addapi-api").val();
				var url = $("#addapi-url > input").val();
				
				if(short_name == "---")
					return status.setMessage("Please select a valid API first");
				
				// Select the good API model
				if(short_name == "mywebrss")
					var api = new APIMyWebRSSModel();
				else
					return status.setMessage("Can't find a valid handler for this API");
				api.attributes.url = url;
				
				// Check the URL
				if(!url)
					return status.setMessage("Please enter an URL");
				
				if(window.apis.where({ url: url }).length)
					return status.setMessage("This URL is already used by an other API");
				
				// Add it to the collection
				window.apis.add(api);
				window.apis.save();
				window.location = "#api/" + (window.apis.length-1);
			});
		}
	});
	
	return SettingsView;
});
