import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Direccion, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { direccionVacia } from "../venta/dominio.ts";
import { CambiarArticuloLinea, CambiarCantidadLinea, CambioClientePresupuesto, DeleteLinea, esClienteRegistrado, GetPresupuesto, GetPresupuestos, LineaPresupuesto, PatchCambiarDivisa, PatchLinea, PostLinea, PostPresupuesto, Presupuesto } from "./diseño.ts";

type PresupuestoAPI = {
  id: string;
  codigo: string;
  fecha: string;
  fecha_salida: string;
  agente_id: string;
  nombre_agente: string;
  divisa_id: string;
  tasa_conversion: number;
  total: number;
  total_divisa_empresa: number;
  neto: number;
  total_iva: number;
  total_irpf: number;
  por_descuento: number;
  neto_sin_dto: number;
  forma_pago_id: string;
  nombre_forma_pago: string;
  grupo_iva_negocio_id: string;
  observaciones: string;
  cliente_id: string | null;
  nombre_cliente: string;
  id_fiscal: string;
  direccion_id: string | null;
  direccion: Direccion;
  aprobado: boolean;
};

const baseUrl = new ApiUrls().PRESUPUESTO;

type LineaPresupuestoAPI = LineaPresupuesto;

export const presupuestoFromAPI = (p: PresupuestoAPI): Presupuesto => ({
  ...p,
  fecha: new Date(Date.parse(p.fecha)),
  fecha_salida: new Date(Date.parse(p.fecha_salida)),
  dtoPorcentual: p.por_descuento,
  netoSinDto: p.neto_sin_dto,
  cliente: {
    cliente_id: p.cliente_id ?? null,
    nombre_cliente: p.nombre_cliente ?? "",
    id_fiscal: p.id_fiscal ?? "",
    direccion_id: p.direccion_id ?? null,
    direccion: p.direccion ?? direccionVacia(),
  },
  lineas: [],
});

export const presupuestoToAPI = (l: Presupuesto): PresupuestoAPI => {
  return {
    ...l,
    fecha: l.fecha.toISOString(),
    fecha_salida: l.fecha_salida.toISOString(),
    por_descuento: l.dtoPorcentual,
    neto_sin_dto: l.netoSinDto,
    cliente_id: l.cliente.cliente_id ?? "",
    nombre_cliente: l.cliente.nombre_cliente,
    id_fiscal: l.cliente.id_fiscal,
    direccion_id: l.cliente.direccion_id ?? "",
    direccion: l.cliente.direccion,
  };
};
export const lineaPresupuestoFromAPI = (l: LineaPresupuestoAPI): LineaPresupuesto => l;

export const getPresupuesto: GetPresupuesto = async (id) =>
  RestAPI.get<{ datos: PresupuestoAPI }>(`${baseUrl}/${id}`).then((respuesta) => {
    return presupuestoFromAPI(respuesta.datos);
  });

export const getPresupuestos: GetPresupuestos = async (
  filtro: Filtro,
  orden: Orden,
  paginacion: Paginacion
) => {
  const q = criteriaQuery(filtro, orden, paginacion);

  const respuesta = await RestAPI.get<{ datos: PresupuestoAPI[]; total: number }>(baseUrl + q);
  return { datos: respuesta.datos.map(presupuestoFromAPI), total: respuesta.total };
};

export const postPresupuesto: PostPresupuesto = async (presupuesto): Promise<string> => {
  let clientePayload;

  if (esClienteRegistrado(presupuesto)) {
    clientePayload = {
      cliente_id: presupuesto.cliente.cliente_id,
      direccion_id: presupuesto.cliente.direccion_id
    };
  } else {
    clientePayload = {
      nombre: presupuesto.nombre_cliente,
      id_fiscal: presupuesto.id_fiscal,
      direccion: {
        nombre_via: presupuesto.nombre_via,
        tipo_via: presupuesto.tipo_via || null,
        numero: presupuesto.numero || null,
        otros: presupuesto.otros || null,
        cod_postal: presupuesto.cod_postal || null,
        ciudad: presupuesto.ciudad,
        provincia_id: presupuesto.provincia_id || null,
        provincia: presupuesto.provincia || null,
        pais_id: presupuesto.pais_id || null,
        apartado: presupuesto.apartado || null,
        telefono: presupuesto.telefono || null,
      }
    };
  }

  const payload = {
    cliente: clientePayload,
    empresa_id: presupuesto.empresa_id
  };

  return await RestAPI.post(baseUrl, payload, "Error al crear presupuesto").then((respuesta) => respuesta.id);
}

export const borrarPresupuesto = async (id: string): Promise<void> => {
  await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar presupuesto");
}

export const patchCambiarAgente = async (id: string, agenteId: string) => {
  await RestAPI.patch(`${baseUrl}/${id}`, { cambios: { agente_id: agenteId } }, "Error al cambiar agente del presupuesto");
}

