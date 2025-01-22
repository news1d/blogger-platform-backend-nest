import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () => {
  return Transform(({ value }: TransformFnParams) => {
    return typeof value === 'string' ? value.trim() : value;
  });
};
