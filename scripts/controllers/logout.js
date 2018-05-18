App.controller("logoutCtrl", function ($scope, $http, $location,$rootScope, UserService, Session) {


    SessionStorage.clear();
    $location.path("/signin");
});