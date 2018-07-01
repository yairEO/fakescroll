;(function(){
    raf = window.requestAnimationFrame || function(cb) { return window.setTimeout(cb, 1000 / 60) };

    function FakeScroll(targetElm, settings){
        if( !targetElm ) return;

        this.settings = Object.assign({}, this.defaults, settings || {});
        this.callback = settings.callback ? settings.callback : null;

        this.state = {};
        this.listeners = {};

        this.DOM = this.build(targetElm);
        this.events.binding.call(this, this.DOM);

        // run "moveBar" once
        setTimeout(this.moveBar.bind(this));

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
                             <div class='fakeScroll__track'>
                                <div class="fakeScroll__bar ${this.settings.classname}"></div>
                             </div>`,
                fragment = document.createDocumentFragment();

            // move all the children of the target element into a fragment
            while( targetElm.childNodes.length ){
                fragment.appendChild(targetElm.childNodes[0]);
            }

            targetElm.insertAdjacentHTML('afterbegin', scopeHTML);

            DOM.scrollWrap = targetElm.firstElementChild;
            DOM.scrollContent = DOM.scrollWrap.firstElementChild;
            DOM.scrollContent.appendChild(fragment);

            DOM.track = DOM.scrollWrap.nextElementSibling;
            DOM.bar = DOM.track.firstElementChild;

            return DOM;
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
                this.events.on.call(this, DOM.scrollContent, 'scroll mouseenter', 'onScrollResize')
                           .on.call(this, window, 'resize', 'onScrollResize')
                           .on.call(this, DOM.bar, 'mousedown', 'onBarMouseDown')

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
                onScrollResize(e){
                    this.moveBar.call(this)
                },

                onDrag(e){
                    var delta = e.pageY - this.state.lastPageY;
                    this.state.lastPageY = e.pageY;

                    raf(() => {
                        this.DOM.scrollContent.scrollTop += delta / this.scrollRatio;
                    });
                },

                onStopDrag(e){
                    [this.DOM.bar, document.body].map(el => el.classList.remove('fakeScroll--grabbed'))
                    this.events.drag.call(this, 'off');
                    setTimeout(()=>{ this.state.drag = false })
                },

                onBarMouseDown(e){
                    this.state.drag = true;
                    this.state.lastPageY = e.pageY;
                    [this.DOM.bar, document.body].map(el => el.classList.add('fakeScroll--grabbed'))
                    this.events.drag.call(this, 'on');
                },

                onTrackClick(e){
                    if( this.state.drag ) return;

                    var bounds       = e.target.getBoundingClientRect(),
                        styles       = window.getComputedStyle(e.target, null),
                        boundsPad    = [parseInt(styles.paddingTop, 10), 0, parseInt(styles.paddingBottom, 10), 0],
                        perc         = (e.clientY - bounds.top) / (bounds.height - boundsPad[0] - boundsPad[2]),
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

        destroy(){
            this.events.off.call(this, window, 'resize', 'onScrollResize');
        },

        moveBar(){
            // if( !this.DOM.scrollContent ) return false;

            var _scrollContent = this.DOM.scrollContent,
                scrollHeight = _scrollContent.scrollHeight,
                ownHeight   = this.DOM.scrollWrap.clientHeight;

            this.scrollRatio = ownHeight / scrollHeight;

            // update fake scrollbar location on the Y axis using requestAnimationFrame
            raf(()=> {
                var height = (ownHeight / scrollHeight) * 100,
                    top = (_scrollContent.scrollTop / scrollHeight ) * 100;

                this.DOM.bar.style.cssText = `height  : ${height}%;
                                              top     : ${top}%;
                                              display : ${scrollHeight <= ownHeight ? 'none' : ''}`;
            });
        }
    }

    Element.prototype.fakeScroll = function( settings ){
        this._fakeScroll = this._fakeScroll || new FakeScroll(this, settings || {});

        return this._fakeScroll;
    }
})();