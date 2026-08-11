import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { CabeceraLicenciaFarma, CabeceraLicenciaFarmaAPI, LicenciaFarma, LicenciaFarmaAPI, NuevaLicenciaFarma, Trato, TratoAPI } from "./diseño.ts";

const baseUrlLicenciaFarma = `/ventas/licencia_farma`;

const tratoDesdeAPI = (t: TratoAPI): Trato => ({
    id: t.id,
    estado: t.estado,
    titulo: t.titulo,
});

const cabeceraLicenciaFarmaDesdeAPI = (api: CabeceraLicenciaFarmaAPI): CabeceraLicenciaFarma => ({
    id: api.id,
    tipoLicencia: api.tipo_licencia,
    fechaCaducidad: api.fecha_caducidad,
    fechaInicio: api.fecha_inicio,
    nombreCliente: api.nombre_cliente,
    agenteId: api.agente_id,
});

const licenciaFarmaFromAPI = (api: LicenciaFarmaAPI): LicenciaFarma => ({
    ...cabeceraLicenciaFarmaDesdeAPI(api),
    fechaRevisionDatos: api.fecha_revision_datos,
    fechaRecepcionAcuerdos: api.fecha_recepcion_acuerdos,
    fechaEnvioDocumentacion: api.fecha_envio_documentacion,
    fechaFin: api.fecha_fin,
    tratoId: api.trato_id,
    estado: api.estado,
    clienteId: api.cliente_id,
    nombreAgente: api.nombre_agente,
    trato: api.trato ? tratoDesdeAPI(api.trato) : null,
});

const licenciaFarmaToAPI = (l: Partial<LicenciaFarma>) => ({
    ...(l.tipoLicencia !== undefined && { tipo_licencia: l.tipoLicencia }),
    ...(l.fechaCaducidad !== undefined && { fecha_caducidad: l.fechaCaducidad }),
    ...(l.fechaInicio !== undefined && { fecha_inicio: l.fechaInicio }),
    ...(l.fechaRevisionDatos !== undefined && { fecha_revision_datos: l.fechaRevisionDatos }),
    ...(l.fechaRecepcionAcuerdos !== undefined && { fecha_recepcion_acuerdos: l.fechaRecepcionAcuerdos }),
    ...(l.fechaEnvioDocumentacion !== undefined && { fecha_envio_documentacion: l.fechaEnvioDocumentacion }),
    ...(l.fechaFin !== undefined && { fecha_fin: l.fechaFin }),
    ...(l.tratoId !== undefined && { trato_id: l.tratoId }),
    ...(l.estado !== undefined && { estado: l.estado }),
    ...(l.nombreCliente !== undefined && { nombre_cliente: l.nombreCliente }),
    ...(l.agenteId !== undefined && { agente_id: l.agenteId }),
});

const nuevaLicenciaFarmaToAPI = (n: NuevaLicenciaFarma) => ({
    tipo_licencia: n.tipoLicencia,
    fecha_caducidad: n.fechaCaducidad,
    trato_id: n.tratoId,
    cliente_id: n.clienteId,
    nombre_cliente: n.nombreCliente,
    agente_id: n.agenteId,
});

export const getLicenciaFarma = async (id: string): Promise<LicenciaFarma> =>
    await RestAPI.get<{ datos: LicenciaFarmaAPI }>(`${baseUrlLicenciaFarma}/${id}`).then((r) => licenciaFarmaFromAPI(r.datos));

export const getLicenciasFarma = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): RespuestaLista<CabeceraLicenciaFarma> => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: CabeceraLicenciaFarmaAPI[]; total: number }>(baseUrlLicenciaFarma + q);
    return { datos: respuesta.datos.map(cabeceraLicenciaFarmaDesdeAPI), total: respuesta.total };
};

export const postLicenciaFarma = async (nueva: NuevaLicenciaFarma): Promise<string> =>
    await RestAPI.post(baseUrlLicenciaFarma, nuevaLicenciaFarmaToAPI(nueva)).then((r) => r.id);

export const patchLicenciaFarma = async (id: string, cambios: Partial<LicenciaFarma>): Promise<void> =>
    await RestAPI.patch(`${baseUrlLicenciaFarma}/${id}`, { cambios: licenciaFarmaToAPI(cambios) });

export const deleteLicenciaFarma = async (id: string): Promise<void> =>
    await RestAPI.delete(`${baseUrlLicenciaFarma}/${id}`);

type RespuestaMarcarDatosRevisados = { datos: { fecha_revision_datos: string } };

export const marcarDatosRevisados = async (id: string): Promise<string> => {
    const response = await RestAPI.patch(
        `${baseUrlLicenciaFarma}/${id}/datos_revisados`,
        {},
        "Error al revisar datos"
    );

    return ((response as unknown) as RespuestaMarcarDatosRevisados).datos.fecha_revision_datos;
};
