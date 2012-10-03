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
    
    //debug
    storage.set(today,[])
    
    /**
     * Cups of coffe today
     * @return {number}
     */
    coffe.today = function(){
        return _.reduce(storage.get(today,[]), function(memo, cup){ return memo + cup; }, 0)
    }
    
    /**
     * Add a cup (or half a cup)
     * @param {boolean} whole (optional) true == one cup, false == half a cup, default: true
     */
    coffe.add = function(whole) {
        var cups = storage.get(today,[])
        cups.push(whole === false?0.5:1)
        storage.set(today,cups)
    }
    
    /**
     * Change last added cup
     * @param {boolean} whole
     */
    coffe.change = function(whole){
        coffe.pop()
        coffe.add(whole)
    }
    
    /**
     * Pop last added cup
     * @return {Object} the cup
     */
    coffe.pop = function(whole){
        var cups = storage.get(today,[])
        var cup = cups.pop()
        storage.set(today,cups)
        return cup
    }
    
    return coffe
}])



/**
 * Controllers
 */ 
function CoffeCtrl($scope,coffe) {
    
    //preload all images
    for (var i=0; i<16; i++) {
        var img = new Image()
        img.src = 'img/coffecups/'+i+'.jpg';
    }
    
    $scope.add = function() {
        coffe.add()
        $scope.cupimage = 'cup'+ Math.min(15,$scope.count())
    }
    
    $scope.count = function(){
        return coffe.today()
    }
    
    $scope.cupimage = 'cup'+ Math.min(15,$scope.count())
}
