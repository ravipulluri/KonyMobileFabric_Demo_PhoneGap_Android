$(document).ready(function(){

	var activityDetails = JSON.parse(localStorage.konyActivityDetails);
	
	// Filling corresponding elements with dynamic data using corresponding Ids
	
	$("#activitySubjectDisplay").html(activityDetails.name);
	$("#activityPriorityDisplay").html("Priority: "+activityDetails.priority);
	
	activityDetails.activitydate = (activityDetails.activitydate == 'null') ? '' : activityDetails.activitydate;
	$("#activityDateDisplay").html(activityDetails.activitydate);
	
	$("#activityPriorityImageDisplay").addClass(activityDetails.priority.toLowerCase());
	
	
	if(activityDetails.name != "null"){
		$("#activityNameDisplay h2").html(activityDetails.name);
	}else{
		$("#activityNameDisplay h2").html("");
	}
	
	if(activityDetails.relatedto != "null"){
		$("#activityRelatedToDisplay h2").html(activityDetails.relatedto);
	}else{
		$("#activityRelatedToDisplay h2").html("");
	}
	
	if(activityDetails.phone != "null"){
		$("#activityPhoneDisplay h2").html(activityDetails.phone);
	}else{
		$("#activityPhoneDisplay h2").html("");
	}
	
	if(activityDetails.tasktype != "null"){
		$("#activityTypeDisplay h2").html(activityDetails.tasktype);
	}else{
		$("#activityTypeDisplay h2").html("");
	}
	
	if(activityDetails.description != "null"){
		$("#activityCommentsDisplay h2").html(activityDetails.description);
	}else{
		$("#activityCommentsDisplay h2").html("");
	}
	
});


