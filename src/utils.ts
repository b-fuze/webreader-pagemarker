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

