@preprocessor typescript

@{%
import { lexer } from './lexer';
import { ast } from './ast';
%}

@lexer lexer

# Precedence climbs from low (Statement) to high (Factor).
# Left-recursive rules are naturally left-associative in Nearley
# because nearley is an Earley parser, not LL(1).

Statement ->
    Expression %EQ  Expression {% ([l, , r]) => ast.cmp('=',  l, r) %}
  | Expression %NEQ Expression {% ([l, , r]) => ast.cmp('!=', l, r) %}
  | Expression                 {% ([e]) => e %}

Expression ->
    Expression %PLUS  Term {% ([l, , r]) => ast.bin('+', l, r) %}
  | Expression %MINUS Term {% ([l, , r]) => ast.bin('-', l, r) %}
  | Term                   {% ([t]) => t %}

Term ->
    Term %TIMES  Factor {% ([l, , r]) => ast.bin('*', l, r) %}
  | Term %DIVIDE Factor {% ([l, , r]) => ast.bin('/', l, r) %}
  | Factor              {% ([f]) => f %}

Factor ->
    %NUMBER                         {% ([tok]) => ast.num(Number(tok.text)) %}
  | %LPAREN Expression %RPAREN      {% ([, e]) => e %}
  | %MINUS Factor                   {% ([, f]) => ast.neg(f) %}
