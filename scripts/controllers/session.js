
/*(function () {
    'use strict';

   var App = angular.module('urbanApp')
        .factory('AuthenticationFactory', AuthenticationFactory)
        .factory('UserAuthFactory', UserAuthFactory)
        .factory('TokenInterceptorFactory', TokenInterceptorFactory);

    App.factory('Session', function() {
      var Session = {
        data: {},
        saveSession: function() { /* save session data to db  },
        updateSession: function(nData, identifier) {
          /* load data from db 
          return Session.data[identifier] = nData;
        }
      };
      return Session;
    });

    AuthenticationFactory.$inject = ['$window'];
    function AuthenticationFactory($window) {

        return {
            isLogged: false,

            check: function () {

                if (sessionStorage.getItem("username") && sessionStorage.getItem("publicKey")) {

                    this.isLogged = true;
                } else {
                    this.isLogged = false;
                    delete this.username;
                    delete this.publicKey;
                }

                return this.isLogged;
            }
        };
    }

    UserAuthFactory.$inject = ['$window', '$location', '$http', 'AuthenticationFactory',
        'ApiBaseUrlLogin'];
    function UserAuthFactory($window, $location, $http, AuthenticationFactory, ApiBaseUrlLogin, UserService) {

        return {

            login: function (username, password) {
                return $http({
                    url: ApiBaseUrlLogin + "hmo/login",
                    method: 'POST',
                    headers : {
                    'Content-Type': 'application/json;'
           },
                    data: {
                    "data":{
                        "username":username,
                        "password":password
                    }
                }
                });
            },

            logOut: function () {

                if (AuthenticationFactory.isLogged) {
                    AuthenticationFactory.isLogged = false;

                    delete AuthenticationFactory.username;
                    delete $window.sessionStorage.id;
                    delete $window.sessionStorage.email;
                    delete $window.sessionStorage.username;
                    delete $window.sessionStorage.password;
                    delete $window.sessionStorage.hospitalId;
                    delete $window.sessionStorage.hospitalAccessId;
                    delete $window.sessionStorage.hospitalUsername;

                    $location.path("/signin");
                }
            }
        }
    }

    TokenInterceptorFactory.$inject = ['$q', '$window'];
    function TokenInterceptorFactory($q, $window) {
        return {
            request: function (config) {
                config.headers = config.headers || {};

                if ($window.sessionStorage.token) {
                    config.headers['token'] = $window.sessionStorage.token;
                    config.headers['Content-Type'] = "application/json";
                }
                else if ($window.sessionStorage.hospitalToken) {
                    config.headers['token'] = $window.sessionStorage.hospitalToken;
                    config.headers['Content-Type'] = "application/json";
                }
                return config || $q.when(config);
            },

            response: function (response) {
                return response || $q.when(response);
            }
        }
    }
})();*/



(function () {
    angular.module('urbanApp')
        .controller('LoginController', LoginController);
    LoginController.$inject = ['$rootScope', '$window', '$location'];
    function LoginController($rootScope, $window, $location, UserAuthFactory, AuthenticationFactory, Session) {
    }
})();


/*App.factory('UserService', function() {
  return {
    apiRoot : 'http://192.168.4.237/healthTouch/public/api/',
    //apiRoot : 'http://172.16.1.22:6500/royalty/H/public/api/',
    //apiRoot : 'http://localhost/royalty/H/public/api/',
    //webroot: 'http://localhost/fpanda/fpanda/'
    webroot: 'http://192.168.4.237/healthTouch/public/api/',
    //webroot: 'http://172.16.1.22:6500/fpanda/'
  };
});*/


