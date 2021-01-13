import { tag as css, markerSelector, labelClass } from "./utils";

export const pageMarkerStyles = css`
  .sect2 {
    position: relative;
  }

  ${ markerSelector } {
    vertical-align: top;
  }

  ${ markerSelector }:hover::before {
    content: "";
    position: absolute;
    margin-top: 0.25em;
    width: 150px;
    height: 1.3em;
    z-index: 10;

    background: linear-gradient(to right, rgba(255, 0, 0, 0.25), rgba(255, 0, 0, 0));
    border-left: 2px solid #F00;
  }

  .${ labelClass } {
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

export const nestedTableOfContentStyles = css`
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

