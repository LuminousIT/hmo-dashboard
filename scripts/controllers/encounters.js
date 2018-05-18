'use strict';


angular
  .module('urbanApp')
  .controller('encountersCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope', '$timeout', encountersCtrl]);

	function encountersCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope, $timeout) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.ae = {};
    var custom = new $rootScope.customMessage();
    var  url= UserService.apiRoot+'hmo/get/transactions/-/-/-/-/-/0/7799999999';
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
            $scope.encounters = response.data.content.data; 
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
  $scope.updateTransaction = function(status, obj, index){
    if(status == -1){
      $scope.headerStatus = "Reject Transaction";
    }else if(status == 1){
      $scope.headerStatus = "Accept Transaction";
    }else if(status == 10){
      $scope.headerStatus = "Reprocess Transaction";
    }
    $scope.transID = obj.transID;
    $scope.comment = obj.comments;
    $scope.finalPrice = (obj.finalPrice > 0 )? obj.finalPrice : obj.price;
    $scope.status = status;
    $scope.providerID = obj.providerID;
    $scope.editingIndex = index;
  }
  $scope.conclude = function(status, ev){
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
    $scope.datum = datum;
    var config = {
        method: 'POST',
            headers : {
                'Content-Type': 'application/json;'
       }
    }
    if(status == -1){ if(datum.data.comments.length < 5){ $rootScope.mCra(custom.error("Sorry! Comment field cannot be empty at least 5 chars long is required.")); return;}}
    if(status == 1){ if(datum.data.finalPrice < 1){$rootScope.mCra(custom.error("Sorry! Final Price cannot be less than 1.")); return;}}
    if(status == 10){ if(datum.data.comments.length < 5){$rootScope.mCra(custom.error("Sorry! Comment field cannot be empty at least 5 chars long is required.")); return;}}
    var obj = ev.currentTarget;
    obj.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
    $http.post(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $("#closeBtn").click();
        $scope.encounters[$scope.editingIndex].finalPrice = $scope.datum.data.finalPrice;
        $scope.encounters[$scope.editingIndex].comments = $scope.datum.data.comments;
        $scope.encounters[$scope.editingIndex].status = $scope.datum.data.status;
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          obj.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
      }
  }, function(err){
      $rootScope.mCra(custom.error("Something went wrong"));
      obj.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
  });
  }
  $scope.reloadState = function(){
    $state.reload();
  }
  $scope.filterTransactions = function(obj){
    var obj = obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var organization = $('#Organization').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    var type = $('#type').find(":selected").val();
    var fromDate = document.getElementById("fromDate").value == ""? "0" : new Date(document.getElementById("fromDate").value).valueOf()/1000;
    var toDate = document.getElementById("toDate").value == ""? "9999999999999999999" : new Date(document.getElementById("toDate").value).valueOf()/1000;
    var  url= UserService.apiRoot+'hmo/get/transactions/'+provider+'/'+type+'/'+organization+'/-/'+fromDate+'/'+toDate;
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.encounters = response.data.content.data;
            obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
        }else{
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
         }
        }, function(response){
         obj.innerHTML = "<i class=\"fa fa-filter\"></i> Filter Encounter";
    });
  }
  $scope.setID = function(obj){
    $scope.ae = obj;
    document.getElementById("detIO").style.display = "block";
    document.getElementById("drugs").style.display = "none";
    document.getElementById("procedures").style.display = "none";
    document.getElementById("mdiag").style.width = "";
    document.getElementById("goback").style.display = "none";
  };
  $scope.pointFile = function(file){
    return "http://staging-apis-d.touchandpay.me/public/"+file;
  };
  $scope.getDrugs = function(id){
    document.getElementById("drugs").style.display = "block";
    document.getElementById("detIO").style.display = "none";
    document.getElementById("goback").style.display = "block";
    document.getElementById("mdiag").style.width = "80%";
    document.getElementById("procedures").style.display = "none";
    document.getElementById("ldr").style.display = "block";
    var  url= UserService.apiRoot+'hmo/get/pod/drugs/'+id;
    $scope.drugs = {};
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.drugs = response.data.content.data;
      }else{
       }
       document.getElementById("ldr").style.display = "none";
      }, function(response){
        document.getElementById("ldr").style.display = "none";
  });
  };
  $scope.getProcedures = function(id){
    document.getElementById("detIO").style.display = "none";
    document.getElementById("drugs").style.display = "none";
    document.getElementById("procedures").style.display = "block";
    document.getElementById("mdiag").style.width = "80%";
    document.getElementById("goback").style.display = "block";
    document.getElementById("pdr").style.display = "block";
    var  url= UserService.apiRoot+'hmo/get/pod/procedures/'+id;
    $scope.procedures = {};
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.procedures = response.data.content.data;
      }else{
       }
       document.getElementById("pdr").style.display = "none";
      }, function(response){
        document.getElementById("pdr").style.display = "none";
  });
  
  };
  $scope.goBack = function(){
    document.getElementById("detIO").style.display = "block";
    document.getElementById("drugs").style.display = "none";
    document.getElementById("procedures").style.display = "none";
    document.getElementById("mdiag").style.width = "";
    document.getElementById("goback").style.display = "none";
  };
}


  function DatepickerDemoCtrl2($scope) {
    $scope.today = function () {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
      $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
  }
