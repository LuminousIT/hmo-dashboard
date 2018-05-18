'use strict';


angular
  .module('urbanApp')
  .controller('organizationCtrl', ['$scope', '$location', '$filter', '$http',  'UserService', '$rootScope', '$state', 'DTOptionsBuilder', organizationCtrl]);

	function organizationCtrl($scope, $location, $filter, $http, UserService, $rootScope, $state, DTOptionsBuilder) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    var custom = new $rootScope.customMessage();
    $(".closeBtn").click(function(){
      $(".modal-content").hide("slow");
      $(".bcover").hide("slow");
    });

    $(".openBtn").click(function(){
      $(".modal-content").show("slow");
      $(".bcover").show("slow");
    });

    var config = {
      headers : {
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID')
      }
    };
    var  url= UserService.apiRoot+'hmo/get/organization';
    var data= {};
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.organizations = response.data.content.data; 
         }else{                      
        }
        }, function(response){
    });
  var  url= UserService.apiRoot+'get/states';
  var data= {};
  $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.states = response.data.content.data; 
       }else{                      
      }
      }, function(response){
  });
  $("#stateID").change(function(){
    $("#fetcher").html("<i class='fa fa-spinner fa-spin'></i> Fetching LG");
    var id = $('#stateID').find(":selected").val();
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

  $scope.createOrg = function(ev){
    var name = $("#name").val();
    var phone = $("#phone").val();
    var email = $("#email").val();
    var address = $("#address").val();
    var state = $('#stateID').find(":selected").val();
    var LG = $('#LG').find(":selected").val();
    if(state < 1 || LG < 1){ $rootScope.mCra(custom.error("You have not selected a valid location!")); return; }
    if(name.length < 2){ $rootScope.mCra(custom.error("The name is invalid")); return; }
    if(phone.length < 2){ $rootScope.mCra(custom.error("The phone Number is invalid")); return; }
    if(email.length < 5){ $rootScope.mCra(custom.error("The email is invalid")); return; }
    if(address.length < 5){ $rootScope.mCra(custom.error("The address is invalid")); return; }
    ev = ev.currentTarget;
    ev.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> working...";
    var config = {
      headers : {
        'Content-Type': 'application/json'
      }
    };
    var datum = {
      data:{
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID'),
        'name':name,
        'address':address,
        'phone':phone,
        'email':email,
        'state':state,
        'LG':LG
      }
    };
    var url = UserService.apiRoot+'hmo/create/organization';
    $http.post(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $state.reload();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          ev.innerHTML = "save";
      }
    }, function(response){
      ev.innerHTML = "save";
    });
    $scope.getURI = function(id){
      return "http://www.org.healthtouch.me/hr/i.html#?"+id;
    }
  }
  $scope.details = function(x){
    x = JSON.stringify(x);
    sessionStorage.setItem("tmp_ogpfl", x);
    $location.path("/org-details");
  }
  $scope.setOrg = function(x, ev){
    ev = ev.currentTarget;
    var oldContent = ev.innerHTML;
    var newStatus = 1 - x.status;
    var datum = {
      data:{
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID'),
        'orgID':x.id
      }
    };
    var url = UserService.apiRoot+'hmo/set/organization/'+newStatus;
    ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Working";
    $http.post(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $state.reload();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          ev.innerHTML = oldContent;
      }
    }, function(response){
      ev.innerHTML = oldContent;
    });
  }

	}
