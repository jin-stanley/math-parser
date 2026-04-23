import type { AstNode, ArithmeticNode } from '../../parser';

/**
 * Recursive AST renderer using classic tree connectors.
 *
 * Design choices:
 * - No explicit `left:` / `right:` labels. BinOp/Compare always have
 *   left first, right second, so the order is self-evident from the
 *   tree's vertical layout. Removing the labels halves the line count
 *   and makes the structure scannable at a glance.
 * - `├─` / `└─` connectors make sibling vs. last-sibling visually
 *   distinct, which is the main readability issue a bare indent has.
 * - A subtle vertical guide line runs down each children container
 *   to tie siblings together without the clutter of per-ancestor pipes.
 */

export type AstViewProps = {
  node: AstNode;
};

export function AstView({ node }: AstViewProps) {
  return (
    <div className="ast-tree" role="tree" aria-label="AST structure">
      <AstNodeView node={node} />
    </div>
  );
}

function AstNodeView({ node }: { node: AstNode | ArithmeticNode }) {
  switch (node.type) {
    case 'Num':
      return (
        <span className="ast-header">
          <span className="ast-node__type">Num</span>
          <span className="ast-node__num">{node.value}</span>
        </span>
      );

    case 'Neg':
      return (
        <div className="ast-node">
          <span className="ast-header">
            <span className="ast-node__type">Neg</span>
          </span>
          <div className="ast-children">
            <Child isLast>
              <AstNodeView node={node.expr} />
            </Child>
          </div>
        </div>
      );

    case 'BinOp':
    case 'Compare':
      return (
        <div className="ast-node">
          <span className="ast-header">
            <span className="ast-node__type">{node.type}</span>
            <span className="ast-node__op">{node.op}</span>
          </span>
          <div className="ast-children">
            <Child>
              <AstNodeView node={node.left} />
            </Child>
            <Child isLast>
              <AstNodeView node={node.right} />
            </Child>
          </div>
        </div>
      );
  }
}

function Child({
  children,
  isLast = false,
}: {
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={`ast-child ${isLast ? 'ast-child--last' : ''}`} role="treeitem">
      <span className="ast-connector" aria-hidden="true">
        {isLast ? '└─' : '├─'}
      </span>
      <div className="ast-child__body">{children}</div>
    </div>
  );
}
