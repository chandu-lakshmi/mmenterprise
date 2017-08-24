(function () {
	"use strict";

	angular
		.module('app.analytics', ["angucomplete-alt"])
		.controller('AnalyticsController', AnalyticsController)
		.controller('AnalyticsSearchController', AnalyticsSearchController)
		.filter('sortByMatch', function() {
		  	return function(items, searchString) {
			    var re = new RegExp("[" + searchString + "]", "g"); 
			    items.sort(function (a, b) {
				    if (!searchString) {
				        return '';
				    }
				    var matchingCharsA = a.title.length - (a.title.match(re) || []).length; 
				    var matchingCharsB = b.title.length - (b.title.match(re) || []).length;

				    return (matchingCharsA > matchingCharsB ? 1 : -1);
			    });
			    return items;
		  	};
		});

	AnalyticsController.$inject       = ['$state'];
	AnalyticsSearchController.$inject = ['$scope', '$state', '$timeout', '$filter'];


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
			{name:'Diversity By Ethnicity'}, 
			{name:'Diversity By Religion'},
			{name:'Diversity By Critical Thinking'}
		];


		this.localSearch = function(str) {
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


	function AnalyticsSearchController ($scope, $state, $timeout, $filter){

		var vm = this,
				hasDropdownSelelected = false,
				initSearchData = $state.params.searchVal;


		this.dropDownList = [
			{name:'Diversity By Gender'}, 
			{name:'Diversity By Ethnicity'}, 
			{name:'Diversity By Religion'},
			{name:'Diversity By Critical Thinking'}
		];
		this.searchResults = [
			{ title : 'Diversity By Gender', desc : 'Gender diversity is equitable or fair representation between genders. Gender diversity most commonly refers to an equitable ratio of men and women, but may also include non-binary gender categories. Its vital to have a good ratio of gender diversity in the organization which brings in increased financial performance better reputation, customer base …'},
			{ title : 'Diversity By Ethnicity', desc : 'Ethnic diversity is fair representation of people in an organization based on age, culture, nation etc. Ethnic diversity brings in more, employee satisfaction, retention, different perspectives, improve the ability to influence.'},
			{ title : 'Diversity By Religion', desc : 'Religious diversity is an important metric to be considered in an organization as this represents the organization as an organization with equal opportunity for all. Religious diversity enhances the brand as an equal opportunity employer…'},
			{ title : 'Diversity By Critical Thinking', desc : 'Critical Thinking is the ability of a person to reason through any issue/situation. Having an understanding on the mix of people with critical thinking is critical for the overall success of any organization…'},
			
			{ title : 'Lorem ipsum', desc : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
			{ title : 'Aliquam maximum arcu vehicle, blandit orci id, blandit erat.', desc : 'Offers worldwide news coverage, analysis, show profiles, boradcast schedules, team biographies, and email news alerts, it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially.'},
			{ title : 'Maecenas a arcu in nulla vestibumum euismod.', desc : 'View the latest news and breaking news today for U.S., world, wether, entertainment, politics and health at CNN.com.'},
			{ title : 'Generated 5 paragraphs, 87 words, 586 bytes of Lorem Ipsum', desc : 'The latest news and headlines from Yahoo! News. Get breaking news stories and in-depth coverage with videos and photos.'},
			{ title : 'There are many variations of passanges of Lorem Ipsum', desc : "If you are going to us a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary."}
		];
		this.recentSearchResults = ['Diversity', 'Lorem ipsum dolor sit amet', 'Aliquam maximum arcu vehicle', 'Pellentesque tempus lectus nec', 'Praesent nec felis elementum', 'Sed sit amet eros faucibus', 'Ut et turpis id augue rutrum lacinia.', 'Nam dictum orci mollis Ut vitae elit ut exetrsest', 'consequat accumsan ante aliquam vulputate et ac ex.', 'Maecenas a arcu in nulla', 'Etiam sit amet nunc et augue mattis pharetra.'];

		this.selectedResult = function(obj) {
			
			if(obj){
				vm.search = obj.title;
			} else{
				vm.search = $('#search_value').val();
			}
			hasDropdownSelelected = true;

		}

		this.localSearch = function(str) {
			if (!hasDropdownSelelected) {
				vm.search = str;
			}

			if(hasDropdownSelelected && str.length < 3) {
				hasDropdownSelelected = false;
			}

			var matches = [];
		  	vm.dropDownList.forEach(function(list) {
			    if (list.name.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) {
			      	matches.push(list);
			    }
		  	});
		 	return matches;

		};

		function init() {
			
			vm.search = initSearchData;

			
		
			setTimeout(function(){
				$('#search_value').val(initSearchData);
				$('#search_value').focus();
			}, 100); 
			
			getSearchResult();
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
