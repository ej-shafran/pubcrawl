export type Subscription<TData> = (
  ...args: TData extends (...args: infer TArgs) => any ? TArgs : [TData]
) => void;
