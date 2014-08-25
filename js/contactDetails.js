$(document).ready(function(){

	var contactDetails = JSON.parse(localStorage.konyContactDetails);
	
	// Filling corresponding elements with dynamic data using corresponding Ids
	
	$("#contactName h2").html(contactDetails.firstname+' '+contactDetails.lastname);
	$("#contactName h3").html(contactDetails.title);
	$("#contactFirstname").html(contactDetails.firstname);
	$("#contactLastname").html(contactDetails.lastname);
	
	if(contactDetails.phone != ""){
		$("#contactPhone h2").html(contactDetails.phone);
		$("#contactPhoneNumber").attr('href','tel:'+contactDetails.phone);
	}else{
		$("#contactPhone h2").html("");
	}
	
	if(contactDetails.email != ""){
		$("#contactMail h2").html(contactDetails.email);
		$("#contactEMail").attr('href','mailto:'+contactDetails.email);
	}else{
		$("#contactMail h2").html("");
	}
	
	// binding click event logic for favorite icon
	$("#contactFavoriteStatus").off('click');
	$("#contactFavoriteStatus").on('click',function(event){
		modifyFavorite(this,'contacts',contactDetails.id); // Modifying the favorite status of the correponding item
	});
	
	// Favorite Highlighting logic
	if(localStorage.konyFavorites != undefined ){
		
		var konyFavs = JSON.parse(localStorage.konyFavorites);
		var itemId = contactDetails.id;
		
		if(konyFavs['contacts'] != undefined){
			if(konyFavs['contacts'].indexOf(itemId) == '-1'){
				$("#contactFavoriteStatus").attr('src','images/star.png');
			}
			else{
				$("#contactFavoriteStatus").attr('src','images/star-fav.png');
			}
		}
	}
	
});


