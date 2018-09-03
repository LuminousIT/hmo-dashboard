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
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
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

  $scope.filterTransactions = function(obj){
    obj = arguments.length < 1 ? document.getElementById("btns") : obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var provider = $('#provider').find(":selected").val();
    var type = $('#type').find(":selected").val();
    var fromDate = document.getElementById("fromDate").value == ""? "0" : new Date(document.getElementById("fromDate").value).valueOf()/1000;
    var toDate = document.getElementById("toDate").value == ""? "9999999999999999999" : new Date(document.getElementById("toDate").value).valueOf()/1000;
    var url = UserService.apiRoot+'hmo/get/transactions/'+provider+'/'+type+'/'+$scope.orgData.id+'/-/'+fromDate+'/'+toDate+'/-/-';
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

  $scope.editOrg = function(ev){
    var name = $("#name").val();
    var phone = $("#phone").val();
    var email = $("#email").val();
    var address = $("#address").val();
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
        'orgID':$scope.orgData.id
      }
    };
    var url = UserService.apiRoot+'hmo/update/organization';
    $http.put(url, datum, config).then(function(response){
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
    
  }
	}
