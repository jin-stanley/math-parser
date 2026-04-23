import type { AstNode, ArithmeticNode } from '../../parser';

/**
 * Recursive, self-describing AST renderer.
 *
 * JSON.stringify works but bins type/op/children into indistinguishable
 * strings; a dedicated tree makes precedence and associativity visible
 * at a glance (the whole point of showing an AST to the user).
 */

export type AstViewProps = {
  node: AstNode;
};

export function AstView({ node }: AstViewProps) {
  return (
    <pre className="ast-tree" aria-label="AST structure">
      <AstNodeView node={node} />
    </pre>
  );
}

function AstNodeView({ node }: { node: AstNode | ArithmeticNode }) {
  switch (node.type) {
    case 'Num':
      return (
        <div className="ast-node">
          <span className="ast-node__type">Num</span>
          {' '}
          <span className="ast-node__num">{node.value}</span>
        </div>
      );
    case 'Neg':
      return (
        <div className="ast-node">
          <div className="ast-node__header">
            <span className="ast-node__type">Neg</span>
          </div>
          <div className="ast-node__children">
            <Field label="expr">
              <AstNodeView node={node.expr} />
            </Field>
          </div>
        </div>
      );
    case 'BinOp':
      return (
        <div className="ast-node">
          <div className="ast-node__header">
            <span className="ast-node__type">BinOp</span>
            {' '}
            <span className="ast-node__op">{node.op}</span>
          </div>
          <div className="ast-node__children">
            <Field label="left">
              <AstNodeView node={node.left} />
            </Field>
            <Field label="right">
              <AstNodeView node={node.right} />
            </Field>
          </div>
        </div>
      );
    case 'Compare':
      return (
        <div className="ast-node">
          <div className="ast-node__header">
            <span className="ast-node__type">Compare</span>
            {' '}
            <span className="ast-node__op">{node.op}</span>
          </div>
          <div className="ast-node__children">
            <Field label="left">
              <AstNodeView node={node.left} />
            </Field>
            <Field label="right">
              <AstNodeView node={node.right} />
            </Field>
          </div>
        </div>
      );
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="ast-field-label">{label}: </span>
      {children}
    </div>
  );
}
