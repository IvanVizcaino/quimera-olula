
type F0 = [];
type F1<A, B> = [(input: A) => B];
type F2<A, B, C> = [(input: A) => B, (input: B) => C];
type F3<A, B, C, D> = [(input: A) => B, (input: B) => C, (input: C) => D];
type F4<A, B, C, D, E> = [(input: A) => B, (input: B) => C, (input: C) => D, (input: D) => E];
type F5<A, B, C, D, E, F> = [(input: A) => B, (input: B) => C, (input: C) => D, (input: D) => E, (input: E) => F];
type FN<A, B, C, D, E, F> = F0 | F1<A, B> | F2<A, B, C> | F3<A, B, C, D> | F4<A, B, C, D, E> | F5<A, B, C, D, E, F>;

interface Pipe {
    <A>(value: A): A;
    <A, B>(value: A, fn1: (input: A) => B): B;
    <A, B, C>(value: A, fn1: (input: A) => B, fn2: (input: B) => C): C;
    <A, B, C, D>(
        value: A,
        fn1: (input: A) => B,
        fn2: (input: B) => C,
        fn3: (input: C) => D
    ): D;
    <A, B, C, D, E>(
        value: A,
        fn1: (input: A) => B,
        fn2: (input: B) => C,
        fn3: (input: C) => D,
        fn4: (input: D) => E
    ): E;
    <A, B, C, D, E, F>(
        value: A,
        fn1: (input: A) => B,
        fn2: (input: B) => C,
        fn3: (input: C) => D,
        fn4: (input: D) => E,
        fn5: (input: E) => F
    ): F;
}


export const pipe: Pipe = <A, B, C, D, E, F>(
    value: A,
    ...fns: FN<A, B, C, D, E, F>) => {

    switch (fns.length) {
        case 0:
            return value;
        case 1:
            return fns[0](value);
        case 2:
            return fns[1](fns[0](value));
        case 3:
            return fns[2](fns[1](fns[0](value)));
        case 4:
            return fns[3](fns[2](fns[1](fns[0](value))));
        case 5:
            return fns[4](fns[3](fns[2](fns[1](fns[0](value)))));
        default:
            throw new Error('pipe function supports up to 4 functions');
    }
};
