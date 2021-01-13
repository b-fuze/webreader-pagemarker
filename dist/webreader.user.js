// ==UserScript==
// @name         WebReader Page Markers
// @namespace    https://b-fuze.dev/
// @version      0.1.0
// @description  Add page markers to webreader.io
// @author       b-fuze
// @match        https://ebooks.cenreader.com/*
// @run-at       document-end
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

    border-left: 2px solid red;
    background: #DDD;
    color: #222;
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

    // const paragraphs = new Set<HTMLParagraphElement>();
    function pbLabel(page) {
        const label = document.createElement("label");
        label.classList.add(labelClass);
        const strong = document.createElement("strong");
        label.textContent = "PAGE ";
        strong.textContent = String(page);
        label.appendChild(strong);
        return label;
    }
    function fixMarkers() {
        const pageBreaks = Array.from(document.querySelectorAll(markerSelector));
        for (const brk of pageBreaks) {
            const pageNumber = +brk.getAttribute("title");
            brk.appendChild(pbLabel(pageNumber));
            brk.setAttribute("title", "Page " + pageNumber);
        }
    }

    // Setup styles
    installStyles(pageMarkerStyles);
    installStyles(nestedTableOfContentStyles);
    console.log("Applied styles");
    // Fix markers on page
    fixMarkers();

}());
