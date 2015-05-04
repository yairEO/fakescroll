/////////////////////////////////////////////////////////
// fakeScroll - a custom scroll bar jQuery plugin
// By Yair Even-Or - https://github.com/yairEO/fakescroll

;(function($, win){
    "use strict";

    var docElm = document.documentElement,
        $doc   = $(document),
        raf = win.requestAnimationFrame
           || win.webkitRequestAnimationFrame
           || win.mozRequestAnimationFrame
           || win.msRequestAnimationFrame
           || function(cb) { return win.setTimeout(cb, 1000 / 60); },

        defaults = {};

    jQuery.fn.fakeScroll = function(settings){
        return this.each(function(idx, selector){
            var $el = $(this), // convert window to the HTML element
                fakeScroll;

            // if element already the pluging bound to it, return
            if( $el.data('_fakeScroll') )
                return;

            // create a new FakeScroll instance
            fakeScroll = new FakeScroll($el, settings || {});
            // bind the FakeScroll instance to the DOM component
            $el.data('_fakeScroll', fakeScroll);
        });
    }

    // Mouse drag handler
    function dragDealer($el, FS_context){
        var lastPageY;

        $el.on('mousedown.drag', function(e) {
            lastPageY = e.pageY;
            $el.addClass('grabbed');
            $doc.on('mousemove.drag', drag).on('mouseup.drag', stop);
            return false;
        });

        function drag(e){
            var delta     = e.pageY - lastPageY;
                lastPageY = e.pageY;

            raf(function(){
                FS_context.el[0].scrollTop += delta / FS_context.scrollRatio;
            });
        }

        function stop() {
            $el.removeClass('grabbed');
            $doc.off("mousemove.drag mouseup.drag");
        }
    }

    // Constructor
    function FakeScroll($el, settings){
        // this.id = new Array(8).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 7); // generate an UID for each instance
        this.target = $el;
        this.bar = $('<div class="fakeScrollBar">');
        this.settings = $.extend({}, settings, defaults);
        this.callback = settings.callback ? settings.callback : null;
        this.maxScrollSoFar = 0;

        // wrap with needed DOM structure
        this.el = this.target.wrapInner('<div class="scrollWrap"><div class="scrollContent"></div></div>').find('.scrollContent');

        // insert the fake scroll bar into the container
        this.bar.appendTo(this.el.closest(this.target));
        // initiate drag controller on the instance
        dragDealer(this.bar, this);
        // run "moveBar" once
        this.moveBar();

        this.el.on('scroll.fakeScroll mouseenter.fakeScroll', this.moveBar.bind(this) );
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
})(jQuery, window);