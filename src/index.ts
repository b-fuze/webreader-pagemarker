import { pageMarkerStyles, nestedTableOfContentStyles } from "./styles";
import { fixMarkers } from "./markers";
import { installStyles } from "./utils";

// Setup styles
installStyles(pageMarkerStyles);
installStyles(nestedTableOfContentStyles);
console.log("Applied styles");

// Fix markers on page
fixMarkers();

