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


		this.dropDownList = [
			{ title : 'Diversity By Gender', desc : 'Gender diversity is equitable or fair representation between genders. Gender diversity most commonly refers to an equitable ratio of men and women, but may also include non-binary gender categories. Its vital to have a good ratio of gender diversity in the organization which brings in increased financial performance better reputation, customer base …', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-Gender/GenderDiversityDashboard?publish=yes'},
			{ title : 'Diversity By Ethnicity', desc : 'Ethnic diversity is fair representation of people in an organization based on age, culture, nation etc. Ethnic diversity brings in more, employee satisfaction, retention, different perspectives, improve the ability to influence.', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-Ethnicity/EthnicDiversityDashboard?publish=yes'},
			{ title : 'Diversity By Religion', desc : 'Religious diversity is an important metric to be considered in an organization as this represents the organization as an organization with equal opportunity for all. Religious diversity enhances the brand as an equal opportunity employer…', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-Religion/ReligionDiversityDashboard?publish=yes'},
			{ title : 'Diversity By Critical Thinking', desc : 'Critical Thinking is the ability of a person to reason through any issue/situation. Having an understanding on the mix of people with critical thinking is critical for the overall success of any organization…', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-CriticalThinking/CriticalThinkingDiversityDashboard?publish=yes'}
		];

		this.localSearch = function(str) {
			var matches = [];
		  	vm.dropDownList.forEach(function(list) {
			    if (list.title.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) {
			      	matches.push(list);
			    }
		  	});
		 	return matches;
		};

		this.search = function() {
			var txt = $('#search_value').val();
			if(txt.length){
				$state.go('app.analyticsSearch', { searchVal : txt });
			}
		}

		this.selectedResult = function(selected) {
			if(selected)
				window.open(selected.description.link,'_blank');
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
			{ title : 'Diversity By Gender', desc : 'Gender diversity is equitable or fair representation between genders. Gender diversity most commonly refers to an equitable ratio of men and women, but may also include non-binary gender categories. Its vital to have a good ratio of gender diversity in the organization which brings in increased financial performance better reputation, customer base …', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-Gender/GenderDiversityDashboard?publish=yes'},
			{ title : 'Diversity By Ethnicity', desc : 'Ethnic diversity is fair representation of people in an organization based on age, culture, nation etc. Ethnic diversity brings in more, employee satisfaction, retention, different perspectives, improve the ability to influence.', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-Ethnicity/EthnicDiversityDashboard?publish=yes'},
			{ title : 'Diversity By Religion', desc : 'Religious diversity is an important metric to be considered in an organization as this represents the organization as an organization with equal opportunity for all. Religious diversity enhances the brand as an equal opportunity employer…', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-Religion/ReligionDiversityDashboard?publish=yes'},
			{ title : 'Diversity By Critical Thinking', desc : 'Critical Thinking is the ability of a person to reason through any issue/situation. Having an understanding on the mix of people with critical thinking is critical for the overall success of any organization…', link: 'https://public.tableau.com/profile/saurabho#!/vizhome/EmployeeDiversityDashboard-CriticalThinking/CriticalThinkingDiversityDashboard?publish=yes'}
		];
		
		this.selectedResult = function(selected) {
			if(selected){
				vm.search = selected.title;
				window.open(selected.description.link,'_blank');
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
			    if (list.title.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) {
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
