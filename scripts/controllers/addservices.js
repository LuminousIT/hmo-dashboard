'use strict';


angular
  .module('urbanApp')
  .controller('addservicesCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope',  addservicesCtrl]);
	function addservicesCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
	if(sessionStorage.getItem("pageSurfed")){
		sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
	}else{
		sessionStorage.setItem("pageSurfed", 1);
	}
	var custom = new $rootScope.customMessage();
	$scope.dtOptions = DTOptionsBuilder.newOptions()
	.withOption('lengthMenu', [[100, 50, 25, 10, -1], [100, 50, 25, 10, "All"]]);
	$scope.isNextAble = false;
	$scope.originalServices = [];
	var servicesSorted = [];
	var originalTotalService = [];
	$scope.lastID = '-';
	$scope.planDetails = JSON.parse(sessionStorage.getItem("tmp_hpln"));
	var config = {
		headers : {
		  'username': sessionStorage.getItem('username'),
		  'publicKey': sessionStorage.getItem('publicKey'),
		  'hmoID': sessionStorage.getItem('HMOID')
		}
		};
		
		/* 
		* Gets the categories 
		*/
	  var  url = UserService.apiRoot+'hmo/get/serviceCategory';
	  $http.get(url, config).then(function(response){
		if(response.data.error.status == 0){
			$scope.servicecategory = response.data.content.data;

			/*
			* Gets all the services by cat
			*/
			var  url = UserService.apiRoot+'hmo/get/planservice/'+$scope.planDetails.id;
			$http.get(url, config).then(function(response){
				if(response.data.error.status == 0){
					$scope.originalServices = response.data.content.data;
					$scope.usf = $scope.filterByCat($scope.originalServices);

					/*
					* Gets the services in effect
					*/
					var  url = UserService.apiRoot+'hmo/get/services/'+$scope.servicecategory[0].id+'/-';
					$http.get(url, config).then(function(response){
						if(response.data.error.status == 0){
							if(response.data.content.data.length == 100 ){ $scope.isNextAble = true; 
								$scope.lastID = response.data.content.data[99].id;
							}else{ $scope.isNextAble = false; }

							$scope.svs = $scope.filterByCurr(response.data.content.data);
						}else{
							$rootScope.mCra(custom.error(response.data.error.message));                 
						}
						}, function(response){
							$rootScope.mCra(custom.error("There seems to be an error! Please check network, sign in again or contact admin"));
					});
				}else{
					$rootScope.mCra(custom.error(response.data.error.message));
				}
				}, function(response){
					$rootScope.mCra(custom.error("There seems to be an error! Please check network, sign in again or contact admin"));
			});
		 }else{
			$rootScope.mCra(custom.error(response.data.error.message));                     
		}
		}, function(response){
			$rootScope.mCra(custom.error("There seems to be an error! Please check network, sign in again or contact admin"));
	 });


	
	$scope.fetchNext = function(obj){
		var id = $('#serviceCat').find(":selected").val();
		var  url= UserService.apiRoot+'hmo/get/services/'+id+'/'+$scope.lastID;
		obj = obj.currentTarget;
		obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> wait...";
		$http.get(url, config).then(function(response){
			if(response.data.error.status == 0){
				if(response.data.content.data.length == 100 ){ $scope.isNextAble = true; 
					$scope.lastID = response.data.content.data[99].id;
				}else{ $scope.isNextAble = false; 
					$rootScope.mCra(custom.warning("You are on last page."));
				}
				$scope.svs = $scope.filterByCurr(response.data.content.data);
				obj.innerHTML = "<i class=\"fa fa-caret-right\"></i> Next Page";
			}else{
				$rootScope.mCra(custom.error(response.data.error.message));                 
			}
			}, function(response){
				$rootScope.mCra(custom.error("There seems to be an error! Please check network, sign in again or contact admin"));
		});
	}

	/*
	* Listens to change in service Category
	*/
  $("#serviceCat").change(function(){
		$("#waitBar").show();
		var id = $('#serviceCat').find(":selected").val();
		var  url= UserService.apiRoot+'hmo/get/services/'+id+'/-';
		$http.get(url, config).then(function(response){
			if(response.data.error.status == 0){
				if(response.data.content.data.length == 100 ){ $scope.isNextAble = true; 
					$scope.lastID = response.data.content.data[99].id;
				}else{ $scope.isNextAble = false; }
				$scope.usf = $scope.filterByCat($scope.originalServices);
				$scope.svs = $scope.filterByCurr(response.data.content.data);
				$("#waitBar").hide("slow"); 
			}else{
				$("#waitBar").hide("slow");              
			}
			}, function(response){
				$("#waitBar").html("slow");
		});
	});

	/*
	* Adding service to 
	*/
	$scope.moveRight = function(obj){
		$scope.originalServices.push(obj);
		var index = $scope.svs.indexOf(obj);
		if(index >= 0){
			$scope.svs.splice(index, 1);
		}else{
			alert("Something serious went wrong");
		}
		$scope.usf = $scope.filterByCat($scope.originalServices);
	}

	/*
	* Removing service from
	*/
	$scope.moveLeft = function(obj){
		$scope.svs.push(obj);
		var index = $scope.originalServices.indexOf(obj);
		if(index >= 0){
			$scope.originalServices.splice(index, 1);
		}else{
			alert("Something serious went wrong");
		}
		$scope.usf = $scope.filterByCat($scope.originalServices);
	}

	/*
	* Sorting services using current category
	*/
	$scope.filterByCat = function(obj){
		var nArr = [];
		var id = $('#serviceCat').find(":selected").val();
		if(parseInt(id)){
			var counter = 0;
			while(counter < obj.length){
				var thisObj = obj[counter].serviceType;
				if(thisObj == id){
					nArr.push(obj[counter]);
				}
				counter++;
			}
			return nArr;
		}else{
			return obj
		}
	}

	/*
	* filter services (removing already added services)
	*/
	$scope.filterByCurr = function(obj){
		var nArr = [];
		if(obj.length > 0){
			var counter = 0;
			while(counter < obj.length){
				if(!$scope.findInArray(obj[counter], $scope.usf)){
					nArr.push(obj[counter]);
				}
				counter++;
			}
		}
		return nArr;
	}

	/*
	* This program finds in array
	*/
	$scope.findInArray = function(needle, haystack){
		var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(typeof haystack[i] == 'object') {
            if($scope.objCmp(haystack[i], needle)) return true;
        } else {
            if(haystack[i] == needle) return true;
        }
    }
    return false;
	}
	$scope.objCmp = function(a1, a2) {
    if (a1.id != a2.id) return false;
    return true;
	}

	$scope.saveChanges = function(obj){
		obj = obj.currentTarget;
		obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Preparing...";
		var service = [];
		var counter = 0;
		while(counter < $scope.originalServices.length){
			var serviceObj = {};
			serviceObj.serviceID = $scope.originalServices[counter].id;
			serviceObj.category = $scope.originalServices[counter].serviceType;
			serviceObj.price = $scope.originalServices[counter].price;
			serviceObj.frequency = $scope.originalServices[counter].frequency;
			serviceObj.duration = $scope.originalServices[counter].duration;
			serviceObj.comment = $scope.originalServices[counter].comment;
			service.push(serviceObj);
			counter++;
		}
		if(service.length > 0){
			var config = {
				headers : {
					"Content-Type":"application/json"
				}
			};
			var datum = {
				"data":{
					'username': sessionStorage.getItem('username'),
					'publicKey': sessionStorage.getItem('publicKey'),
					'hmoID': sessionStorage.getItem('HMOID'),
					"planID":$scope.planDetails.id,
					"services":service
				}
			}
			obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Uploading...";
			var url = UserService.apiRoot+'hmo/create/service';
      $http.post(url, datum, config).then(function(response){
        if(response.data.error.status == 0){
					obj.innerHTML = "<i class=\"fa fa-check-circle\"></i> Save Changes";
          $rootScope.mCra(custom.success(response.data.success.message));
        }else{
					obj.innerHTML = "<i class=\"fa fa-check-circle\"></i> Save Changes";
            $rootScope.mCra(custom.error(response.data.error.message));
        }
			}, function(response){
				obj.innerHTML = "<i class=\"fa fa-check-circle\"></i> Save Changes";
			});
		}else{
			obj.innerHTML = "<i class=\"fa fa-check-circle\"></i> Save Changes";
			$rootScope.mCra(custom.warning("The service is empty. Please select service and try again"));
		}
	}
	$scope.updateData = function(type, index, obj){
		obj = obj.currentTarget;
		if(type == 0){
			$scope.originalServices[index].price = obj.value
		}else if(type == 1){
			$scope.originalServices[index].frequency = obj.value
		}else if(type == 2){
			$scope.originalServices[index].duration = obj.value
		}else if(type == 3){
			$scope.originalServices[index].comment = obj.value
		}
	}
}
