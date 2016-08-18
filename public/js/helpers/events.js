App.Events = {

    cache: {},

    publish: function (topic, args) {
        this.cache[topic] && $.each(this.cache[topic], function (key, value) {
            $.each(value, function () {
                this.apply(this, args || [])
            });
        });
    },

    subscribe: function (topic, subtopic, callback) {
        if (!this.cache[topic]) {
            this.cache[topic] = {};
        }
        if (!this.cache[topic][subtopic]) {
            this.cache[topic][subtopic] = [];
        }
        this.cache[topic][subtopic].push(callback);
    },

    unsubscribe: function(topic, subtopic, callback){
        var index;

        if (this.cache[topic] && this.cache[topic][subtopic]) {
            if (callback) {
                index = this.cache[topic][subtopic].indexOf(callback);
                if (index > -1) {
                    this.cache[topic][subtopic].splice(index, 1);
                }
            } else {
                this.cache[topic][subtopic] = [];
            }
        }
    }

};



$(window).on('resize', function (e) {
    if(App.timer.resize) clearTimeout(App.timer.resize);
    
    App.timer.resize = setTimeout(function(){
        App.Events.publish('window.resize', [e]);
    }, 120);
});

/*$(document).on('click', function (e) {
    App.Events.publish('document.click', [e]);
});*/

$(document).on('touchmove', function (e) {
    var event = e.originalEvent || e;
    
    if (event.touches.length > 1) {
        e.preventDefault();
    }
});