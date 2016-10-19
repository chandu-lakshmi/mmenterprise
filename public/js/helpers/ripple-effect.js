(function () {
"use strict";


	angular
		.module('ripple',[])
		
		.service('rippleService', rippleService)
		

	function rippleService(){
		
		this.wave = function(){
			var ink, d, x, y;

			$(document).on('click', '.ripplelink', function(e){
			    if($(this).find(".ink").length === 0){
			        $(this).prepend("<span class='ink'></span>");
			    }
			         
			    ink = $(this).find(".ink");
			    ink.removeClass("animate");
			     
			    if(!ink.height() && !ink.width()){
			        d = Math.max($(this).outerWidth(), $(this).outerHeight());
			        ink
			        	.css({
			        		height: d,
			        		width: d
			        	});
			    }
			     
			    x = e.pageX - $(this).offset().left - ink.width()/2;
			    y = e.pageY - $(this).offset().top - ink.height()/2;
			     
			    ink
			    	.css({
			    		top: y+'px',
			    		left: x+'px',
			    		background: $(this).data("ripple-color")
			    	})
			    	.addClass("animate");

			    /*window.setTimeout(function(){
		        	ink.remove();
		      	}, 2000);*/
			});
		}

	}


}());
