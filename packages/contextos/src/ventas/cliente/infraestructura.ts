import UrlsCrmClass from "@olula/ctx/crm/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { normalizarIban } from "@olula/lib/iban.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import UrlsVentasClass from "../comun/urls.ts";
import { Cliente, CrmContacto, CuentaBanco, DirCliente, GetCliente, NuevaCuentaBanco, NuevaDireccion, NuevoCrmContacto, PatchCliente, PostCliente } from "./diseño.ts";

const UrlsVentas = new UrlsVentasClass();
const UrlsCrm = new UrlsCrmClass();

type ClienteApi = Cliente & {
  fecha_baja: string | null;
};
const clienteFromAPI = (c: ClienteApi): Cliente => ({
  ...c,
  fecha_baja: c.fecha_baja ? new Date(Date.parse(c.fecha_baja)) : null,
});

export type DireccionAPI = {
  nombre_via: string;
  tipo_via: string;
  numero: string;
  otros: string;
  cod_postal: string;
  ciudad: string;
  provincia_id: number;
  provincia: string;
  pais_id: string;
  apartado: string;
  telefono: string;
};

export type DirClienteAPI = {
  id: string;
  direccion: DireccionAPI;
  dir_envio: boolean;
  dir_facturacion: boolean;
};

const dirClienteFromAPI = (d: DirClienteAPI): DirCliente => (
  {
    id: d.id,
    dir_facturacion: d.dir_facturacion,
    dir_envio: d.dir_envio,
    ...d.direccion,
  }
)

const dirClienteToAPI = (d: DirCliente): DireccionAPI => (
  {
    nombre_via: d.nombre_via,
    tipo_via: d.tipo_via,
    numero: d.numero,
    otros: d.otros,
    cod_postal: d.cod_postal,
    ciudad: d.ciudad,
    provincia_id: d.provincia_id,
    provincia: d.provincia,
    pais_id: d.pais_id,
    apartado: d.apartado,
    telefono: d.telefono,
  }
)

const CuentaBancoToAPI = (c: NuevaCuentaBanco): CuentaBancoAPIPatch => ({
  descripcion: c.descripcion,
  cuenta: {
    iban: normalizarIban(c.iban),
  },
});

export const getCliente: GetCliente = async (id) =>
  await RestAPI.get<{ datos: ClienteApi }>(`${UrlsVentas.CLIENTE}/${id}`).then((respuesta) => clienteFromAPI(respuesta.datos));

export const getClientes = async (
  filtro: Filtro,
  orden: Orden,
  paginacion: Paginacion
): RespuestaLista<Cliente> => {
  const q = criteriaQuery(filtro, orden, paginacion);

  const respuesta = await RestAPI.get<{ datos: ClienteApi[]; total: number }>(UrlsVentas.CLIENTE + q);
  return { datos: respuesta.datos.map(clienteFromAPI), total: respuesta.total };
};

export const patchCliente: PatchCliente = async (id, cliente) =>
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${id}`, {
    cambios: {
      nombre: cliente.nombre,
      id_fiscal: {
        id: cliente.id_fiscal,
        tipo: cliente.tipo_id_fiscal,
      },
      agente_id: cliente.agente_id,
      divisa_id: cliente.divisa_id,
      serie_id: cliente.serie_id,
      forma_pago_id: cliente.forma_pago_id,
      grupo_iva_negocio_id: cliente.grupo_iva_negocio_id,
      nombre_comercial: cliente.nombre_comercial,
      web: cliente.web,
      telefono1: cliente.telefono1,
      telefono2: cliente.telefono2,
      email: cliente.email,
      observaciones: cliente.observaciones,
      copiasfactura: cliente.copiasfactura,
      grupo_id: cliente.grupo_id,
    },
  }, "Error al guardar el cliente");

export const darDeBajaCliente = async (id: string, fecha: Date) =>
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${id}`, {
    cambios: {
      de_baja: true,
      fecha_baja: fecha,
    },
  }, "Error al dar de baja el cliente");

