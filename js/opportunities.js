$(document).ready(function(){

	ldr.show();
	/**************  Kony initialization code ***********/
	var konymbaas = new Kony.cloud();
	konymbaas.init(
	    KonyappKey,
	    KonyappSecret,
	    KonyappService,    
	    function(data){},
	    function(data){}
	);
	konymbaas.auth("CRM").getToken('false',function(data){},function(data){}); // setting X-Kony-Authorization
	/**************  Kony initialization code ***********/
	
	var opportunitiesIntegrationObj = konymbaas.integration("SalesForceOpportunities");
	var post_data = {"Authorization" : "Bearer "+localStorage.konyAuthorization }; //passing Authorization header in data
	opportunitiesIntegrationObj.request("getOpportunities", post_data, opportunitiesIntegrationSuccessCallback, opportunitiesIntegrationFailureCallback);
	
	//binding keyup event for search/filter logic implementation
	$('#opportunities_search_input').off('keyup');
	$('#opportunities_search_input').on('keyup',function(event){
		filterByText(event.target.value,'opportunityList'); //calling global filtering method
	});
	
});

/**************** Opportunities Integration callbacks starts here  *************/
var opportunitiesIntegrationSuccessCallback = function(data){
	ldr.hide();
    var parsedOpportunitiesObject = JSON.parse(data);
    var opportunityListItems = '';
    $.each(parsedOpportunitiesObject.list,function(index,opportunity){
    	var probability = parseInt(opportunity.probability);
    	
    	//Logic for adding class to the last list item
    	var lastItemClass= '';
    	if(parsedOpportunitiesObject.list.length == index+1){
    		lastItemClass= 'border-last';
    	}
    	
    	opportunityListItems += '<li onclick=\'storeOpportunityDetails('+JSON.stringify(opportunity)+');\' class="opportunityList '+lastItemClass+'" >'+
								'<div class="media-list">'+
									'<div class="media">'+
										  '<a href="#" class="pull-left"><img src="images/p'+probability+'.png" alt="" /></a>'+
										  '<div class="media-body">'+
											    '<h2 class="media-heading opportunityListFilterTarget">'+opportunity.name+'</h2>'+
											    '<p class="sub-text"> '+opportunity.stagename+'</p>'+
									            '<p> '+opportunity.opptype+' </p>'+
							              '</div>'+
						            '</div>'+
							     '</div>'+
							  '</li>';

    });
    
    $("#opportunitiesListContainer").html(opportunityListItems);
    
};

var opportunitiesIntegrationFailureCallback = function(data){
	console.log(data);
};
/**************** Opportunities Integration callbacks ends here  ****************/


/**********************************************
* storeOpportunityDetails()
* 
* This function is used to store corresponding
* opportunity data in local storage before 
* redirecting to the Details page.
* 
* inputs:
* @opportunityObj - corresponding opportunity 
* 					details JSON object
* 
**********************************************/
function storeOpportunityDetails(opportunityObj){
	localStorage.konyOpportunityDetails = JSON.stringify(opportunityObj); //storing the corresponding opportunity details in localstorage
	window.location.href = "opportunityDetails.html"; //redirecting to details page
}
