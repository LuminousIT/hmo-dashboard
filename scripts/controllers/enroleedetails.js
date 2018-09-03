'use strict';
angular
  .module('urbanApp')
  .controller('enroleeCtrl', ['$scope', '$location', '$filter', '$http',  'UserService', '$rootScope', '$state', 'DTOptionsBuilder','$timeout',  enroleeCtrl]);

	function enroleeCtrl($scope, $location, $filter, $http, UserService, $rootScope, $state, DTOptionsBuilder, $timeout) {
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
    var x = sessionStorage.getItem('tmp_epfl');
    $scope.enroleeData = JSON.parse(x);
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
  var  url= UserService.apiRoot+'hmo/get/enrolee/2/-/-/-/'+$scope.enroleeData.eID;
  $http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.dependants = response.data.content.data;
     }else{                         
    }
    }, function(response){
  });
  $scope.getEnrolee = function(eID){
    url= UserService.apiRoot+'hmo/get/enrolee/'+$scope.enroleeData.type+'/'+eID+'/-/-/-';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          sessionStorage.setItem('tmp_epfl', JSON.stringify(response.data.content.data[0]));
          $scope.enroleeData = response.data.content.data[0];
      }else{
        return null
      }
      }, function(response){
    });
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
  var  url= UserService.apiRoot+'hmo/get/transactions/-/-/-/'+$scope.enroleeData.eID+'/0/7799999999/2/-';
  $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.encounters = response.data.content.data; 
      }else{}
      }, function(response){
  });
  var  url = UserService.apiRoot+'hmo/get/providersheet';
  $http.get(url, config).then(function(response){
  if(response.data.error.status == 0){
      $scope.providers = response.data.content.data;
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
var url= UserService.apiRoot+'hmo/get/plans/-/-';
$http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.plans = response.data.content.data;
        $('#plans2').select2();
    }else{}
    }, function(response){
});
  $scope.filterTransactions = function(obj){
    var obj = obj.currentTarget;
    obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
    var organization = $('#Organization').find(":selected").val();
    var provider = $('#provider').find(":selected").val();
    var type = $('#type').find(":selected").val();
    var fromDate = document.getElementById("fromDate").value == ""? "0" : new Date(document.getElementById("fromDate").value).valueOf()/1000;
    var toDate = document.getElementById("toDate").value == ""? "9999999999999999999" : new Date(document.getElementById("toDate").value).valueOf()/1000;
    var url = UserService.apiRoot+'hmo/get/transactions/'+provider+'/'+type+'/'+organization+'/'+$scope.enroleeData.cardSerial+'/'+fromDate+'/'+toDate;
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
        'enroleeID': $scope.enroleeData.eID,
        'fullname': $('#fullname').val(),
        'type': $scope.enroleeData.type,
        'phone': $('#phone').val(),
        'email' : $('#email').val(),
        'address' : $('#address').val(),
        'gender' : $('#gender').find(':selected').val(),
        'pop' : $scope.activeImage,
        'birthday': $('#birthday').val() == ""? "0" : new Date($('#birthday').val()).valueOf()/1000
      }
    };
    var url= UserService.apiRoot+'hmo/edit/enrolee';
    $http.put(url, $scope.datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $scope.activeImage = null;
        /*$scope.enroleeData.cardSerial = $scope.datum.newCardSerial;
        $scope.enroleeData.planID = $scope.datum.planID;
        $scope.enroleeData.providerID = $scope.datum.providerID;
        $scope.enroleeData.providerName = ($('#providers2').find(":selected").text().substring(0,4) == 'Keep')? $scope.enroleeData.providerName :  $('#providers2').find(":selected").text();
        $scope.enroleeData.planName = ($('#plans2').find(":selected").text().substring(0,4) == 'Keep')? $scope.enroleeData.planName :  $('#plans2').find(":selected").text();*/
        $scope.getEnrolee($scope.enroleeData.eID);        
        $("#closeBtn").click();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          obj.innerHTML = "Save update";
      }
    }, function(response){
      obj.innerHTML = "Save update";
    });
  }

  $scope.addsenrolee = function(obj){
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
        'k': $("#npassword").val(),
        'parent': $scope.enroleeData.eID,
        'fullname': $('#nfullname').val(),
        'phone': $('#nphone').val(),
        'email' : $('#nemail').val(),
        'address' : $('#naddress').val(),
        'gender' : $('#ngender').find(':selected').val(),
        'pop' : $scope.activeImage,
        'birthday': $('#nbirthday').val() == ""? "0" : new Date($('#nbirthday').val()).valueOf()/1000,
        'enrroleeID': $("#enroleeID").val()
      }
    };
    var url= UserService.apiRoot+'hmo/create/senrolee';
    $http.put(url, $scope.datum, config).then(function(response){
      if(response.data.error.status == 0){
        $rootScope.mCra(custom.success(response.data.success.message));
        $scope.activeImage = null;
        $state.reload();
      }else{
          $rootScope.mCra(custom.error(response.data.error.message));
          obj.innerHTML = "Save update";
      }
    }, function(response){
      obj.innerHTML = "Save update";
    });
  }
  $scope.toggleTabs = function(sender, otherSender,  objClass, otherClass){
    sender = sender.currentTarget;
    sender.className = "btn btn-primary";
    $(otherSender).attr('class', 'btn btn-info');
    $("."+objClass).show("slow");
    $("."+otherClass).hide("slow");
  }
  $scope.uploadFile = function (input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.readAsDataURL(input.files[0]);
        reader.onload = function (e) {
            //$('#photo-id').attr('src', e.target.result);                    
            var canvas = document.createElement("canvas");
            var imageElement = document.createElement("img");
            imageElement.setAttribute = $('<img>', { src: e.target.result });
            var context = canvas.getContext("2d");
            imageElement.setAttribute.load(function(){
                canvas.width = this.width;
                canvas.height = this.height;
                context.drawImage(this, 0, 0);
                var base64Image = canvas.toDataURL("image/png");
                var data = base64Image.replace(/^data:image\/\w+;base64,/, "");
                $scope.activeImage = data;
                console.log(data);
            });
        }
      }
    }
	}
