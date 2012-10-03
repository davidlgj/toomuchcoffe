
//Copyright (c) 2012 David Jensen

//Permission is hereby granted, free of charge, to any person obtaining a copy 
//of this software and associated documentation files (the "Software"), to deal 
//in the Software without restriction, including without limitation the rights 
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
//copies of the Software, and to permit persons to whom the Software is 
//furnished to do so, subject to the following conditions:
//The above copyright notice and this permission notice shall be included in 
//all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
//SOFTWARE.


"use strict";
//init service module
angular.module('app',[])

/**
 * Services
 */
angular.module('app').factory('storage', [function() {
    
    var storage = {}
    
    /**
     * Get a value from storage
     * @param {string} key
     * @param {Any} def (optional) default object if none is found
     */ 
    storage.get = function(key,def) {
        var val = window.localStorage[key]
        if (angular.isUndefined(val) || val === 'undefined') {
            if (def) {
                return def;
            } 
            return undefined;
        }
        
        return angular.fromJson(val)
    }
    
    /**
     * Set a value
     * @param {string} key
     * @param {Any} value, will be serialized to JSON and deserialized on get
     */
    storage.set = function(key,val) {
        if (angular.isString(val)) { //add "" to make it a JSON string
            val = '"'+val+'"'
        }
        window.localStorage[key] = angular.toJson(val)
    }
    
    /**
     * Check if a key is defined in storage
     */
    storage.has = function(key){
        return !angular.isUndefined(window.localStorage[key])
    }
    
    return storage
}])

angular.module('app').factory('coffe', ['storage',function(storage) {
    var coffe = {} 
    
    var today = new Date().toDateString()
    
    //init storage
    if (!storage.has('dates')) {
        storage.set('dates',[])
    }
    //check if we've added today to the list of dates
    //dates is used as an index of all the days we have data for
    if (!_.contains(storage.get('dates'),today)) {
        var dates = storage.get('dates')
        dates.push(today)
        storage.set('dates',dates)
    }
    
    /**
     * Cups of coffe today
     * @return {number}
     */
    coffe.today = function(){
        return storage.get(today,0)
    }
    
    /**
     * Add a cup 
     */
    coffe.add = function() {
        var cups = storage.get(today,0)
        cups++
        storage.set(today,cups)
    }
        
    /**
     * Decrease one cup
     * @return {Object} the cup
     */
    coffe.dec = function(){
        var cups = storage.get(today,0)
        cups--
        storage.set(today,Math.max(0,cups))
        return cups
    }
    
    /**
     * Reset today to 0
     */ 
    coffe.reset = function(){
        storage.set(today,0)
    }
    
    return coffe
}])

/**
 * Directives
 */
var makeDirective = function(event){
    angular.module('app').directive(event, function factory($parse) {
        var def = {
            restrict: 'A',
            replace: false,
            transclude: false,
            
            link: function(scope, element, attrs) {
                $$(element[0]).on(event,function(e){
                    console.log('event fired',e)
                    e.preventDefault();
                    
                    var fn = $parse(attrs[event])
                    scope.$apply(function() {
                        fn(scope)
                    })
                })
            }
        }
        return def
    })
}
 
makeDirective('tap')
makeDirective('hold')
 

/**
 * Controllers
 */ 
function CoffeCtrl($scope,coffe) {

    //hacks
    //to prevent default longclick (hold) behaviour, i.e. the dialog for saving an image
    //we have to preventDefault
    document.addEventListener('touchstart',function(e){ e.preventDefault() },false)

    //preload all images
    for (var i=0; i<16; i++) {
        var img = new Image()
        img.src = 'img/coffecups/'+i+'.jpg'
    }
    
    $scope.add = function() {
        coffe.add()
        $scope.cupimage = 'cup'+ Math.min(15,$scope.count())
    }
    
    
    $scope.reset = function() {
        coffe.reset()
        $scope.cupimage = 'cup0'
    }
    
    $scope.count = function(){
        return coffe.today()
    }
    
    $scope.cupimage = 'cup'+ Math.min(15,$scope.count())
}