export const patchCambiarDivisa: PatchCambiarDivisa = async (id, divisaId) => {
  await RestAPI.patch(`${baseUrl}/${id}`, { cambios: { divisa_id: divisaId } }, "Error al cambiar divisa del presupuesto");
}

export const patchCambiarCliente = async (id: string, cambio: CambioClientePresupuesto): Promise<void> => {
  if (cambio.cliente_id) {
    const clientePayload = {
      cambios: {
        cliente: {
          cliente_id: cambio.cliente_id,
          direccion_id: cambio.direccion_id
        }
      }
    }
    await RestAPI.patch(`${baseUrl}/${id}`, clientePayload, "Error al cambiar cliente del presupuesto");
  } else {
    const clientePayload = {
      cambios: {
        cliente: {
          nombre: cambio.nombre_cliente || "",
          id_fiscal: cambio.id_fiscal,
          direccion: {
            nombre_via: cambio.nombre_via,
            tipo_via: cambio.tipo_via || null,
            numero: cambio.numero || null,
            otros: cambio.otros || null,
            cod_postal: cambio.cod_postal || null,
            ciudad: cambio.ciudad || null,
            provincia_id: cambio.provincia_id || null,
            provincia: cambio.provincia || null,
            pais_id: cambio.pais_id || null,
            apartado: cambio.apartado || null,
            telefono: cambio.telefono || null,
          }
        }
      }
    }
    await RestAPI.patch(`${baseUrl}/${id}`, clientePayload, "Error al cambiar cliente del presupuesto");
  }


}

export const getLineas = async (id: string): Promise<LineaPresupuesto[]> =>
  await RestAPI.get<{ datos: LineaPresupuestoAPI[] }>(`${baseUrl}/${id}/linea`).then((respuesta) => {
    const lineas = respuesta.datos.map((d) => lineaPresupuestoFromAPI(d));
    return lineas
  });


export const postLinea: PostLinea = async (id, linea) => {
  return await RestAPI.post(`${baseUrl}/${id}/linea`, {
    lineas: [{
      articulo_id: linea.referencia,
      cantidad: linea.cantidad
    }]
  }, "Error al crear línea de presupuesto").then((respuesta) => {
    const miRespuesta = respuesta as unknown as { ids: string[] };
    return miRespuesta.ids[0];
  });
}

export const patchArticuloLinea: CambiarArticuloLinea = async (id, lineaId, referencia) => {
  const payload = {
    cambios: {
      articulo: {
        articulo_id: referencia
      },
    },
  }
  await RestAPI.patch(`${baseUrl}/${id}/linea/${lineaId}`, payload, "Error al actualizar artículo de la línea del presupuesto");
}

export const patchLinea: PatchLinea = async (id, linea) => {
  const payload = {
    cambios: {
      articulo: {
        articulo_id: linea.referencia
      },
      cantidad: linea.cantidad,
      pvp_unitario: linea.pvp_unitario,
      dto_porcentual: linea.dto_porcentual,
      grupo_iva_producto_id: linea.grupo_iva_producto_id,
    },
  }
  await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, "Error al actualizar línea del presupuesto");
}


export const patchCantidadLinea: CambiarCantidadLinea = async (id, linea, cantidad) => {
  const payload = {
    cambios: {
      articulo: {
        articulo_id: linea.referencia
      },
      cantidad: cantidad,
    },
  }
  await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, "Error al actualizar cantidad de la línea del presupuesto");
}

export const deleteLinea: DeleteLinea = async (id: string, lineaId: string): Promise<void> => {
  await RestAPI.patch(`${baseUrl}/${id}/linea/borrar`, {
    lineas: [lineaId]
  }, "Error al borrar línea del presupuesto");
}

export const patchPresupuesto = async (id: string, presupuesto: Presupuesto) => {
  const payload = {
    cambios: {
      agente_id: presupuesto.agente_id,
      divisa: {
        divisa_id: presupuesto.divisa_id,
        tasa_conversion: presupuesto.tasa_conversion,
      },
      fecha: presupuesto.fecha,
      cliente_id: presupuesto.cliente.cliente_id,
      nombre_cliente: presupuesto.cliente.nombre_cliente,
      id_fiscal: presupuesto.cliente.id_fiscal,
      direccion_id: presupuesto.cliente.direccion_id,
      forma_pago_id: presupuesto.forma_pago_id,
      grupo_iva_negocio_id: presupuesto.grupo_iva_negocio_id,
      observaciones: presupuesto.observaciones,
    },
  };

  await RestAPI.patch(`${baseUrl}/${id}`, payload, "Error al actualizar presupuesto");
};


export const aprobarPresupuesto = async (id: string) => {
  await RestAPI.patch(`${baseUrl}/${id}/aprobar`, {}, "Error al aprobar presupuesto");
};

export const patchCambiarDescuento = async (id: string, dto_porcentual: number): Promise<void> => {
  await RestAPI.patch(`${baseUrl}/${id}`, {
    cambios: {
      por_descuento: dto_porcentual,
    }
  }, "Error al cambiar descuento del presupuesto");
};
