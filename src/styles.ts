import { tag as css, markerSelector, labelClass } from "./utils";

export const styles = css`
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
