
var konymbaas;
var authServiceObj;

$(function() {
	ldr.show();
	konymbaas = new Kony.cloud();
	konymbaas.init(
	    KonyappKey,
	    KonyappSecret,
	    KonyappService,   
	    InitSuccessCallback,
	    InitFailureCallback
	);
	alert(KonyappKey);
	
	// event handler for login button
	$("#login").click(function () {

		var username = $.trim($("#username").val());
		var password = $("#password").val();
		
		if (username == "") {
			alert('Please Enter User Name');
			return false;
		}else if (password == "") {
			alert('Please Enter Password');
			return false;
		}else{
			ldr.show();
			
			//login request parameters
			var loginObj = {"_type" : "basic", "userid" : username,"password" : password };
			
			//Calling auth function for getting Authentication service handler
			authServiceObj = konymbaas.auth(); 
			//Login Validation using autentication service handler object
			authServiceObj.login(loginObj,LoginSuccessCallback,LoginFailureCallback);
		}
	});
    
});

/***************** init callbacks starts here  ****************/
var InitSuccessCallback = function(data){
	if(localStorage.konycurrentUser){
		var userDetails = JSON.parse(localStorage.konycurrentUser);
		if(userDetails.username){
			$("#username").val(crypt.decode(userDetails.username));
			$("#password").val(crypt.decode(userDetails.password));
		}
	}
	ldr.hide();
};

var InitFailureCallback = function(data){
	ldr.hide();
};
/*****************  init callbacks ends here  ****************/



/*****************  Login callbacks starts here  ****************/
var LoginSuccessCallback = function(data){
	if($('#rememberme').is(':checked')){
		var username = crypt.encode($.trim($("#username").val()));
		var password = crypt.encode($("#password").val());
		var currentUser = {'username':username,'password':password};
		localStorage.konycurrentUser = JSON.stringify(currentUser); //storing user details in local storage
	}
	
	//Manipulate user data here if needed
	authServiceObj.getBackendToken('false','',BackendTokenSuccessCallback,BackendTokenFailureCallback); // Getting BackendToken

};

var LoginFailureCallback = function(data){
	ldr.hide();
	console.log('login failed');
	alert(data.responseJSON.message); //showing login error message
	return false;
};
/****************  Login callbacks ends here  ****************/



/***************** BackendToken callbacks starts here  ****************/
var BackendTokenSuccessCallback = function(data){

    localStorage.konyAuthorization = data.value; //storing authorization in localstorage

    if(localStorage.regid != ""){
           
	        konymbaas.messaging().subscribe("androidgcm", device.uuid, localStorage.regid, $.trim($("#username").val()), function(data){ 
	        
	            window.location.href= "dashboard.html";
	            ldr.hide(); 
	            
	        },function(data){
	            ldr.hide(); 
	            console.log(data);
	        });
	    }
	else{
        window.location.href= "dashboard.html";
        ldr.hide(); 
    }
	  
};

var BackendTokenFailureCallback = function(data){
	ldr.hide();
	console.log(data);
};
/**************** BackendToken callbacks ends here  ****************/

