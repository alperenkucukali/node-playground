interface UpdateField {
  key: string;
  attributeName: string;
  value: unknown;
}

interface UpdateExpressionResult {
  expression: string;
  names: Record<string, string>;
  values: Record<string, unknown>;
}

export function buildUpdateExpression(fields: UpdateField[], errorMessage = 'No updates provided'): UpdateExpressionResult {
  const expressions: string[] = [];
  const names: Record<string, string> = { '#updatedAt': 'UpdatedAt' };
  const values: Record<string, unknown> = { ':updatedAt': new Date().toISOString() };

  expressions.push('#updatedAt = :updatedAt');

  for (const field of fields) {
    if (field.value === undefined) {
      continue;
    }

    const nameKey = `#${field.key}`;
    const valueKey = `:${field.key}`;

    expressions.push(`${nameKey} = ${valueKey}`);
    names[nameKey] = field.attributeName;
    values[valueKey] = field.value;
  }

  if (expressions.length === 1) {
    throw new Error(errorMessage);
  }

  return {
    expression: `SET ${expressions.join(', ')}`,
    names,
    values,
  };
}
