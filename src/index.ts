import { pageMarkerStyles, nestedTableOfContentStyles } from "./styles";
import { fixMarkers } from "./markers";
import { installStyles } from "./utils";
import { attach } from "./attach-angular";
import { accessibleAnnotationList } from "./accessible-annotation-list";

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