export const darDeAltaCliente = async (id: string) =>
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${id}`, {
    cambios: {
      de_baja: false,
      fecha_baja: null,
    },
  }, "Error al dar de alta el cliente");

export const deleteCliente = async (id: string): Promise<void> =>
  await RestAPI.delete(`${UrlsVentas.CLIENTE}/${id}`, "Error al borrar cliente");

export const postCliente: PostCliente = async (cliente) =>
  await RestAPI.post(UrlsVentas.CLIENTE, cliente, "Error al guardar el cliente").then((respuesta) => respuesta.id);

export const getDireccion = async (clienteId: string, direccionId: string): Promise<DirCliente> =>
  await RestAPI.get<{ datos: DirClienteAPI }>(`${UrlsVentas.CLIENTE}/${clienteId}/direccion/${direccionId}`).then((respuesta) =>
    dirClienteFromAPI(respuesta.datos)
  );

export const getDirecciones = async (id: string): Promise<DirCliente[]> =>
  await RestAPI.get<{ datos: DirClienteAPI[] }>(`${UrlsVentas.CLIENTE}/${id}/direccion`).then((respuesta) => {
    const direcciones = respuesta.datos.map((d) => dirClienteFromAPI(d));
    return direcciones
  });

export const postDireccion = async (clienteId: string, direccion: NuevaDireccion): Promise<string> => {
  const payload = {
    direccion: {
      ...direccion,
    }
  }
  return await RestAPI.post(`${UrlsVentas.CLIENTE}/${clienteId}/direccion`, payload, "Error al guardar dirección").then((respuesta) => respuesta.id);
}

export const setDirFacturacion = async (clienteId: string, direccionId: string): Promise<void> =>
  RestAPI.patch(`${UrlsVentas.CLIENTE}/${clienteId}/direccion/${direccionId}/facturacion`, {}, "Error al establecer dirección de facturación");

export const setDirEnvio = async (clienteId: string, direccionId: string): Promise<void> =>
  RestAPI.patch(`${UrlsVentas.CLIENTE}/${clienteId}/direccion/${direccionId}/envio`, {}, "Error al establecer dirección de envío");


export const actualizarDireccion = async (clienteId: string, direccion: DirCliente): Promise<void> =>
  RestAPI.patch(
    `${UrlsVentas.CLIENTE}/${clienteId}/direccion/${direccion.id}`
    , { direccion: dirClienteToAPI(direccion) }, "Error al actualizar dirección"
  );

export const deleteDireccion = async (clienteId: string, direccionId: string): Promise<void> =>
  await RestAPI.delete(`${UrlsVentas.CLIENTE}/${clienteId}/direccion/${direccionId}`, "Error al borrar dirección");


export const getCuentasBanco = async (clienteId: string): Promise<CuentaBanco[]> =>
  await RestAPI.get<{ datos: CuentaBancoAPI[] }>(`${UrlsVentas.CLIENTE}/${clienteId}/cuenta_banco`).then((respuesta) =>
    respuesta.datos.map(cuentaBancoFromAPI)
  );

export const postCuentaBanco = async (clienteId: string, cuenta: NuevaCuentaBanco): Promise<string> => {
  return await RestAPI.post(`${UrlsVentas.CLIENTE}/${clienteId}/cuenta_banco`, CuentaBancoToAPI(cuenta)).then((respuesta) => respuesta.id);
};

export const patchCuentaBanco = async (clienteId: string, cuenta: CuentaBanco): Promise<void> => {
  const payload = {
    cuenta: {
      iban: normalizarIban(cuenta.iban),
    },
  };
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${clienteId}/cuenta_banco/${cuenta.id}`, payload, "Error al actualizar cuenta bancaria");
};

export const deleteCuentaBanco = async (clienteId: string, cuentaId: string): Promise<void> =>
  await RestAPI.delete(`${UrlsVentas.CLIENTE}/${clienteId}/cuenta_banco/${cuentaId}`, "Error al borrar cuenta bancaria");

export const desmarcarCuentaDomiciliacion = async (clienteId: string): Promise<void> =>
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${clienteId}/cuenta_domiciliacion`, { "cuenta_id": "" }, "Error al desmarcar cuenta domiciliación");

export const domiciliarCuenta = async (clienteId: string, cuentaId: string): Promise<void> => {
  const payload = {
    cuenta_id: cuentaId,
  };
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${clienteId}/cuenta_domiciliacion`, payload, "Error al domiciliar cuenta");
};

