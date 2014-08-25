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
	
	var leadsIntegrationObj = konymbaas.integration("SalesForceLeads");
	var post_data = {"Authorization" : "Bearer "+localStorage.konyAuthorization }; //passing Authorization header in data
	leadsIntegrationObj.request("getLeads", post_data, leadsIntegrationSuccessCallback, leadsIntegrationFailureCallback);
	
	//binding keyup event for search/filter logic implementation
	$('#leads_search_input').off('keyup');
	$('#leads_search_input').on('keyup',function(event){
		filterByText(event.target.value,'leadList'); //calling global filtering method
	});
	
});

/**************** Leads Integration callbacks starts here  *************/
var leadsIntegrationSuccessCallback = function(data){
	
	ldr.hide();
    var parsedLeadsObject = JSON.parse(data);
    var leadListItems = '';
    $.each(parsedLeadsObject.list,function(index,lead){
    	lead.title = (lead.title == 'null') ? '' : lead.title;
    	lead.lastname = (lead.lastname == 'null') ? '' : lead.lastname;
    	
    	//Logic for adding class to the last list item
    	var lastItemClass= '';
    	if(parsedLeadsObject.list.length == index+1){
    		lastItemClass= 'border-last';
    	}
    	
    	leadListItems += '<li onclick=\'storeLeadDetails('+JSON.stringify(lead)+');\' class="leadList '+lastItemClass+'" >'+
						    	'<div class="media-list">'+
						        '<div class="media">'+
						            '<a href="#" class="pull-left"><img src="images/contact-icon.png" alt="" /></a>'+
						            '<div class="media-body">'+
						               '<h2 class="media-heading leadListFilterTarget">'+lead.firstname+' '+lead.lastname+'</h2>'+
						                '<p>'+lead.title+'</p>'+
						           '</div>'+
						         '</div>'+
						         '</div>'+
						     '</li>';
    	
    });
    
    $("#leadsListContainer").html(leadListItems);
    
};

var leadsIntegrationFailureCallback = function(data){
	console.log(data);
};
/**************** Leads Integration callbacks ends here  ****************/

/**********************************************
* storeLeadDetails()
* 
* This function is used to store corresponding
* lead data in local storage before 
* redirecting to the Details page.
* 
* inputs:
* @leadObj - corresponding lead details
* 				JSON object
* 
**********************************************/
function storeLeadDetails(leadObj){
	localStorage.konyLeadDetails = JSON.stringify(leadObj); //storing the corresponding lead details in localstorage
	window.location.href = "leadDetails.html"; //redirecting to details page
}
