import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Empresa } from "../diseño.js";
import { getEmpresa, patchEmpresa } from "../infraestructura.js";
import { ContextoDetalleEmpresa, EstadoDetalleEmpresa } from "./maquina.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleEmpresa, ContextoDetalleEmpresa>;

const pipeEmpresa = ejecutarListaProcesos<EstadoDetalleEmpresa, ContextoDetalleEmpresa>;

/**
 * Metadatos del formulario: validaciones y configuración de campos.
 */
export const metaEmpresa: MetaModelo<Empresa> = {
    campos: {
        nombre: { requerido: true, minimo: 2 },
        cifNif: { requerido: true },
        administrador: { requerido: true },
        ejercicioId: { requerido: true },
        telefono: { requerido: false, tipo: "telefono" },
        email: { requerido: false, tipo: "email" },
        web: { requerido: false, tipo: "url" },
        serieId: { requerido: false },
        formaPagoId: { requerido: false },
        divisaId: { requerido: false },
        almacenId: { requerido: false },

        tipoVia: { requerido: false },
        nombreVia: { requerido: false },
        numero: { requerido: false },
        otros: { requerido: false },
        codPostal: { requerido: false },
        ciudad: { requerido: false },
        provinciaId: { requerido: false, tipo: "entero" },
        provincia: { requerido: false },
        paisId: { requerido: false },
        apartado: { requerido: false },
        telefonoDireccion: { requerido: false, tipo: "telefono" },
    },
};

export const empresaInicial = (): Empresa => ({
    id: '',
    nombre: '',
    cifNif: '',
    administrador: '',
    ejercicioId: '',
    telefono: '',
    email: '',
    web: '',
    serieId: '',
    formaPagoId: '',
    divisaId: '',
    almacenId: '',

    tipoVia: '',
    nombreVia: '',
    numero: '',
    otros: '',
    codPostal: '',
    ciudad: '',
    provinciaId: 0,
    provincia: '',
    paisId: '',
    apartado: '',
    telefonoDireccion: '',
});

export const contextoDetalleEmpresaInicial: ContextoDetalleEmpresa = {
    estado: 'INICIAL',
    empresa: empresaInicial(),
};

/**
 * Refresca la entidad desde la API y propaga el cambio al maestro.
 */
export const refrescarEmpresa: ProcesarDetalle = async (contexto) => {
    const empresa = await getEmpresa(contexto.empresa.id);
    return [
        { ...contexto, empresa },
        [["empresa_cambiada", empresa]],
    ];
};

/**
 * Guarda cambios en la API (se llama desde el auto-guardado de useModelo).
 * Envía el modelo completo; el mapper decide qué incluir.
 */
export const guardarEmpresa = async (
    contexto: ContextoDetalleEmpresa,
    empresa: Empresa,
): Promise<void> => {
    const iguales = JSON.stringify(empresa) === JSON.stringify(contexto.empresa);
    if (!iguales) {
        await patchEmpresa(empresa.id, empresa);
    }
};

export const cargarEmpresa: (_: string) => ProcesarDetalle =
    (idEmpresa) => async (contexto) => {
        const empresa = await getEmpresa(idEmpresa);
        return pipeEmpresa(contexto, [
            async (ctx) => ({ ...ctx, empresa }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idEmpresa = payload as string;
    if (idEmpresa) {
        return cargarEmpresa(idEmpresa)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', empresa: empresaInicial() };
};
