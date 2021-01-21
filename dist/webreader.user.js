// ==UserScript==
// @name         WebReader Page Markers
// @namespace    https://b-fuze.dev/
// @version      0.1.3
// @description  Add page markers to webreader.io
// @author       b-fuze
// @match        https://ebooks.cenreader.com/*
// @run-at       document-body
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const markerSelector = 'span[id^="page"]:not(.pagenumber)';
    const labelClass = "bf-page-break-label";
    const tag = (text, ...values) => {
        const out = [text[0]];
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            out.push(value);
            out.push(text[i + 1]);
        }
        return out.join("");
    };
    const parentObservers = new Map();
    function persistChild(parent, child) {
        parent.appendChild(child);
        let list = parentObservers.get(parent);
        if (!list) {
            list = [];
            parentObservers.set(parent, list);
            // Observe parent for changes
            let lastListener = null;
            const observer = new MutationObserver(records => {
                let reappend = records.find(r => r.removedNodes.length);
                if (reappend) {
                    clearTimeout(lastListener);
                    lastListener = setTimeout(() => {
                        for (const child of list) {
                            if (child.parentNode !== parent) {
                                parent.appendChild(child);
                            }
                        }
                    }, 250);
                }
            });
            observer.observe(parent, {
                childList: true,
            });
        }
        list.push(child);
    }
    const installStyles = (styles) => {
        const styleElm = document.createElement("style");
        styleElm.appendChild(new Text(styles));
        // Ensure style element isn't removed
        persistChild(document.head, styleElm);
        return styleElm;
    };

    const pageMarkerStyles = tag `
  .sect2 {
    position: relative;
  }

  ${markerSelector} {
    vertical-align: top;
  }

  ${markerSelector}:hover::before {
    content: "";
    position: absolute;
    margin-top: 0.25em;
    width: 150px;
    height: 1.3em;
    z-index: 10;

    background: linear-gradient(to right, rgba(255, 0, 0, 0.25), rgba(255, 0, 0, 0));
    border-left: 2px solid #F00;
  }

  .${labelClass} {
    position: absolute;
    display: block;
    right: 100%;
    margin-top: -3em;
    margin-right: 5px;
    padding: 0.3em 0.5em;
    white-space: nowrap;

    font-size: 0.45em;
    line-height: normal;
    user-select: none;

    border-left: 2px solid red;
    background: #DDD;
    color: #222;
  }

  .${labelClass} * {
    background: transparent !important;
  }
`;
    const nestedTableOfContentStyles = tag `
  ul.toc-nested .toc-item {
    --indent-width: 25px;
    padding-left: var(--indent-width);
  }

  ul.toc-nested .toc-item .toc-page-root {
    position: relative;
    --bf-border-color: #373737;
    border-left: 1px solid var(--bf-border-color);
  }

  ul.toc-nested li:first-child .toc-item .toc-page-root::before {
    content: "";
    position: absolute;
    display: block;
    top: -1px;
    right: 100%;
    width: var(--indent-width);
    height: 1px;
    background: var(--bf-border-color);
  }
`;

    function pbLabel(page) {
        const label = document.createElement("label");
        label.classList.add(labelClass);
        const strong = document.createElement("strong");
        label.textContent = "PAGE ";
        strong.textContent = String(page);
        label.appendChild(strong);
        return label;
    }
    const pbGuard = Symbol();
    function updateMarkers() {
        const pageBreaks = Array.from(document.querySelectorAll(markerSelector));
        for (const brk of pageBreaks) {
            if (!brk[pbGuard]) {
                const pageNumber = +brk.getAttribute("title");
                brk.appendChild(pbLabel(pageNumber));
                brk.setAttribute("title", "Page " + pageNumber);
                brk[pbGuard] = true;
            }
        }
    }
    const spanSet = new Set();
    function fixMarkers() {
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                const oldSize = spanSet.size;
                // Iterate the existing page numbers
                for (const span of Array.from(document.querySelectorAll(markerSelector))) {
                    spanSet.add(span);
                }
                if (oldSize !== spanSet.size) {
                    updateMarkers();
                }
            }, 250);
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    const overriddenTemplates = {};
    const overriddenControllers = {};
    let origAngular = null;
    /**
     * Intercept methods on objects
     * TODO: Probably rename to "decorator" something or another lol
     */
    function interceptFunc(obj, prop, intercept, initNull = true, force = false) {
        const guardSym = Symbol.for("org.bfuze.intercept." + prop);
        // Prevent from setting the same interceptor twice
        if (!force && guardSym in obj) {
            return;
        }
        // Add interceptor funcs
        let origFunc = initNull ? obj[prop] : () => { };
        function next(args) {
            return origFunc.apply(obj, args);
        }
        Object.defineProperty(obj, prop, {
            configurable: false,
            get() {
                return origFunc && function (...args) {
                    return intercept(args, next);
                };
            },
            set(value) {
                origFunc = value;
            },
        });
        // Add guard to prevent future conflicts
        obj[guardSym] = true;
    }
    /**
     * Intercept angular instance to override some of its
     * functionality
     */
    function attach() {
        Object.defineProperty(window, "angular", {
            get() {
                return origAngular;
            },
            set(value) {
                interceptFunc(value, "module", (args, next) => {
                    const modName = args[0];
                    const mod = next(args);
                    // Intercept component creation for the "app" module
                    if (modName === "app") {
                        interceptFunc(mod, "component", (args, next) => {
                            const componentName = args[0];
                            const componentMeta = args[1];
                            if (componentName in overriddenControllers) {
                                const ctrl = componentMeta.controller.pop();
                                const override = overriddenControllers[componentName];
                                function next(args) {
                                    return ctrl.apply(this, args);
                                }
                                function newCtrl(...args) {
                                    return override.call(this, args, next.bind(this));
                                }
                                Object.defineProperty(newCtrl, "length", {
                                    value: ctrl.length,
                                });
                                componentMeta.controller.push(newCtrl);
                            }
                            const component = next(args);
                            return component;
                        });
                    }
                    // Intercept "commons" mod to override template creation
                    if (modName === "commons") {
                        interceptFunc(mod, "run", (args, next) => {
                            const arr = args[0];
                            const section = arr[0];
                            if (section === "$templateCache") {
                                const templFunc = arr.pop();
                                arr.push(function (templCache) {
                                    // Intercept templates before they're stored in the cache
                                    interceptFunc(templCache, "put", (args, next) => {
                                        let [url, template] = args;
                                        if (url in overriddenTemplates) {
                                            template = overriddenTemplates[url];
                                        }
                                        return next([url, template]);
                                    });
                                    templFunc(templCache);
                                });
                            }
                            return next(args);
                        });
                    }
                    return mod;
                });
                origAngular = value;
            },
        });
    }
    /**
     * Override Angular Templates
     */
    function overrideTemplate(path, src) {
        overriddenTemplates[path] = src;
    }
    /**
     * Override Angular component controller functions
     */
    function overrideController(name, override) {
        overriddenControllers[name] = override;
    }

    /**
     * Make annotation accessible by wrapping it inside an actual
     * <a> anchor element in lieu of the terrible Jaavscript feature
     * that can only open in the current tab
     */
    function accessibleAnnotationList() {
        overrideController("readerInputItemViewer", function (args, next) {
            this.bfuzeGetAnnotationUrl = function () {
                const annotationId = this.item.id;
                const bookId = location.hash.split("/")[2];
                const pageId = this.item.pageId;
                return `https://ebooks.cenreader.com/#!/reader/${bookId}/page/${pageId}?highlight=${annotationId}&scrollTo=${annotationId}`;
            };
            return next(args);
        });
        overrideTemplate("app/reader/user-input/components/reader-input-item-viewer/reader-input-item-viewer.html", tag `
    <div class="reader-input-item-viewer" ng-class="{'item-missing-page-border': !$ctrl.page,        'bookmark-error': $ctrl.type == 'bookmark' &amp;&amp; !$ctrl.page,        'notes-error': $ctrl.type == 'note' &amp;&amp; !$ctrl.page,        'highlight-error': $ctrl.type == 'highlight' &amp;&amp; !$ctrl.page,        'normal-bookmark': $ctrl.type == 'bookmark' &amp;&amp; $ctrl.page}">
        <div class="item-missing-page" ng-if="!$ctrl.page"><i class="material-icons md-18 icon">error</i><span class="caption">{{ 'GT_USER_INPUTS_NOT_DISPLAYED_TITLE' | translate }}</span></div>
        <div class="sync-content" gt-colors="{background: $ctrl.color}" ng-mouseover="$ctrl.hover = true" ng-mouseleave="$ctrl.hover = false" tabindex="-1" aria-label="{{($ctrl.item.options.selectedText) | decodeURI}}" ng-class="{'item-missing-page-cursor': !$ctrl.page &amp;&amp; $ctrl.hover,            'sync-content-bookmark': $ctrl.type == 'bookmark',            'sync-content-note': $ctrl.type == 'note',            'sync-content-highlight': $ctrl.type == 'highlight',            'page-exist': (!$ctrl.pageTitle &amp;&amp; $ctrl.hover) }">
            <a href="{{ $ctrl.bfuzeGetAnnotationUrl() }}" style="text-decoration: none; color: inherit;">
              <p ng-bind-html="($ctrl.markedHighlight || $ctrl.item.options.selectedText)                 | decodeURI | sanitizeText | readMore: {size: 320, html: true}" aria-label="{{ $ctrl.item.options.selectedText | decodeURI | sanitizeText | readMore: {full: true} }}" ng-if="$ctrl.item.options.selectedText &amp;&amp; $ctrl.type !== 'note' " tabindex="0"></p>
            </a>
            <div class="note-content" ng-if="$ctrl.type === 'note'" aria-label="{{($ctrl.item.options.selectedText + ', ' + $ctrl.item.options.noteText)| decodeURI | sanitizeText}}" tabindex="0"><span class="highlight-caption" ng-bind-html="($ctrl.markedselectedText || $ctrl.item.options.selectedText)                     | decodeURI | sanitizeText | readMore: {size: 320, html: true}" aria-label="{{ $ctrl.item.options.selectedText | decodeURI | sanitizeText | readMore: {full: true} }}" ng-if="$ctrl.item.options.selectedText" tabindex="-1"></span><span class="note-highlight" ng-bind-html="$ctrl.getNoteText()                     | decodeURI | readMore: {full: $ctrl.fullNote, size: 320, html: true}" aria-label="{{ $ctrl.item.options.noteText | decodeURI | readMore: {full: true} }}" ng-if="$ctrl.type === 'note' &amp;&amp; $ctrl.item.options.noteText" tabindex="-1"></span><span class="note-show-more-less" ng-if="$ctrl.item.options.noteText.length &gt; 320" ng-click="$ctrl.showMoreOrLess()" translate="{{$ctrl.moreOrLess}}"></span></div>
            <p ng-if="$ctrl.pageTitle &amp;&amp; $ctrl.type === 'bookmark'" ng-bind-html="($ctrl.markedBookmark || $ctrl.item.pageTitle)                 | decodeURI | sanitizeText | readMore: {size: 320, html: true}" tabindex="0" aria-label="{{ $ctrl.pageTitle | decodeURI | sanitizeText | readMore: {full: true} }}"></p>
            <p class="page-missing" ng-if="!$ctrl.page &amp;&amp; $ctrl.type === 'bookmark'" aria-label="{{'GT_USER_INPUT_MISSING_PAGE' | translate}}" translate="GT_USER_INPUT_MISSING_PAGE" tabindex="0"></p>
        </div>
        <div class="sync-menu"><i class="material-icons">{{$ctrl.getAnnotationIcon()}}</i><span tabindex="0" role="input" aria-label="{{$ctrl.type}}">{{$ctrl.typeTranslation}}</span><span class="flex"></span><span class="date">{{ $ctrl.item.$updated_at | date: 'shortDate' }}</span>
            <div class="anontation-select" ng-init="openAnnotationMenu = false" deep-blur="openAnnotationMenu = false" tabindex="-1" ng-class="{'anontation-select-expandet': openAnnotationMenu,                 'anontation-select-expandet-bookmark': openAnnotationMenu &amp;&amp; $ctrl.type == 'bookmark'}"><span class="anontation-menu" ng-click="openAnnotationMenu = !openAnnotationMenu;$ctrl.openDropdown($event, openAnnotationMenu)" ng-attr-expanded="{{ openAnnotationMenu }}" tabindex="-1"><i class="material-icons" tabindex="0" aria-label="{{'GT_USER_INPUT_OPTIONS' | translate}}">more_vert</i></span>
                <div class="anontation-dropdown" ng-class="{'fade': openAnnotationMenu,                     'last-item': $ctrl.isLastItem(openAnnotationMenu) &amp;&amp; $ctrl.item.type !== 'bookmark',                     'last-item-bookmark': $ctrl.isLastItem(openAnnotationMenu) &amp;&amp; $ctrl.item.type === 'bookmark'}" ng-click="openAnnotationMenu = false" ng-show="openAnnotationMenu" gt-colors="{                     color:'textColor'                 }" tabindex="-1">
                    <div class="anontation-menu-item" ng-class="{'disabled-div': !$ctrl.page}" gt-colors="{                             hover: {                                 background: 'primaryColor',                                 color: '#fff'                             }                         }"><button class="link" ng-class="{'disabled-button': !$ctrl.page}" ng-disabled="!$ctrl.page" gt-modal="gt-modal" params="$ctrl.goToAnnotationModal" approve-button="$ctrl.goToAnnotation()"></button></div>
                    <div class="anontation-menu-item" ng-if="$ctrl.type == 'note' || $ctrl.type == 'highlight'" gt-colors="{                             hover: {                                 background: 'primaryColor',                                 color: '#fff'                             }                         }"><button class="link" ng-if="$ctrl.type == 'note'" ng-click="$ctrl.openNoteMode($event)" translate="GT_USER_INPUT_EDIT_NOTE"></button><button class="link" ng-if="$ctrl.type == 'highlight'" ng-click="$ctrl.openNoteMode($event)" translate="GT_USER_INPUT_CHANGE_INTO_NOTE"></button></div>
                    <div class="anontation-menu-item" gt-colors="{                             hover: {                                 background: 'primaryColor',                                 color: '#fff'                             }                         }"><button class="link" gt-modal="gt-modal" params="$ctrl.modalParams" approve-button="$ctrl.delete()"></button></div>
                </div>
            </div>
        </div>
    </div>
    <reader-input-note settings="$ctrl.noteSettings" ng-if="$root.SessionService.readerMode == 'EDIT'        || $root.SessionService.readerMode == 'SINGLE'"></reader-input-note>
  `);
    }

    // Setup styles
    installStyles(pageMarkerStyles);
    installStyles(nestedTableOfContentStyles);
    console.log("Applied styles");
    // Fix markers on page
    fixMarkers();
    // Attach Angular interception
    attach();
    // Make angular-based annotations accessible
    accessibleAnnotationList();

}());
