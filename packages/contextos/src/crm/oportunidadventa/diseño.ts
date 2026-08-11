import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import type { NuevaOportunidadVenta } from "./crear/diseño.ts";

export interface OportunidadVenta extends Entidad {
    id: string;
    descripcion: string;
    cliente_id: string | null;
    nombre_cliente: string | null;
    importe: number;
    estado_id: string;
    descripcion_estado: string | null;
    probabilidad: number;
    fecha_cierre?: Date | null;
    contacto_id: string | null;
    nombre_contacto: string | null;
    tarjeta_id: string | null;
    nombre_tarjeta: string | null;
    usuario_id: string | null;
    observaciones: string | null;
    valor_defecto: boolean;
    agente_id: string | null;
    acciones_pendientes?: number | null;
};

export type EstadoOportunidad = {
    id: string;
    descripcion: string | null;
    probabilidad: number;
    valor_defecto: boolean;
};

export type CambiosOportunidadVenta = Partial<OportunidadVenta>;

export type GetOportunidadVenta = (id: string) => Promise<OportunidadVenta>;

export type GetOportunidadesVenta = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<OportunidadVenta>;

export type PostOportunidadVenta = (oportunidad: NuevaOportunidadVenta) => Promise<string>;

export type PatchOportunidadVenta = (id: string, cambios: CambiosOportunidadVenta) => Promise<void>;

export type DeleteOportunidadVenta = (id: string) => Promise<void>;