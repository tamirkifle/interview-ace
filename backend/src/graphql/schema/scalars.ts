import { GraphQLScalarType, Kind } from 'graphql';

export const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: unknown) {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('DateTime must be a string or number');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
}); 