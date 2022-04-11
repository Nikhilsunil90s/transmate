export function loadExternalScript(scriptMeta = {}) {
  const script = document.createElement("script");
  Object.assign(script, scriptMeta);

  // script.integrity =
  // "sha512-zhDD6mpjQmjTOqcC2jd9iRgxmAlk/pmCCUPjKA9XWbcmvk7o0Jr8/9Dr0qQ5V54DPQJcRgCvlgFrtWMxgRjSOQ==";
  // script.crossorigin = "anonymous";
  script.async = true;

  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}

export function loadExcelJS() {
  const scriptMeta = {
    type: "text/javascript",
    src: "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.1.1/exceljs.min.js",
    integrity:
      "sha512-zhDD6mpjQmjTOqcC2jd9iRgxmAlk/pmCCUPjKA9XWbcmvk7o0Jr8/9Dr0qQ5V54DPQJcRgCvlgFrtWMxgRjSOQ==",
    crossOrigin: "anonymous"
  };
  return loadExternalScript(scriptMeta);
}
