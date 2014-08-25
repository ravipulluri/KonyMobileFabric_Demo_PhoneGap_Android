$(document).ready(function(){

	var leadDetails = JSON.parse(localStorage.konyLeadDetails);
	
	// Filling corresponding elements with dynamic data using corresponding Ids
	
	$("#leadNameDisplay").html(leadDetails.firstname+' '+leadDetails.lastname);
	$("#leadTitleDisplay").html(leadDetails.title);
	$("#leadFirstNameDisplay").html(leadDetails.firstname);
	$("#leadLastNameDisplay").html(leadDetails.lastname);
	
	if(leadDetails.phone != ""){
		$("#leadPhoneDisplay h2").html(leadDetails.phone);
		$("#leadPhone").attr('href','tel:'+leadDetails.phone);
	}else{
		$("#leadPhoneDisplay h2").html("");
	}
	
	if(leadDetails.email != ""){
		$("#leadEmailDisplay h2").html(leadDetails.email);
		$("#leadEmail").attr('href','mailto:'+leadDetails.email);
	}else{
		$("#leadEmailDisplay h2").html("");
	}
	
	// binding click event logic for favorite icon
	$("#leadFavoriteStatus").off('click');
	$("#leadFavoriteStatus").on('click',function(event){
		modifyFavorite(this,'leads',leadDetails.id); // Modifying the favorite status of the correponding item
	});
	
	// Favorite Highlighting logic
	if(localStorage.konyFavorites != undefined ){
		
		var konyFavs = JSON.parse(localStorage.konyFavorites);
		var itemId = leadDetails.id;
		
		if(konyFavs['leads'] != undefined){
			if(konyFavs['leads'].indexOf(itemId) == '-1'){
				$("#leadFavoriteStatus").attr('src','images/star.png');
			}
			else{
				$("#leadFavoriteStatus").attr('src','images/star-fav.png');
			}
		}
	}
	
});