export const asignarCuentaRemesa = async (clienteId: string, cuentaId: string): Promise<void> =>
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${clienteId}/cuenta_remesa`, { cuenta_remesa: cuentaId }, "Error al asignar la cuenta de remesa");

export type CuentaBancoAPI = {
  id: string;
  cuenta: {
    descripcion: string | null;
    iban: string | null;
    bic: string | null;
    codigo_cuenta: string | null;
    pais_id: string | null;
    entidad: string | null;
    agencia: string | null;
    digito_control: string | null;
    cuenta: string | null;
  };
};

export type CuentaBancoAPIPatch = {
  descripcion: string;
  cuenta: {
    iban: string;
  };
};


export const cuentaBancoFromAPI = (c: CuentaBancoAPI): CuentaBanco => ({
  id: c.id,
  descripcion: c.cuenta.descripcion ?? "",
  iban: c.cuenta.iban ?? "",
  bic: c.cuenta.bic ?? "",
  codigo_cuenta: c.cuenta.codigo_cuenta ?? "",
  pais_id: c.cuenta.pais_id ?? "",
  entidad: c.cuenta.entidad ?? "",
  agencia: c.cuenta.agencia ?? "",
  digito_control: c.cuenta.digito_control ?? "",
  cuenta: c.cuenta.cuenta ?? "",
});

// Agenda del cliente: rutas de Ventas (/ventas/contacto), no las del CRM, para que
// funcione en las apps que no cargan el contexto CRM.
const urlContactoVentas = "/ventas/contacto";
const urlAgendaCliente = (clienteId: string) => `${UrlsVentas.CLIENTE}/${clienteId}/contacto`;

export interface ContactoAgendaApi {
  id: string;
  nombre: string;
  cargo: string | null;
  email: string | null;
  telefono1: string | null;
  telefono2: string | null;
  observaciones: string | null;
}

export const contactoAgendaDesdeApi = (api: ContactoAgendaApi): CrmContacto => ({
  id: api.id,
  nombre: api.nombre ?? "",
  cargo: api.cargo ?? "",
  email: api.email ?? "",
  telefono1: api.telefono1 ?? "",
  telefono2: api.telefono2 ?? "",
  observaciones: api.observaciones ?? "",
});

const contactoAgendaAApi = (contacto: NuevoCrmContacto) => ({
  nombre: contacto.nombre,
  cargo: contacto.cargo,
  email: contacto.email,
  telefono1: contacto.telefono1,
  telefono2: contacto.telefono2,
  observaciones: contacto.observaciones,
});

export const getCrmContactosCliente = async (clienteId: string): Promise<CrmContacto[]> =>
  await RestAPI.get<{ datos: ContactoAgendaApi[] }>(urlAgendaCliente(clienteId))
    .then((respuesta) => respuesta.datos.map(contactoAgendaDesdeApi));

export const postCrmContactoCliente = async (clienteId: string, contacto: NuevoCrmContacto): Promise<string> =>
  await RestAPI.post(urlAgendaCliente(clienteId), contactoAgendaAApi(contacto), "Error al crear contacto")
    .then((respuesta) => respuesta.id);

/** Busca en todos los contactos (para añadir uno existente a la agenda). */
export const getContactosAgenda = async (filtro: Filtro, orden: Orden): Promise<CrmContacto[]> => {
  const q = criteriaQuery(filtro, orden);
  return RestAPI.get<{ datos: ContactoAgendaApi[] }>(urlContactoVentas + q)
    .then((respuesta) => respuesta.datos.map(contactoAgendaDesdeApi));
};

export const vincularContactoAgenda = async (contactoId: string, clienteId: string): Promise<void> => {
  try {
    await RestAPI.post(`${urlAgendaCliente(clienteId)}/${contactoId}`, {}, "Error al añadir el contacto a la agenda");
  } catch (error) {
    const fallo = error as { estado?: number; descripcion?: string };
    if (fallo?.estado === 409) {
      throw { nombre: "Contacto ya vinculado", descripcion: fallo.descripcion, estado: 409 };
    }
    throw error;
  }
};

export const desvincularContactoAgenda = async (contactoId: string, clienteId: string): Promise<void> =>
  await RestAPI.delete(`${urlAgendaCliente(clienteId)}/${contactoId}`, "Error al quitar el contacto de la agenda");

export const getCrmContactos = async (filtro: Filtro, orden: Orden): Promise<CrmContacto[]> => {
  const q = criteriaQuery(filtro, orden);
  return RestAPI.get<{ datos: CrmContacto[] }>(`${UrlsCrm.CONTACTO}` + q).then((respuesta) => respuesta.datos);
}

export const patchCrmContacto = async (contacto: CrmContacto): Promise<void> => {
  await RestAPI.patch(`${urlContactoVentas}/${contacto.id}`, contactoAgendaAApi(contacto), "Error al actualizar contacto");
};

export const deleteCrmContacto = async (contactoId: string): Promise<void> =>
  await RestAPI.delete(`${urlContactoVentas}/${contactoId}`, "Error al borrar contacto");
