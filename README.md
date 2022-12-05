<h1 align="center">
  <a href='https://yaireo.github.io/fakescroll'><img src="/scroll.png" width="40%" /></a>
  <br><br>
  <a href='https://yaireo.github.io/fakescroll'>FakeScroll</a>⚡<em>lightweight</em> custom-looking scrollbars
</h1>

<p align="center">
  <a href='https://www.npmjs.com/package/@yaireo/fakescroll'>
      <img src="https://img.shields.io/npm/v/@yaireo/fakescroll.svg" />
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@yaireo/fakescroll" />
  <img src="https://img.shields.io/npm/dw/@yaireo/fakescroll" />
</p>


- 1.4KB gzipped (js)
- 4.0KB minified (js)
- 7.7KB unminified (js)
- ~20+ KB avarage similar scripts (unminified)

> Currently only supports *vertical* scroll due to cultural norms

While there is somewhat of a support for scrollbar customization [through CSS](https://atomiks.github.io/30-seconds-of-css/#custom-scrollbar), it is not fully supported
in all browsers / older versions and the level of customization isn't flexible enough to allow creativity or certain special product needs.

👉 Make sure to *import* `fakescroll.css`

## Install ([CDN](jsdelivr.com/package/npm/@yaireo/fakescroll)):

```bash
npm i @yaireo/fakescroll
```

## [React port](https://codesandbox.io/s/react-fakescroll-4rdel)

```js
import FakeScroll from '@yaireo/fakescroll/react.fakescroll.js'
import '@yaireo/fakescroll/fakescroll.css'

const onFakeScrollChange = ({ scrollRatio }) => console.log(scrollRatio)

<FakeScroll className='foo' track='smooth' onChange={onFakeScrollChange}>
    ...
</FakeScroll>
```

## Example markup:
```html
<div class="foo">
    ...
    ...
    ...
</div>
```

## Initialize custom scrollbar with callback:
```js
var myScrollbar = document.querySelector('.foo').fakeScroll({
    onChange: () => console.log( myScrollbar.scrollRatio )
})
```

The `onChange` also has a `scrollRatio` propery in its *argument*:

```js
document.querySelector('.foo--outside').fakeScroll({
    onChange: ({ scrollRatio }) => console.log( scrollRatio )
});
```

## The above markup will now become:
```html
<div class="foo fakeScroll fakeScroll--hasBar">
    <div class="fakeScroll__wrap">
        <div class="fakeScroll__content">
            ...
            ...
            ...
        </div>
    </div>
    <div class="fakeScroll__bar"></div>
</div>
```
## Browser support

The script probably won't work on IE without [Babel](https://babeljs.io/docs/en/babel-cli) & [ES2015 polyfills](https://github.com/paulmillr/es6-shim).

### [DEMO PAGE](http://yaireo.github.io/fakescroll)

## Settings

Name                | Type            | Default     | Info
------------------- | ----------      | ----------- | --------------------------------------------------------------------------
classname           | String          | ""          | Class name which is added to the scrollbar Track element
track               | Boolean/String  | false       | enable track events. use "smooth" for smooth "jumping"
onChange            | Function        |             | Callback function whenever the scroll updates
