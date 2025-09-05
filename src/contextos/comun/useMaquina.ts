import { useCallback, useReducer, useRef } from "react";

type OnEvento<E> = (payload?: unknown) => E | void | Promise<E | void>

export type Maquina<E extends string> = Record<E, Record<string, E | OnEvento<E>>>;



type ProcesarEvento = (evento: string, payload?: unknown) => void;
export function useMaquina<Estado extends string>(
    maquina: Maquina<Estado>,
    estado: Estado,
    setEstado: (estado: Estado) => void
): ProcesarEvento {
    return useCallback(async (evento, payload) => {
        // console.log("procesarEvento", evento, payload, 'estado actual', estado);
        if (!(evento in maquina[estado])) {
            return;
        }
        const proceso = maquina[estado][evento];
        const nuevoEstado = proceso ?
            typeof proceso === 'string'
                ? proceso
                : await proceso(payload) : undefined;
        setEstado(nuevoEstado || estado);
    }, [maquina, estado, setEstado]);
}


// export function useMaquina2<Estado extends string>(
//     maquina: Maquina<Estado>,
//     estadoInicial: Estado,
// ): [ProcesarEvento, Estado, (estado: Estado) => void] {

//     const [estado, setEstado] = useState<Estado>(estadoInicial);
//     const estadoPrevio = useRef<Estado>(estadoInicial);

//     if (estado !== estadoPrevio.current) {
//         estadoPrevio.current = estado;
//         if ('al_entrar' in maquina[estado]) {
//             const onEnter = maquina[estado].al_entrar;
//             if (typeof onEnter === 'function') {
//                 onEnter();
//             }
//         }
//     }

//     const emitir: ProcesarEvento = useCallback(async (evento, payload) => {
//         // console.log("Evento recibido:", evento, "en estado actual:", estado);
//         if (!(evento in maquina[estado])) {
//             return;
//         }
//         const proceso = maquina[estado][evento];
//         const nuevoEstado = proceso ?
//             typeof proceso === 'string'
//                 ? proceso
//                 : await proceso(payload) : undefined;
//         setEstado(nuevoEstado || estado);

//     }, [maquina, estado]);

//     return [emitir, estado, setEstado];
// }

type ContextoBase = Record<string, unknown>
type ParamsOnEvento<E extends string, C extends ContextoBase> = {
    maquina: Maquina3<E, C>;
    payload?: unknown;
    setEstado: (estado: E) => (maquina: Maquina3<E, C>) => Maquina3<E, C>;
    publicar: ProcesarEvento;
}
type OnEvento3<E extends string, C extends ContextoBase> = ({
    maquina, payload, setEstado }: ParamsOnEvento<E, C>
) => Maquina3<E, C> | void;

type AccionR = {
    evento: string,
    payload: unknown
}

// export type ConfigMaquina3<E extends string, C extends ContextoBase> = Record<E, Record<string, E | OnEvento3<E, C>>>;

// const makeReductor = <Estado extends string, Contexto extends ContextoBase>(
//     config: ConfigMaquina3<Estado, Contexto>,
//     publicar: ProcesarEvento
// ) => {

//     const setEstado = (estado: Estado) => (maquina: Maquina3<Estado, Contexto>) => {
//         return {
//             ...maquina,
//             estado
//         };
//     }


//     const reductor = (maquina: Maquina3<Estado, Contexto>, accion: AccionR): Maquina3<Estado, Contexto> => {
//         // switch (accion.evento) {
//         //     case "emitir": {
//         const evento = accion.evento;
//         if (!(evento in config[maquina.estado])) {
//             return maquina;
//         }
//         const proceso = config[maquina.estado][evento];
//         const nuevoEstado = proceso ?
//             typeof proceso === 'string'
//                 ? {
//                     ...maquina,
//                     estado: proceso,
//                 }
//                 : proceso({ maquina, payload: accion.payload, setEstado, publicar })
//             : maquina;
//         return nuevoEstado ?? maquina;
//     }
//     return reductor;
// }

export type Maquina3<Estado extends string, Contexto extends ContextoBase> = {
    estado: Estado,
    contexto: Contexto
}
// type OpcionesMaquina = {
//     publicar?: ProcesarEvento
// }
// export function useMaquina3<Estado extends string, Contexto extends ContextoBase>(
//     config: ConfigMaquina3<Estado, Contexto>,
//     estadoInicial: Estado,
//     contextoInicial: Contexto,
//     {
//         publicar = () => { }
//     }: OpcionesMaquina
// ): [
//         ProcesarEvento,
//         Maquina3<Estado, Contexto>
//     ] {

//     const [estadoR, dispatch] = useReducer(makeReductor<Estado, Contexto>(config, publicar), {
//         estado: estadoInicial,
//         contexto: contextoInicial
//     });

//     const emitir = useConstant(() => (evento: string, payload: unknown) => {
//         console.log("Evento recibido:", evento, "con payload:", payload);
//         dispatch({ evento, payload })
//     });


//     return [
//         emitir,
//         {
//             estado: estadoR.estado,
//             contexto: estadoR.contexto
//         }
//     ];
// }

export type ConfigMaquina4<E extends string, C extends ContextoBase> = {
    inicial: Maquina3<E, C>,
    estados: Record<E, Record<string, E | OnEvento3<E, C>>>;
}

type OpcionesMaquina4<Estado extends string, Contexto extends ContextoBase> = {
    config: ConfigMaquina4<Estado, Contexto>,
    publicar?: ProcesarEvento
}

export function useMaquina4<Estado extends string, Contexto extends ContextoBase>(
    {
        config,
        publicar = () => { }
    }: OpcionesMaquina4<Estado, Contexto>,
): [
        ProcesarEvento,
        Maquina3<Estado, Contexto>
    ] {

    const [estadoR, dispatch] = useReducer(
        makeReductor4<Estado, Contexto>(config, publicar),
        config.inicial
    );

    const emitir = useConstant(() => (evento: string, payload: unknown) => {
        // console.log("Evento recibido:", evento, "con payload:", payload);
        dispatch({ evento, payload })
    });


    return [
        emitir,
        {
            estado: estadoR.estado,
            contexto: estadoR.contexto
        }
    ];
}

const makeReductor4 = <Estado extends string, Contexto extends ContextoBase>(
    config: ConfigMaquina4<Estado, Contexto>,
    publicar: ProcesarEvento
) => {

    const setEstado = (estado: Estado) => (maquina: Maquina3<Estado, Contexto>) => {
        return {
            ...maquina,
            estado
        };
    }

    const reductor = (maquina: Maquina3<Estado, Contexto>, accion: AccionR): Maquina3<Estado, Contexto> => {
        const evento = accion.evento;
        if (!(evento in config.estados[maquina.estado])) {
            return maquina;
        }
        const proceso = config.estados[maquina.estado][evento];
        const nuevoEstado = proceso ?
            typeof proceso === 'string'
                ? {
                    ...maquina,
                    estado: proceso,
                }
                : proceso({ maquina, payload: accion.payload, setEstado, publicar })
            : maquina;
        return nuevoEstado ?? maquina;
    }
    return reductor;
}

const useConstant = <T>(compute: () => T): T => {
    const ref = useRef<T | null>(null);
    if (ref.current === null) ref.current = compute();
    return ref.current;
};


