/**
 * A subscription callback for a certain type `TData`.
 *
 * If `TData` is a function, this subscription function will accept its parameters as arguments.
 * Otherwise, the function will accept `TData`.
 **/
export type Subscription<TData> = (
  ...args: TData extends (...args: infer TArgs) => any ? TArgs : [TData]
) => void;
