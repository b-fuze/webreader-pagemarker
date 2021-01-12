import { styles } from "./styles";
import { fixMarkers } from "./markers";

addEventListener("load", () => {
  // Setup styles
  const styleElm = document.createElement("style");
  styleElm.appendChild(new Text(styles));
  document.head.appendChild(styleElm);

  // Fix markers on page
  fixMarkers();
});

