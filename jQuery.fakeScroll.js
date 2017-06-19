/////////////////////////////////////////////////////////
// fakeScroll - a custom scroll bar jQuery plugin
// By Yair Even-Or - https://github.com/yairEO/fakescroll

;(function($, win){
    "use strict";

    var docElm = document.documentElement,
        $doc   = $(document),
        raf = win.requestAnimationFrame || function(cb) { return win.setTimeout(cb, 1000 / 60); },
        defaults = {
            offset : "0 0 0 0"
        };

    jQuery.fn.fakeScroll = function(settings){
        return this.each(function(idx, selector){
            var $el = $(this), // convert window to the HTML element
                fakeScroll = $el.data('_fakeScroll');

            // if element already the pluging bound to it, return
            if( fakeScroll ){
                typeof settings == 'string' && fakeScroll[settings] && fakeScroll[settings]();
                return;
            }

            // create a new FakeScroll instance
            fakeScroll = new FakeScroll($el, settings || {});
            // bind the FakeScroll instance to the DOM component
            $el.data('_fakeScroll', fakeScroll);
        });
    }

    // Constructor
    function FakeScroll($el, settings){
        // this.id = new Array(8).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 7); // generate an UID for each instance
        this.target = $el;
        this.bar = $('<div class="fakeScrollBar">').addClass(settings.theme);
        this.settings = $.extend({}, defaults, settings);
        this.settings.offset = this.settings.offset.split(' '); // convert offset String to Array

        this.callback = settings.callback ? settings.callback : null;
        this.maxScrollSoFar = 0;

        // wrap with needed DOM structure
        this.el = this.target.wrapInner('<div class="scrollWrap"><div class="scrollContent"></div></div>').find('.scrollContent');

        // insert the fake scroll bar into the container
        this.bar.appendTo(this.el.closest(this.target));
        // initiate drag controller on the instance
        this.dragDealer();
        // run "moveBar" once
        setTimeout(this.moveBar.bind(this), 0);

        this.el.on('scroll.fs_scroll mouseenter.fs_mouseenter', this.moveBar.bind(this) );
        $(win).on('resize.fs_resize.' + this.id, this.moveBar.bind(this) );
    }

    FakeScroll.prototype = {
        destroy : function(){
            $el.off('scroll.fs_scroll mousedown.fs_drag').removeData('_fakeScroll');
        },

        // Mouse drag handler
        dragDealer : function($el){
            var lastPageY,
                $el = this.bar,
                that = this;


            $el.on('mousedown.fs_drag', function(e) {
                lastPageY = e.pageY;
                $el.add(document.body).addClass('fakescroll-grabbed');
                $doc.on('mousemove.fs_drag', drag).on('mouseup.fs_drag', stop);
                return false;
            });

            function drag(e){
                var delta     = e.pageY - lastPageY;
                    lastPageY = e.pageY;

                raf(function(){
                    that.el[0].scrollTop += delta / that.scrollRatio;
                });
            }

            function stop() {
                $el.add(document.body).removeClass('fakescroll-grabbed');
                $doc.off("mousemove.fs_drag mouseup.fs_drag");
            }
        },

        moveBar: function(e){
            if( !this.el || !this.el[0] ) return false;

            var totalHeight = this.el[0].scrollHeight,
                ownHeight   = this.el[0].clientHeight,
                that        = this;

            this.scrollRatio = ownHeight / totalHeight;

            // update fake scrollbar location on the Y axis using requestAnimationFrame
            raf(function(){
                var height = (ownHeight / totalHeight) * 100,
                    top = (that.el[0].scrollTop / totalHeight ) * 100;

                that.bar[0].style.cssText = "height : calc("+ height + "% - " + that.settings.offset[0] + "px); \
                                             top    : calc("+ top    + "% + " + that.settings.offset[0] + "px);";
            });

            this.bar.toggleClass('enabled', totalHeight > ownHeight);
        }
    }
})(jQuery, window);
