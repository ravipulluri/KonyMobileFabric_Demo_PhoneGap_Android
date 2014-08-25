$(document).ready(function(){probabilityImageDisplay

	var opportunityDetails = JSON.parse(localStorage.konyOpportunityDetails);
	
	// Filling corresponding elements with dynamic data using corresponding Ids
	
	if(opportunityDetails.probability != 'null'){
		$("#opportunityNameDisplay").html(opportunityDetails.name);
	}
	
	if(opportunityDetails.probability != 'null'){
		$("#opportunityTypeDisplay").html(opportunityDetails.opptype);
	}
	
	if(opportunityDetails.probability != 'null'){
		$("#accountNameDisplay").html(opportunityDetails.accountname);
	}
	
	if(opportunityDetails.probability != 'null'){
		var probability = parseInt(opportunityDetails.probability);
		var imageSrc = "images/p"+probability+".png";
		$("#probabilityImageDisplay").attr('src',imageSrc);
	}
	
	if(opportunityDetails.amount != 'null'){
		$("#amountDisplay").html(opportunityDetails.amount);
	}
	if(opportunityDetails.leadsource != 'null'){
		$("#leadSourceDisplay").html(opportunityDetails.leadsource);
	}
	if(opportunityDetails.closedate != 'null'){
		$("#closeDateDisplay").html(opportunityDetails.closedate);
	}
	if(opportunityDetails.expectedrevenue != 'null'){
		$("#expectedRevenueDisplay").html(opportunityDetails.expectedrevenue);
	}
	
	// binding click event logic for favorite icon
	$("#opportunityFavoriteStatus").off('click');
	$("#opportunityFavoriteStatus").on('click',function(event){
		modifyFavorite(this,'opportunities',opportunityDetails.id); // Modifying the favorite status of the correponding item
	});
	
	// Favorite Highlighting logic
	if(localStorage.konyFavorites != undefined ){
		
		var konyFavs = JSON.parse(localStorage.konyFavorites);
		var itemId = opportunityDetails.id;
		
		if(konyFavs['opportunities'] != undefined){
			if(konyFavs['opportunities'].indexOf(itemId) == '-1'){
				$("#opportunityFavoriteStatus").attr('src','images/star.png');
			}
			else{
				$("#opportunityFavoriteStatus").attr('src','images/star-fav.png');
			}
		}
	}
	
	
});


