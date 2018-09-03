'use strict';


angular
  .module('urbanApp')
  .controller('packageCtrl', ['$scope', '$location', '$filter', '$http', 'editableOptions', 'editableThemes', 'UserService', '$rootScope', '$state', packageCtrl]);

	function packageCtrl($scope, $location, $filter, $http, editableOptions, editableThemes, UserService, $rootScope, $state) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.showPlans = function(x) {
        $("#waiter").show();
        $scope.editedPlans = [];
        $scope.currentEdit = x;
        $scope.modalAction = "Edit / View Package Plans";
        $("#descTab").hide();
        $("#orgTab").hide();
        $("#planTab").show();
        $(".modal-content").show("slow");
        $(".bcover").show("slow");
        var config = {
            headers : {
              'username': sessionStorage.getItem('username'),
              'publicKey': sessionStorage.getItem('publicKey'),
              'hmoID': sessionStorage.getItem('HMOID')
            }
          };
        var  url = UserService.apiRoot+'hmo/get/package/plan/'+x.id;
        $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.packagePlan = response.data.content.data;
                $scope.editedPlans = [];                
                for(var i = 0; i < $scope.plans.length; i++){
                    var found = false;
                    var obj = $scope.plans[i];
                    for(var ij = 0; ij < $scope.packagePlan.length; ij++){
                        if($scope.packagePlan[ij].id == obj.id){
                            found = true
                            break;
                        }else{
                            found = false;
                        }
                    }
                    if(found){ obj.found = true; }else{ obj.found = false; } $scope.editedPlans.push(obj);
                }
                $("#waiter").hide();
                //$state.reload();
            }else{
                $rootScope.mCra(custom.error(response.data.error.message));
            }
            }, function(response){
        });
    };
    var custom = new $rootScope.customMessage();
    $scope.currentEdit = false;
    $scope.modalAction = "Create new Package";
    $(".closeBtn").click(function(){
      $(".modal-content").hide("slow");
      $(".bcover").hide("slow");
    });

    $(".openBtn").click(function(){
      $scope.currentEdit = false;
      //$scope.currentEdit = null;
      //document.getElementById("tariffPlan").disabled = false;
      $scope.modalAction = "Create new Package";
      $(".modal-content").show("slow");
      $(".bcover").show("slow");
      $("#descTab").show();
      $("#orgTab").show();
      $("#planTab").hide();
    });
    var config = {
      headers : {
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID')
      }
    };
    var  url = UserService.apiRoot+'hmo/get/organization';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.organization = response.data.content.data;          
          //$state.reload();
       }else{                         
      }
      }, function(response){
   });
  var  url = UserService.apiRoot+'hmo/get/package';
  $http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.tariffs = response.data.content.data;
     }else{                         
    }
    }, function(response){
 });
 var  url = UserService.apiRoot+'hmo/get/plans/-/-';
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

  $scope.createPackage = function(obj){
    $scope.currentEdit = null;
    //document.getElementById("tariffPlan").disabled = false;
    var packageName = $("#tariffName").val();
    var packageDescription = $("#tariffDescription").val();
    var orgID = $('#organization').find(":selected").val();
    if(packageName.length < 4){ $rootScope.mCra(custom.error("Package Name is invalid. At least 5 characters expected")); return; }
    if(packageDescription.length < 4){ $rootScope.mCra(custom.error("Package Description is invalid. At least 5 characters expected")); return; }
    if(orgID < 1){ $rootScope.mCra(custom.error("You have not selected a valid Organization")); return; }
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
        'packageName':packageName,
        'description':packageDescription,
        'orgID':orgID
      }
    }
    var url = UserService.apiRoot+'hmo/create/package';
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
    //document.getElementById("tariffPlan").disabled = true;
    $scope.modalAction = "Edit Package";
  }
  $scope.updatePlan = function(obj, ev){
      ev = ev.currentTarget;
      if(ev.checked){
          $scope.packagePlan.push(obj);
      }else{
        for(var i = 0; i < $scope.packagePlan.length; i++){
            if($scope.packagePlan[i].id == obj.id){
                $scope.packagePlan.splice(i, 1);
                break;
            }
        }
      }
  }
  $scope.updatePackage = function(obj){
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
        'packageID':$scope.currentEdit.id,
        'planID':$scope.packagePlan
      }
    }
    var url = UserService.apiRoot+'hmo/add/package/plans';
    $http.post(url, JSON.stringify(datum), config).then(function(response){
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
