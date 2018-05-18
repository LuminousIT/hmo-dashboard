'use strict';

angular
  .module('urbanApp')
  .controller('pacodeCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope',  pacodeCtrl]);
	function pacodeCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope) {        
        if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
            $location.path("/signin");
        }
        if(sessionStorage.getItem("pageSurfed")){
            sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
        }else{
            sessionStorage.setItem("pageSurfed", 1);
        }
        var custom = new $rootScope.customMessage();
        var config = {
            headers : {
              'username': sessionStorage.getItem('username'),
              'publicKey': sessionStorage.getItem('publicKey'),
              'hmoID': sessionStorage.getItem('HMOID')
            }
        };
        var  url = UserService.apiRoot+'hmo/get/providersheet';
            $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.providers = response.data.content.data;
                $('#provider').select2();         
                //$state.reload();
            }else{                         
            }
            }, function(response){
        });
        var  url= UserService.apiRoot+'hmo/get/enrolee/-/-/-/-';
        $http.get(url, config).then(function(response){
          if(response.data.error.status == 0){
            $('#enrolee').select2(); 
              $scope.enrolees = response.data.content.data;
           }else{                         
          }
          }, function(response){
        });
        $('#modalFling').click(function(){
            $('#add-staff').modal('show');
        });
        $(".closeBtn").click(function(){
            $(".modal-content").hide("slow");
            $(".bcover").hide("slow");
        });
        $(".openBtn").click(function(){
            $(".modal-content").show("slow");
            $(".bcover").show("slow");
        });
      
        var custom = new $rootScope.customMessage();
    	var data= {};
        var config = {
            headers : {
              'username': sessionStorage.getItem('username'),
              'publicKey': sessionStorage.getItem('publicKey'),
              'hmoID': sessionStorage.getItem('HMOID')
            }
        };
        var url= UserService.apiRoot+'hmo/get/cards/-';
        $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.cards = response.data.content.data;
            }else{}
            }, function(response){
        });
        var url= UserService.apiRoot+'hmo/get/code';
        $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.code = response.data.content.data;
            }else{}
            }, function(response){
        });
        $scope.createCode = function (ev){
            if($("#code").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($("#details").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($('#enrolee').find(":selected").val() == 0){ $rootScope.mCra(custom.error("The Enrolee selected is invalid")); return; }
            if($('#provider').find(":selected").val() == 0){ $rootScope.mCra(custom.error("The Provider selected is invalid")); return; }
            ev = ev.currentTarget;
            var former = ev.innerHTML;
            ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> wait...";
            var  url= UserService.apiRoot+'hmo/create/code';
            var config = {
              headers : {
                'Content-Type': 'application/json'
              }
            };
            var datum = {
              data:{
                'username': sessionStorage.getItem('username'),
                'publicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID'),
                'code': $("#code").val(),
                'enrolee': $('#enrolee').find(":selected").val(),
                'providerID': $('#provider').find(":selected").val(),
                'enroleeName': $('#enrolee').find(":selected").text(),
                'providerName': $('#provider').find(":selected").text(),
                'comment': $("#details").val()
              }
            };
            $http.post(url, datum, config).then(function(response){
              if(response.data.error.status == 0){
                $rootScope.mCra(custom.success(response.data.success.message));
                $state.reload();
              }else{
                  $rootScope.mCra(custom.error(response.data.error.message));
                  ev.innerHTML = former;
              }
            }, function(response){
              ev.innerHTML = former;
            });
        }
    }