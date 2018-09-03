'use strict';
angular
  .module('urbanApp')
  .controller('reportCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope',  reportCtrl]);
	function reportCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope) {
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
    var config = {
            headers : {
                'username': sessionStorage.getItem('username'),
                'publicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID')
       }
    }
   var  url= UserService.apiRoot+'hmo/get/organization';
   $http.get(url, config).then(function(response){
     if(response.data.error.status == 0){
         $scope.organizations = response.data.content.data;
      }else{                         
     }
     }, function(response){
  });
   url= UserService.apiRoot+'hmo/get/claimscat';
    var config = {
            headers : {
                'username': sessionStorage.getItem('username'),
                'publicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID')
       }
    }
    $http.get(url, config).then(function(response){
        if(response.data.error.status == 0){
            $scope.claimscat = response.data.content.data;
        //  console.log(response.data.content.data);
        }else{}
        }, function(response){
    });
    $scope.getReport = function(ind, ev){
        ev = ev.currentTarget;
        var former = ev.innerHTML;
        var custom = new $rootScope.customMessage();
        var data= {};
        var config = {
                headers : {
                    'username': sessionStorage.getItem('username'),
                    'publicKey': sessionStorage.getItem('publicKey'),
                    'hmoID': sessionStorage.getItem('HMOID')
            }
        };
        ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Fetching";
        if(ind == 1){
            var fromDate = $("#diagnosisfromDate").val() == ""? "0" : new Date($("#diagnosisfromDate").val()).valueOf()/1000;
            var toDate = $("#diagnosistoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#diagnosistoDate").val()).valueOf()/1000;
            var counts = $("#diagnosisNumber").val();
            var url = UserService.apiRoot+'hmo/get/diagnosis-report/'+fromDate+'/'+toDate+'/'+counts;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.diagnosisChartResult = $rootScope.returnImURL(response.data.content.imageURL+'?chks='+Math.floor(Date.now() / 1000));
                    $scope.diagnosisResult = true;
                    console.log($scope.diagnosisChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }else if(ind == 2){
            var fromDate = $("#procedurefromDate").val() == ""? "0" : new Date($("#procedurefromDate").val()).valueOf()/1000;
            var toDate = $("#proceduretoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#proceduretoDate").val()).valueOf()/1000;
            var counts = $("#procedureNumber").val();
            var url = UserService.apiRoot+'hmo/get/procedure-report/'+fromDate+'/'+toDate+'/'+counts;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.procedureChartResult = $rootScope.returnImURL(response.data.content.imageURL+'?chks='+Math.floor(Date.now() / 1000));
                    $scope.procedureResult = true;
                    console.log($scope.procedureChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }else if(ind == 3){
            var fromDate = $("#servicesfromDate").val() == ""? "0" : new Date($("#servicesfromDate").val()).valueOf()/1000;
            var toDate = $("#servicestoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#servicestoDate").val()).valueOf()/1000;
            var url = UserService.apiRoot+'hmo/get/services-report/'+fromDate+'/'+toDate;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.servicesResultFile = $rootScope.returnImURL(response.data.content.fileURL);
                    $scope.servicesResult = response.data.content.data;
                    $scope.servicesResultCount = response.data.content.total;
                    //$scope.sResult = true;
                    //console.log($scope.procedureChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }else if(ind == 4){
            var fromDate = $("#servicesfromDate").val() == ""? "0" : new Date($("#servicesfromDate").val()).valueOf()/1000;
            var toDate = $("#servicestoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#servicestoDate").val()).valueOf()/1000;
            var organization = $('#enroleeorganization').find(":selected").val();
            var url = UserService.apiRoot+'hmo/get/enrolee-report/'+organization+'/'+fromDate+'/'+toDate;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.enroleeFileResult = $rootScope.returnImURL(response.data.content.fileURL);
                    $scope.enroleeResult = response.data.content.data;
                    $scope.enroleeResultCount = response.data.content.total;
                    //$scope.sResult = true;
                    //console.log($scope.procedureChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }else if(ind == 5){
            var fromDate = $("#organizationfromDate").val() == ""? "0" : new Date($("#organizationfromDate").val()).valueOf()/1000;
            var toDate = $("#organizationtoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#organizationtoDate").val()).valueOf()/1000;
            var url = UserService.apiRoot+'hmo/get/organization-report/'+fromDate+'/'+toDate;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.organizationFileResult = $rootScope.returnImURL(response.data.content.fileURL);
                    $scope.organizationResult = response.data.content.data;
                    $scope.organizationResultCount = response.data.content.total;
                    //$scope.sResult = true;
                    //console.log($scope.procedureChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }else if(ind == 6){
            var fromDate = $("#providerfromDate").val() == ""? "0" : new Date($("#providerfromDate").val()).valueOf()/1000;
            var toDate = $("#providertoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#providertoDate").val()).valueOf()/1000;
            var claimsCat = $("#serviceCat").find(":selected").val();
            var url = UserService.apiRoot+'hmo/get/provider-report/'+fromDate+'/'+toDate+'/'+claimsCat;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.providerFileResult = $rootScope.returnImURL(response.data.content.fileURL);
                    $scope.providerResult = response.data.content.data;
                    $scope.providerResultCount = response.data.content.total;
                    //$scope.sResult = true;
                    //console.log($scope.procedureChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }else if(ind == 7){
            var fromDate = $("#claimfromDate").val() == ""? "0" : new Date($("#claimfromDate").val()).valueOf()/1000;
            var toDate = $("#claimtoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#claimtoDate").val()).valueOf()/1000;
            var url = UserService.apiRoot+'hmo/get/claims-entry-report/'+fromDate+'/'+toDate;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.claimFileResult = $rootScope.returnImURL(response.data.content.fileURL);
                    $scope.claimResult = response.data.content.data;
                    //$scope.sResult = true;
                    //console.log($scope.procedureChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }else if(ind == 8){
            var fromDate = $("#claimvfromDate").val() == ""? "0" : new Date($("#claimvfromDate").val()).valueOf()/1000;
            var toDate = $("#claimvtoDate").val() == ""? Math.floor(Date.now() / 1000) : new Date($("#claimvtoDate").val()).valueOf()/1000;
            var url = UserService.apiRoot+'hmo/get/claims-vet-report/'+fromDate+'/'+toDate;
            $http.get(url, config).then(function(response){
                if(response.data.error.status == 0){
                    ev.innerHTML = former;
                    $scope.claimvFileResult = $rootScope.returnImURL(response.data.content.fileURL);
                    $scope.claimvResult = response.data.content.data;
                    //$scope.sResult = true;
                    //console.log($scope.procedureChartResult);
                }else{
                    $rootScope.mCra(custom.error(response.data.error.message));
                    ev.innerHTML = former;
                }
                }, function(response){
                    $rootScope.mCra(custom.error("Something Serious Happened"));
                    ev.innerHTML = former;
            });
        }
    }
    $scope.emailFile = function(x, event){
        $scope.fileUrltoBeEmailed = x;
    }
    $scope.sendEmail = function(ev){
        var custom = new $rootScope.customMessage();
        var  url= UserService.apiRoot+'hmo/send/email/report';
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
              'fileUrl': $scope.fileUrltoBeEmailed,
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
}