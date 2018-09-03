'use strict';

angular
  .module('urbanApp')
  .controller('scheduleCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope',  scheduleCtrl]);
	function scheduleCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope) {        
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
        var  url = UserService.apiRoot+'hmo/get/schedule';
            $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.schedules = response.data.content.data;
                $('#provider').select2();         
                //$state.reload();
            }else{                         
            }
            }, function(response){
        });
        $('#modalFling').click(function(){
            $('#add-staff').modal('show');
        });
        $(".closeBtn").click(function(){
            $scope.activeSchedule = null;
            $(".modal-content").hide("slow");
            $(".bcover").hide("slow");
        });
        $(".openBtn").click(function(){
            $(".modal-content").show("slow");
            $(".bcover").show("slow");
        });
      
        var custom = new $rootScope.customMessage();
    	var data= {};

        $scope.createSchedule = function (ev){
            /*if($("#name").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($("#link").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($("#emails").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($('#lastRun').val()){ $rootScope.mCra(custom.error("The Enrolee selected is invalid")); return; }
            if($('#emails').val()){ $rootScope.mCra(custom.error("The Provider selected is invalid")); return; }*/
            var name = $("#name").val();
            var link = $("#link").val();
            var emails = $("#emails").val();
            var lastRun =  new Date(document.getElementById("lastRun").value).valueOf()/1000;
            var frequency = $("#frequency").val();
            ev = ev.currentTarget;
            var former = ev.innerHTML;
            ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> wait...";
            var  url= UserService.apiRoot+'hmo/create/schedule';
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
                'name': name,
                'link': link,
                'emails':emails,
                'lastRun': lastRun,
                'frequency': frequency
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
        $scope.updateSchedule = function (ev){
            /*if($("#name").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($("#link").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($("#emails").val().length < 2){ $rootScope.mCra(custom.error("The code is invalid")); return; }
            if($('#lastRun').val()){ $rootScope.mCra(custom.error("The Enrolee selected is invalid")); return; }
            if($('#emails').val()){ $rootScope.mCra(custom.error("The Provider selected is invalid")); return; }*/
            var name = $("#name").val();
            var link = $("#link").val();
            var emails = $("#emails").val();
            var lastRun =  new Date(document.getElementById("lastRun").value).valueOf()/1000;
            var frequency = $("#frequency").val();
            if(isNaN(lastRun)){lastRun = $scope.activeSchedule.lastRun; }
            ev = ev.currentTarget;
            var former = ev.innerHTML;
            ev.innerHTML = "<i class='fa fa-spinner fa-spin'></i> wait...";
            var  url= UserService.apiRoot+'hmo/update/schedule';
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
                'name': name,
                'link': link,
                'emails':emails,
                'lastRun': lastRun,
                'frequency': frequency,
                'id': $scope.activeSchedule.id
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
        $scope.setObj = function(x){
            $scope.activeSchedule = x;
            $(".modal-content").show("slow");
            $(".bcover").show("slow");
        }
    }