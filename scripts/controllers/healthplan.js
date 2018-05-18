
angular
  .module('urbanApp')
  .controller('ModalDemoCtrl', ['$scope', '$modal', '$log',  ModalDemoCtrl])
  .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', '$http', '$rootScope', '$state', 'UserService', 'items', ModalInstanceCtrl])
  .controller('healthplanCtrl', ['$scope', '$location', '$http', '$rootScope', 'UserService', '$filter', 'editableOptions', 'editableThemes',  healthplanCtrl]);


	function healthplanCtrl($scope, $location, $http, $rootScope, UserService, $modalInstance, items, $modal, $log, $filter, editableOptions, editableThemes) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.addservices = function(planObj) {
      planObj = JSON.stringify(planObj);
      sessionStorage.setItem("tmp_hpln", planObj);
      $location.path("/addservices");
    };
    var custom = new $rootScope.customMessage();
    var config = {
      headers : {
        'username': sessionStorage.getItem('username'),
        'publicKey': sessionStorage.getItem('publicKey'),
        'hmoID': sessionStorage.getItem('HMOID')
      }
    };
    var  url = UserService.apiRoot+'hmo/get/plans/-';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.plans = response.data.content.data;
          if($scope.plans.length > 0){
            var t = document.getElementsByClassName("dataTables_empty");
          }
          //$state.reload();
       }else{                         
      }
      }, function(response){
   });
    //editableThemes.bs3.inputClass = 'input-sm';
      //editableThemes.bs3.buttonsClass = 'btn-sm';
      //editableOptions.theme = 'bs3';


    /*$scope.plans = [
    {
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
  ];*/
	  $scope.dataTableOpt = {
	    'ajax': 'data/datatables-arrays.json'
	  };
    $scope.checkName = function (data, id) {
      if (id === 2 && data !== 'awesome') {
        return 'Username 2 should be `awesome`';
      }
    };
    $scope.savePlan = function (data, id) {
      //$scope.user not updated yet
      angular.extend(data, {
        id: id
      });
      config = {
        headers : {
            'Content-Type':'application/json'
        }
      };
      data.publicKey = sessionStorage.getItem('publicKey');
      data.username = sessionStorage.getItem('username');
      data.hmoID = sessionStorage.getItem('HMOID');
      datum = {
        data : data
      };
      $("#toaster").show("slow");
      var url = UserService.apiRoot+'hmo/edit/plan';
        $http.put(url, datum, config).then(function(response){
          if(response.data.error.status == 0){
            $("#toaster").hide("slow");
            $rootScope.mCra(custom.success(response.data.success.message));
            $scope.cancel();
            $state.reload();
          }else{
            $("#toaster").hide("slow");
              $rootScope.mCra(custom.error(response.data.error.message));
          }
      }, function(response){
        $("#toaster").hide("slow");
      });
      //return $http.post('/saveUser', data);
    };

    // remove user
    $scope.removeUser = function (index) {
      $scope.users.splice(index, 1);
    };

    // add user
    $scope.addUser = function () {
      $scope.inserted = {
        id: $scope.users.length + 1,
        name: '',
        status: null,
        group: null
      };
      $scope.users.push($scope.inserted);
    };

    $scope.checkName2 = function (data) {
      if (data !== 'awesome') {
        return 'Username should be `awesome`';
      }
    };

    $scope.saveColumn = function (column) {
      var results = [];
      /*angular.forEach($scope.users, function(user) {
        results.push($http.post('/saveColumn', {column: column, value: user[column], id: user.id}));
      })
      return $q.all(results);*/
    };

    $scope.checkName3 = function (data, id) {
      if (id === 2 && data !== 'awesome') {
        return 'Username 2 should be `awesome`';
      }
    };

    // filter users to show
    $scope.filterUser = function (user) {
      return user.isDeleted !== true;
    };

    // mark user as deleted
    $scope.deleteUser = function (id) {
      var filtered = $filter('filter')($scope.users, {
        id: id
      });
      if (filtered.length) {
        filtered[0].isDeleted = true;
      }
    };

    // add user
    $scope.addUser2 = function () {
      $scope.users.push({
        id: $scope.users.length + 1,
        name: '',
        status: null,
        group: null,
        isNew: true
      });
    };

    // cancel all changes
    $scope.cancel = function () {
      for (var i = $scope.users.length; i--;) {
        var user = $scope.users[i];
        // undelete
        if (user.isDeleted) {
          delete user.isDeleted;
        }
        // remove new
        if (user.isNew) {
          $scope.users.splice(i, 1);
        }
      }
    };

    // save edits
    $scope.saveTable = function () {
      var results = [];
      for (var i = $scope.users.length; i--;) {
        var user = $scope.users[i];
        // actually delete user
        if (user.isDeleted) {
          $scope.users.splice(i, 1);
        }
        // mark as not new
        if (user.isNew) {
          user.isNew = false;
        }

        // send on server
        //results.push($http.post('/saveUser', user));
      }

      return; // $q.all(results);
    };
	};


function ModalDemoCtrl($scope, $modal, $log) {
  $scope.items = ['item1', 'item2', 'item3'];
  $scope.open = function (size) {
    var modalInstance = $modal.open({
      templateUrl: 'tariffModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
function ModalInstanceCtrl($scope, $modalInstance, $http, $rootScope, $state, UserService, items) {
  var custom = new $rootScope.customMessage();
  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };
  $scope.addPlans = function(obj){
    var planName = $("#planName").val();
    var description = $("#planDescription").val();
    if(planName.length < 3){
      $rootScope.mCra(custom.error("Sorry, the plan Name Can not be less than 4 characters"));
      return;
    }
    if(planDescription.length < 5){
      $rootScope.mCra(custom.error("Sorry, the plan Description Can not be less than 6 characters"));
      return;
    }
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
        'planName':planName,
        'description':description
      }
    };
    var obj = obj.currentTarget;
    obj.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> wait...";
    var url = UserService.apiRoot+'hmo/create/plan';
      $http.post(url, datum, config).then(function(response){
        if(response.data.error.status == 0){
          $rootScope.mCra(custom.success(response.data.success.message));
          $scope.cancel();
          $state.reload();
          obj.innerHTML = "save";
        }else{
            obj.innerHTML = "save";
            $rootScope.mCra(custom.error(response.data.error.message));
        }
    }, function(response){
      obj.innerHTML = "save";
    });
  }

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}
