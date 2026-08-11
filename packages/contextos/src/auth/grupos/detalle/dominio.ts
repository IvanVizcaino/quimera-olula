import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { CategoriaReglas, Grupo, ReglaAnidada, ReglaConValor } from "../diseño.ts";
import { getReglasPorGrupoPermiso } from "../dominio.ts";
import { getPermisosGrupo, getReglas, putPermiso } from "../infraestructura.ts";
import { ContextoDetalleGrupo, EstadoDetalleGrupo } from "./diseño.ts";

type ProcesarDetalleGrupo = ProcesarContexto<EstadoDetalleGrupo, ContextoDetalleGrupo>;

const limpiarDetalle = (contexto: ContextoDetalleGrupo, grupoSeleccionado: Grupo | null): ContextoDetalleGrupo => ({
    ...contexto,
    estado: "LISTA",
    grupoSeleccionado,
    reglasOrganizadas: [],
    categoriasAbiertas: {},
    reglasAbiertas: {},
});

const actualizarReglaRecursiva = (
    reglas: ReglaAnidada[],
    reglaId: string,
    nuevoValor: boolean | null
): ReglaAnidada[] => {
    return reglas.map((regla) => {
        const hijos = regla.hijos ? actualizarReglaRecursiva(regla.hijos, reglaId, nuevoValor) : undefined;

        return {
            ...regla,
            valor: regla.id === reglaId ? nuevoValor : regla.valor,
            ...(hijos ? { hijos } : {}),
        };
    });
};

const actualizarReglaEnCategorias = (
    categorias: CategoriaReglas[],
    reglaId: string,
    nuevoValor: boolean | null
): CategoriaReglas[] => {
    return categorias.map((categoria) => ({
        ...categoria,
        reglas: actualizarReglaRecursiva(categoria.reglas, reglaId, nuevoValor),
    }));
};

const actualizarCategoria = (
    categorias: CategoriaReglas[],
    categoriaId: string,
    nuevoValor: boolean | null
): CategoriaReglas[] => {
    return categorias.map((categoria) => (
        categoria.id === categoriaId
            ? { ...categoria, valor: nuevoValor }
            : categoria
    ));
};

export const cargarReglasGrupo: ProcesarDetalleGrupo = async (contexto, payload) => {
    const grupoSeleccionado = (payload as Grupo | null) ?? null;

    if (!grupoSeleccionado?.id) {
        return limpiarDetalle(contexto, null);
    }

    const [{ datos: reglas }, { datos: permisos }] = await Promise.all([
        getReglas(),
        getPermisosGrupo(grupoSeleccionado.id),
    ]);

    return {
        ...contexto,
        estado: "LISTA",
        grupoSeleccionado,
        reglasOrganizadas: getReglasPorGrupoPermiso(grupoSeleccionado.id, reglas, permisos),
        categoriasAbiertas: {},
        reglasAbiertas: {},
    };
};

const actualizarPermisoRegla = (nuevoValor: boolean | null): ProcesarDetalleGrupo => async (contexto, payload) => {
    const regla = payload as ReglaConValor;
    const grupoId = contexto.grupoSeleccionado?.id;

    if (!grupoId || !regla?.id) {
        return contexto;
    }

    await putPermiso(grupoId, regla.id, nuevoValor);

    return {
        ...contexto,
        reglasOrganizadas: actualizarReglaEnCategorias(contexto.reglasOrganizadas, regla.id, nuevoValor),
    };
};

const actualizarPermisoCategoria = (nuevoValor: boolean | null): ProcesarDetalleGrupo => async (contexto, payload) => {
    const categoria = payload as CategoriaReglas;
    const grupoId = contexto.grupoSeleccionado?.id;

    if (!grupoId || !categoria?.id) {
        return contexto;
    }

    await putPermiso(grupoId, categoria.id, nuevoValor);

    return {
        ...contexto,
        reglasOrganizadas: actualizarCategoria(contexto.reglasOrganizadas, categoria.id, nuevoValor),
    };
};

export const permitirRegla = actualizarPermisoRegla(true);
export const cancelarRegla = actualizarPermisoRegla(false);
export const borrarRegla = actualizarPermisoRegla(null);

export const permitirCategoria = actualizarPermisoCategoria(true);
export const cancelarCategoria = actualizarPermisoCategoria(false);
export const borrarCategoria = actualizarPermisoCategoria(null);

export const toggleCategoria: ProcesarDetalleGrupo = async (contexto, payload) => {
    const categoriaId = payload as string;

    return {
        ...contexto,
        categoriasAbiertas: {
            ...contexto.categoriasAbiertas,
            [categoriaId]: !contexto.categoriasAbiertas[categoriaId],
        },
    };
};

export const toggleRegla: ProcesarDetalleGrupo = async (contexto, payload) => {
    const reglaId = payload as string;

    return {
        ...contexto,
        reglasAbiertas: {
            ...contexto.reglasAbiertas,
            [reglaId]: !contexto.reglasAbiertas[reglaId],
        },
    };
};
