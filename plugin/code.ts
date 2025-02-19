declare const SITE_URL: string;

figma.showUI(`<script>window.location.href = '${SITE_URL}'</script>`, {
  width: 300,
  height: 544,
});

figma.ui.onmessage = (msg) => {
  if (msg.type === "paste-svg") {
    const newSVGNode = figma.createNodeFromSvg(msg.svg);
    figma.currentPage.appendChild(newSVGNode);
    figma.currentPage.selection = [newSVGNode];
  }
};