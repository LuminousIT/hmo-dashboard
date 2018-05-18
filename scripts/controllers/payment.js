'use strict';


angular
  .module('urbanApp')
  .controller('paymentCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope', '$timeout',  paymentCtrl]);
	function paymentCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope, $timeout) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
	if(sessionStorage.getItem("pageSurfed")){
		sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
	}else{
		sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.summaryList = [];
    $scope.detailedList = [];
    $scope.encounters = [];
    function prepareData(bulkObj){
        var counter = 0;
        var summaryList = [];
        var detailedList = [];
        while(counter < bulkObj.length){
            var thisObj = bulkObj[counter];
            var res = findObj(thisObj.providerID, summaryList);
            if(res < 0){
                var obj = {};
                obj.providerID = thisObj.providerID;
                obj.providerName = thisObj.providerName;
                obj.finalPrice = thisObj.finalPrice;
                obj.totalCount = 1;
                summaryList.push(obj);
                var mArr = [];
                mArr.push(thisObj);
                detailedList.push(mArr);
            }else{
                summaryList[res].finalPrice = parseFloat(summaryList[res].finalPrice) + parseFloat(thisObj.finalPrice);
                summaryList[res].totalCount++;
                var extract = detailedList[res];
                extract.push(thisObj);
                detailedList[res] = extract;
            }
            counter++;
        }
        return [summaryList, detailedList];
    }
    function findObj(id, summaryList){
        var counter = 0;
        var res = -1;
        while(counter < summaryList.length){
            if(id == summaryList[counter].providerID){
                res = counter;
                break;
            }
            counter++;
        }
        return res;
    }
    var custom = new $rootScope.customMessage();
    var  url= UserService.apiRoot+'hmo/get/transactions/-/1/-/-/0/7799999999';
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
            var encounters = response.data.content.data;
            var r = prepareData(encounters);
            $scope.summaryList = r[0];
            $scope.detailedList = r[1];
        }else{}
        }, function(response){
    });
    var  url= UserService.apiRoot+'hmo/get/providersheet';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.providers = response.data.content.data;
       }else{                         
      }
      }, function(response){
   });
   var  url= UserService.apiRoot+'hmo/get/organization';
   $http.get(url, config).then(function(response){
     if(response.data.error.status == 0){
         $scope.organizations = response.data.content.data;
      }else{                         
     }
     }, function(response){
  });
  $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('lengthMenu', [[10, 25, 50, 100, 150, -1], [10, 25, 50, 100, 150, "All"]])
    .withOption('drawCallback', function () {
        //initSearch();
        // Use `$timeout` in order to ensure everything is rendered before computing
      $timeout(function() {
        //initSearch();
        compute();
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
        var t2 = row[2].replace(",","").replace("₦","");
        var t = row[3].replace(",","").replace("₦","");
        $scope.tcSum += parseFloat(t2);
        $scope.pSum += parseFloat(t);
      }catch(e){

      }
      });
  }
  $scope.filterTransactions = function(obj){
    var obj = obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var organization = $('#Organization').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    var type = 1;//$('#type').find(":selected").val();
    var fromDate = document.getElementById("fromDate").value == ""? "0" : new Date(document.getElementById("fromDate").value).valueOf()/1000;
    var toDate = document.getElementById("toDate").value == ""? "9999999999999999999" : new Date(document.getElementById("toDate").value).valueOf()/1000;
    var  url= UserService.apiRoot+'hmo/get/transactions/'+provider+'/'+type+'/'+organization+'/-/'+fromDate+'/'+toDate;
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            var encounters = response.data.content.data;
            var r = prepareData(encounters);
            $scope.summaryList = r[0];
            $scope.detailedList = r[1];
            obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
        }else{
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
         }
        }, function(response){
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
    });
  }
  $scope.toggleView = function(index){
      if(arguments.length > 0){
          $scope.encounters = $scope.detailedList[index];
      }
      $("#summary_tbl").toggle("slow");
      $("#details_tbl").toggle("slow");
  }
  $scope.payBtn = function(x, index, ev){
      if(!confirm("Please Confirm the payment by pressing Ok! The process could not be reversed")){ return; }
      ev = ev.currentTarget;
      ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Working";
      $scope.nowUpdate = $scope.detailedList[index];
      var  url= UserService.apiRoot+'hmo/concludetransaction';
      var datum = {
          "data":{
              'status': status,
              'transactionID': $("#transID").val(),
              'providerID': $("#providerID").val(),
              'comments': $("#comment").val(),
              'finalPrice': $("#amount2").val(),
              'username': sessionStorage.getItem('username'),
              'publicKey': sessionStorage.getItem('publicKey'),
              'hmoID': sessionStorage.getItem('HMOID')            
          }
      };
      var config = {
          method: 'POST',
              headers : {
                  'Content-Type': 'application/json;'
         }
      }
      for (var i=0; i < $scope.nowUpdate.length; i++) {
        doPush($scope.nowUpdate[i], ev);        
      }
      ev.innerHTML = "<i class=\"fa fa-money\"> </i> Confirm Payment";
      $state.reload();
  }
  var doPush = function(unit, ev){
    ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Working";
    var  url= UserService.apiRoot+'hmo/concludetransaction';
    var config = {
        method: 'POST',
            headers : {
                'Content-Type': 'application/json;'
       }
    }
    var datum = {
        "data":{
            'status': 2,
            'transactionID': unit.transID,
            'providerID': unit.providerID,
            'comments': unit.comments,
            'finalPrice': unit.finalPrice,
            'username': sessionStorage.getItem('username'),
            'publicKey': sessionStorage.getItem('publicKey'),
            'hmoID': sessionStorage.getItem('HMOID')
        }
    };
    $http.post(url, datum, config).then(function(response){
        if(response.data.error.status == 0){
        }else{
            ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
        }
    }, function(err){
        ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
    });
  }
}