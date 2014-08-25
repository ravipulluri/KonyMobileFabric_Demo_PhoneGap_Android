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
	
	var contactsIntegrationObj = konymbaas.integration("SalesForceContacts");
	var post_data = {"Authorization" : "Bearer "+localStorage.konyAuthorization }; //passing Authorization header in data
	contactsIntegrationObj.request("getContacts", post_data, contactsIntegrationSuccessCallback, contactsIntegrationFailureCallback);
	
	//binding keyup event for search/filter logic implementation
	$('#contacts_search_input').off('keyup');
	$('#contacts_search_input').on('keyup',function(event){
		filterByText(event.target.value,'contactList'); //calling global filtering method
	});
});

/**************** Contacts Integration callbacks starts here  *************/
var contactsIntegrationSuccessCallback = function(data){
	
	ldr.hide();
    var parsedContactsObject = JSON.parse(data);
    var contactListItems = '';
    $.each(parsedContactsObject.list,function(index,contact){
    	contact.title = (contact.title == 'null') ? '' : contact.title;
    	contact.lastname = (contact.lastname == 'null') ? '' : contact.lastname;
    	contact.phone = (contact.phone == 'null') ? '' : contact.phone;
    	contact.email = (contact.email == 'null') ? '' : contact.email;
    	
    	//Logic for adding class to the last list item
    	var lastItemClass= '';
    	if(parsedContactsObject.list.length == index+1){
    		lastItemClass= 'border-last';
    	}
    	
    	contactListItems += '<li onclick=\'storeContactDetails('+JSON.stringify(contact)+');\' class="contactList '+lastItemClass+'" >'+
						    	'<div class="media-list">'+
						        '<div class="media">'+
						            '<a href="#" class="pull-left"><img src="images/contact-icon.png" alt="" /></a>'+
						            '<div class="media-body">'+
						               '<h2 class="media-heading contactListFilterTarget" >'+contact.firstname+' '+contact.lastname+'</h2>'+
						                '<p>'+contact.title+'</p>'+
						           '</div>'+
						         '</div>'+
						         '</div>'+
						     '</li>';
    	
    });
    
    $("#contactsListContainer").html(contactListItems);
    
};

var contactsIntegrationFailureCallback = function(data){
	console.log(data);
};
/**************** Contacts Integration callbacks ends here  ****************/

/**********************************************
* storeContactDetails()
* 
* This function is used to store corresponding
* contact data in local storage before 
* redirecting to the Details page.
* 
* inputs:
* @contactObj - corresponding contact details
* 				JSON object
* 
**********************************************/
function storeContactDetails(contactObj){
	localStorage.konyContactDetails = JSON.stringify(contactObj); //storing the corresponding contact details in localstorage
	window.location.href = "contactDetails.html"; //redirecting to details page
}
