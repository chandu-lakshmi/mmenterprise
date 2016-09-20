angular.module('app.filters', [])

.filter('checkedLength', function(){
    return function(o) {
        var c = 0;
        
        try{
            for (var i in o) {
                if (o.hasOwnProperty(i) && o[i]) {
                    c++;
                }
            }
        }catch(e){}

        return c;
    };
})

.filter('fromNow', function () {
    return function (time) {
        return moment(time, 'DD/MM/YYYY, h:mm A').fromNow();
    };
})

.filter('getById', function() {
    
    return function(list, id) {
        if(list && list.length && id){
            var i=0, len=list.length;
            for (; i<len; i++) {
                if (+list[i].id == +id) {
                    return list[i];
                }
            }
        }
        
        return null;
    };
    
})

.filter('getByProp', function() {
    return function(list, prop, search) {
        if(list && list.length && prop && search){
            var i=0, len=list.length;
            for (; i<len; i++) {
                if ((""+list[i][prop]).toLowerCase() == (""+search).toLowerCase()) {
                    return list[i];
                }
            }
        }
        
        return null;
    };
})

.filter('hasData', function(){
    return function(o) {
        try{
            for (var l in o) {
                if (o.hasOwnProperty(l)) {
                    return true;
                }
            }
        }catch(e){}

        return false;
    };
})

.filter('range', function() {
    
    return function(list, start, end) {
        start = start ? parseInt(start) : 0;
        end = end ? parseInt(end) : 1;
        
        if (start > -1 && end > -1) {
            if(start < end){
                for (var i = start; i <= end; i++){
                    list.push(i);
                }
            }else{
                for (var i = start; i >= end; i--){
                    list.push(i);
                }
            }
        }

        return list;
    };
    
})

.filter('urlSearch', function() {
    return function(list, url, prop) {
        if(list && list.length && url && prop){
            var i=0, len=list.length;
            for (; i<len; i++) {

                if (url.indexOf(list[i][prop]) == 0) {
                    return list[i];
                }
            }
        }
        
        return null;
    };
});