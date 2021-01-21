import { pageMarkerStyles, nestedTableOfContentStyles } from "./styles";
import { fixMarkers } from "./markers";
import { installStyles } from "./utils";
import { attach } from "./attach-angular";
import { accessibleAnnotationList } from "./accessible-annotation-list";

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

