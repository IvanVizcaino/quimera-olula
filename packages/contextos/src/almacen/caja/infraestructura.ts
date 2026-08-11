import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Entidad } from "@olula/lib/diseño.js";
import {
    Caja,
    CajaContenido,
    CambiosCaja,
    ComponenteCaja,
    DeleteCaja,
    GetCaja,
    GetCajas,
    MaterialCaja,
    MovimientoCaja,
    NuevaCaja,
    PatchCaja,
    PostCaja,
} from "./diseño.ts";

interface CajaAPI extends Entidad {
    id: string;
    lpn: string;
    ubicacion_id: string;
    ubicacion: string;
    contenedor_id?: string | null;
}

interface MovimientoCajaAPI {
    id: string;
    cantidad: number;
    fecha_hora: string;
    lote_id: string;
    ubicacion_id: string;
    ubicacion: string;
}

interface MaterialCajaAPI {
    id: string;
    sku: string;
    descripcion: string;
    cantidad: number;
    movimientos: MovimientoCajaAPI[];
}

interface CajaContenidoAPI extends CajaAPI {
    contenido: ComponenteCajaAPI[];
}
type ComponenteCajaAPI = CajaContenidoAPI | MaterialCajaAPI;

interface NuevaCajaAPI {
    ubicacion_id: string;
    contenedor_id?: string | null;
}

type CambiosCajaAPI = Partial<CajaAPI>;

const baseUrl = `/almacen/caja`;

const esMaterialAPI = (comp: ComponenteCajaAPI): comp is MaterialCajaAPI =>
    "sku" in comp;

const movimientoDesdeApi = (mov: MovimientoCajaAPI): MovimientoCaja => ({
    id: mov.id,
    cantidad: String(mov.cantidad),
    fechaHora: new Date(mov.fecha_hora),
    idLote: mov.lote_id,
    idUbicacion: mov.ubicacion_id,
    ubicacion: mov.ubicacion,
});

const materialDesdeApi = (mat: MaterialCajaAPI): MaterialCaja => ({
    id: mat.id,
    sku: mat.sku,
    descripcion: mat.descripcion,
    cantidad: mat.cantidad,
    movimientos: mat.movimientos.map(movimientoDesdeApi),
});

const componenteDesdeApi = (comp: ComponenteCajaAPI): ComponenteCaja => {
    if (esMaterialAPI(comp)) {
        return materialDesdeApi(comp);
    }
    return cajaContenidoDesdeApi(comp);
};

export const cajaDesdeApi = (cajaApi: CajaAPI): Caja => ({
    id: cajaApi.id,
    lpn: cajaApi.lpn,
    idUbicacion: cajaApi.ubicacion_id,
    ubicacion: cajaApi.ubicacion,
    contenedorId: cajaApi.contenedor_id,
    contenedor: cajaApi.contenedor,
});

const cajaContenidoDesdeApi = (cajaApi: CajaContenidoAPI): CajaContenido => ({
    id: cajaApi.id,
    lpn: cajaApi.lpn,
    idUbicacion: cajaApi.ubicacion_id,
    ubicacion: cajaApi.ubicacion,
    idContenedor: cajaApi.contenedor_id,
    contenido: cajaApi.contenido.map(componenteDesdeApi),
});

const nuevaCajaAApi = (caja: NuevaCaja): NuevaCajaAPI => ({
    ubicacion_id: caja.idUbicacion,
    contenedor_id: caja.idContenedor,
});

const cambiosCajaAApi = (cambios: CambiosCaja): CambiosCajaAPI => {
    const api: CambiosCajaAPI = {};
    if (cambios.idUbicacion !== undefined) api.ubicacion_id = cambios.idUbicacion;
    if (cambios.idContenedorId !== undefined) api.contenedor_id = cambios.idContenedor;
    return api;
};

export const getCaja: GetCaja = async (id) => {
    return await RestAPI.getItem<CajaContenido, CajaContenidoAPI>(
        `${baseUrl}/${id}`,
        cajaContenidoDesdeApi,
    );
};

export const getCajas: GetCajas = async (criteria) => {
    return await RestAPI.getQuery<Caja, CajaAPI>(
        baseUrl,
        criteria,
        cajaDesdeApi,
    );
};

export const postCaja: PostCaja = async (nuevaCaja) => {
    const respuesta = await RestAPI.post<NuevaCajaAPI>(
        baseUrl,
        nuevaCajaAApi(nuevaCaja),
        "Error al crear caja"
    );
    return respuesta.id;
};

export const patchCaja: PatchCaja = async (id, cambios) => {
    await RestAPI.patch<CambiosCajaAPI>(
        `${baseUrl}/${id}`,
        cambiosCajaAApi(cambios),
        "Error al guardar caja"
    );
};

export const deleteCaja: DeleteCaja = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al borrar caja"
    );
};
