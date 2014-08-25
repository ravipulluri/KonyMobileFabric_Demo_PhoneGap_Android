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
	
	var activitiesIntegrationObj = konymbaas.integration("SalesForceTasks");
	var post_data = {"Authorization" : "Bearer "+localStorage.konyAuthorization }; //passing Authorization header in data
	activitiesIntegrationObj.request("getTasks", post_data, activitiesIntegrationSuccessCallback, activitiesIntegrationFailureCallback);
	
	//binding keyup event for search/filter logic implementation
	$('#activities_search_input').off('keyup');
	$('#activities_search_input').on('keyup',function(event){
		filterByText(event.target.value,'activityList'); //calling global filtering method
	});
	
});

/**************** Activities Integration callbacks starts here  *************/
var activitiesIntegrationSuccessCallback = function(data){
	ldr.hide();
    var parsedActivitiesObject = JSON.parse(data);
    var activityListItems = '';
    $.each(parsedActivitiesObject.list,function(index,activity){
    	
    	//Logic for adding class to the last list item
    	var lastItemClass= '';
    	if(parsedActivitiesObject.list.length == index+1){
    		lastItemClass= 'border-last';
    	}

    	activity.activitydate = (activity.activitydate == 'null') ? '' : activity.activitydate;
    	activityListItems += '<li  onclick=\'storeActivityDetails('+JSON.stringify(activity)+');\' class="activityList '+lastItemClass+'" >'+
        						'<div class="media-list">'+
							        '<div class="media">'+
							          '<a href="#" class="pull-left"><img src="images/activities-icon.png" alt="" /></a>'+
							          '<div class="media-body">'+
							            '<h2 class="media-heading activityListFilterTarget">'+activity.subject+'</h2>'+
							            '<p class="sub-text">Priority: '+activity.priority+'</p>'+
							            '<p>'+activity.activitydate+'</p>'+
							            '</div>'+
							            '</div>'+
							      '</div>'+
							      '<div class="priority-cricle '+activity.priority.toLowerCase()+'"></div>'+
							 '</li>';
    	
    	
    });
    
    $("#activitiesListContainer").html(activityListItems);
    
};

var activitiesIntegrationFailureCallback = function(data){
	console.log(data);
};
/**************** Activities Integration callbacks ends here  ****************/

/**********************************************
* storeActivityDetails()
* 
* This function is used to store corresponding
* Activity data in local storage before 
* redirecting to the Details page.
* 
* inputs:
* @activityObj - corresponding activity details
* 				JSON object
* 
**********************************************/
function storeActivityDetails(activityObj){
	localStorage.konyActivityDetails = JSON.stringify(activityObj); //storing the corresponding activity details in localstorage
	window.location.href = "activityDetails.html"; //redirecting to details page
}
