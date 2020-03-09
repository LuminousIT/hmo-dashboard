'use strict';


angular
  .module('urbanApp')
  .controller('tariffamountCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope', tariffamountCtrl]);

	function tariffamountCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }else{

    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.tariffDetails = JSON.parse(sessionStorage.getItem("tmp_tram"));
    $scope.tariffID = $scope.tariffDetails.id;
    var config = {
      headers : {
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID')
      }
    };
    var custom = new $rootScope.customMessage();
    var  url = UserService.apiRoot+'hmo/get/tariffservice/'+$scope.tariffID;
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.tariffServices = response.data.content.data;          
          //$state.reload();
       }else{ 
      }
      }, function(response){
   });

   $scope.updatePrice = function(t, index, ev){
     if(t == 0){
      $scope.tariffServices[index].price = (ev.currentTarget.value.length < 1)? ev.currentTarget.placeholder : ev.currentTarget.value;
     }else if(t == 1){
      $scope.tariffServices[index].frequency = (ev.currentTarget.value.length < 1)? ev.currentTarget.placeholder : ev.currentTarget.value;
     }else if(t == 2){
      $scope.tariffServices[index].duration = (ev.currentTarget.value.length < 1)? ev.currentTarget.placeholder : ev.currentTarget.value;
     }else{
      $scope.tariffServices[index].serviceName = (ev.currentTarget.value.length < 1)? ev.currentTarget.placeholder : ev.currentTarget.value;
     }
   };
   $scope.savePrices = function(ev){
     var obj = [];
     var counter = 0;
     while(counter < $scope.tariffServices.length){
       var nobj = {};
       nobj.price = ($scope.tariffServices[counter].price.length < 1)? 0 : $scope.tariffServices[counter].price;
       nobj.duration = ($scope.tariffServices[counter].duration.length < 1)? 0 : $scope.tariffServices[counter].duration;
       nobj.frequency = ($scope.tariffServices[counter].frequency.length < 1)? 0 : $scope.tariffServices[counter].frequency;
       nobj.pTariffID = $scope.tariffServices[counter].pid;
       obj.push(nobj);
       counter++;
     }
     if(obj.length < 1){ $rootScope.mCra(custom.error("There is no changes to apply")); return; }
     ev = ev.currentTarget;
     ev.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> working...";
    var  url = UserService.apiRoot+'hmo/upload/tariff';
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
        'tariffName':$scope.tariffDetails.tariffName,
        'planID':$scope.tariffDetails.planID,
        'providerID':$scope.tariffDetails.providerID,
        'services':obj
      }
    };
    $http.post(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $state.reload();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          ev.innerHTML = "<i class=\"fa fa-check\"></i>save";
      }
    }, function(response){
      ev.innerHTML = "<i class=\"fa fa-check\"></i>save";
    });
   }

   $scope.deleteService = function(x, ev){
    var obj = ev.currentTarget;
    if(confirm("Are you sure? You will delete the Service")){
      var url = UserService.apiRoot+'hmo/delete-service';
      var data = {};
      data.publicKey = sessionStorage.getItem('publicKey');
      data.username = sessionStorage.getItem('username');
      data.hmoID = sessionStorage.getItem('HMOID');
      data.tariffID = x.tariffID;
      data.serviceID = x.id;
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
      $http.post(url, datum, config).then(function(response){
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

  $scope.initService = function(){
    $scope.tariffServices = [{"editing":1}].concat($scope.tariffServices);
  }
  $scope.saveService = function(x, ev){
    console.log( $scope.tariffServices[0]);
    var obj = ev.currentTarget;
    if(confirm("Are you sure? You will delete the Service")){
      var url = UserService.apiRoot+'hmo/add-service';
      var data = {};
      data.publicKey = sessionStorage.getItem('publicKey');
      data.username = sessionStorage.getItem('username');
      data.hmoID = sessionStorage.getItem('HMOID');
      data.tariffID = $scope.tariffID;
      data.name = x.serviceName;
      data.price = x.price;
      data.frequency = x.frequency;
      data.duration = x.duration;
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
      $http.post(url, datum, config).then(function(response){
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
