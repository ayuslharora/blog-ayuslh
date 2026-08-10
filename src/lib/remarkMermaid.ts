import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Rewrites ```mermaid fences into <Mermaid chart="..." /> before rehype-pretty-code
// runs, so the diagram source is rendered as a diagram rather than syntax-highlighted.
export default function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node: any, index, parent: any) => {
      if (node.lang !== 'mermaid' || !parent || index === undefined) return;

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [{ type: 'mdxJsxAttribute', name: 'chart', value: node.value }],
        children: [],
      };
    });
  };
}
