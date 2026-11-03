import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Agente, CambiosAgente } from "../diseño.js";
import { getAgente, patchAgente } from "../infraestructura.js";
import { ContextoDetalleAgente, EstadoDetalleAgente } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleAgente, ContextoDetalleAgente>;

const pipeAgente = ejecutarListaProcesos<EstadoDetalleAgente, ContextoDetalleAgente>;

const CAMPOS_EDITABLES = [
    "nombre_pila",
    "apellidos",
    "id_fiscal",
    "por_comision",
    "telefono",
    "email",
    "direccion",
    "ciudad",
    "codpostal",
    "provincia",
] as const;

export const metaAgente: MetaModelo<Agente> = {
    campos: {
        nombre: { requerido: false, bloqueado: true },
        nombre_pila: { requerido: true },
        apellidos: { requerido: true },
        id_fiscal: { requerido: true },
        por_comision: { requerido: true, tipo: "decimal", decimales: 2 },
        telefono: { requerido: false, tipo: "telefono" },
        email: { requerido: false, tipo: "email" },
        direccion: { requerido: false },
        ciudad: { requerido: false },
        codpostal: { requerido: false },
        provincia: { requerido: false },
        usuario_id: { requerido: false, bloqueado: true },
    },
};

export const agenteInicial = (): Agente => ({
    id: '',
    nombre: '',
    nombre_pila: '',
    apellidos: '',
    id_fiscal: '',
    por_comision: 0,
    telefono: null,
    email: null,
    direccion: null,
    ciudad: null,
    codpostal: null,
    provincia: null,
    usuario_id: null,
});

export const contextoDetalleAgenteInicial: ContextoDetalleAgente = {
    estado: 'INICIAL',
    agente: agenteInicial(),
};

export const refrescarAgente: ProcesarDetalle = async (contexto) => {
    const agente = await getAgente(contexto.agente.id);

    return [
        { ...contexto, agente },
        [["agente_cambiado", agente]],
    ];
};

export const guardarAgente = async (
    contexto: ContextoDetalleAgente,
    agente: Agente,
): Promise<void> => {
    const anterior = contexto.agente;
    const cambios: CambiosAgente = {};
    CAMPOS_EDITABLES.forEach((campo) => {
        if (agente[campo] !== anterior[campo]) {
            (cambios as Record<string, unknown>)[campo] = agente[campo];
        }
    });
    if (Object.keys(cambios).length === 0) return;

    await patchAgente(agente.id, cambios);
};

export const cargarAgente: (_: string) => ProcesarDetalle =
    (idAgente) => async (contexto) => {
        const agente = await getAgente(idAgente);
        return pipeAgente(contexto, [
            async (ctx) => ({ ...ctx, agente }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idAgente = payload as string;
    if (idAgente) {
        return cargarAgente(idAgente)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', agente: agenteInicial() };
};
