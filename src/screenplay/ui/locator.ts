export const xpathLiteral = (value: string): string =>
    `'${ value.replace(/'/g, "''") }'`;
