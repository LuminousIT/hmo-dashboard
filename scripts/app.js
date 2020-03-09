
/**
 * @ngdoc overview
 * @name urbanApp
 * @description
 * # urbanApp
 *
 * Main module of the application.
 */

var App = angular
  .module('urbanApp', [
    'ui.router',
    'ngAnimate',
    'ui.bootstrap',
    'oc.lazyLoad',
    'ngStorage',
    'ngSanitize',
    'ui.utils',
    'ngTouch'
  ])
  .constant('COLORS', {
    'default': '#e2e2e2',
    primary: '#09c',
    success: '#2ECC71',
    warning: '#ffc65d',
    danger: '#d96557',
    info: '#4cc3d9',
    white: 'white',
    dark: '#4C5064',
    border: '#e4e4e4',
    bodyBg: '#e0e8f2',
    textColor: '#6B6B6B',
  });

  
  angular.module('urbanApp')
        .constant('ApiBaseUrl', 'http://localhost/healthTouch/public/api/')//'http://apis-s.touchandpay.me/hmo/public/api/')
        .constant('ApiBaseUrlLogin', 'http://apis-s.touchandpay.me/hmo/public/api/')
        //.constant('UrlEncoded', 'application/x`-www-form-urlencoded')
        .filter('momentFilter', MomentFilter)
        .run(function () {
            console.log('Health-Touch App Started');
        });

    App.factory('Session', function() {
      var Session = {
        data: {},
        saveSession: function() { /* save session data to db */ },
        updateSession: function(nData, identifier) {
          /* load data from db */
          return Session.data[identifier] = nData;
        }
      };
      return Session;
    });

    function MomentFilter() {
        return function (date) {
            if (date === null || !angular.isDefined(date))
                return null;
            if (moment(date).isValid()) {
                return moment(date).format('DD-MM-YYYY HH:mm');
            }
            return date;
        }
    }

    App.run(function($rootScope, $timeout, UserService) {     
              function strrev(s){
                  s = s+"";
                  return s.split("").reverse().join("");
              };
      
              $rootScope.dateFormater = function(str){
                  var dt = new Date(str*1000);
                  formatted = dt.toDateString();
                  return formatted;
              };
              $rootScope.returnImURL = function(str){
                return UserService.webroot+""+str;
            };
              $rootScope.fetchDistinct = function(data){
                  var j = data;
                  var summary = [];
                  var userDatas = [];
                  var start = 0;
                  while (start < data.length){
                      var obj = data[start];
                      var searchresult = findInArray(obj,summary);
                      if(searchresult[0]){
                          userDatas[searchresult[1]].push(obj);
                          summary[searchresult[1]].amount = parseInt(summary[searchresult[1]].amount) + parseInt(obj.amount);
                          summary[searchresult[1]].tcount += 1;
                      }else{
                          obj.tcount = 1;
                          summary.push(obj);
                          var nArr = [obj];
                          userDatas.push(nArr);
                      }
                      start++;
                  }
                  return [summary, userDatas];
              }
              function findInArray(needle, arrayStack){
                  found = false;
                  var index = -1;
                  for(counter=0; counter < arrayStack.length; counter++){
                      if(needle.staffID === arrayStack[counter].staffID){
                          index = counter;
                          found = true;
                          break;
                      }
                  }
                  return [found, index];
              }
              $rootScope.getUnitPrice = function(t, q){
                  if(t == 0 || q == 0 || q == null || t == null) return 0;
                  return parseFloat(t)/parseFloat(q);
              }
              $rootScope.adminCanteenID = (sessionStorage.getItem('canteenID'))? true : false;
              $rootScope.notAdminCanteenID = !($rootScope.adminCanteenID);
              $rootScope.pricer = function(pri,t){
                  pri = pri+"";
                  var sign = "";
                  if(!parseInt(pri)){
                      return 0;
                  }
                  if(parseInt(pri.substr(0,1))){
      
                  }else{
                      sign = pri.substr(0,1);
                      pri = pri.substr(1,pri.length);
                  }
                  t = (arguments.length > 1)? t : false;
                  r = strrev(pri);
                  len = r.length;
                  start = 0;
                  nstr  = "";
                  l = 0;
                  iS = false;
                  while (start < len){
                      if(l == 2 && (start+1) < len){
                          nstr = ","+r.substr(start,1)+nstr;
                          iS = true;
                      }else{
                          nstr = r.substr(start,1)+nstr;
                      }
                      start++;
                      if (!(iS)){
                          l++;
                      }else{
                          l = 0;
                          iS = false;
                      }
                  }
              return (t)? sign+" ₦"+nstr : sign+" "+nstr;
              };
              $rootScope.customMessage = function(){
                  this.warning = function warning(message){
                      return '<div style=\'padding:12px; opacity:.99\'><div style=\'color:#F48622; font-size:16px; background:#FBE9BD; border-left:#F48622 thick solid; width:50%; padding:15px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif;\'><i class=\'fa fa-exclamation-circle\'></i> '+message+'</div></div>';
                  }
                  this.error = function(message){
                      return '<div style=\'padding:12px;\'><div align=\'left\' style=\'color:#ED050B; opacity:.99;width:50%; font-size:15px; background:#F9B4B0; border-left:#ED050B thick solid; padding:15px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif; \' ><i class=\'fa fa-warning\'></i> '+message+'</div></div>';
                  }
                  this.success = function(message){
                      return '<div style=\'padding:12px;\'><div style=\'color:#2B8E11; width:50%; opacity:.99; font-size:16px; background:#BCF8AD; border-left:#2B8E11 thick solid; padding:15px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif;\'><i class=\'fa fa-check-square-o\'></i> '+message+'</div></div>';
                  }
              };
              $rootScope.mCra = function(message){
                  document.getElementById("stow").style.display = "block";
                  document.getElementById("stow").innerHTML = message;
                  document.getElementById("stow").opacity = 1;
                  clearMessage();
              };
              delay = 4;
              function clearMessage(){
                  var timer;
                  if(delay === 0){
                    $timeout.cancel(timer);
                      delay = 4;
                      $("#stow").fadeOut(100, function(){
                          $("#stow").html('');
                      });
                  }
                  else{
                      delay--;
                      timer = $timeout(function(){clearMessage();},1000);
                  }
              };
              $rootScope.setHTMLStyle = function(){
                var style = "";
                if(sessionStorage.getItem('publickey')){
                  style = 'style="background:none;"';
                }else{
                  style = 'style="background: url(images/bg3.jpg) bottom right no-repeat; background-attachment:fixed; background-size:cover;"';
                }
                return style;
              }
              $rootScope.unix2Date = function(UNIX_timestamp){
                var a = new Date(UNIX_timestamp * 1000);
                //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                var year = a.getFullYear();
                var month = a.getMonth() + 1;
                var day = a.getDate();
                if (month < 10) 
                    month = "0" + month;
                if (day < 10) 
                    day = "0" + day;
                var date = year + '-' + month + '-' + day;
                return date;
              }
              $rootScope.version = 105180831;
              $rootScope.sleep = function(milliseconds) {
                var start = new Date().getTime();
                for (var i = 0; i < 1e7; i++) {
                  if ((new Date().getTime() - start) > milliseconds){
                    break;
                  }
                }
              }
          });


  App.factory('UserService', function() {
  return {
    //apiRoot : 'http://apis-s.healthtouch.me/hmo/public/api/',
    //apiRoot : 'http://172.16.1.22:6500/royalty/H/public/api/',
    apiRoot : 'http://localhost/healthTouch/public/api/',
    //webroot: 'http://localhost/fpanda/fpanda/'
    webroot: 'http://localhost/healthTouch/public/',
    //webroot: 'http://172.16.1.22:6500/fpanda/'
  };
});
