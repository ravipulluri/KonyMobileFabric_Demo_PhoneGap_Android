/**
 * Created by KH1809 on 4/8/2014.
 */
var Kony = {
    cloud: function(use_ide) {
        var mainref = this;

        var authServices = {};
        var integrationServices = {};
        var syncServices = {};
        var messagingService;
        var IDE_MODE = false;
        var AjaxProvider , logger, dataStore;

        var tokens = {};

        var serviceDocExpiry = 2*24*60*60*1000;

        if (use_ide === true){
            IDE_MODE = true;
            AjaxProvider = new KonyPlatformNetworkProvider();
            logger = new KonyPlatformLogger();
            dataStore = new KonyPlatformDataStore();
        } else {
            AjaxProvider = new JQueryAJAXProvider();
            logger = new Logger();
            dataStore = new LocalStore();
        }

        logger.disableLog();

        this.enableDebug = function() {
        	logger.enableLog();
        }
        
        this.disableDebug = function() {
        	logger.disableLog();
        }
        
        this.init = function(appKey, appSecret, serviceUrl, successCallback, failureCallback) {
            logger.log("### init:: called init");

            if(appKey === undefined || appKey == "" || appSecret === undefined || appSecret == "" || serviceUrl === undefined || serviceUrl == "") {
                logger.log("### init:: Invalid credentials passed");
                throw new Exception(Errors.INIT_FAILURE,"Invalid initialization parameters");
            }
            
            var hashCode = function(str){
                var hash = 0;
                if (str.length == 0) return hash;
                for (i = 0; i < str.length; i++) {
                    char = str.charCodeAt(i);
                    hash = ((hash<<5)-hash)+char;
                    hash = hash & hash;
                }
                return hash;
            };

            mainref.appKey = appKey;
            mainref.appSecret = appSecret;
            mainref.serviceUrl = serviceUrl;
            var keyprefix = hashCode(appKey+appSecret+serviceUrl);
            var svcDocdsDataKey = keyprefix + "::SVCDOC::DATA";
            var svcDocdsTimeKey = keyprefix + "::SVCDOC::TIME";

            var _doInit = function(serviceDoc) {
                var _processServiceDoc = function(servConfig) {
                    logger.log("### init::_doInit::_processServiceDoc");
                    try {
                        mainref.appId = servConfig.appId;

                        if (servConfig.login != undefined) {
                            logger.log("### init::_doInit::_processServiceDoc parsing AuthServices");
                            for (var i = 0; i < servConfig.login.length; i++) {
                                var rec = servConfig.login[i];
                                authServices[rec.prov] = new AuthService(servConfig.login[i]);
                            }
                        }

                        if (servConfig.integsvc != undefined) {
                            logger.log("### init::_doInit::_processServiceDoc parsing Integration services");
                            for (var servName in servConfig.integsvc) {
                                if (servConfig.integsvc.hasOwnProperty(servName) && typeof (servName) !== 'function') {
                                    integrationServices[servName] = new IntegrationService(servConfig.integsvc[servName], servName);
                                }
                            }
                        }

                        if (servConfig.messagingsvc != undefined) {
                            logger.log("### init::_doInit::_processServiceDoc parsing Messaging services");
                            messagingService = new MessagingService(servConfig.messagingsvc.url);
                            messagingService.setKmsAppId(servConfig.messagingsvc.appId);
                        }
                        logger.log("### init::_doInit::_processServiceDoc parsing service document done");
                        return true;
                    } catch (err) {
                        logger.log("### init::_doInit::_processServiceDoc failed with an exception: "+ err);
                        return false;
                    }
                };

                if(serviceDoc) {
                    if(_processServiceDoc(serviceDoc)){
                        logger.log("### init::_doInit processing Service doc successfull. Calling success callback");
                        successCallback(mainref);
                    } else {
                        logger.log("### init::_doInit processing Service doc failed. Calling failure callback");
                        failureCallback();
                    }
                } else {
                    logger.log("### init::_doInit calling GET on appConfig to retrieve servicedoc");
                    AjaxProvider.post(
                        serviceUrl,
                        undefined,
                        {
                            "X-Kony-App-Key" : appKey,
                            "X-Kony-App-Secret" : appSecret,
                            "X-HTTP-Method-Override" : "GET"
                        },
                        function(data) {
                            logger.log("### init::_doInit fetched servicedoc successfuly");
                            logger.log("### init:: retrieved data from service doc"); logger.log(data);
                            mainref.config = data;
                            mainref.appId = data.appId;
                            if(_processServiceDoc(data)){
                                logger.log("### init::_doInit processing service document successfull. Saving to localstore");
                                var svcDataStr= JSON.stringify(data);
                                dataStore.setItem(svcDocdsDataKey,svcDataStr);
                                dataStore.setItem(svcDocdsTimeKey,new Date().getTime());
                                logger.log("### init::_doInit saving done. Calling success callback");
                                successCallback(mainref);
                            } else {
                                logger.log("### init::_doInit processing servicedoc failed. Calling failure callback");
                                failureCallback();
                            }
                        },
                        function(data){
                            logger.log("### init::_doInit fetching service document from Server failed"  + data);
                            logger.log("### init::_doInit calling failure callback");
                            failureCallback(data);
                        }
                    );
                }


            };

            var svcDocTime = dataStore.getItem(svcDocdsTimeKey);
            var svcDocData = dataStore.getItem(svcDocdsDataKey);

            if(svcDocData && svcDocTime && ( (new Date().getTime()) - svcDocTime < serviceDocExpiry)) {
                //serviceDoc is still valid. Just parse local store data
                logger.log("### init:: Service doc is still valid. Utilising locally saved service doc");
                _doInit(JSON.parse(svcDocData));
            } else {
                logger.log("### init:: Service doc expired locally");
                _doInit();
            }

        };

        /**
         * Returns Authentication service handler for the given provider name
         * if provider name is not provided it returns the first authentication service
         * configured.
         * @param providerName
         * @returns {*}
         */
        this.auth = function(providerName) {
            var provider;
            if (providerName != null) {
                provider =  authServices[providerName];
            } else {
                for (var i in authServices) {
                    if (authServices.hasOwnProperty(i) && typeof (i) !== 'function') {
                        provider =  authServices[i];
                        break;
                    }
                }
            }
            //logger.log("### auth:: returning authService for providerName = "+provider.getProviderName());
            return provider;
        };

        /**
         * Returns the Sync service handler for the provided sync service
         * if service name is not provided it returns the first service found in the config
         * @param name
         * @returns {*}
         */
        this.sync = function(serviceName) {
            if (serviceName != null) {
                return syncServices[serviceName];
            }
            for (var i in integrationServices) {
                if (syncServices.hasOwnProperty(i) && typeof (i) !== 'function') {
                    return syncServices[i];
                }
            }
        };

        /**
         * Returns the Integration service handler for the provided integration service
         * if service name is not provided it returns the first service found in the config
         * @param serviceName
         * @returns {*}
         */
        this.integration = function(serviceName) {
            if (serviceName != null) {
                return integrationServices[serviceName];
            }
            for (var i in integrationServices) {
                if (integrationServices.hasOwnProperty(i) && typeof (i) !== 'function') {
                    return integrationServices[i];
                }
            }
        };

        /**
         * Returns the messaging service handler
         * @param name
         * @returns {*}
         */
        this.messaging = function(name) {
            return messagingService
        };

        function AuthService(serviceObj){
            if(serviceObj === undefined || serviceObj.prov == undefined || serviceObj.type == undefined) {
                throw new Exception(Errors.INIT_FAILURE, "Invalid service url and service type");
            }

            var _type = serviceObj.type;
            var _serviceUrl = Util.stripTrailingCharacter(serviceObj.url,"/");;
            var _providerName = serviceObj.prov;

            logger.log("### AuthService:: initialized for provider "+ _providerName + " with type " + _type);

            var dsKey = _serviceUrl + "::" + _providerName + "::" + _type +"::RAW";

            this.login = function(options, successCallback, failureCallback) {

                logger.log("### AuthService::login Invoked login for provider "+ _providerName + " of type "+ _type);

                if(options == undefined) {
                    throw new Exception(Errors.INIT_FAILURE,"Missing required number of arguments to login function");
                }

                if(_type == "oauth2") {
                    logger.log("### AuthService::login Adapter type is oauth2");
                    if(options.windowHandler != undefined) {
                        var _window = options.windowHandler;
                        var _popup = null;
                        var _listener = function(event) {
                            var _contents = event.data;
                            _popup.close();
                            _detachEvent();
                            try {
                                logger.log("### AuthService::login received authorization code as " + _contents);
                                AjaxProvider.post(_serviceUrl+"/oauth2/token?provider="+_providerName,
                                    {"code":_contents},
                                    {
                                        "X-Kony-App-Key" : mainref.appKey,
                                        "X-Kony-App-Secret" : mainref.appSecret
                                    },
                                    function(data) {
                                        logger.log("### AuthService::login login successful. Retrieved Data:: ");
                                        logger.log(data);
                                        logger.log("### AuthService::login saving to localstore");
                                        dataStore.setItem(dsKey,JSON.stringify(data));
                                        logger.log("### AuthService::login savint to localstore successful. Extracting token.");
                                        tokens[_providerName] = data.claims_token.value;
                                        logger.log("### AuthService::login extracted token. Calling success callback");
                                        successCallback(data.claims_token.value);
                                    },
                                    function(data) {
                                        logger.log("### AuthService::login login failure. retrieved data:: ");
                                        logger.log(data);
                                        logger.log("### AuthService::login Calling failure callback");
                                        failureCallback(data);
                                    }
                                );
                            } catch (err) {
                                logger.log("exception ::" +err);

                                failureCallback();
                            }
                        };

                        var _attachEvent = function () {
                            if (_window.addEventListener) {
                                _window.addEventListener('message', _listener, false);
                            }
                            else if (_window.attachEvent) {
                                _window.attachEvent('message', _listener);
                            } else {
                                throw new Exception(Errors.INIT_FAILURE, "environment doesnt support event attatching");
                            }
                        };

                        var _detachEvent = function() {
                            if (_window.detachEvent) {
                                _window.detachEvent('message', _listener);
                            }
                            else if (_window.removeEventListener) {
                                _window.removeEventListener('message', _listener);
                            } else {
                                throw new Exception(Errors.INIT_FAILURE, "environment doesnt support event attatching");
                            }
                        };

                        _attachEvent();
                        var _popup = _window.open(_serviceUrl + "/oauth2/login?provider=" +_providerName);

                    }

                } else if (_type == "basic") {

                    if (options.userid == undefined || options.password == undefined) {
                        throw new Exception(Errors.INIT_FAILURE, "Require username and password");
                    }
                    logger.log("### AuthService::login making POST to authService ");
                    AjaxProvider.post(_serviceUrl+"/login?provider="+_providerName,
                        {
                            "userid" : options.userid,
                            "password" : options.password,
                            "provider" : _providerName
                        },
                        {
                            "X-Kony-App-Key" : mainref.appKey,
                            "X-Kony-App-Secret" : mainref.appSecret
                        },
                        function(data) {
                            logger.log("### AuthService::login login successful. Retrieved Data:: ");
                            logger.log(data);
                            logger.log("### AuthService::login saving to localstore");
                            dataStore.setItem(dsKey,JSON.stringify(data));
                            logger.log("### AuthService::login savint to localstore successful. Extracting token.");
                            tokens[_providerName] = data.claims_token.value;
                            logger.log("### AuthService::login extracted token. Calling success callback");
                            successCallback(data.claims_token.value);
                        },
                        function(data) {
                            logger.log("### AuthService::login login failure. retrieved data:: ");
                            logger.log(data);
                            logger.log("### AuthService::login Calling failure callback");
                            failureCallback(data);
                        }
                    );
                } else {

                }
            };

            this.logout = function(successCallback,failureCallback) {
                logger.log("### AuthService::logout invoked on provider "+ _providerName + " of type "+ _type);
                var value = dataStore.getItem(dsKey);
                var claimsToken = JSON.parse(value).claims_token.value;

                dataStore.removeItem(dsKey);
                delete tokens[_providerName];
                //FIXME: currently logout gives empty text response which results in failure even in good case
                AjaxProvider.post(_serviceUrl + "/logout",
                    {},
                    {
                        "Authorization" : claimsToken
                    },
                    function (data) {
                        logger.log("AuthService::logout successfully logged out. Calling success callback");
                        successCallback({});
                    },
                    function (xhr, status, err) {
                        if(xhr.status == 200) {
                            logger.log("### AuthService::logout successfully logged out. Calling success callback");
                            successCallback({});
                        } else {
                            logger.log("### AuthService::logout logged out Failed. Calling failure callback");
                            failureCallback({});
                        }
                    }
                );
            };

            this.changePassword = function(options, successCallback, failureCallback) {
                if(options == undefined || options.old_password == undefined || options.new_password == undefined) {
                    throw new Exception(Errors.INIT_FAILURE, "Missing required arguments");
                } else {
                    if( dataStore.getItem(dsKey) != null){
                        var rawToken = dataStore.getItem(dsKey);
                        var val = JSON.parse(rawToken);
                        var refreshToken = val.refresh_token;

                        var data = {
                            "old_password": options.old_password,
                            "new_password": options.new_password
                        };

                        AjaxProvider.post(_serviceUrl + "/change_password",
                            data,
                            {"Authorization": val.claims_token.value,"Content-Type":"application/x-www-form-urlencoded"},
                            successCallback,
                            failureCallback
                        );

                    } else {
                        failureCallback(null);
                    }
                }
            };

            this.getToken = function (fromserver, successCallback, failureCallback) {
                logger.log("### AuthService::getToken invoked for provider "+_providerName + " of type "+ _type);
                if(fromserver === true) {
                   logger.log("### AuthService::getToken fetching token from server");
                    _claimsRefresh(null,
                        function(token){
                            tokens[_providerName] = token;
                            successCallback(token);
                        },
                        function(err) {
                            failureCallback(err);
                        });
                } else {
                    logger.log("### AuthService::getToken Fetching token from localstore");
                    if(dataStore.getItem(dsKey) !== null && dataStore.getItem(dsKey) !== undefined) {
                        var rawToken = dataStore.getItem(dsKey);
                        var val = JSON.parse(rawToken);

                        var _exp = val.claims_token.exp;
                        if(_exp && _exp > (new Date().getTime())){
                            logger.log("### AuthService::getToken token is still valid.");
                            tokens[_providerName] = val.claims_token.value;
                            logger.log("### AuthService::getToken extracting token successfull. calling success callback");
                            successCallback(val.claims_token.value);
                        } else {
                            logger.log("### AuthService::getToken token is expired. Fetching from server");
                            _claimsRefresh(null,
                                function(token){
                                    logger.log("### AuthService::getToken fetching token from server successfull");
                                    tokens[_providerName] = val.claims_token.value;
                                    logger.log("### AuthService::getToken extracting token successfull. calling success callback");
                                    successCallback(token);
                                },
                                function(error) {
                                    logger.log("### AuthService::getToken Calling failure callback. fetching token from server failed with response "+ error);
                                    failureCallback(error);
                                });
                        }
                    } else {
                        logger.log("### AuthService::getToken Calling failure callback. No token info found in localstore with key "+ dsKey);
                        return failureCallback(null);
                    }
                }
            };

            this.getBackendToken = function(fromserver,options, successCallback, failureCallback) {
                logger.log("### AuthService::getBackendToken called for provider " + _providerName + " of type " + _type);
                if(fromserver != undefined && fromserver === true) {
                    logger.log("### AuthService::getBackendToken fromserver is enabled. Trying to login");
                    this.login(options,
                        function(){
                            var val = JSON.parse(dataStore.getItem(dsKey));
                            successCallback(val.provider_token);
                        },
                        failureCallback
                    );
                } else {
                    if(dataStore.getItem(dsKey) != null || dataStore.getItem(dsKey) != undefined) {
                        var rawToken = dataStore.getItem(dsKey);
                        var val = JSON.parse(rawToken);

                        var _exp = val.provider_token.exp;
                        logger.log("token expiry time: " + _exp);
                        logger.log("Current time: "+(new Date().getTime()));
                        if(_exp && _exp < (new Date().getTime())) {
                            logger.log("### AuthService::getBackendToken Token expired. Fetching refresh from claims api");
                            _claimsRefresh(null,
                                function (token) {
                                    var rawToken = dataStore.getItem(dsKey);
                                    var val = JSON.parse(rawToken);
                                    tokens[_providerName] = val.claims_token.value;
                                    logger.log("### AuthService::getBackendToken fetching refresh successfull. Calling success callback");
                                    successCallback(val.provider_token);
                                },
                                function (error) {
                                    logger.log("### AuthService::getBackendToken fetching refresh failed. Calling failure callback");
                                    failureCallback(error);
                                });
                        } else {
                            logger.log("### AuthService::getBackendToken present token is valid/doesn't have expiry time. Calling success callback");
                            successCallback(val.provider_token);
                        }
                    } else {
                        logger.log("### AuthService::getBackendToken failed for find info for key "+dsKey+"in database. calling failure callback");
                        failureCallback(null);
                    }
                }
            };

            this.getProfile = function(fromserver,successCallback,failureCallback) {
                if(fromserver && fromserver == true) {
                    _claimsRefresh(null,
                        function() {
                            var rawResponse = dataStore.getItem(dsKey);
                            var val = JSON.parse(rawResponse);
                            tokens[_providerName] = val.claims_token.value;
                            successCallback(val.profile);
                        },
                        failureCallback
                    )
                } else {
                    if(dataStore.getItem(dsKey) != null || dataStore.getItem(dsKey) != undefined) {
                        var rawToken = dataStore.getItem(dsKey);
                        var val = JSON.parse(rawToken);
                        successCallback(val.profile);
                    } else {
                        failureCallback(null);
                    }
                }
            };

            this.getProviderName = function() {
                return _providerName;
            };

            this.getProviderType = function() {
                return _type;
            };

            var _claimsRefresh = function (options, success,failure) {
                logger.log("### AuthService::_claimsRefresh fetching claims from server for provider "+ _providerName);
                var value = dataStore.getItem(dsKey);
                var refreshToken = null;
                if(value) {
                    refreshToken = JSON.parse(value).refresh_token;
                }
                var _url = _serviceUrl + "/claims";
                if(options && options.requestParams != null){
                    _url = _url + "?"
                    for (var i in options.requestParams) {
                        if (options.requestParams.hasOwnProperty(i) && typeof (i) !== 'function') {
                            _url = _url +(i+"="+options.requestParams[i]+"&");
                        }
                    }
                    _url = Util.stripTrailingCharacter(_url,"&");
                }
                if(refreshToken) {
                    logger.log("### AuthService::_claimsRefresh making POST request to claims endpoint");
                    AjaxProvider.post(_url,
                        {},
                        {
                            "Authorization" : refreshToken
                        },
                        function (data) {
                            logger.log("### AuthService::_claimsRefresh Fetching claims succcessfull. saving to db");
                            dataStore.setItem(dsKey,JSON.stringify(data));
                            logger.log("### AuthService::_claimsRefresh saved locally. Calling success callback");
                            success(data.claims_token.value);
                        },
                        function (xhr, status, err) {
                            logger.log("### AuthService::_claimsRefresh fetching claims failed. Calling failure callback");
                            failure(xhr,status,err);
                        }
                    );
                } else {
                    logger.log("### AuthService::_claimsRefresh no refreshtoken found. calling failure callback");
                    failure();
                }
            };
        };

        function IntegrationService(homeUrl, appId) {
            if(homeUrl == undefined || appId == undefined) {
                throw new Exception(Errors.INIT_FAILURE, "Invalid homeUrl and appId");
            }
            homeUrl = Util.stripTrailingCharacter(homeUrl,"/");
            var platform = null;
            var rcId = null;
            var channel = null;
            var url = homeUrl;
            var appID = appId;

            this.getUrl = function () {
                return homeUrl;
            };

            this.request = function (serviceId, data, successCallback, failureCallback, optional) {
                var requestData = {
                    //appID: appID,
                    serviceID: serviceId,
                    platform: platform,
                    rcid: rcId,
                    channel: channel
                };
                for (var key in data) {
                    requestData[key] = data[key];
                }
                var token;
                for (var i in tokens) {
                    if (tokens.hasOwnProperty(i) && typeof(i) !== 'function') {
                        token = tokens[i];
                        break;
                    }
                }

                if(optional !== undefined && optional.providerName !== undefined) {
                    token = tokens[optional.providerName];
                }

                AjaxProvider.post(homeUrl+"/"+serviceId,
                    requestData,
                    {"Content-Type":"application/x-www-form-urlencoded", "X-Kony-Authorization" : token},
                    successCallback,
                    function (xhr, status, err) {
                        failureCallback(err);
                    });
            };

        };

        function SyncService() {
        };

        function MessagingService(url) {
            var homeUrl = url;
            var KSID;
            var appId;
            
            var dsKey = url + ":KMS:AppId";
            
            this.getUrl = function () {
                return homeUrl;
            };

            this.setKSID = function (ksid) {
            	dataStore.setItem(dsKey,ksid);
                KSID = ksid;
            };

            this.getKSID = function () {
            	if(!KSID) {
            		KSID = dataStore.getItem(dsKey);
            	}
            	return KSID
            };

            this.setKmsAppId = function (id) {
                appId = id;
            };

            this.getKmsAppId = function () {
                return appId;
            };

            this.subscribe = function (osType, deviceId, pnsToken, email, successCallback, failureCallback) {
                var uri = homeUrl + "/subscribers";
                jsonParam = {
                    "subscriptionService": {
                        "subscribe": {
                            "sid": pnsToken,
                            "appId": this.getKmsAppId(),
                            "ufid": email,
                            "osType": osType,
                            "deviceId": deviceId
                        }
                    }
                };
                logger.log(JSON.stringify(jsonParam));
                AjaxProvider.post(uri,
                    jsonParam,
                    null,
                    function (data) {
                        KSID = data.id;
                        dataStore.setItem(dsKey,KSID);
                        logger.log("Device registered to KMS with KSID:" + KSID);
                        successCallback(data);
                    },
                    function (data, status, error) {

                            logger.log("ERROR: Failed to subscribe device for KMS");
                        failureCallback(data, status, error);
                    });
            };

            this.unsubscribe = function (successCallback, failureCallback) {
                var uri = homeUrl + "/subscribers/" + this.getKSID();
                logger.log("unsubscribe uri:" + uri);
                dataStore.removeItem(dsKey);
                AjaxProvider.delete(uri,null,null, successCallback, failureCallback);
            };

            this.fetchAllMessages = function (startIndex, pageSize, successCallback, failureCallback) {
                var uri = homeUrl + "/messages/fetch";

                payload = {
                    "ksid": this.getKSID(),
                    "startElement": startIndex,
                    "elementsPerPage": pageSize,
                };

                AjaxProvider.post(uri, payload,null, successCallback, failureCallback);
            };

            this.updateLocation = function (locationName, latitude, longitude, successCallback, failureCallback) {
                var uri = homeUrl + "/location";
                payload = {
                    "ksid": this.getKSID(),
                    "latitude": latitude,
                    "locname": locationName,
                    "longitude": longitude,
                };
                logger.log("updateLocation payload: " + JSON.stringify(payload));
                AjaxProvider.post(uri, payload,null, successCallback, failureCallback);
            };

            this.markMsgRead = function (fetchId, successCallback, failureCallback) {
                var uri = homeUrl + "/messages/open/" + fetchId;
                AjaxProvider.get(uri,null ,null ,successCallback, failureCallback);

            };

            this.getFullContent = function (fetchId, successCallback, failureCallback) {
                var uri = homeUrl + "/messages/content/" + fetchId;
                AjaxProvider.get(uri, null,null,successCallback, failureCallback);
            };
        };

        var Constants = {
            APP_KEY_HEADER: "X-Kony-App-Key",
            APP_SECRET_HEADER: "X-Kony-App-Secret",
            AUTHORIZATION_HEADER: "Authorization"
        };

        var Errors = {
            INIT_FAILURE : "INIT_FAILURE",
            DATA_STORE_EXCEPTION : "DATASTORE_FAILURE"
        };

        /**
         * Exception Class
         * @param name exception name
         * @param message exception description
         * @returns {{name: *, message: *}}
         * @constructor
         */
        function Exception(name, message) {
            return {
                name : name,
                message: message
            };
        };

        /**
         * Logger class.
         * @constructor
         */
        function Logger() {
            var enabled = true;
            /**
             * Logs the given message if logging is enabled. Silently ignores if
             * logging is disabled
             * @param msg
             */
            this.log = function(msg) {
                if(enabled) {
                    console.log(msg);
                }
            };

            /**
             * Enables logging
             */
            this.enableLog = function() {
                enabled = true
            };

            /**
             * Disables logging
             */
            this.disableLog  = function() {
                enabled = false;
            }
        }

        function KonyPlatformLogger(){
            var logging = true;
            this.log = function(msg){
                if(logging){
                    kony.print(msg);
                }
            };
            this.enableLog = function(){
                logging = true;
            };
            this.disableLog = function(){
                logging = false;
            };
        };

        /**
         * DataStore class that stores key,value pairs
         * @constructor
         */
        function LocalStore() {

            /**
             * Sets item in the datastore.
             * @param key key: String
             * @param value value: String
             */
            this.setItem = function (key, value) {
                if (typeof (key) !== "string" && typeof (value) !== "string") {
                    throw new Exception(Errors.DATA_STORE_EXCEPTION, "Invalid type: Keys & values must be strings");
                } else {
                    localStorage.setItem(key, value);
                }
            };

            /**
             * retrieves an item from datastore, return null if not found
             * @param key
             * @returns {*}
             */
            this.getItem = function (key) {
                if (typeof (key) !== "string") {
                    throw new Exception(Errors.DATA_STORE_EXCEPTION, "Invalid Key: Keys must be strings");
                } else {
                    var value = localStorage.getItem(key);
                    if (value === null || value === undefined) {
                        return null;
                    } else {
                        return value;
                    }
                }
            };

            /**
             * removes an item from datastore. fails silently if key not found or removing failed
             * @param key
             */
            this.removeItem = function(key) {
                if(dataStore != null){
                    if(typeof(key) !== "string"){
                        throw new Exception(Error.DATA_STORE_EXCEPTION, "Invalid Key: Keys must be strings");
                    } else {
                        localStorage.removeItem(key);
                    }
                }
            };

            /**
             * Clears all keys from datastore
             */
            this.destroy = function(){
                localStorage.clear();
            };

            /**
             * retrieves all key,value pairs from datastore
             * @returns {{}}
             */
            this.getAllItems = function(){
                var items = {};
                var len = localStorage.length;
                for(var i=0; i<len; i++){
                    var key = localStorage.key(i);
                    var value = localStorage.getItem(key);
                    items[key] = value;
                }
                return items;
            }
        }

        function KonyPlatformDataStore() {
            this.setItem = function (key, value) {
                logger.log("Setting item:" + value + " with key:"+ key);
                if (typeof (key) !== "string") {
                    throw new KonyException(Errors.DATA_STORE_EXCEPTION, "Invalid Key");
                } else {
                    try{
                    	key = key.replace(/\//gi, "");
                        kony.store.setItem(key, value);
                    }catch(e){
                        logger.log("Failed to set item in dtastore:"+e);
                    }
                }
            };

            this.getItem = function (key) {
                logger.log("Getting item for key:"+ key);
                if (typeof (key) !== "string") {
                    throw new KonyException(Errors.DATA_STORE_EXCEPTION);
                } else {
                	key = key.replace(/\//gi, "");
                    var value = kony.store.getItem(key);
                    if (value === null || value === undefined) {
                        logger.log("No value found with key:"+key);
                        return null;
                    } else {
                        return value;
                    }
                }
            };

            this.removeItem = function(key) {
                logger.log("Removing item for key:"+ key);
                if(typeof(key) !== "string"){
                    throw new KonyException(Error.DATA_STORE_EXCEPTION);
                } else {
                	key = key.replace(/\//gi, "");
                    kony.store.removeItem(key); //If no item with that key exists, the method does not perform any action. Thus no need to check for key availablity.
                }
            };

            this.destroy = function(){
                logger.log("Destroying data store for this app");
                kony.store.clear();
            };

            this.getAllItems = function(){
                logger.log("Getting all item from data store");
                var items = {};
                var len = kony.store.length(); //get key length
                for(var i=0; i<len; i++){
                    var key = kony.store.key(i);//get ith key
                    var value = kony.store.getItem(key);//get value
                    items[key] = value;//prepare itemset
                }
                return items;
            }
        };

        /**
         * Async Network Class
         * @constructor
         */
        function JQueryAJAXProvider() {

            /**
             * GET Request
             * @param url
             * @param data
             * @param headers
             * @param successCallback
             * @param failureCallback
             */
            this.get = function(url, data, headers, successCallback, failureCallback) {

                if (headers == undefined || headers == null) {
                    headers = {};
                }
                if(headers["Content-Type"] == undefined) {
                    headers["Content-Type"] = "application/json";
                    data = JSON.stringify(data);
                }
                $.ajax({
                    beforeSend: function (req) {
                        req.setRequestHeader("Accept", "application/json");
                    },
                    url: url,
                    headers: headers,
                    type: "get",
                    data: data,
                    contentType: headers["Content-Type"],
                    success: successCallback,
                    error: failureCallback
                });

            };

            /**
             * POST Request
             * @param url
             * @param data
             * @param headers
             * @param successCallback
             * @param failureCallback
             */
            this.post = function(url, data, headers, successCallback, failureCallback) {
                logger.log(headers);
                if (headers == undefined || headers == null) {
                    headers = {};
                }

                if(headers["Content-Type"] == undefined) {
                    headers["Content-Type"] = "application/json";
                    data = JSON.stringify(data);
                }

                $.ajax({
                    beforeSend: function (req) {
                        req.setRequestHeader("Accept", "application/json");
                    },
                    headers: headers,
                    url: url,
                    type: "post",
                    contentType: headers["Content-Type"],
                    data: data
                }).done(successCallback).fail(function (xhr, status, err) {
                    failureCallback(xhr, status, err);
                });
            };

            /**
             * DELETE Request
             * @param url
             * @param data
             * @param headers
             * @param successCallback
             * @param failureCallback
             */
            this.delete = function(url, data, headers, successCallback, failureCallback) {
                if (headers == undefined || headers == null) {
                    headers = {};
                }

                if(headers["Content-Type"] == undefined) {
                    headers["Content-Type"] = "application/json";
                    data = JSON.stringify(data);
                }

                $.ajax({
                    url: url,
                    type: 'DELETE',
                    headers: headers,
                    data: data,
                    contentType: headers["Content-Type"],
                    success: successCallback
                }).fail(failureCallback);
            };
        }

        function KonyPlatformNetworkProvider(){
            this.post = function (url, params, headers, successCallback, failureCallback) {

                function networkCallbackStatus(status, result){
                    if(status === 400){
                        logger.log("Response:" + JSON.stringify(result));
                        if(result.opstatus !== null && result.opstatus !== undefined && result.opstatus !== 0){
                            failureCallback(result);
                        }else{
                            successCallback(result);
                        }
                    }
                }
                if(headers === undefined || headers === null) {
                    headers = {}
                }
                headers["Accept"] = "application/json";
                if(headers["Content-Type"] === null || headers["Content-Type"] === undefined){
                   // headers["Content-Type"] = "application/json"; //setting to default header
                    //headers["Content-Type"] = "application/x-www-form-urlencoded"; //setting to default header
                }
               // headers = JSON.stringify(headers);

			   if(params === undefined){
				params = {};
			   }
                params.httpheaders = headers;
                logger.log("Hitting " + url + " with params " + JSON.stringify(params));
                kony.net.invokeServiceAsync(url, params, networkCallbackStatus, null);
            };
        };

        /**
         * Utility static functions
         * @constructor
         */
        function Util() {
        }
        Util.stripTrailingCharacter = function(str,char) {
            if(str.substr(str.length-1) == char) {
                return str.substr(0, str.length - 1);
            }
            return str;
        };
    }
};
