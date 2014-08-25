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
	
	var accountsIntegrationObj = konymbaas.integration("SalesForceAccounts");
	var post_data = {"Authorization" : "Bearer "+localStorage.konyAuthorization }; //passing Authorization header in data
	accountsIntegrationObj.request("getAccounts", post_data, accountsIntegrationSuccessCallback, accountsIntegrationFailureCallback);
	
	
	//binding keyup event for search/filter logic implementation
	$('#accounts_search_input').off('keyup');
	$('#accounts_search_input').on('keyup',function(event){
		filterByText(event.target.value,'accountList'); //calling global filtering method
	});
});

/**************** Accounts Integration callbacks starts here  *************/
var accountsIntegrationSuccessCallback = function(data){
	ldr.hide();
    var parsedAccountsObject = JSON.parse(data);
    var accountListItems = '';
    $.each(parsedAccountsObject.list,function(index,account){
    	
    	account.billingstate = ($.trim(account.billingstate) == "null") ? "" : account.billingstate;
    	account.phone = ($.trim(account.accounttype) == "null") ? "" : account.phone;
    	if($.trim(account.billingcity) != 'null')
    		var address = account.billingcity+', '+account.billingstate;
    	else
    		var address = account.billingstate;

    	if($.trim(account.accounttype) != 'null')
    		var accType = account.accounttype;
    	else
    		var accType = '';
    	
    	//Logic for adding class to the last list item
    	var lastItemClass= '';
    	if(parsedAccountsObject.list.length == index+1){
    		lastItemClass= 'border-last';
    	}
    	
		accountListItems += '<li onclick=\'storeAccountDetails('+JSON.stringify(account)+');\' class="accountList '+lastItemClass+'" >'+
								'<div class="media-list">'+
									'<div class="media">'+
										  '<a href="#" class="pull-left"><img src="images/account-list-icon.png" alt="" /></a>'+
										  '<div class="media-body">'+
											    '<h2 class="media-heading accountListFilterTarget">'+account.name+'</h2>'+
											    '<p class="sub-text"> '+address+'</p>'+
									            '<p>'+accType+'</p>'+
							              '</div>'+
						            '</div>'+
							     '</div>'+
							  '</li>';
    });
    
    $("#accountsListContainer").html(accountListItems);
    
};

var accountsIntegrationFailureCallback = function(data){
	console.log(data);
};
/**************** Accounts Integration callbacks ends here  ****************/

/**********************************************
* storeAccountDetails()
* 
* This function is used to store corresponding
* account data in local storage before 
* redirecting to the Details page.
* 
* inputs:
* @accountObj - corresponding account details
* 				JSON object
* 
**********************************************/
function storeAccountDetails(accountObj){
	localStorage.konyAccountDetails = JSON.stringify(accountObj); //storing the corresponding account details in localstorage
	window.location.href = "accountDetails.html"; //redirecting to details page
}

