'use strict';


angular
  .module('urbanApp')
  .controller('paymentOrderCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope', '$timeout',  paymentOrderCtrl]);
	function paymentOrderCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope, $timeout) {
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
    var custom = new $rootScope.customMessage();
    var data= {};
    var config = {
            headers : {
                'username': sessionStorage.getItem('username'),
                'publicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID')
       }
    }
   var  url= UserService.apiRoot+'hmo/get/providersheet';
   $http.get(url, config).then(function(response){
     if(response.data.error.status == 0){
         $scope.providers = response.data.content.data;
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
  $scope.filterTransactions = function(obj = document.getElementById("fltrBtn")){
    //var obj = obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var organization = $('#Organization').find(":selected").val();
    var type = 1;//$('#type').find(":selected").val();
    var fromDate = document.getElementById("fromDate").value == ""? "0" : new Date(document.getElementById("fromDate").value).valueOf()/1000;
    var toDate = document.getElementById("toDate").value == ""? "9999999999999999999" : new Date(document.getElementById("toDate").value).valueOf()/1000;
    var  url= UserService.apiRoot+'hmo/get/payment-advice/'+fromDate+'/'+toDate+'/'+organization+'/-';
    sessionStorage.setItem("_fltr_dfr", document.getElementById("fromDate").value); sessionStorage.setItem("_fltr_dt", document.getElementById("toDate").value);
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.invoices = response.data.content.data;
            obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter";
        }else{
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter";
         }
        }, function(response){
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter";
    });
  }

  $scope.updateEndDate = function(obj){
    //obj = obj.currentTarget;
    var x = document.getElementById("invoiceMonths").value;
    var CurrentDate = new Date(Date.parse($("#invoiceStart").val()));
    //CurrentDate.setFullYear(CurrentDate.getFullYear(), CurrentDate.getMonth() + x, 1)
    var nm = parseInt(CurrentDate.getMonth()) + parseInt(x);
    CurrentDate.setMonth(nm, 0);
    var month = CurrentDate.getMonth();
    var day = CurrentDate.getDay();
    var year = CurrentDate.getFullYear();
    month += 1;
    if(month < 10){
        month = "0"+month;
    }
    day += 1;
    if(day < 10){
        day = "0"+day;
    }
    var end = year + '-' + month + '-' + day;
    $('#invoiceEnd').val(end);
  }

  $scope.generateInvoice = function(ev){
    var  url= UserService.apiRoot+'hmo/create/invoice';
    ev = ev.currentTarget;
    var org = $("#org").find(":selected").val();
    var invoiceStart = new Date(document.getElementById("invoiceStart").value).valueOf()/1000;
    var invoiceMonths = $("#invoiceMonths").val();
    var invoiceEnd = new Date(document.getElementById("invoiceEnd").value).valueOf()/1000;
    if(invoiceMonths < 1){
      $rootScope.mCra(custom.success("The Number of months is invalid"));
      return;
    }
    if(invoiceStart < 1){
        $rootScope.mCra(custom.success("The Start date is invalid"));
        return;
      }
    var datum = {
      "data":{
          'orgID': org,
          'dateFrom': invoiceStart,
          'dateTo': invoiceEnd,
          'cycle': invoiceMonths,
          'username': sessionStorage.getItem('username'),
          'publicKey': sessionStorage.getItem('publicKey'),
          'hmoID': sessionStorage.getItem('HMOID')            
      }
    };
    $scope.datum = datum;
    var config = {
        method: 'POST',
            headers : {
                'Content-Type': 'application/json;'
        }
    }
    ev.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
    $http.post(url, datum, config).then(function(response){
        if(response.data.error.status == 0){
            $rootScope.mCra(custom.success(response.data.success.message));
            $state.reload();
        }else{
            $rootScope.mCra(custom.error(response.data.error.message));
            ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
        }
    }, function(err){
        $rootScope.mCra(custom.error("Something went wrong:"+ err));
        ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
    });
  }

  $scope.sendInvoice = function(ev){
    var  url= UserService.apiRoot+'hmo/send/payment-advice';
    ev = ev.currentTarget;
    var emails = $("#emails").val();
    var message = $("#message").val();
    if(emails.length < 1){
      $rootScope.mCra(custom.success("The email is required"));
      return;
    }
    var datum = {
      "data":{
          'emails': emails,
          'message': message,
          'paymentID': $scope.activeInvoice.paymentID,
          'username': sessionStorage.getItem('username'),
          'publicKey': sessionStorage.getItem('publicKey'),
          'hmoID': sessionStorage.getItem('HMOID')            
      }
    };
    $scope.datum = datum;
    var config = {
        method: 'POST',
            headers : {
                'Content-Type': 'application/json;'
        }
    }
    ev.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
    $http.post(url, datum, config).then(function(response){
        if(response.data.error.status == 0){
            $rootScope.mCra(custom.success(response.data.success.message));
            $("#c2").click();
            //$state.reload();
        }else{
            $rootScope.mCra(custom.error(response.data.error.message));
            ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
        }
    }, function(err){
        $rootScope.mCra(custom.error("Something went wrong:"+ err));
        ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
    });
  }

  $scope.emailFile = function(x, index, event){
      $scope.activeInvoice = x;
  }
  $scope.updateAdvice = function(x){
      $scope.actvDt = x;
  }
  $scope.updateStatus = function(ev, x){
      x = $scope.actvDt;
      if(confirm("Please confirm, Are you sure you want to update the status of the Invoice to paid?")){
        var  url= UserService.apiRoot+'hmo/update/payment-advice/to/1';
        ev = ev.currentTarget;
        var datum = {
          "data":{
              'invoiceID': x.paymentID,
              'amount' : x.amount,
              'providerID': x.providerID,
              'notes' : $("#notes").val(),
              'username': sessionStorage.getItem('username'),
              'publicKey': sessionStorage.getItem('publicKey'),
              'hmoID': sessionStorage.getItem('HMOID')
          }
        };
        $scope.datum = datum;
        var config = {
            method: 'POST',
                headers : {
                    'Content-Type': 'application/json;'
            }
        }
        ev.innerHTML = "<i class='fa fa-history fa-spin'></i> working...";
        $http.post(url, datum, config).then(function(response){
            if(response.data.error.status == 0){
                $rootScope.mCra(custom.success(response.data.success.message));
                //$("#c2").click();
                $state.reload();
            }else{
                $rootScope.mCra(custom.error(response.data.error.message));
                ev.innerHTML = "<i class=\"fa fa-history\"> </i> Update Invoice Status";
            }
        }, function(err){
            $rootScope.mCra(custom.error("Something went wrong:"+ err));
            ev.innerHTML = "<i class=\"fa fa-history\"> </i> Update Invoice Status";
        });
      }
  }
  $scope.returnImURL = function(lnk){
      return UserService.webroot.replace("public/", "")+""+lnk;
  }
  $(document).ready(function(){
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10) 
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    if(sessionStorage.getItem("_fltr_dfr") && sessionStorage.getItem("_fltr_dt")){
      $('#fromDate').val(sessionStorage.getItem("_fltr_dfr"));
      $('#toDate').val(sessionStorage.getItem("_fltr_dt"));
    }else{
      $('#fromDate').val(today);
      $('#toDate').val(today);
    }    
    //getAccounts();                
    $scope.filterTransactions();
}); 
}