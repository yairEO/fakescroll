import React, { useReducer, useRef, useEffect, useLayoutEffect, useCallback, createRef, useMemo } from "react"

const raf = window.requestAnimationFrame || (cb => window.setTimeout(cb, 1000 / 60))
const cx = (...list) => list.filter(Boolean).join(" ")
const CLASSNAMES = {
  grab: "fakeScroll--grabbed",
  hasBar: "fakeScroll--hasBar"
}

const reducer = (state, action) => {
  switch (action.type) {
    case "drag":
      return {
        ...state,
        isDragging: "scrollTop" in action,
        scrollTop: action.scrollTop || state.scrollTop,
        lastPageY: action.pageY || state.lastPageY
      }

    case "drag-release": return {...state, drag:false }
    case "trackBounds": return { ...state, trackBounds: action.payload }
    case "toggleSmoothScroll": return { ...state, smoothScroll: !state.smoothScroll }
    case "ratio": return { ...state, ratio: action.payload }
    case "mouseEvent": return { ...state,  mouse:{ type:action.event.type, pageY:action.event.pageY }}

    case "barProps": {
      const { height, top, scrollHeight, ownHeight } = action.payload

      return {
        ...state,
        hasBar: scrollHeight > ownHeight,
        barStyle: {
          height: `${height}%`,
          top: `${top}%`
        }
      }
    }

    case "scrollTo": return { ...state, scrollTo:action.to}

    default:
      return state
  }
}

const initialState = {
  trackBounds: {},
  isDragging: false,
  scrollTop: null,
  scrollTo: null,
  ratio: null,
  lastPageY: null,
  smoothScroll: false,
  hasBar: null,
  barStyle: undefined,
  mouse: {}
}

const FakeScroll = ({ children, className, onChange:onChangeCB, track = false, ...rest }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const listeners = useRef({})

  const refs = useMemo(() => ({
      wrap: createRef(),
      track: createRef(),
      content: createRef()
    }),[])

  const onMouseEvent = useCallback(e =>
    raf(() => dispatch({ type:"mouseEvent", event:e }) )
  , [dispatch])

  const onScrollResize = useCallback(() => {
    setBarGeometry()
    // debounce - get track bounds
    clearTimeout(listeners.current.timeout__resize)
    listeners.current.timeout__resize = setTimeout(getTrackBounds, 200)
  }, [])

  useLayoutEffect(() => {
    onScrollResize()
    window.addEventListener("resize", onScrollResize)

    // cleanup
    return () => {
      window.removeEventListener("resize", onScrollResize)
      toggleDragEvents(false)
      document.body.classList.remove(CLASSNAMES.grab)
    }
  }, [onScrollResize])

  useEffect(()=>{
    const {type} = state.mouse

    if( type == "mousemove" )
      onDrag(state.mouse)

    else if( type == "mouseup" )
      onStopDrag(state.mouse)

  }, [state.mouse])

  useEffect(()=>{
    state.scrollTo >= 0 && scrollTo(state.scrollTo)
  }, [state.scrollTo])

  // events only binded when Bar element gets a "mousedown" event
  const toggleDragEvents = (toggle = true) => {
    const action = (toggle ? "add" : "remove") + "EventListener"

    document[action]("mousemove", onMouseEvent)
    document[action]("mouseup", onMouseEvent)
  }

  // click-holding the bar and moving it
  const onDrag = e => {
    const delta = e.pageY - state.lastPageY
    const { trackBounds } = state

    raf(() => {
      const sTop = document.documentElement.scrollTop,
            isDragWithinTrackBounds = e.pageY >= (state.trackBounds.top + sTop) &&
                                      e.pageY <= (state.trackBounds.bottom + sTop)

      if (isDragWithinTrackBounds)
        dispatch({ type:"scrollTo", to:state.scrollTop + delta/state.ratio })

      // update variables when cursor position is outside the Track bounds
      else
        dispatch({ type:"drag", scrollTop:refs.content.current.scrollTop, pageY:e.pageY })
    })
  }

  const scrollTo = to => refs.content.current.scrollTop = to

  const onStopDrag = () => {
    toggleDragEvents(false)
    document.body.classList.remove(CLASSNAMES.grab)
    setTimeout(dispatch, 0, { type: "drag" })
  }

  const onBarGrab = e => {
    dispatch({ type:"drag", scrollTop:refs.content.current.scrollTop, pageY:e.pageY })

    document.body.classList.add(CLASSNAMES.grab)
    toggleDragEvents()
  }

  const onTrackClick = e => {
    if (!track || state.isDragging) return

    const { trackBounds: _TB } = state,
          perc = (e.clientY - _TB.top) /(_TB.height - _TB.topPad - _TB.bottomPad),
          scrollHeight = refs.content.current.scrollHeight,
          ownHeight = refs.wrap.current.clientHeight,
          newScrollTop = perc * (scrollHeight - ownHeight);

    if (track === "smooth") {
      dispatch({ type: "toggleSmoothScroll" })
      setTimeout(dispatch, 500, { type:"toggleSmoothScroll" })
    }

    dispatch({ type:"scrollTo", to:newScrollTop })
  }

  const getTrackBounds = useCallback(() => {
    const bounds = refs.track.current.getBoundingClientRect()
    const { paddingTop, paddingBottom } = window.getComputedStyle(refs.track.current, null)

    bounds.topPad = parseInt(paddingTop, 10)
    bounds.bottomPad = parseInt(paddingBottom, 10)

    dispatch({ type: "trackBounds", payload: bounds })
    return bounds
  }, [])

  // move th fake track bar element
  const setBarGeometry = () => {
    const scrollHeight = refs.content.current.scrollHeight,
          ownHeight = refs.wrap.current.clientHeight,
          scrollRatio = refs.content.current.scrollTop / (refs.content.current.scrollHeight - ownHeight)

    // update fake scrollbar location on the Y axis using requestAnimationFrame
    raf(() => {
      const height = (ownHeight / scrollHeight) * 100,
            top = (refs.content.current.scrollTop / scrollHeight) * 100

      dispatch({ type: "ratio", payload: refs.track.current.clientHeight / scrollHeight })
      dispatch({ type: "barProps", payload: { height, top, scrollHeight, ownHeight } })

      onChangeCB && onChangeCB({ scrollRatio })
    })
  }

  return (
    <div className={cx("fakeScroll", state.hasBar && CLASSNAMES.hasBar, className)} onMouseEnter={onScrollResize}>
      <div className="fakeScroll__wrap" ref={refs.wrap}>
        <div
          className="fakeScroll__content"
          ref={refs.content}
          style={state.smoothScroll ? { scrollBehavior: "smooth" } : undefined}
          onScroll={onScrollResize}
          {...rest}
        >
          {children}
        </div>
      </div>
      <div
        className={cx("fakeScroll__track")}
        onClick={onTrackClick}
        ref={refs.track}
      >
        { state.hasBar &&
          <div
            style={state.barStyle}
            className={cx("fakeScroll__bar", state.isDragging && CLASSNAMES.grab)}
            onMouseDown={onBarGrab}
          />
        }
      </div>
    </div>
  )
}

export default FakeScroll
