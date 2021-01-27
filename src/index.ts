import { pageMarkerStyles, nestedTableOfContentStyles } from "./styles";
import { fixMarkers } from "./markers";
import { installStyles } from "./utils";
import { attach } from "./attach-angular";
import { accessibleAnnotationList } from "./accessible-annotation-list";
import { accessibleSearchResult } from "./accessible-search-result";
import { collapsibleTocItem } from "./collapsible-toc-item";

// Wait for document to load before fixing markers
// and other cosmetic features
addEventListener("DOMContentLoaded", () => {
  // Setup styles
  installStyles(pageMarkerStyles);
  installStyles(nestedTableOfContentStyles);

  // Fix markers on page
  fixMarkers();
});

// Attach Angular interception
attach();

// Make angular-based annotations accessible
accessibleAnnotationList();

// Make search results accessible
accessibleSearchResult();

// Make toc item arrows *only* collapse/expand
collapsibleTocItem();

