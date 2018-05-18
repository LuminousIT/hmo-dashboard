'use strict';


angular
  .module('urbanApp')
  .controller('tableCtrl', ['$scope', '$location', tableCtrl]);

	function tableCtrl($scope, $location) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }else{

    }

    $scope.users = [ 
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
  ];
	  $scope.dataTableOpt = {
	    'ajax': 'data/datatables-arrays.json'
	  };
	}

