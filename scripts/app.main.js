'use strict';

var App = angular
  .module('urbanApp')
  .controller('AppCtrl', ['$scope', '$http', '$localStorage', '$location', '$window',
        function AppCtrl($scope, $http, $location, $window, $localStorage) {

      $scope.mobileView = 767;

      $scope.app = {
        name: 'Healthtouch',
        author: 'Healthtouch',
        version: '1.0.0',
        year: (new Date()).getFullYear(),
        layout: {
          isSmallSidebar: false,
          isChatOpen: false,
          isFixedHeader: true,
          isFixedFooter: true,
          isBoxed: false,
          isStaticSidebar: false,
          isRightSidebar: false,
          isOffscreenOpen: false,
          isConversationOpen: false,
          isQuickLaunch: false,
          sidebarTheme: '',
          headerTheme: ''
        },
        isMessageOpen: false,
        isConfigOpen: false
      };

      $scope.user = {
        fname: sessionStorage.getItem("staffName"),
        lname: 'Perkins',
        jobDesc: 'Human Resources Guy',
        avatar: 'images/avatar.jpg',
      };

      if (!sessionStorage.getItem("username") && !sessionStorage.getItem("publicKey")) {
        location.href = '#/signin';

      } else{

      }

      if (angular.isDefined($localStorage.layout)) {
        $scope.app.layout = $localStorage.layout;
      } else {
        $localStorage.layout = $scope.app.layout;
      }

      $scope.$watch('app.layout', function () {
        $localStorage.layout = $scope.app.layout;
      }, true);

      $scope.getRandomArbitrary = function () {
        return Math.round(Math.random() * 100);
      };
    }

]);
