(function () {
	"use strict";

	angular
		.module('app.analytics', ["angucomplete-alt"])
		.controller('AnalyticsController', AnalyticsController)
		.controller('AnalyticsSearchController', AnalyticsSearchController)


	AnalyticsController.$inject       = ['$state'];
	AnalyticsSearchController.$inject = ['$state', '$timeout'];


	function AnalyticsController ($state){
		
		var vm = this;


		this.recentSearchResults = [
			{ title : 'Diversity', desc : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
			{ title : 'Slider Revolution Included', desc : 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.'},
			{ title : 'Slider Revolution Included', desc : 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.'},
			{ title : 'Slider Revolution Included', desc : 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.'}
		];
		this.dropDownList = [
			{name:'Diversity By Gender'}, 
			{name:'Diversity by Ethnicity'}, 
			{name:'Diversity by Religion'},
			{name:'Diversity by Critical Thinking'}
		];


		this.localSearch = function(str) {
			console.log(str)
			var matches = [];
		  	vm.dropDownList.forEach(function(list) {
			    if (list.name.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) {
			      	matches.push(list);
			    }
		  	});
		 	return matches;
		};

		this.search = function() {
			var txt = $('#search_value').val();
			if(txt.length){
				this.selectedResult({ title: txt });
			}
		}

		this.selectedResult = function(obj) {
			$state.go('app.analyticsSearch', { searchVal : obj.title });
		}


		function init() {

			setTimeout(function(){
				$('#search_value').attr("placeholder","I am looking for");
			}); 

		}
		

		init();
	}


	function AnalyticsSearchController ($state, $timeout){

		var vm = this;

		
		this.search = $state.params.searchVal;

		this.searchResults = [
			{ title : 'Lorem ipsum', desc : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
			{ title : 'Aliquam maximum arcu vehicle, blandit orci id, blandit erat.', desc : 'Offers worldwide news coverage, analysis, show profiles, boradcast schedules, team biographies, and email news alerts, it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially.'},
			{ title : 'Maecenas a arcu in nulla vestibumum euismod.', desc : 'View the latest news and breaking news today for U.S., world, wether, entertainment, politics and health at CNN.com.'},
			{ title : 'Generated 5 paragraphs, 87 words, 586 bytes of Lorem Ipsum', desc : 'The latest news and headlines from Yahoo! News. Get breaking news stories and in-depth coverage with videos and photos.'},
			{ title : 'There are many variations of passanges of Lorem Ipsum', desc : "If you are going to us a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary."}
		];
		this.recentSearchResults = ['Diversity', 'Lorem ipsum dolor sit amet', 'Aliquam maximum arcu vehicle', 'Pellentesque tempus lectus nec', 'Praesent nec felis elementum', 'Sed sit amet eros faucibus', 'Ut et turpis id augue rutrum lacinia.', 'Nam dictum orci mollis Ut vitae elit ut exetrsest', 'consequat accumsan ante aliquam vulputate et ac ex.', 'Maecenas a arcu in nulla', 'Etiam sit amet nunc et augue mattis pharetra.'];

		this.findResults = function() {
			getSearchResult();
		}

		function init() {

			getSearchResult();

			setTimeout(function(){
				$('#search').focus();
			}, 100); 
			
		}
		
		function getSearchResult() {

			vm.inProgress = true;

			$timeout(function(){
				vm.inProgress = false;
			}, 3000);

		}

		init();


	}

}());
