fakeScroll
========

### [DEMO PAGE](http://yaireo.github.io/fakescroll)

Uber lightweight & robust custom scrollbar replacement jQuery plugin.
The internet deserves a performant custom scrollbar script that is flexible, easy to use and only weights ~5.4k.


## Example markup for typical use-case

    <div class="fakeScroll">
        ...
        ...
        ...
    </div>

## The above will become this (once plugin is applied):

    <div class="fakeScroll">
        <div class="scrollWrap">
            <div class="scrollContent">
                ...
                ...
                ...
            </div>
        </div>
        <div class="fakeScrollBar"></div>
    </div>

## Initializing

    $('.fakeScroll').fakeScroll();

## Settings

Name                | Type       | Default     | Info
------------------- | ---------- | ----------- | --------------------------------------------------------------------------
theme               | String     | undefined   | Class name which is added to the ".fakeScrollBar" element
offset              | String     | 0 0         | scroll offset, from start and end
sensitivity         | Number     | 1           | scroll sensitivity multiplier
minBarSizer         | Number     | 50          | Minimum size for the fake scroll bar, in pixels
