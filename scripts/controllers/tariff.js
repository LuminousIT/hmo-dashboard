'use strict';


angular
  .module('urbanApp')
  .controller('tariffCtrl', ['$scope', '$location', '$filter', '$http', 'editableOptions', 'editableThemes', 'UserService', '$rootScope', '$state', tariffCtrl]);


	function tariffCtrl($scope, $location, $filter, $http, editableOptions, editableThemes, UserService, $rootScope, $state) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.tariffAmount = function(x) {
      sessionStorage.setItem("tmp_tram", JSON.stringify(x));
      $location.path("/tariffamount");
    };
    var custom = new $rootScope.customMessage();
    $scope.currentEdit = false;
    $scope.modalAction = "Create new tarrif";

    $(".closeBtn").click(function(){
      $(".modal-content").hide("slow");
      $(".bcover").hide("slow");
    });

    $(".openBtn").click(function(){
      $scope.currentEdit = false;
      document.getElementById("tariffPlan").disabled = false;
      $scope.modalAction = "Create new tarrif";
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
    var  url = UserService.apiRoot+'hmo/get/providersheet';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.providers = response.data.content.data;          
          //$state.reload();
       }else{                         
      }
      }, function(response){
   });
  var  url = UserService.apiRoot+'hmo/get/tariffs/-';
  $http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.tariffs = response.data.content.data;
     }else{                         
    }
    }, function(response){
 });
 var  url = UserService.apiRoot+'hmo/get/plans/-';
 $http.get(url, config).then(function(response){
   if(response.data.error.status == 0){
       $scope.plans = response.data.content.data;
    }else{                         
   }
   }, function(response){
  });
  $("#category").change(function(){
    $("#fetcher").html("<i class='fa fa-spinner fa-spin'></i> Fetching Matches");
    var id = $('#category').find(":selected").val();
    var  url = UserService.apiRoot+'hmo/get/tariffs/'+id;
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.tariffs = response.data.content.data;
            $("#fetcher").html(""); 
         }else{
            $("#fetcher").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");              
        }
        }, function(response){
            $("#fetcher").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");
    });
  });

  $scope.createTariff = function(obj){
    $scope.currentEdit = null;
    document.getElementById("tariffPlan").disabled = false;
    var tariffName = $("#tariffName").val();
    var tariffDescription = $("#tariffDescription").val();
    var tariffPlan = $('#tariffPlan').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    if(tariffName.length < 4){ $rootScope.mCra(custom.error("Tariff Name is invalid. At least 5 characters expected")); return; }
    if(tariffDescription.length < 4){ $rootScope.mCra(custom.error("Tariff Description is invalid. At least 5 characters expected")); return; }
    if(tariffPlan < 1){ $rootScope.mCra(custom.error("You have not selected a valid Plan")); return; }
    if(provider < 1){ $rootScope.mCra(custom.error("You have not selected a valid provider")); return; }
    obj = obj.currentTarget;
    obj.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> working...";
    var config = {
      headers : {
        'Content-Type':'application/json'
      }
    };
    var datum = {
      data:{
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID'),
        'tariffName':tariffName,
        'tariffDescription':tariffDescription,
        'planID':tariffPlan,
        'provider':provider
      }
    }
    var url = UserService.apiRoot+'hmo/create/tariff';
    $http.post(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $state.reload();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          obj.innerHTML = "Save";
      }
    }, function(response){
      obj.innerHTML = "Save";
    });
  }

  $scope.changeTariff = function(data){
    $scope.currentEdit = data;
    $(".modal-content").show("slow");
    $(".bcover").show("slow");
    document.getElementById("tariffPlan").disabled = true;
    $scope.modalAction = "Edit tarrif";
  }
  $scope.updateTariff = function(obj){
    var tariffName = $("#tariffName").val();
    var tariffDescription = $("#tariffDescription").val();
    var tariffPlan = $('#tariffPlan').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    if(tariffName.length < 4){ $rootScope.mCra(custom.error("Tariff Name is invalid. At least 5 characters expected")); return; }
    if(tariffDescription.length < 4){ $rootScope.mCra(custom.error("Tariff Description is invalid. At least 5 characters expected")); return; }
    if(tariffPlan < 1){ $rootScope.mCra(custom.error("You have not selected a valid Plan")); return; }
    if(provider < 1){ $rootScope.mCra(custom.error("You have not selected a valid provider")); return; }
    obj = obj.currentTarget;
    obj.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> working...";
    var config = {
      headers : {
        'Content-Type':'application/json'
      }
    };
    var datum = {
      data:{
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID'),
        'tariffName':tariffName,
        'tariffDescription':tariffDescription,
        'planID':tariffPlan,
        'provider':provider, 
        'tariffID' : $scope.currentEdit.tariffID
      }
    }
    var url = UserService.apiRoot+'hmo/edit/tariff';
    $http.post(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $state.reload();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          obj.innerHTML = "Save";
      }
    }, function(response){
      obj.innerHTML = "Save";
    });
  }
}
