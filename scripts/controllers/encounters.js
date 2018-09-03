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
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $scope.ae = {};
    var custom = new $rootScope.customMessage();
    //var  url= UserService.apiRoot+'hmo/get/transactions/-/-/-/-/-/0/7799999999';
    var data= {};
    var config = {
            headers : {
                'username': sessionStorage.getItem('username'),
                'publicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID')
       }
    }
    /*$http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.encounters = response.data.content.data;
        //  console.log(response.data.content.data);
        }else{}
        }, function(response){
    });*/
    
    var  url= UserService.apiRoot+'hmo/get/providersheet';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.providers = response.data.content.data;
        //  console.log(response.data.content.data);
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
  $scope.fetchFlagged = function(obj){
    $scope.activeFlag = true;
    $scope.activeFlagID = obj.flag;
    $scope.filterTransactions();
  }
  $scope.deactivateFlag = function(){
    $scope.activeFlag = false;
    $scope.activeFlagID = null;
    $scope.filterTransactions();
  }
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
    //$scope.finalPrice = (obj.finalPrice > 0 )? obj.finalPrice : obj.price;
    $scope.status = status;
    $scope.providerID = obj.providerID;
    //$scope.editingIndex = index;
    updatefinalPrice();
  }
  $scope.updateDrug = function (data, ev, index, type) {
    ev = ev.currentTarget;
    if(type == 0){
      data.finalCost = ev.value;
      $scope.drugs[index] = data
    }else{
      data.comment = ev.value;
      $scope.drugs[index] = data
    }
    
  }
  $scope.updateProcedure = function (data, ev, index, type) {
    ev = ev.currentTarget;
    if(type == 0){
      data.finalCost = ev.value;
      $scope.procedures[index] = data
    }else{
      data.comment = ev.value;
      $scope.procedures[index] = data
    }
    
  }
  $scope.updateFeedingCost = function(ev){
    $scope.encounters[$scope.editingIndex].finalFeedingCost = ev.currentTarget.value;
  }
  function getNewDrugPrice(){
    var drugs = [];
    for(var i = 0; i < $scope.drugs.length; i++){
      var obj = {};
      obj.finalCost = $scope.drugs[i].finalCost;
      obj.id = $scope.drugs[i].id;
      obj.comment = $scope.drugs[i].comment;
      drugs.push(obj);
    }
    return drugs;
  }
  function getNewProcedurePrice(){
    var procedures = [];
    for(var i = 0; i < $scope.procedures.length; i++){
      var obj = {};
      obj.finalCost = $scope.procedures[i].finalCost;
      obj.id = $scope.procedures[i].id;
      obj.comment = $scope.procedures[i].comment;
      procedures.push(obj);
    }
    return procedures;
  }
  function updatefinalPrice(){
    var price = 0;
    price += parseFloat($scope.encounters[$scope.editingIndex].finalFeedingCost);
    for(var i = 0; i < $scope.drugs.length; i++){
      price += parseFloat($scope.drugs[i].finalCost);
    }
    for(var i = 0; i < $scope.procedures.length; i++){
      price += parseFloat($scope.procedures[i].finalCost);
    }
    $scope.finalPrice = price;
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
            'emails': $("#email").val(),
            'drugs':getNewDrugPrice(),
            'procedure':getNewProcedurePrice(),
            'finalFeedingCost': $scope.encounters[$scope.editingIndex].finalFeedingCost,
            'username': sessionStorage.getItem('username'),
            'publicKey': sessionStorage.getItem('publicKey'),
            'hmoID': sessionStorage.getItem('HMOID')            
        }
    };
    $scope.datum = datum;
        console.log(datum);
    var config = {
        method: 'POST',
            headers : {
                'Content-Type': 'application/json;'
       }
    }
    if(status == -1){ if(datum.data.comments.length < 5){ $rootScope.mCra(custom.error("Sorry! Comment field cannot be empty at least 5 chars long is required.")); return;}}
    if(status == 1){ if(datum.data.finalPrice < 1){$rootScope.mCra(custom.error("Sorry! Final Price cannot be less than 1.")); return;}}
    if(status == 10){ if(datum.data.comments.length < 5){$rootScope.mCra(custom.error("Sorry! Comment field cannot be empty at least 5 chars long is required.")); return;}}
    if(status == 10){ if(datum.data.emails.length < 5){$rootScope.mCra(custom.error("Sorry! email field cannot be empty at least 1 valid email is required.")); return;}}
    if(status == 10){if(!confirm("Please note that this cliams will be removed. \n Do you still want to continue?")){ return; }}
    var obj = ev.currentTarget;
    obj.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
    $http.post(url, datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $state.reload();
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
  $scope.filterTransactions = function(obj = document.getElementById("fltrBtn")){
    //var obj = obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var organization = $('#Organization').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    var type = $('#type').find(":selected").val();
    var fromDate = document.getElementById("fromDate").value == ""? "0" : new Date(document.getElementById("fromDate").value).valueOf()/1000;
    var toDate = document.getElementById("toDate").value == ""? "9999999999999999999" : new Date(document.getElementById("toDate").value).valueOf()/1000;
    var flagID = ($scope.activeFlagID == null)? "-" : $scope.activeFlagID;
    sessionStorage.setItem("_fltr_dfr", document.getElementById("fromDate").value)
    sessionStorage.setItem("_fltr_dt", document.getElementById("toDate").value)
    var  url= UserService.apiRoot+'hmo/get/transactions/'+provider+'/'+type+'/'+organization+'/-/'+fromDate+'/'+toDate+'/1/'+flagID;
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
  $scope.setID = function(obj, index){
    $scope.ae = obj;
    $scope.editingIndex = index;
    document.getElementById("detIO").style.display = "block";
    $("#cthis").val(obj.finalFeedingCost);
    // document.getElementById("drugs").style.display = "none";
    // document.getElementById("procedures").style.display = "none";
    // document.getElementById("mdiag").style.width = "";
    // document.getElementById("goback").style.display = "none";
  };
  $scope.pointFile = function(file){
    return "http://apis-s.touchandpay.me/hmo/public/"+file;
  };
  $scope.getDrugs = function(id){
    // document.getElementById("drugs").style.display = "block";
    // document.getElementById("detIO").style.display = "none";
    // document.getElementById("goback").style.display = "block";
    // document.getElementById("mdiag").style.width = "80%";
    // document.getElementById("procedures").style.display = "none";
    // document.getElementById("ldr").style.display = "block";
    var  url= UserService.apiRoot+'hmo/get/pod/drugs/'+id;
    $scope.drugs = {};
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.drugs = response.data.content.data;
          // console.log(response.data.content.data);
      }else{
       }
      });
  };
  $scope.getProcedures = function(id){
    // document.getElementById("detIO").style.display = "none";
    // document.getElementById("drugs").style.display = "none";
    // document.getElementById("procedures").style.display = "block";
    // document.getElementById("mdiag").style.width = "80%";
    // document.getElementById("goback").style.display = "block";
    // document.getElementById("pdr").style.display = "block";
    var  url= UserService.apiRoot+'hmo/get/pod/procedures/'+id;
    $scope.procedures = {};
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.procedures = response.data.content.data;
      }else{
       }
      });
  
  };
  // $scope.goBack = function(){
  //   document.getElementById("detIO").style.display = "block";
  //   document.getElementById("drugs").style.display = "none";
  //   document.getElementById("procedures").style.display = "none";
  //   document.getElementById("mdiag").style.width = "";
  //   document.getElementById("goback").style.display = "none";
  // };
  document.getElementById("btnPrint").onclick = function () {
    printElement(document.getElementById("printContent"));
}

function printElement(elem) {
    var domClone = elem.cloneNode(true);
    
    var $printSection = document.getElementById("printSection");
    
    if (!$printSection) {
        var $printSection = document.createElement("div");
        $printSection.id = "printSection";
        document.body.appendChild($printSection);
    }
    
    $printSection.innerHTML = "";
    $printSection.appendChild(domClone);
    window.print();
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
$(document).on("wheel", "input[type=number]", function (e) {
  $(this).blur();
});

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
