


angular
  .module('urbanApp')
  .controller('providerCtrl', ['$scope', '$interval', '$http', '$window','$localStorage', '$state', '$rootScope', 'COLORS', 'UserService', 'DTOptionsBuilder', providerCtrl]);
	function providerCtrl($scope, $interval, $http, $window, $localStorage, $state, $rootScope, COLORS, UserService, DTOptionsBuilder){
    custom = new $rootScope.customMessage();
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.providers = [];
    var config = {
      headers : {
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID')
      }
    };
    var  url = UserService.apiRoot+'hmo/get/providers/-/-/-';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.providers = response.data.content.data;
       }else{                         
      }
      }, function(response){
   });
   var  url = UserService.apiRoot+'hmo/get/providerCategory';
   $http.get(url, config).then(function(response){
     if(response.data.error.status == 0){
         $scope.serviceCat = response.data.content.data;
      }else{                         
     }
     }, function(response){
  });
  var  url= UserService.apiRoot+'get/states';
  var data= {};
  $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.states = response.data.content.data; 
       }else{                      
      }
      }, function(response){
  });
  $("#stateID").change(function(){
    $("#fetcher").html("<i class='fa fa-spinner fa-spin'></i> Fetching LG");
    var id = $('#stateID').find(":selected").val();
    var  url= UserService.apiRoot+'get/lgs/'+id;
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.lgs = response.data.content.data;
            $("#fetcher").html(""); 
         }else{
            $("#fetcher").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");              
        }
        }, function(response){
            $("#fetcher").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");
    });
  });
$scope.filterProvider = function(obj){
  var cat = $('#cat').find(":selected").val();
  var state = $('#stateID').find(":selected").val();
  var lgid = $('#LGID').find(":selected").val();
  obj.currentTarget.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Wait...";
  var  url = UserService.apiRoot+'hmo/get/providers/'+cat+'/'+state+'/'+lgid;
  $http.get(url, config).then(function(response){
    if(response.data.error.status == 0){
        $scope.providers = response.data.content.data;
        obj.currentTarget.innerHTML = "<i class=\"fa fa-filter\"></i> Filter";
     }else{
      obj.currentTarget.innerHTML = "<i class=\"fa fa-filter\"></i> Filter";                      
    }
    }, function(response){
      obj.currentTarget.innerHTML = "<i class=\"fa fa-filter\"></i> Filter";
 });
}
$scope.updateProvider = function(obj, nstatus, providerID){
  var message = "";
  var status = null;
  if(nstatus == null){
    message = "Are you sure? Please confirm the action to sign up the Provider";
    status = 2;
  }
  if(nstatus == 1){
    message = "Are you sure? Please confirm the action to Deactivate the Provider";
    status = 0;
  }
  if(nstatus == 0){
    message = "Are you sure? Please confirm the action to Reactivate the provider";
    status = 1;
  }
  if(confirm(message)){    
    obj = obj.currentTarget;
    var former = obj.innerHTML;
    obj.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> working...";
    config = {
      headers : {
          'Content-Type':'application/json'
      }
    };
    datum = {
      data : {
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID'),
        'provider': providerID
      }
    };
    var url = UserService.apiRoot+'hmo/set/provider/to/'+status;
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
    });
  }
};

$(".closeBtn").click(function(){
  $(".modal-content").hide("slow");
  $(".bcover").hide("slow");
});

var  url = UserService.apiRoot+'hmo/get/plans/-/-';
 $http.get(url, config).then(function(response){
   if(response.data.error.status == 0){
       $scope.plans = response.data.content.data;
    }else{                         
   }
   }, function(response){
  });

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
  var  url = UserService.apiRoot+'hmo/get/'+x.providerID+'/plans';
  $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.providerPlan = response.data.content.data;
          $scope.editedPlans = [];                
          for(var i = 0; i < $scope.plans.length; i++){
              var found = false;
              var obj = $scope.plans[i];
              for(var ij = 0; ij < $scope.providerPlan.length; ij++){
                  if($scope.providerPlan[ij].planID == obj.id){
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
$scope.updatePlan = function(obj, ev){
  ev = ev.currentTarget;
  if(ev.checked){
      $scope.providerPlan.push(obj);
  }else{
    for(var i = 0; i < $scope.providerPlan.length; i++){
        if($scope.providerPlan[i].planID == obj.id){
            $scope.providerPlan.splice(i, 1);
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
      'providerID':$scope.currentEdit.providerID,
      'planID':$scope.providerPlan
    }
  }
  var url = UserService.apiRoot+'hmo/add/plan/provider';
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
$scope.setProviderID = function(x){
  $scope.pdata = x;
}

$scope.createBalance = function(obj){
  var balance = $("#balance").val();
  var key = $("#password").val();
  var note = $("#notes").val();
  var refrnce = $("#reference").val();
  obj = obj.currentTarget;
  former = obj.innerHTML;
  obj.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> working...";
  var custom = new $rootScope.customMessage();
  if(parseInt(balance)){
    if(key.length >= 3){
      var datum = {
        data:{
          'username': sessionStorage.getItem('username'),
          'publicKey': sessionStorage.getItem('publicKey'),
          'hmoID': sessionStorage.getItem('HMOID'),
          'k': key,
          'providerID':$scope.pdata.providerID,
          'amount':balance,
          'note': note,
          'reference' :refrnce
        }
      }
      var url = UserService.apiRoot+'hmo/update/provider-balance';
      $http.put(url, JSON.stringify(datum), config).then(function(response){
        if(response.data.error.status == 0){
          $rootScope.mCra(custom.success(response.data.success.message));
          $state.reload();
        }else{
            $rootScope.mCra(custom.error(response.data.error.message));
            ////obj.innerHTML = ;
            obj.innerHTML = former;
        }
      }, function(response){
        obj.innerHTML = former;
      });
    }else{
      $rootScope.mCra(custom.error("Invalid password"));
      obj.innerHTML = former;
    }
  }else{
    $rootScope.mCra(custom.error("Invalid Amount in field"));
    obj.innerHTML = former;
  }
}

$scope.getBal = function(a, b){
  return parseFloat(a) + parseFloat(b);
}

   /* $scope.users = [{
      id: 1,
      name: 'awesome user1',
      status: 2,
      group: 4,
      groupName: 'admin'
        },
    {
      id: 2,
      name: 'awesome user2',
      status: undefined,
      group: 3,
      groupName: 'vip'
        },
    {
      id: 3,
      name: 'awesome user3',
      status: 2,
      group: null
        }
  ];

  $scope.statuses = [
    {
      value: 1,
      text: 'status1'
        },
    {
      value: 2,
      text: 'status2'
        },
    {
      value: 3,
      text: 'status3'
        },
    {
      value: 4,
      text: 'status4'
        }
  ];
	  $scope.dataTableOpt = {
	    'ajax': 'data/datatables-arrays.json'
	  };*/
	}

