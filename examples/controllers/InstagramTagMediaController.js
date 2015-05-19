/**
 * Created by domenicovacchiano on 19/05/15.
 */


var instagramTagMediaController=angular.module('myApp.InstagramTagMediaController',[]);
instagramTagMediaController.controller('InstagramTagMediaController',function($scope,$timeout){

    $scope.instagramJSON={};
    $scope.isRequestInProgress=true;
    $scope.lastLoadDate=new Date().toTimeString();
    //example hashtag
    $scope.hashtag="tropea";
    //put here your Instagram client id
    $scope.ClientId="MY_CLIENT_ID";

    //////////////////////////////////////////////////////////////////////
    //ngDvInstagramTagMedia events
    $scope.$on('ngDvInstagramTagMedia_NextItem',function(event,data){
        $scope.lastImageUrl=data.imageUrl;
        $scope.pageOf=data.currentIndex + "/" + data.totalItems;
    });
    $scope.$on('ngDvInstagramTagMedia_DataChanged',function(event,data){
        $scope.isRequestInProgress=false;
    });
    $scope.$on('ngDvInstagramTagMedia_DataWillLoad',function(event){
        $scope.isRequestInProgress=true;
    });
    $scope.$on('ngDvInstagramTagMedia_DataDidLoad',function(event,data){
        $scope.isRequestInProgress=false;
        $scope.lastLoadDate=new Date().toTimeString();
    });
    //////////////////////////////////////////////////////////////////////
});
