angular
  .module('urbanApp')
  .controller('claimsCatCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope', '$timeout', claimsCatCtrl]);

	function claimsCatCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope, $timeout) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
    if(sessionStorage.getItem("pageSurfed")){
      sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
    }else{
      sessionStorage.setItem("pageSurfed", 1);
    }

    var custom = new $rootScope.customMessage();
    var  url= UserService.apiRoot+'hmo/get/claimscat';
    var data= {};
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
    $scope.createCat = function(ev){
      var  url= UserService.apiRoot+'hmo/create/claimscat';
      ev = ev.currentTarget;
      var name = $("#name").val();
      var detail = $("#details").val();
      if(name.length < 4){
        $rootScope.mCra(custom.success("The Category name is invalid"));
        return;
      }
      var datum = {
        "data":{
            'catName': name,
            'description': detail,
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
          $state.reload();
        }else{
            $rootScope.mCra(custom.error(response.data.error.message));
            ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
        }
    }, function(err){
        $rootScope.mCra(custom.error("Something went wrong:"+ err));
        ev.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
    });
    }

    $scope.purge = function(x){
      if(confirm("Are you sure you want to delete the item?")){
        var  url= UserService.apiRoot+'hmo/delete/claimscat';
        var datum = {
          "data":{
              'catID': x.id,
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
      //ev.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
      $http.post(url, datum, config).then(function(response){
          if(response.data.error.status == 0){
            $rootScope.mCra(custom.success(response.data.success.message));
            $state.reload();
          }else{
              $rootScope.mCra(custom.error(response.data.error.message));
              //obj.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
          }
      }, function(err){
          $rootScope.mCra(custom.error("Something went wrong:"+err));
          //obj.innerHTML = "Update <i class=\"fa fa-chevron-circle-right\"></i>";
      });
      }
    }
//modal 1 function
    $(".closeBtn").click(function(){
      $(".modal-content").hide("slow");
      $(".dcover").hide("slow");
    }); 

    $(".openBtn").click(function(){
      $(".modal-content").show("slow");
      $(".dcover").show("slow");
    });
    }