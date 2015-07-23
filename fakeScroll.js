////////////////////////////////////////
// fakeScroll - a custom scroll bar jQuery plugin

var fakeScroll = function(elm){
    "use strict";

    var docElm = document.documentElement,
        raf = window.requestAnimationFrame
           || window.webkitRequestAnimationFrame
           || window.mozRequestAnimationFrame
           || window.msRequestAnimationFrame
           || function(cb) { return window.setTimeout(cb, 1000 / 60); },

        defaults = {};

    jQuery.fn.fakeScroll = function(settings){
        return this.each(function(){

            var $el = $(this), // convert window to the HTML element
                fakeScroll;

            // if element already the pluging bound to it, return
            if( $el.data('_fakeScroll') )
                return;

            // wrap with needed DOM structure
            $el.wrapInner('<div class="scrollWrap"><div class="scrollContent"></div></div>');
            // create a new FakeScroll instance
            fakeScroll = new FakeScroll($el.find('.scrollContent'), settings || {});
            // bind the FakeScroll instance to the DOM component
            $el.data('_fakeScroll', fakeScroll);
        });
    }

    // Mouse drag handler
    function dragDealer(barElm, FS_context){
        var lastPageY, onMouseDown;

        onMouseDown = function(e){
            lastPageY = e.pageY;

            barElm.classList.add("grabbed");

            document.addEventListener("mousemove", drag, false);
            document.addEventListener("mouseup", stop, false);
        }

        barElm.addEventListener("mousedown", onMouseDown, false);

        function drag(e){
            var delta     = e.pageY - lastPageY;
                lastPageY = e.pageY;

            raf(function(){
                FS_context.el[0].scrollTop += delta / FS_context.scrollRatio;
            });
        }

        function stop() {
            barElm.classList.remove("grabbed");

            document.removeEventListener('mousemove', drag, false);
            document.removeEventListener('mouseup', stop, false);
        }
    }

    // Constructor
    function FakeScroll($el, settings){
		this.id = new Array(8).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 7); // generate an UID for each instance
        this.el = $el;
        this.bar = $('<div class="fakeScrollBar">');

        this.settings = $.extend({}, settings, defaults);
        this.callback = settings.callback ? settings.callback : null;
        this.maxScrollSoFar = 0;

        // insert the fake scroll bar into the container
        this.bar.appendTo(this.el.closest('.fakeScroll'));
		
		// initiate drag controller on the instance
		dragDealer(this.bar, this);
        // run "moveBar" once
        this.moveBar();

        this.el.on('scroll.fakeScroll', this.moveBar.bind(this) );
       // $(win).on('resize.fakeScroll.' + this.id, this.moveBar.bind(this) );
    }

    FakeScroll.prototype = {
        destroy : function(){
            $el.off('scroll.fakeScroll mousedown.drag').removeData('_fakeScroll');
        },

        moveBar: function(e){
            var totalHeight = this.el[0].scrollHeight,
                ownHeight   = this.el[0].clientHeight,
                that        = this;

            this.scrollRatio = ownHeight / totalHeight;
            // update fake scrollbar location on the Y axis using requestAnimationFrame
            raf(function(){
                that.bar[0].style.cssText = 'height:' + (ownHeight / totalHeight) * 100 + '%; top:' + (that.el[0].scrollTop / totalHeight ) * 100 + '%';
            });
        }
    }

}