export const markerSelector = 'span[id^="page"]:not(.pagenumber)';
export const labelClass = "bf-page-break-label";

export const tag = (text: TemplateStringsArray, ...values: string[]) => {
  const out = [text[0]];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    out.push(value);
    out.push(text[i + 1]);
  }

  return out.join("");
}

const parentObservers = new Map<Element, Element[]>();
function persistChild(parent: Element, child: Element) {
  parent.appendChild(child);

  let list = parentObservers.get(parent);
  if (!list) {
    list = [];
    parentObservers.set(parent, list);

    // Observe parent for changes
    let lastListener: NodeJS.Timeout = null as any as NodeJS.Timeout;
    const observer = new MutationObserver(records => {
      let reappend = records.find(r => r.removedNodes.length);

      if (reappend) {
        clearTimeout(lastListener);
        lastListener = setTimeout(() => {
          for (const child of list!) {
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

export const installStyles = (styles: string) => {
  const styleElm = document.createElement("style");
  styleElm.appendChild(new Text(styles));

  // Ensure style element isn't removed
  persistChild(document.head, styleElm);
  return styleElm;
}

