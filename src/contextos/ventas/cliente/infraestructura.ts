import { RestAPI } from "../../comun/api/rest_api.ts";
import ApiUrls from "../../comun/api/urls.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "../../comun/diseño.ts";
import { criteriaQuery } from "../../comun/infraestructura.ts";
import { Cliente, CrmContacto, CuentaBanco, DirCliente, GetCliente, NuevaCuentaBanco, NuevaDireccion, NuevoCrmContacto, PatchCliente, PostCliente } from "./diseño.ts";


type ClienteApi = Cliente;

const clienteFromAPI = (c: ClienteApi): Cliente => ({
  ...c,
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

const CuentaBancoToAPI = (c: CuentaBanco): CuentaBancoAPIPatch => ({
  descripcion: c.descripcion,
  cuenta: {
    iban: c.iban,
    bic: c.bic,
  },
});

export const getCliente: GetCliente = async (id) =>
  await RestAPI.get<{ datos: Cliente }>(`${ApiUrls.VENTAS.CLIENTE}/${id}`).then((respuesta) => clienteFromAPI(respuesta.datos));

export const getClientes = async (
  filtro: Filtro,
  orden: Orden,
  paginacion: Paginacion
): RespuestaLista<Cliente> => {
  const q = criteriaQuery(filtro, orden, paginacion);

  const respuesta = await RestAPI.get<{ datos: ClienteApi[]; total: number }>(ApiUrls.VENTAS.CLIENTE + q);
  return { datos: respuesta.datos.map(clienteFromAPI), total: respuesta.total };
};

export const patchCliente: PatchCliente = async (id, cliente) =>
  await RestAPI.patch(`${ApiUrls.VENTAS.CLIENTE}/${id}`, {
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

export const darDeBajaCliente = async (id: string, fecha: string) =>
  await RestAPI.patch(`${ApiUrls.VENTAS.CLIENTE}/${id}`, {
    cambios: {
      de_baja: true,
      fecha_baja: fecha,
    },
  }, "Error al dar de baja el cliente");

export const darDeAltaCliente = async (id: string) =>
  await RestAPI.patch(`${ApiUrls.VENTAS.CLIENTE}/${id}`, {
    cambios: {
      de_baja: false,
      fecha_baja: null,
    },
  }, "Error al dar de alta el cliente");

export const deleteCliente = async (id: string): Promise<void> =>
  await RestAPI.delete(`${ApiUrls.VENTAS.CLIENTE}/${id}`, "Error al borrar cliente");

export const postCliente: PostCliente = async (cliente) => {
  return await RestAPI.post(ApiUrls.VENTAS.CLIENTE, cliente, "Error al guardar el cliente").then((respuesta) => respuesta.id);
}

export const getDireccion = async (clienteId: string, direccionId: string): Promise<DirCliente> =>
  await RestAPI.get<{ datos: DirClienteAPI }>(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/direccion/${direccionId}`).then((respuesta) =>
    dirClienteFromAPI(respuesta.datos)
  );

export const getDirecciones = async (id: string): Promise<DirCliente[]> =>
  await RestAPI.get<{ datos: DirClienteAPI[] }>(`${ApiUrls.VENTAS.CLIENTE}/${id}/direccion`).then((respuesta) => {
    const direcciones = respuesta.datos.map((d) => dirClienteFromAPI(d));
    return direcciones
  });

export const postDireccion = async (clienteId: string, direccion: NuevaDireccion): Promise<string> => {
  const payload = {
    direccion: {
      ...direccion,
    }
  }
  return await RestAPI.post(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/direccion`, payload, "Error al guardar dirección").then((respuesta) => respuesta.id);
}

export const setDirFacturacion = async (clienteId: string, direccionId: string): Promise<void> =>
  RestAPI.patch(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/direccion/${direccionId}/facturacion`, {}, "Error al establecer dirección de facturación");


export const actualizarDireccion = async (clienteId: string, direccion: DirCliente): Promise<void> =>
  RestAPI.patch(
    `${ApiUrls.VENTAS.CLIENTE}/${clienteId}/direccion/${direccion.id}`
    , { direccion: dirClienteToAPI(direccion) }, "Error al actualizar dirección"
  );

export const deleteDireccion = async (clienteId: string, direccionId: string): Promise<void> =>
  await RestAPI.delete(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/direccion/${direccionId}`, "Error al borrar dirección");


export const getCuentasBanco = async (clienteId: string): Promise<CuentaBanco[]> =>
  await RestAPI.get<{ datos: CuentaBancoAPI[] }>(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/cuenta_banco`).then((respuesta) =>
    respuesta.datos.map(cuentaBancoFromAPI)
  );

export const getCuentaBanco = async (clienteId: string, cuentaId: string): Promise<CuentaBanco> =>
  await RestAPI.get<{ datos: CuentaBancoAPI }>(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/cuenta_banco/${cuentaId}`).then((respuesta) =>
    cuentaBancoFromAPI(respuesta.datos)
  );

export const postCuentaBanco = async (clienteId: string, cuenta: NuevaCuentaBanco): Promise<string> => {
  return await RestAPI.post(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/cuenta_banco`, CuentaBancoToAPI(cuenta as CuentaBanco)).then((respuesta) => respuesta.id);
};

export const patchCuentaBanco = async (clienteId: string, cuenta: CuentaBanco): Promise<void> => {
  const payload = {
    cuenta: {
      iban: cuenta.iban,
      bic: cuenta.bic,
    },
  };
  await RestAPI.patch(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/cuenta_banco/${cuenta.id}`, payload, "Error al actualizar cuenta bancaria");
};

export const deleteCuentaBanco = async (clienteId: string, cuentaId: string): Promise<void> =>
  await RestAPI.delete(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/cuenta_banco/${cuentaId}`, "Error al borrar cuenta bancaria");

export const desmarcarCuentaDomiciliacion = async (clienteId: string): Promise<void> =>
  await RestAPI.patch(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/cuenta_domiciliacion`, { "cuenta_id": "" }, "Error al desmarcar cuenta domiciliación");

export const domiciliarCuenta = async (clienteId: string, cuentaId: string): Promise<void> => {
  const payload = {
    cuenta_id: cuentaId,
  };
  await RestAPI.patch(`${ApiUrls.VENTAS.CLIENTE}/${clienteId}/cuenta_domiciliacion`, payload, "Error al domiciliar cuenta");
};

export type CuentaBancoAPI = {
  id: string;
  cuenta: {
    descripcion: string;
    iban: string;
    bic: string;
  };
};

export type CuentaBancoAPIPatch = {
  descripcion: string;
  cuenta: {
    iban: string;
    bic: string;
  };
};


export const cuentaBancoFromAPI = (c: CuentaBancoAPI): CuentaBanco => ({
  id: c.id,
  descripcion: c.cuenta.descripcion,
  iban: c.cuenta.iban,
  bic: c.cuenta.bic,
});

export const getCrmContactosCliente = async (clienteId: string): Promise<CrmContacto[]> =>
  await RestAPI.get<{ datos: CrmContacto[] }>(`${ApiUrls.CRM.CLIENTE}/${clienteId}/contactos`).then((respuesta) => respuesta.datos);

export const postCrmContacto = async (contacto: NuevoCrmContacto): Promise<string> => {
  const payload = {
    nombre: contacto.nombre,
    email: contacto.email,
  };
  return await RestAPI.post(`${ApiUrls.CRM.CONTACTO}`, payload, "Error al crear contacto").then((respuesta) => respuesta.id);
};

export const getCrmContacto = async (contactoId: string): Promise<CrmContacto> =>
  await RestAPI.get<{ datos: CrmContacto }>(`${ApiUrls.CRM.CONTACTO}/${contactoId}`).then((respuesta) => respuesta.datos);

export const getCrmContactos = async (filtro: Filtro, orden: Orden): Promise<CrmContacto[]> => {
  const q = criteriaQuery(filtro, orden);
  return RestAPI.get<{ datos: CrmContacto[] }>(`${ApiUrls.CRM.CONTACTO}` + q).then((respuesta) => respuesta.datos);
}

export const patchCrmContacto = async (contacto: CrmContacto): Promise<void> => {
  const payload = {
    nombre: contacto.nombre,
    email: contacto.email,
  };
  await RestAPI.patch(`${ApiUrls.CRM.CONTACTO}/${contacto.id}`, payload, "Error al actualizar contacto");
};

export const deleteCrmContacto = async (contactoId: string): Promise<void> =>
  await RestAPI.delete(`${ApiUrls.CRM.CONTACTO}/${contactoId}`, "Error al borrar contacto");
