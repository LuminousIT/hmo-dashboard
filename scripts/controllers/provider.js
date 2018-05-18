


angular
  .module('urbanApp')
  .controller('providerCtrl', ['$scope', '$interval', '$http', '$window','$localStorage', '$state', '$rootScope', 'COLORS', 'UserService', 'DTOptionsBuilder', providerCtrl]);
	function providerCtrl($scope, $interval, $http, $window, $localStorage, $state, $rootScope, COLORS, UserService, DTOptionsBuilder){
    custom = new $rootScope.customMessage();
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
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

