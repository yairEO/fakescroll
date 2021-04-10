;(function(root, factory){
    var define = define || {};
    if( typeof define === 'function' && define.amd )
        define([], factory);
    else if( typeof exports === 'object' && typeof module === 'object' )
        module.exports = factory();
    else if(typeof exports === 'object')
        exports["FakeScroll"] = factory()
    else
        root.FakeScroll = factory()
  }(this, function(){
    raf = window.requestAnimationFrame || function(cb) { return window.setTimeout(cb, 1000 / 60) };

    function FakeScroll(targetElm, settings){
        if( !targetElm ) return;

        this.settings = Object.assign({}, this.defaults, settings || {})

        this.state = {}
        this.listeners = {}

        this.DOM = this.build(targetElm)
        this.events.binding.call(this, this.DOM)

        // run "moveBar" once
        setTimeout(this.events.callbacks.onScrollResize.bind(this))
    }

    FakeScroll.prototype = {
        defaults : {
            classname : "",
            track     : false // "smooth" will enable smooth scroll
        },

        /**
         * Build the DOM needed
         */
        build( targetElm ){
            var DOM = {};
                scopeHTML = `<div class="fakeScroll__wrap">
                                <div class="fakeScroll__content"></div>
                             </div>
                             <div class='fakeScroll__track ${this.settings.classname}'>
                                <div class="fakeScroll__bar"></div>
                             </div>`,
                fragment = document.createDocumentFragment();

            // move all the children of the target element into a fragment
            while( targetElm.childNodes.length ){
                fragment.appendChild(targetElm.childNodes[0]);
            }

            targetElm.insertAdjacentHTML('afterbegin', scopeHTML);

            DOM.scope = targetElm;
            DOM.scrollWrap = targetElm.firstElementChild;
            DOM.scrollContent = DOM.scrollWrap.firstElementChild;
            DOM.scrollContent.appendChild(fragment);

            DOM.track = DOM.scrollWrap.nextElementSibling;
            DOM.bar = DOM.track.firstElementChild;

            DOM.scope.classList.add("fakeScroll");

            return DOM;
        },

        destroy(){
            this.events.off.call(this, window, 'resize', 'onScrollResize');
        },

        get scrollRatio(){
            return this.state.scrollRatio
        },

        events : {
            on(elm, eName, cbName){
                // to be able tp unbind the events, callback refferece must be saved somewhere
                eName.split(' ').forEach(e => {
                    if( !(cbName in this.events.callbacks) ) console.warn(cbName, " doesn't exist in Callbacks: ", this.events.callbacks);

                    this.listeners[e] = this.events.callbacks[cbName].bind(this);
                    elm.addEventListener(e, this.listeners[e])
                });

                return this.events;
            },

            off(elm, eName, cbName){
                eName.split(' ').forEach(e => elm.removeEventListener(e, this.listeners[e]))
                return this.events;
            },

            binding(DOM){
                this.events.on.call(this, DOM.scrollContent, 'scroll', 'onScrollResize')
                           .on.call(this, DOM.scope, 'mouseenter', 'onScrollResize')
                           .on.call(this, DOM.bar, 'mousedown', 'onBarMouseDown')
                           .on.call(this, window, 'resize', 'onScrollResize')

                if( this.settings.track )
                    this.events.on.call(this, DOM.track, 'click', 'onTrackClick')
            },

            /**
             * events only binded when Bar element gets a "mousedown" event
             * @param  {[type]} onOff [description]
             * @return {[type]}       [description]
             */
            drag(onOff){
                this.events[onOff].call(this, document, 'mousemove', 'onDrag')
                           [onOff].call(this, document, 'mouseup', 'onStopDrag')
            },

            callbacks : {
                onScrollResize(){
                    this.moveBar.call(this);
                    this.DOM.scope.classList.toggle('fakeScroll--hasBar', this.state.ratio < 1)

                    // debounce - get track bounds
                    clearTimeout(this.listeners.timeout__resize);
                    this.listeners.timeout__resize = setTimeout(this.getTrackBounds.bind(this), 200)
                },

                onDrag(e){
                    var delta = e.pageY - this.state.lastPageY;

                    raf(() => {
                        var sTop = document.documentElement.scrollTop,
                            isDragWithinTrackBounds = e.pageY >= (this.state.trackBounds.top + sTop) && e.pageY <= (this.state.trackBounds.bottom + sTop);

                        if( isDragWithinTrackBounds )
                            this.DOM.scrollContent.scrollTop = this.state.drag + delta / this.state.ratio;
                        // update variables when mouse position is outside the Track bounds
                        else{
                            this.state.drag = this.DOM.scrollContent.scrollTop;
                            this.state.lastPageY = e.pageY;
                        }
                    });
                },

                onStopDrag(e){
                    [this.DOM.bar, document.body].map(el => el.classList.remove('fakeScroll--grabbed'))
                    this.events.drag.call(this, 'off');
                    setTimeout(()=>{ this.state.drag = false })
                },

                onBarMouseDown(e){
                    this.state.drag = this.DOM.scrollContent.scrollTop;
                    this.state.lastPageY = e.pageY;

                    [this.DOM.bar, document.body].map(el => el.classList.add('fakeScroll--grabbed'))
                    this.events.drag.call(this, 'on');
                },

                onTrackClick(e){
                    if( this.state.drag ) return;

                    var perc         = (e.clientY - this.state.trackBounds.top) / (this.state.trackBounds.height - this.state.trackBounds.topPad - this.state.trackBounds.bottomPad),
                        scrollHeight = this.DOM.scrollContent.scrollHeight,
                        ownHeight    = this.DOM.scrollWrap.clientHeight,
                        newScrollTop = perc * (scrollHeight - ownHeight);

                    if( this.settings.track == 'smooth' ){
                        this.DOM.scrollContent.style.scrollBehavior = 'smooth';
                        setTimeout(()=>{ this.DOM.scrollContent.style.scrollBehavior = 'unset' }, 500)
                    }

                    this.DOM.scrollContent.scrollTop = newScrollTop;
                }
            }
        },

        getTrackBounds(){
            var bounds = this.DOM.track.getBoundingClientRect(),
                styles = window.getComputedStyle(this.DOM.track, null);

            bounds.topPad = parseInt(styles.paddingTop, 10);
            bounds.bottomPad = parseInt(styles.paddingBottom, 10);

            this.state.trackBounds = bounds;
            return bounds;
        },

        moveBar(){
            // if( !this.DOM.scrollContent ) return false;

            var _scrollContent = this.DOM.scrollContent,
                scrollHeight = _scrollContent.scrollHeight,
                ownHeight   = this.DOM.scrollWrap.clientHeight;

            this.state.ratio = this.DOM.track.clientHeight / scrollHeight
            this.state.scrollRatio = this.DOM.scrollContent.scrollTop / (_scrollContent.scrollHeight - ownHeight)


            // update fake scrollbar location on the Y axis using requestAnimationFrame
            raf(()=> {
                var height = (ownHeight / scrollHeight) * 100,
                    top = (_scrollContent.scrollTop / scrollHeight ) * 100;

                this.DOM.bar.style.cssText = `height  : ${height}%;
                                              top     : ${top}%;
                                              display : ${scrollHeight <= ownHeight ? 'none' : ''}`;

                this.settings.onChange && this.settings.onChange({scrollRatio:this.state.scrollRatio })
            });

        }
    }

    /**
     * Extend the DOM with "fakeScroll" method. The chances of the same name already be taken are slim to none,
     * But you should now; it's your code you're putting this into.
     */
    Element.prototype.fakeScroll = function( settings ){
        this._fakeScroll = this._fakeScroll || new FakeScroll(this, settings || {});
        return this._fakeScroll;
    }

    return FakeScroll
}));