import { markerSelector, labelClass } from "./utils";

// const paragraphs = new Set<HTMLParagraphElement>();
function pbLabel(page: number) {
  const label = document.createElement("label");
  label.classList.add(labelClass);

  const strong = document.createElement("strong");
  label.textContent = "PAGE ";
  strong.textContent = String(page);
  label.appendChild(strong);

  return label;
}

export function fixMarkers() {
  const pageBreaks = Array.from(document.querySelectorAll(markerSelector));
  for (const brk of pageBreaks) {
    const pageNumber = +brk.getAttribute("title")!;
    brk.appendChild(pbLabel(pageNumber));
    brk.setAttribute("title", "Page " + pageNumber);
  }
}