App.controller("loginCtrl", function ($scope, $http, $location,$rootScope, $window, UserService, Session){
    custom = new $rootScope.customMessage();    
     if (sessionStorage.getItem("username") && sessionStorage.getItem("publicKey")) {
         $location.path("/");
         return;
    }else{
    }
    if (sessionStorage.getItem("ftoken") && sessionStorage.getItem("HMOID")) {
        $location.path("/signup");
    }
    $scope.login = function(obj){
        var  url= UserService.apiRoot+'hmo/login';
        var datum = {"data":{
                "username": $("#username").val(),
                "password": $("#password").val()
        }};
        if(datum.data.username.length < 1 || datum.data.password < 1){
            $rootScope.mCra(custom.error("All fields are required!"));
            return;
        }
        obj.currentTarget.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
        var config = {
        		method: 'POST',
                headers : {
                    'Content-Type': 'application/json;'
           }
        }
        $http.post(url, datum, config).then(function(response){
            if(response.data.error.status == 0){
                sessionStorage.setItem("username", response.data.content.data[0].username);
                sessionStorage.setItem("publicKey", response.data.content.data[0].publicKey);
                sessionStorage.setItem("HMOID", response.data.content.data[0].HMOID);
                var  url= UserService.apiRoot+'hmo/get/staff/me';
                var data= {};
                var config = {
                        headers : {
                            'username': sessionStorage.getItem('username'),
                            'publicKey': sessionStorage.getItem('publicKey'),
                            'hmoID': sessionStorage.getItem('HMOID')
                   }
                }
                $http.get(url, config).then(function(response){
                    if(response.data.error.status == 0){                        
                        sessionStorage.setItem("staffName", response.data.content.data[0].staffName);
                        sessionStorage.setItem("hmoName", response.data.content.data[0].hmoName);
                        sessionStorage.setItem("email", response.data.content.data[0].email);
                        sessionStorage.setItem("phone", response.data.content.data[0].phone);
                        sessionStorage.setItem("address", response.data.content.data[0].address);                
                        sessionStorage.setItem("gender", response.data.content.data[0].gender);
                        sessionStorage.setItem("lg", response.data.content.data[0].lg);
                        sessionStorage.setItem("state", response.data.content.data[0].state);
                        sessionStorage.setItem("providerID", response.data.content.data[0].providerID);
                        $location.path("/");
                    }else{}
                    }, function(response){
                });
            }else{
                $rootScope.mCra(custom.error(response.data.error.message));
                obj.currentTarget.innerHTML = "Sign in";
            }
        }, function(err){ })
    };
});


App.controller("logoutCtrl", function ($scope, $http, $location,$rootScope, UserService, Session) {
    sessionStorage.clear();
    $location.path("/signin");
});


