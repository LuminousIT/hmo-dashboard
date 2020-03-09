
angular
    .module('urbanApp')
    .controller('ModalDemoCtrl', ['$scope', '$modal', '$log', ModalDemoCtrl])
    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', '$http', '$rootScope', '$state', 'UserService', 'items', ModalInstanceCtrl])
    .controller('customProviderCtrl', ['$scope', '$location', '$http', '$rootScope', 'UserService', '$filter', 'editableOptions', 'editableThemes', 'DTOptionsBuilder', customProviderCtrl]);


function customProviderCtrl($scope, $location, $http, $rootScope, UserService, $modalInstance, items, $modal, $log, $filter, editableOptions, editableThemes, DTOptionsBuilder) {
    if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if (sessionStorage.getItem("pageSurfed")) {
        sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    } else {
        sessionStorage.setItem("pageSurfed", 1);
    }
    $scope.addservices = function (planObj) {
        planObj = JSON.stringify(planObj);
        sessionStorage.setItem("tmp_hpln", planObj);
        $location.path("/addservices");
    };
    var custom = new $rootScope.customMessage();
    var config = {
        headers: {
            'username': sessionStorage.getItem('username'),
            'publicKey': sessionStorage.getItem('publicKey'),
            'hmoID': sessionStorage.getItem('HMOID')
        }
    };
    var url = UserService.apiRoot + 'hmo/get/custom-providers';
    $http.get(url, config).then(function (response) {
        if (response.data.error.status == 0) {
            $scope.providers = response.data.content.data;
            if ($scope.providers.length > 0) {
                var t = document.getElementsByClassName("dataTables_empty");
            }
            //$state.reload();
        } else {
        }
    }, function (response) {
    });
    $scope.dataTableOpt = {
        'ajax': 'data/datatables-arrays.json'
    };
    $scope.savePlan = function (data, id) {
        //$scope.user not updated yet
        angular.extend(data, {
            id: id
        });
        config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        data.publicKey = sessionStorage.getItem('publicKey');
        data.username = sessionStorage.getItem('username');
        data.hmoID = sessionStorage.getItem('HMOID');
        datum = {
            data: data
        };
        $("#toaster").show("slow");
        var url = UserService.apiRoot + 'hmo/edit/plan';
        $http.put(url, datum, config).then(function (response) {
            if (response.data.error.status == 0) {
                $("#toaster").hide("slow");
                $rootScope.mCra(custom.success(response.data.success.message));
                $scope.cancel();
                $state.reload();
            } else {
                $("#toaster").hide("slow");
                $rootScope.mCra(custom.error(response.data.error.message));
            }
        }, function (response) {
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
    var config = {
        headers: {
            'username': sessionStorage.getItem('username'),
            'publicKey': sessionStorage.getItem('publicKey'),
            'hmoID': sessionStorage.getItem('HMOID')
        }
    };
    var url = UserService.apiRoot + 'hmo/get/plans/-/-';
    $http.get(url, config).then(function (response) {
        if (response.data.error.status == 0) {
            $scope.plans = response.data.content.data;
            //$state.reload();
        } else {
        }
    }, function (response) {
    });
    url = UserService.apiRoot + 'get/states';
    $http.get(url, config).then(function (response) {
        if (response.data.error.status == 0) {
            $scope.states = response.data.content.data;
            //$state.reload();
        } else {
        }
    }, function (response) {
    });
    var oFileIn;
    /*$(function() {
        oFileIn = document.getElementById('providers');
        if(oFileIn.addEventListener) {
            oFileIn.addEventListener('change', filePicked, false);
        }
    }); */
  
  $scope.filePicked = function(oEvent) {
      // Get The File From The Input
      var oFile = oEvent.files[0];
      var sFilename = oFile.name;
      // Create A File Reader HTML5
      var reader = new FileReader();    
      // Ready The Event For When A File Gets Selected
      reader.onload = function(e) {
        var data = e.target.result;
        var cfb = XLSX.read(data, {type: 'binary'});
        console.log(cfb)
        cfb.SheetNames.forEach(function(sheetName) {
            // Obtain The Current Row As CSV
            var sCSV = XLS.utils.make_csv(cfb.Sheets[sheetName]);   
            var oJS = XLS.utils.sheet_to_json(cfb.Sheets[sheetName]);  
            //$("#my_file_output").html(sCSV);
            console.log(oJS)
            $scope.oJSON = oJS
        });
      };
      
      // Tell JS To Start Reading The File.. You could delay this if desired
      reader.readAsBinaryString(oFile);
  }
    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };
    $(document).ready(function(){
        
    });
    $scope.addProviders = function (obj) {
        var stateObj = document.getElementById("states");
        var planObj = document.getElementById("plan");
        var state = stateObj.options[stateObj.selectedIndex].value;
        var plan = planObj.options[planObj.selectedIndex].value;        
        if (state < 1) {
            $rootScope.mCra(custom.error("Sorry, You have to select a state"));
            return;
        }
        if (plan < 1) {
            $rootScope.mCra(custom.error("Sorry, You have to select a plan"));
            return;
        }
        config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        datum = {
            data: {
                'username': sessionStorage.getItem('username'),
                'publicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID'),
                'planID': plan,
                'state': state,
                'providers': $scope.oJSON
            }
        };
        var obj = obj.currentTarget;
        obj.innerHTML = "<i class=\"fa fa-spin fa-spinner\"></i> wait...";
        var url = UserService.apiRoot + 'hmo/create/custom-provider';
        $http.post(url, datum, config).then(function (response) {
            if (response.data.error.status == 0) {
                $rootScope.mCra(custom.success(response.data.success.message));
                $state.reload();
            } else {
                obj.innerHTML = "save";
                $rootScope.mCra(custom.error(response.data.error.message));
            }
        }, function (response) {
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
