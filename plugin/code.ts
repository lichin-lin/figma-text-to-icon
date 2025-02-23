declare const SITE_URL: string;

figma.showUI(`<script>window.location.href = '${SITE_URL}'</script>`, {
  width: 300,
  height: 544,
});

figma.ui.onmessage = (msg) => {
  if (msg.type === "EVAL") {
    const { code, id, params } = msg;
    try {
      const fn = eval(code);
      const result = fn(figma, params);
      figma.ui.postMessage({
        type: "EVAL_RESULT",
        id,
        result,
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "EVAL_REJECT",
        id,
        error: (error as Error).message,
      });
    }
  } else if (msg.type === "paste-svg") {
    const newSVGNode = figma.createNodeFromSvg(msg.svg);
    figma.currentPage.appendChild(newSVGNode);
    figma.currentPage.selection = [newSVGNode];
  }
};
