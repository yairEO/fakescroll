[fakeScroll](http://yaireo.github.io/fakescroll)
========

Very lightweight & robust custom-looking HTML scrollbar script.

- 1.4KB gzipped (js)
- 4.0KB minified (js)
- 7.7KB unminified (js)
- ~20 KB avarage similar scripts (unminified)

> Currently only supports vertical scroll due to cultural norms

## Example markup:

    <div class="foo">
        ...
        ...
        ...
    </div>

## Initializing:

    document.querySelector('.foo').fakeScroll();

## The above will transform into this:

    <div class="foo">
        <div class="fakeScroll__wrap">
            <div class="fakeScroll__content">
                ...
                ...
                ...
            </div>
        </div>
        <div class="fakeScroll__bar"></div>
    </div>

## Browser support

The script probably won't work on IE without [Babel](https://babeljs.io/docs/en/babel-cli) & [ES2015 polyfills](https://github.com/paulmillr/es6-shim).

### [DEMO PAGE](http://yaireo.github.io/fakescroll)

## Settings

Name                | Type            | Default     | Info
------------------- | ----------      | ----------- | --------------------------------------------------------------------------
classname           | String          | ""          | Class name which is added to the scrollbar Track element
track               | Boolean/String  | false       | enable track events. use "smooth" for smooth "jumping"