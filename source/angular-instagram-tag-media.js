/**
 * Created by domenicovacchiano on 19/05/15.
 */
/**
 * @name        ngDvHttpGet
 * @restrict    E
 * @description
 * Allows to execute a GET on a remote server
 * @references
 * https://instagram.com/developer/endpoints/tags/
 * @isolated_scope
 * ------------------------------------------------------------------------------------------------------
 * attr name        type                description
 * ------------------------------------------------------------------------------------------------------
 * tagName          one-way binding     hashtag of media pics
 * clientId         one-way binding     Instagram app CLIENT ID
 * reloadMs         one-way binding     Milliseconds for reloading data from the server
 * slideMs          one-way binding     Milliseconds to activare a slider images service.
 *                                      Use "auto" to implement an auto calculation interval
 * instagramData    two-way binding     Set here your data source  for the response body
 * ------------------------------------------------------------------------------------------------------
 * @events
 * ------------------------------------------------------------------------------------------------------
 * name                                         data               description
 * ------------------------------------------------------------------------------------------------------
 * ngDvInstagramTagMedia_DataChanged          --           it will be raised when your data source changes, generally
 *                                                         if the the success promise method will be invoked
 * ngDvInstagramTagMedia_DataWillLoad         --           it will be raised before sending a request to the server
 * ngDvInstagramTagMedia_DataDidLoad          --           it will be raised after sending a request to the server
 *                                                         and if the the success promise method will be invoked
 * ngDvInstagramTagMedia_NextItem             --           it will be raised after slideMs milliseconds
 * ------------------------------------------------------------------------------------------------------

 *  -------------------------------------------------------------
 *  Events implementations
 *  -------------------------------------------------------------
 *  $scope.$on('ngDvInstagramTagMedia_NextItem',function(event,data){
 *       //your code
 *       //data is an object with this structure:
 *         var data={
 *              item: item of the instagram data array,
 *              totalItems: length of instagram data array,
 *              currentIndex:_currentSlideIndex,
 *              imageUrl: .images.low_resolution.url of an item of the instagram data array,
 *           };
 *   });
 *   $scope.$on('ngDvInstagramTagMedia_DataChanged',function(event,data){
 *       //your code
 *       //data is the data sent from the Instagram API see https://instagram.com/developer/endpoints/tags/
 *   });
 *  $scope.$on('ngDvInstagramTagMedia_DataWillLoad',function(event){
 *       //your code
 *   });
 *  $scope.$on('ngDvInstagramTagMedia_DataDidLoad',function(event,data){
 *       //your code
 *       //data is the data sent from the Instagram API see https://instagram.com/developer/endpoints/tags/
 *   });
 *  -------------------------------------------------------------
 * @example
 *  <ng-dv-instagram-tag-media
 *          tag-name={{hashtag}}
 *          lient-id="{{ClientId}}"
 *          reload-ms="60000"
 *          slide-ms="auto">
 *          <!--data presentation-->
 *           <div>
 *               <img ng-src="{{lastImageUrl}}" style="border-style: solid;border-width: 2px"/>
 *               <div>
 *                  <span>{{pageOf}}</span>
 *                </div>
 *            </div>
 *  </ng-dv-instagram-tag-media>
 *  -------------------------------------------------------------
 *  For the previous example I used the controller below
 *  -------------------------------------------------------------
 *  var instagramTagMediaController=angular.module('myApp.InstagramTagMediaController',[]);
 *  instagramTagMediaController.controller('InstagramTagMediaController',function($scope,$timeout){
 *      $scope.hashtag="tropea";
 *      //put here your Instagram client id
 *      $scope.ClientId="MY_CLIENT_ID";
 *      $scope.$on('ngDvInstagramTagMedia_NextItem',function(event,data){
 *          $scope.lastImageUrl=data.imageUrl;
 *          $scope.pageOf=data.currentIndex + "/" + data.totalItems;
 *      });
 *   });
 *  -------------------------------------------------------------
 */


