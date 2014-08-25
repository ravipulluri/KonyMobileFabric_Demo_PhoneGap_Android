$(document).ready(function(){

	var accountDetails = JSON.parse(localStorage.konyAccountDetails);
	//console.log(accountDetails);
	
	// Filling corresponding elements with dynamic data using corresponding Ids
	$("#accountNameDisplay").html(accountDetails.name);
	
	if(accountDetails.billingcity != 'null'){ 
		var billingCityState = accountDetails.billingcity+', '+accountDetails.billingstate;
	}else{
		var billingCityState = accountDetails.billingstate;
	}
	$("#billingCityStateDisplay").html(billingCityState);
	
	if(accountDetails.accounttype != 'null'){
		$("#accountTypeDisplay").html(accountDetails.accounttype);
	}
	if(accountDetails.industry == "null"){
		$("#accountIndustryDisplay h2").html('');
	}else{
		$("#accountIndustryDisplay h2").html(accountDetails.industry);
	}
	$("#billingAddressDisplay").html(accountDetails.billingstreet);
	if(accountDetails.phone != "null"){
		$("#accountDetailsPhone").attr('href','tel:'+accountDetails.phone);
	}
	if(accountDetails.website != "null"){
		var check_http = accountDetails.website.indexOf( 'http://' ) === -1 && accountDetails.website.indexOf( 'https://' ) === -1;
		if ( check_http ) {
			accountDetails.website = "http://"+accountDetails.website;
		}
		$("#accountDetailsUrl").attr("href", accountDetails.website);
	}
	
	$("#phoneDisplay").html(accountDetails.phone);
	$("#websiteDisplay").html(accountDetails.website);
	
	
	
	// binding click event logic for favorite icon
	$("#accountFavoriteStatus").off('click');
	$("#accountFavoriteStatus").on('click',function(event){
		modifyFavorite(this,'accounts',accountDetails.id); // Modifying the favorite status of the correponding item
	});
	
	
	// Favorite Highlighting logic
	if(localStorage.konyFavorites != undefined ){
		
		var konyFavs = JSON.parse(localStorage.konyFavorites);
		var itemId = accountDetails.id;
		
		if(konyFavs['accounts'] != undefined){
			if(konyFavs['accounts'].indexOf(itemId) == '-1'){
				$("#accountFavoriteStatus").attr('src','images/star.png');
			}
			else{
				$("#accountFavoriteStatus").attr('src','images/star-fav.png');
			}
		}
	}
		
	
});


