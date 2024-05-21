import { useRef, useState } from "react";
import { memoize } from "./memoize";
import { id } from "tsafe/id";

export type CallbackFactory<FactoryArgs extends unknown[], Args extends unknown[], R> = (
    ...factoryArgs: FactoryArgs
) => (...args: Args) => R;

/**
 * https://docs.powerhooks.dev/api-reference/useListCallbacks
 *
 *  const callbackFactory= useListCallbacks(
 *      ([key]: [string], [params]: [{ foo: number; }]) => {
 *          ...
 *      },
 *      []
 *  );
 *
 * WARNING: Factory args should not be of variable length.
 *
 */
export function useListCallbacks<FactoryArgs extends unknown[], Args extends unknown[], R = void>(
    callback: (...callbackArgs: [FactoryArgs, Args]) => R
): CallbackFactory<FactoryArgs, Args, R> {
    type Out = CallbackFactory<FactoryArgs, Args, R>;

    const callbackRef = useRef<typeof callback>(callback);

    callbackRef.current = callback;

    const memoizedRef = useRef<Out | undefined>(undefined);

    return useState(() =>
        id<Out>((...factoryArgs) => {
            if (memoizedRef.current === undefined) {
                // @ts-expect-error: Todo, figure it out
                memoizedRef.current = memoize(
                    // @ts-expect-error: Todo, figure it out
                    (...factoryArgs: FactoryArgs) =>
                        (...args: Args) =>
                            callbackRef.current(factoryArgs, args),
                    { argsLength: factoryArgs.length }
                );
            }

            // @ts-expect-error: Todo, figure it out
            return memoizedRef.current(...factoryArgs);
        })
    )[0];
}