var ngDvInstagramTagMediaModule=angular.module('ngDvInstagramTagMediaModule',[]);
ngDvInstagramTagMediaModule.directive('ngDvInstagramTagMedia',function($http,$q,$compile,$interval){

    return{
        restrict:'E',
        replace: false,
        scope:{
            tagName:'@',
            clientId:'@',
            reloadMs:'@',
            slideMs:'@',
            instagramData:'='
        },

        link: function(scope,element,attrs,ctrl){

            var _timerReload;
            var _timerSlide;
            var _data;
            var _currentSlideIndex=0;
            var _isAutoTimerSlide=false;

            //scope params controls
            if (scope.tagName===undefined){
                throw new Error("Invalid tag-name attribute");
            }
            if (scope.clientId===undefined){
                throw new Error("Invalid client-id attribute");
            }

            //sets reload time
            scope._reloadMs=parseInt(scope.reloadMs) ? scope.reloadMs : 0;

            //sets slide time
            if (angular.uppercase(scope.slideMs)==="AUTO"){
                _isAutoTimerSlide=true;
            }else{
                scope._slideMs=parseInt(scope.slideMs) ? scope.slideMs : 0;
            }

            if (element.html().trim().length != 0) {
                element.append($compile(element.contents())(scope));
            }

            var getAPIUrl=function(){
                //see https://instagram.com/developer/endpoints/tags/ for details
                return "http://api.instagram.com/v1/tags/" + scope.tagName + "/media/recent?client_id=" + scope.clientId + "&callback=JSON_CALLBACK";
            };

            var sliderFunc=function(){
                //sets current index to get the item to send on the next item event
                _currentSlideIndex<_data.data.length-1?_currentSlideIndex++:_currentSlideIndex=0;

                //makes a new object to send on the event
                var nextItem={
                    item:_data.data[_currentSlideIndex],
                    totalItems:_data.data.length,
                    currentIndex:_currentSlideIndex,
                    imageUrl:_data.data[_currentSlideIndex].images.low_resolution.url
                };
                //event emit
                scope.$emit("ngDvInstagramTagMedia_NextItem",nextItem);
            };

            function reloadFunc() {
                //event emit
                scope.$emit("ngDvInstagramTagMedia_DataWillLoad");
                //resets current index var
                _currentSlideIndex=0;
                //send a get request to the remote Instragram server
                $http({
                    method: "JSONP",
                    url:getAPIUrl(),
                    headers:{'Content-Type':'application/json; charset=utf-8'}
                })
                .success(function (data, status, headers, config) {
                    _data=data;

                    //Calculates slide timer with number of pics and reload time.
                    //For example if we have 20 pics and a reload time of 60000 ms
                    //we will show a pic each 3000 ms (3sec) so after 60sec we will show
                    //all 20 pics ;-)
                    if (_isAutoTimerSlide && scope._reloadMs>0){
                        scope._slideMs=parseInt(scope._reloadMs/data.data.length);
                    }
                    //sets loaded data to the two-way data binding param
                    if (scope.instagramData){
                        scope.instagramData=data;
                    }

                    //starts a slider service for a timed emit
                    if (scope._slideMs>0){
                        $interval.cancel(_timerSlide);
                        sliderFunc()
                        _timerSlide = $interval(sliderFunc, scope._slideMs);
                    }
                    //event emit
                    scope.$emit("ngDvInstagramTagMedia_DataDidLoad",data);

                })
                .error(function (data, status, headers, config) {
                    throw new Error(data.message + " " + status);
                });

            }

            if (scope._reloadMs==0){
                reloadFunc();
            }else{
                //starts an auto reloading service by using _reloadMs time
                reloadFunc();
                _timerReload = $interval(reloadFunc, scope._reloadMs);
            }

            scope.$watch("instagramData",function(newValue,oldValue){
                //watch on the instagramData attribute
                if (newValue==oldValue){
                    return;
                }
                //event emit
                scope.$emit("ngDvInstagramTagMedia_DataChanged",newValue);
            });

            element.on('$destroy', function() {
                $interval.cancel(_timerReload);
                $interval.cancel(_timerSlide);
            });

        }

    };

});
