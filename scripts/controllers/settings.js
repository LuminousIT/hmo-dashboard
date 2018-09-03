'use strict';


angular
  .module('urbanApp')
  .controller('settingsCtrl', ['$scope', '$location', '$http', '$state', 'UserService', 'DTOptionsBuilder', '$rootScope',  settingsCtrl]);
	function settingsCtrl($scope, $location, $http, $state, UserService, DTOptionsBuilder, $rootScope) {
		if (!sessionStorage.getItem("username") || !sessionStorage.getItem("publicKey")) {
        $location.path("/signin");
    }
	if(sessionStorage.getItem("pageSurfed")){
		sessionStorage.setItem("pageSurfed", parseInt(sessionStorage.getItem("pageSurfed")) + 1);
	}else{
		sessionStorage.setItem("pageSurfed", 1);
	}
    var custom = new $rootScope.customMessage();
    var obj = {};
    obj.admin = new Array();
    obj.admin[0] = {};
    obj.admin[0].staffName = sessionStorage.getItem('staffName');
    obj.admin[0].username = sessionStorage.getItem('username');
    obj.admin[0].email = sessionStorage.getItem('email');
    obj.admin[0].phone = sessionStorage.getItem('phone');
    obj.admin[0].address = sessionStorage.getItem('address');
    obj.admin[0].gender =  sessionStorage.getItem('gender');
    obj.admin[0].providerID =  sessionStorage.getItem('providerID');
    $scope.obj = obj.admin;
    var  url= UserService.apiRoot+'get/states';
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
            $scope.states = response.data.content.data; 
        }else{}
        }, function(response){
    });
    $("#staffstate").change(function(){
        $("#fetcher2").html("<i class='fa fa-spinner fa-spin'></i> Fetching matched LG");
        var id = $('#staffstate').find(":selected").val();
        var  url= UserService.apiRoot+'get/lgs/'+id;
        $http.get(url, config).then(function(response){
            if(response.data.error.status == 0){
                $scope.lgstaff = response.data.content.data;
                $("#fetcher2").html(""); 
             }else{
                $("#fetcher2").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");              
            }
            }, function(response){
                $("#fetcher2").html("<i class='fa fa-exclamation-circle'></i> Fetch Failed");
        });
    });
    var  url= UserService.apiRoot+'hmo/get/providersheet';
    $http.get(url, config).then(function(response){
      if(response.data.error.status == 0){
          $scope.providersheet = response.data.content.data;
       }else{                         
      }
      }, function(response){
   });

   var  url= UserService.apiRoot+'hmo/get/staff/-';
   $http.get(url, config).then(function(response){
     if(response.data.error.status == 0){
         $scope.staffs = response.data.content.data;
      }else{                         
     }
     }, function(response){
  });
    $scope.staffsignup = function(obj) {
        var  url= UserService.apiRoot+'hmo/create/staff';
        var data = {
            "data":{
                'username': $("#staffusername").val(),
                'password': $("#staffpassword").val(),
                'name': $("#stafffullname").val(),
                'address': $("#staffaddress").val(),
                "phone": $("#staffphone").val(),
                "email": $("#staffemail").val(),
                "state": $('#staffstate').find(":selected").val(),
                "LG": $('#staffLG').find(":selected").val(),
                "gender": $('#staffgender').find(":selected").val(),
                "providerID": $('#accessLevel').find(":selected").val(),
                'adminUsername': sessionStorage.getItem('username'),
                'adminPublicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID')
            }
        };
        var config = {
        		method: 'POST',
                headers : {
                    'Content-Type': 'application/json;'
           }
        }
        if(data.data.name.length < 5){$rootScope.mCra(custom.error("Fullname cannot be less than 5 Chars.")); return; }
        if(data.data.state < 1){$rootScope.mCra(custom.error("Selected State is invalid.")); return; }
        if(data.data.LG < 1){$rootScope.mCra(custom.error("The LG is invalid.")); return; }
        if(data.data.email.length < 2){$rootScope.mCra(custom.error("email address is required.")); return; }
        if(data.data.password.length < 6){$rootScope.mCra(custom.error("Expecting at least 6 characters in password field.")); return; }
        if(data.data.password !== $("#staffpasswordagain").val()){$rootScope.mCra(custom.error("The password do not match.")); return; }
        obj.currentTarget.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
        $http.post(url, data, config).then(function(response){
            if(response.data.error.status == 0){
                document.getElementById("closeBtn1").click();
                $state.reload();
                $rootScope.mCra(custom.success(response.data.success.message+". The new admin can Now login to thier account"));
            }else{
                $rootScope.mCra(custom.error(response.data.error.message));
                obj.currentTarget.innerHTML = "Create Account";
            }
        }, function(err){
            $rootScope.mCra(custom.error("Something went wrong"));
            obj.currentTarget.innerHTML = "Create Account";
        });
    }
    $scope.editprofile = function(obj){
        $scope.editingUser = obj;
    };
    $scope.effectChange = function(obj) {
        var  url= UserService.apiRoot+'hmo/edit/staff';
        var data = {
            "data":{
                'username': $("#editusername").val(),
                'password': $("#editpassword").val(),
                'name': $("#editfullname").val(),
                'address': $("#editaddress").val(),
                "phone": $("#editphone").val(),
                "email": $("#editemail").val(),
                "gender": $('#editgender').find(":selected").val(),
                "providerID": $('#editLevel').find(":selected").val(),
                'adminUsername': sessionStorage.getItem('username'),
                'adminPublicKey': sessionStorage.getItem('publicKey'),
                'hmoID': sessionStorage.getItem('HMOID')
            }
        };
        var config = {
        		method: 'PUT',
                headers : {
                    'Content-Type': 'application/json;'
           }
        }
        if(data.data.name.length < 5){$rootScope.mCra(custom.error("Fullname cannot be less than 5 Chars.")); return; }        
        if(data.data.email.length < 2){$rootScope.mCra(custom.error("email address is required.")); return; }
        if(data.data.password.length > 0 && data.data.password.length < 6){$rootScope.mCra(custom.error("Expecting at least 6 characters in password field.")); return; }
        if(data.data.password !== $("#editpasswordagain").val()){$rootScope.mCra(custom.error("The password do not match.")); return; }
        obj.currentTarget.innerHTML = "<i class='fa fa-cog fa-spin'></i> working...";
        $http.put(url, data, config).then(function(response){
            if(response.data.error.status == 0){
                document.getElementById("closeBtn2").click();
                $state.reload();
                $rootScope.mCra(custom.success(response.data.success.message));
            }else{
                $rootScope.mCra(custom.error(response.data.error.message));
                obj.currentTarget.innerHTML = "Save Changes";
            }
        }, function(err){
            $rootScope.mCra(custom.error("Something went wrong"));
            obj.currentTarget.innerHTML = "Save Changes";
        });
    }


   if (false) {
      // $location.path("/login");
   }else{
       $scope.editPass = function(data, obj){
       if(arguments.length == 2){
       }else{
           obj = document.getElementById("editbtn");
           obj.innerHTML = document.getElementById("work").innerHTML;
           password = document.getElementById("oldPassword").value;
           newPassword = document.getElementById("newPassword").value;
           var  url= UserService.apiRoot+'admin/update/password';
           var dparam = {
                   'username': sessionStorage.getItem('username'),
                   'publicKey': sessionStorage.getItem('publickey'),
                   'oldPassword':password,
                   'newPassword': newPassword

           };
           data = $.param(dparam);
           var config = {
                   headers : {
                       'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
           }
           };
           $http.put(url, data, config).then(function(response){
               if(response.data.error.status == 0){
                   $rootScope.mCra(custom.success(response.data.success.message));
                   obj.innerHTML = "save";
                   document.getElementById("closeBtn2").click();
                   $scope.editPass = response.data.content.data;
                   sessionStorage.setItem('publickey',response.data.content.publicKey);
                   document.getElementById("oldPassword").value = "";
                   document.getElementById("newPassword").value = "";
               }else{
                   $rootScope.mCra(custom.error(response.data.error.message));
                   obj.innerHTML = "save";
               }
           }, function(response){
               $rootScope.mCra(custom.error(response.data.error.message));
               obj.innerHTML = "save";
           });

       }
   }
   $scope.purge = function(obj){
       obj.innerHTML = '<span class="fa fa-history fa-spin"></span>Restore Sytem to Default';
       if(confirm("Are You sure? This process will wipe all transactions, Staff List, and restore cards to Initial State?")){
           var a = Math.floor((Math.random() * 100) + 1);
           var b = Math.floor((Math.random() * 100) + 1);
           var mathOperator = ['+', '-', '*', '/'];
           var str = a +mathOperator[Math.floor((Math.random() * 3) + 0)]+ b;
           var ans = prompt("Please solve the Arithmetic below to continue: \n "+str);
           if(ans == eval(str)){
               ans = prompt("Kindly Write the Access Word below to continue \n");
               if(ans){
                   var url= UserService.apiRoot+'admin/purge/system';
                   var data= $.param({
                       'username': sessionStorage.getItem('username'),
                       'publicKey': sessionStorage.getItem('publickey'),
                       'magic': ans
                   });
                   var config = {
                       headers : {
                           'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                       }
                   }
                   $http.post(url, data, config).then(function(response){
                       if(response.data.error.status == 0){
                           $rootScope.mCra(custom.success(response.data.success.message));
                       }else{
                           $rootScope.mCra(custom.error(response.data.error.message));
                       }
                       obj.innerHTML = '<span class="fa fa-history"></span>Restore Sytem to Default';
                       }, function(response){
                   });
               }else{
                   $rootScope.mCra(custom.error("The Action will not continue!!"));
               }
           }else{
               $rootScope.mCra(custom.error("The Answer is "+eval(str)+". The Action will not continue!!"));
           }
       }

   }
   $scope.saveAdmin = function(obj) {       
       obj = document.getElementById("Savebtn");
       obj.innerHTML = document.getElementById("workr").innerHTML;
       fullname = document.getElementById("fullname").value;
       password = document.getElementById("password").value;
       email = document.getElementById("email").value;
       phone = document.getElementById("phone").value;
       gender = document.getElementById("gender").value;
       address = document.getElementById("address").value;
       username = document.getElementById("username").value;
       accLevel = document.getElementById("accessLevel").options[document.getElementById("accessLevel").selectedIndex].value;
       var  url= UserService.apiRoot+'admin/create/profile';
       var data = $.param({
               'uname': sessionStorage.getItem('username'),
               'publicKey': sessionStorage.getItem('publickey'),
               'fullname':fullname,
               'password':password,
               'email':email,
               'phone':phone,
               'gender':gender,
               'username':username,
               'address':address,
               'canteenID':accLevel
       });
       var config = {
               headers : {
                   'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
       }
       $http.post(url, data, config).then(function(response){
           if(response.data.error.status == 0){
                $rootScope.mCra(custom.success(response.data.success.message));
                obj.innerHTML = "save";
               document.getElementById("closeBtn").click();
               $scope.admin = response.data.content.data;
               document.getElementById("fullname").value = "";
               document.getElementById("password").value = "";
               document.getElementById("email").value = "";
               document.getElementById("phone").value = "";
               document.getElementById("gender").value = "";
               document.getElementById("address").value = "";
               document.getElementById("username").value = "";
           }else{
               $rootScope.mCra(custom.error(response.data.error.message));
           }
           obj.innerHTML = "save";
       }, function(response){
       });
   };
       $scope.updatePoint = function(ev){
           obj = ev.currentTarget;
           var amount = document.getElementById("amount").value;
           var key = document.getElementById("key").value;
           if(amount < 1){ $rootScope.mCra(custom.error("The amount cannot be less than #1")); return; }
           if(key.length < 1){ $rootScope.mCra(custom.error("The password is invalid!")); return; }
           if(!confirm("Are you sure of the point value of #"+amount+"? ")){ return; }
           obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Wait...";
           var  url= UserService.apiRoot+'admin/set/pointLimit';
           var data = $.param({
                   'username': sessionStorage.getItem('username'),
                   'publicKey': sessionStorage.getItem('publickey'),
                   'amount':amount,
                   'k':key
           });
           var config = {
                   headers : {
                       'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
           }
           }
           $http.post(url, data, config).then(function(response){
               if(response.data.error.status == 0){
                   $rootScope.mCra(custom.success(response.data.success.message));
                   obj.innerHTML = "save";
                   document.getElementById("closeBtn2").click();
                   document.getElementById("key").value = "";
                   $scope.spoints = response.data.content.data[0].tlimit;
               }else{
                   $rootScope.mCra(custom.error(response.data.error.message));
               }
               obj.innerHTML = "save";
           }, function(response){
           });
       };
       $scope.fastPoint = function(ev){
           obj = ev.currentTarget;
           var amount = document.getElementById("amount2").value;
           var key = document.getElementById("key2").value;
           if(amount < 1){ $rootScope.mCra(custom.error("The amount cannot be less than #1")); return; }
           if(key.length < 1){ $rootScope.mCra(custom.error("The password is invalid!")); return; }
           if(!confirm("Are you sure of the point value of #"+amount+"? ")){ return; }
           obj.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Wait...";
           var  url= UserService.apiRoot+'admin/addto/pointLimit';
           var data = $.param({
                   'username': sessionStorage.getItem('username'),
                   'publicKey': sessionStorage.getItem('publickey'),
                   'amount':amount,
                   'k':key
           });
           var config = {
                   headers : {
                       'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
           }
           $http.post(url, data, config).then(function(response){
               if(response.data.error.status == 0){
                    $rootScope.mCra(custom.success(response.data.success.message));
                    obj.innerHTML = "save";
                    //document.getElementById("closeB").click();
                   document.getElementById("key2").value = "";
                   $scope.todayleft = response.data.content.data[0].left;
               }else{
                   $rootScope.mCra(custom.error(response.data.error.message));
               }
               obj.innerHTML = "save";
           }, function(response){
           });
       };
   }
}