App.controller("signupCtrl", function($scope, $http, $location,$rootScope, $window, UserService, COLORS, Session) {
    $scope.isunRegistered = true;
     if (sessionStorage.getItem("username") && sessionStorage.getItem("publicKey")) {
        $location.path("/");
        return;
    }
    if (sessionStorage.getItem("ftoken") && sessionStorage.getItem("HMOID")) {
        $("#signCompany").hide("slow");
        $("#signUser").show("slow");
        $scope.isunRegistered = false;
        $scope.HMOID = sessionStorage.getItem("HMOID");
        $scope.ftoken = sessionStorage.getItem("ftoken");
        $rootScope.mCra(custom.success("The HMO Company has been created. Now add an HMO Login Account"));
    }
    var  url= UserService.apiRoot+'get/states';
    var data= {};
    var config = {
        headers : {
          'username': sessionStorage.getItem('username'),
          'publicKey': sessionStorage.getItem('publicKey'),
          'hmoID': sessionStorage.getItem('HMOID')
        }
    };
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.states = response.data.content.data; 
         }else{                         
        }
        }, function(response){
    });

    $("#state").change(function(){
        $("#fetcher").html("<i class='fa fa-spinner fa-spin'></i> Fetching matched LG");
        var id = $('#state').find(":selected").val();
        var  url= UserService.apiRoot+'get/lgs/'+id;
        $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.lgs = response.data.content.data;
                $("#fetcher").html(""); 
             }else{
                $("#fetcher").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");              
            }
            }, function(response){
                $("#fetcher").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");
        });
    });
    $("#staffstate").change(function(){
        $("#fetcher2").html("<i class='fa fa-spinner fa-spin'></i> Fetching matched LG");
        var id = $('#staffstate').find(":selected").val();
        var  url= UserService.apiRoot+'get/lgs/'+id;
        $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.lgstaff = response.data.content.data;
                $("#fetcher2").html(""); 
             }else{
                $("#fetcher2").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");              
            }
            }, function(response){
                $("#fetcher2").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");
        });
    });
    $scope.signup = function(obj) {
        var  url= UserService.apiRoot+'hmo/create';
        var data = {"data":{
                'name': $("#name").val(),
                'address': $("#address").val(),
                "phone": $("#phone").val(),
                "email": $("#email").val(),
                "state": $('#state').find(":selected").val(),
                "LG": $('#LG').find(":selected").val()
        }
        };
        var config = {
        		method: 'POST',
                headers : {
                    'Content-Type': 'application/json;'
           }
        }
        if(data.data.name.length < 2){ $rootScope.mCra(custom.error("Company Name is invalid")); return; }
        if(data.data.address.length < 2){ $rootScope.mCra(custom.error("Address is invalid")); return; }
        if(data.data.phone.length < 2){ $rootScope.mCra(custom.error("Phone Number is invalid")); return; }
        obj.currentTarget.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
        $http.post(url, data, config).then(function(response){
            if(response.data.error.status == 0){
                sessionStorage.setItem("ftoken", response.data.content.ftoken);
                sessionStorage.setItem("HMOID", response.data.content.HMOID);
                $scope.HMOID = response.data.content.HMOID;
                $scope.ftoken = response.data.content.ftoken
                $rootScope.mCra(custom.success(response.data.success.message+". Now add an HMO Login Account"));
                $scope.isunRegistered = false;
                $("#signCompany").hide("slow");
                $("#signUser").show("slow");
            }else{
                $rootScope.mCra(custom.error(response.data.error.message));
                obj.currentTarget.innerHTML = "Create Account";
            }
        }, function(err){
            $rootScope.mCra(custom.error("Something went wrong"));
            obj.currentTarget.innerHTML = "Create Account";
        });
    }
    $scope.staffsignup = function(obj) {
        var  url= UserService.apiRoot+'hmo/create/staff';
        var data = {
            "data":{
                'username': $("#staffusername").val(),
                'password': $("#staffpassword").val(),
                'name': $("#stafffullname").val(),
                'address': $("#staffaddress").val(),
                "phone": $("#staffphone").val(),
                "email": $("#staffemail").val(),
                "state": $('#staffstate').find(":selected").val(),
                "LG": $('#staffLG').find(":selected").val(),
                "gender": $('#staffgender').find(":selected").val(),
                "hmoID": sessionStorage.getItem("HMOID"),
                "ftoken": sessionStorage.getItem("ftoken")
            }
        };
        var config = {
        		method: 'POST',
                headers : {
                    'Content-Type': 'application/json;'
           }
        }
        if(data.data.name.length < 5){$rootScope.mCra(custom.error("Fullname cannot be less than 5 Chars.")); return; }
        if(data.data.state < 1){$rootScope.mCra(custom.error("Selected State is invalid.")); return; }
        if(data.data.LG < 1){$rootScope.mCra(custom.error("The LG is invalid.")); return; }
        if(data.data.email.length < 2){$rootScope.mCra(custom.error("email address is required.")); return; }
        if(data.data.password.length < 6){$rootScope.mCra(custom.error("Expecting at least 6 characters in password field.")); return; }
        if(data.data.password !== $("#staffpasswordagain").val()){$rootScope.mCra(custom.error("The password do not match.")); return; }
        obj.currentTarget.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
        $http.post(url, data, config).then(function(response){
            if(response.data.error.status == 0){                
                $rootScope.mCra(custom.success(response.data.success.message+" Now login to your account"));
                sessionStorage.clear();
                $location.path("/signin");
            }else{
                $rootScope.mCra(custom.error(response.data.error.message));
                obj.currentTarget.innerHTML = "Create Account";
            }
        }, function(err){
            $rootScope.mCra(custom.error("Something went wrong"));
            obj.currentTarget.innerHTML = "Create Account";
        });
    }
});


App.controller('sweetAlertCtrl', ['$scope', 'SweetAlert', 'COLORS', sweetAlertCtrl]);
function sweetAlertCtrl($scope, SweetAlert, COLORS) {
	 $scope.demo4 = function () {
    SweetAlert.swal('Good job!', 'You clicked the button!', 'success');
  };
}
