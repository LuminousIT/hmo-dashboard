'use strict';


angular
  .module('urbanApp')
  .controller('enrolleesCtrl', ['$scope', '$location', '$filter', '$http',  'UserService', '$rootScope', '$state', 'DTOptionsBuilder',  enrolleesCtrl]);


	function enrolleesCtrl($scope, $location, $filter, $http, UserService, $rootScope, $state, DTOptionsBuilder) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.details = function(x){
      x = JSON.stringify(x);
      sessionStorage.setItem("tmp_epfl", x);
      $location.path("/enroleeDetails");
    }
    var custom = new $rootScope.customMessage();
    var config = {
      headers : {
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID')
      }
    };
    var  url= UserService.apiRoot+'hmo/get/organization';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.organization = response.data.content.data;
          $scope.Init = true;
          $scope.filterEnrolees();
       }else{
      }
      }, function(response){
        
   });
   var  url= UserService.apiRoot+'hmo/get/providersheet';
   $http.get(url, config).then(function(response){
     if(response.data.error.status == 0){
         $scope.providersheet = response.data.content.data;
      }else{
     }
     }, function(response){
  });
  
  $scope.alter = function(ev, cardSerial, action){
    if(action == 1){ action = 0; var message = "Are you sure? The Enrolee will be blocked"; }else{ action = 1; var message = "are you sure? the Enrolee will be Unblocked"; }
    if(!confirm(message)){ return; }
    ev = ev.currentTarget;
    var former = ev.innerHTML;
    ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> wait...";
    var  url= UserService.apiRoot+'hmo/set/enrolee/'+cardSerial+'/'+action;
    var config = {
      headers : {
        'Content-Type': 'application/json'
      }
    };
    var datum = {
      data:{
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID')
      }
    };
    $http.put(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $state.reload();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          ev.innerHTML = former;
      }
    }, function(response){
      ev.innerHTML = former;
    });
  };

  $(document).ready(function(){
    
  });

  $scope.filterEnrolees = function(ev = document.getElementById("btnn")){
    var org = $('#orgs').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    var type = $('#type').find(":selected").val();
    //ev = ev.currentTarget;
    if($scope.Init){org = $scope.organization[0].id; $scope.Init = false;}
    ev.innerHTML = "<i class='fa fa-spinner fa-spinner'></i> please wait...";
    var  url= UserService.apiRoot+'hmo/get/enrolee/'+type+'/-/'+org+'/'+provider+'/-';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.enrolees = response.data.content.data;
          ev.innerHTML = '<i class="fa fa-filter"></i> Filter';
       }else{
        ev.innerHTML = '<i class="fa fa-filter"></i> Filter';
      }
      }, function(response){
        ev.innerHTML = '<i class="fa fa-filter"></i> Filter';
    });
  }
  $scope.deleteEnrolee = function(ev, ob){
    var obj = ev.currentTarget;
    if(confirm("Are you sure? You will delete the enrolee and the dependants")){
      var url = UserService.apiRoot+'hmo/delete/enrolee';
      var data = {};
      data.publicKey = sessionStorage.getItem('publicKey');
      data.username = sessionStorage.getItem('username');
      data.hmoID = sessionStorage.getItem('HMOID');
      data.eID = ob.eID;
      var former = obj.innerHTML;
      obj.innerHTML = "W...";
      obj.disabled = "disabled";
      var config = {
        headers : {
            'Content-Type':'application/json'
        }
      };
      var datum = {
        "data":data
      }
      $http.put(url, datum, config).then(function(response){
        if(response.data.error.status == 0){
          $rootScope.mCra(custom.success(response.data.success.message));
          $state.reload();
        }else{
          obj.innerHTML = former;
            $rootScope.mCra(custom.error(response.data.error.message));
        }
    }, function(response){
      obj.innerHTML = former;
      $rootScope.mCra(custom.error(response.data.error.message));
    });
    }
  }
	}
