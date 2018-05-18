'use strict';
angular
  .module('urbanApp')
  .controller('orgDetailsCtrl', ['$scope', '$location', '$filter', '$http',  'UserService', '$rootScope', '$state', 'DTOptionsBuilder','$timeout',  orgDetailsCtrl]);

	function orgDetailsCtrl($scope, $location, $filter, $http, UserService, $rootScope, $state, DTOptionsBuilder, $timeout) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $('.dropdown-toggle').dropdown();
    var x = sessionStorage.getItem('tmp_ogpfl');
    $scope.orgData = JSON.parse(x);
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
         $scope.organizations = response.data.content.data;
      }else{                         
     }
     }, function(response){
  });
  /*var  url= UserService.apiRoot+'hmo/get/enrolee/2/-/-/-/'+$scope.orgData.eID;
  $http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.dependants = response.data.content.data;
     }else{                         
    }
    }, function(response){
  });*/

  $scope.dtOptions = DTOptionsBuilder.newOptions()
  .withOption('lengthMenu', [[10, 25, 50, 100, 150, -1], [10, 25, 50, 100, 150, "All"]])
  .withOption('drawCallback', function () {
      //initSearch();
      // Use `$timeout` in order to ensure everything is rendered before computing
    $timeout(function() {
      //initSearch();
      //compute();
      //listenForEvoke();
    }, 0);
  });
$scope.listenForEvoke = function(ev){
  $( ".elsKey" ).keyup(function(){
    var index = this.id.replace('extended','');
    $scope.dtInstance.DataTable.column(index).search(this.value).draw();
  });
}
$scope.dtInstance = {};
function compute() {
// Notice I use `dataTable` and not `DataTable`
    var displayedRows = $scope.dtInstance.dataTable._('tr', {filter: 'applied', page: 'current'});
    $scope.tcSum = 0;
    $scope.pSum = 0;
    angular.forEach(displayedRows, function(row) {
    // Careful on the content of `row`
    //$scope.sum += parseFloat(row[6]);
    try{
      var t2 = row[6].replace(",","").replace("₦","");
      var t = row[7].replace(",","").replace("₦","");
      $scope.tcSum += parseFloat(t2);
      $scope.pSum += parseFloat(t);
    }catch(e){

    }
    });
}
  $scope.alter = function(ev, cardSerial, action){
    if(action == 1){ action = 0; var message = "Are you sure? The Enrolee will be blocked"; }else{ action = 1; var message = "are you sure? the Enrolee will be Unblocked"; }
    $scope.newActive = action;
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
        $scope.enroleeData.active = $scope.newActive;
        ev.innerHTML = former;
        sessionStorage.setItem('tmp_epfl', JSON.stringify($scope.enroleeData));
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          ev.innerHTML = former;
      }
    }, function(response){
      ev.innerHTML = former;
    });
  }
  /*var  url= UserService.apiRoot+'hmo/get/transactions/-/-/-/'+$scope.enroleeData.eID+'/0/7799999999/2';
  $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.encounters = response.data.content.data; 
      }else{}
      }, function(response){
  });*/
  var  url = UserService.apiRoot+'hmo/get/organization/details/'+$scope.orgData.id;
  $http.get(url, config).then(function(response){
  if(response.data.error.status == 0){
      $scope.otherData = response.data.content;
      $('#providers2').select2();
      //$state.reload();
  }else{                         
  }
  }, function(response){
});
var url= UserService.apiRoot+'hmo/get/cards/0';
$http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.cards = response.data.content.data;
        $('#cards2').select2();
    }else{}
    }, function(response){
});
var url= UserService.apiRoot+'hmo/get/plans/-';
$http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.plans = response.data.content.data;
        $('#plans2').select2();
    }else{}
    }, function(response){
});
var url= UserService.apiRoot+'hmo/get/providersheet';
   $http.get(url, config).then(function(response){
     if(response.data.error.status == 0){
         $scope.providersheet = response.data.content.data;
      }else{
     }
     }, function(response){
  });
  $scope.filterTransactions = function(obj){
    obj = arguments.length < 1 ? document.getElementById("btns") : obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var organization = $('#Organization').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    var type = $('#type').find(":selected").val();
    var fromDate = document.getElementById("fromDate").value == ""? "0" : new Date(document.getElementById("fromDate").value).valueOf()/1000;
    var toDate = document.getElementById("toDate").value == ""? "9999999999999999999" : new Date(document.getElementById("toDate").value).valueOf()/1000;
    var url = UserService.apiRoot+'hmo/get/transactions/'+provider+'/'+type+'/'+$scope.orgData.id+'/-/'+fromDate+'/'+toDate+'/-';
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.encounters = response.data.content.data;
            getAmounts($scope.encounters);
            obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
        }else{
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
         }
        }, function(response){
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
    });
  }
  function getAmounts(transactions){
    var negAm = 0;
    var am = 0;
    for(var i = 0; i < transactions.length; i++){
      negAm += parseInt(transactions[0].price);
      am += parseInt(transactions[0].finalPrice);
    }
    $scope.claimAmount = am;
    $scope.finalAmount = negAm;
  }
  $scope.editenrolee = function(obj){
    var obj = obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var config = {
      headers : {
        'Content-Type': 'application/json'
      }
    };
    $scope.datum = {
      data:{
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID'),
        'k': $("#password").val(),
        'oldCardSerial': $scope.enroleeData.cardSerial,
        'newCardSerial': $('#cards2').find(":selected").val(),
        'providerID': $('#providers2').find(":selected").val(),
        'planID': $('#plans2').find(":selected").val(),
        'enroleeID': $scope.enroleeData.enroleeID
      }
    };

    var url= UserService.apiRoot+'hmo/edit/enrolee';
    $http.put(url, $scope.datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $scope.enroleeData.cardSerial = $scope.datum.newCardSerial;
        $scope.enroleeData.planID = $scope.datum.planID;
        $scope.enroleeData.providerID = $scope.datum.providerID;
        $scope.enroleeData.providerName = ($('#providers2').find(":selected").text().substring(0,4) == 'Keep')? $scope.enroleeData.providerName :  $('#providers2').find(":selected").text();
        $scope.enroleeData.planName = ($('#plans2').find(":selected").text().substring(0,4) == 'Keep')? $scope.enroleeData.planName :  $('#plans2').find(":selected").text();
        sessionStorage.setItem('tmp_epfl', JSON.stringify($scope.enroleeData));
        $("#closeBtn").click();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          obj.innerHTML = "Save update";
      }
    }, function(response){
      obj.innerHTML = "Save update";
    });
  }
  $(document).ready(function(){
    $scope.filterTransactions();
  });
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
