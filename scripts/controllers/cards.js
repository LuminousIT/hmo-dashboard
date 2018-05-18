'use strict';

angular
  .module('urbanApp')
  .controller('cardsCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope',  cardsCtrl]);
	function cardsCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope) {        
        if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
            $location.path("/signin");
        }
        if(sessionStorage.getItem("pageSurfed")){
            sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
        }else{
            sessionStorage.setItem("pageSurfed", 1);
        }
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
        $scope.setCardTo = function (a,b, ev){
            if(a == 1){ a = 0; var message = "Are you sure? The Enrolee will be blocked"; }else{ a = 1; var message = "are you sure? the Enrolee will be Unblocked"; }
            if(!confirm(message)){ return; }
            ev = ev.currentTarget;
            var former = ev.innerHTML;
            ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> wait...";
            var  url= UserService.apiRoot+'hmo/set/enrolee/'+b+'/'+a;
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