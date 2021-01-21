import { markerSelector, labelClass } from "./utils";


function pbLabel(page: number) {
  const label = document.createElement("label");
  label.classList.add(labelClass);

  const strong = document.createElement("strong");
  label.textContent = "PAGE ";
  strong.textContent = String(page);
  label.appendChild(strong);

  return label;
}

const pbGuard = Symbol();
declare global {
  interface Element {
    [pbGuard]: boolean;
  }
}

function updateMarkers() {
  const pageBreaks = Array.from(document.querySelectorAll(markerSelector));
  for (const brk of pageBreaks) {
    if (!brk[pbGuard]) {
      const pageNumber = +brk.getAttribute("title")!;
      brk.appendChild(pbLabel(pageNumber));
      brk.setAttribute("title", "Page " + pageNumber);
      brk[pbGuard] = true;
    }
  }
}

const spanSet = new Set<Element>();
export function fixMarkers() {
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

