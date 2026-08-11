import { MetaModelo } from "@olula/lib/dominio.ts";
import { CategoriaReglas, Grupo, Permiso, Regla, ReglaAnidada, ReglaConValor } from "./diseño.ts";



export const grupoVacio: Grupo = {
    id: "",
    nombre: "",
};

export const metaNuevoGrupo: MetaModelo<Grupo> = {
    campos: {
        id: { tipo: "texto", requerido: true },
        nombre: { tipo: "texto", requerido: true },
    },
};

export const metaGrupo: MetaModelo<Grupo> = {
    campos: {
        id: { tipo: "texto", requerido: true },
        nombre: { tipo: "texto", requerido: true },
    },
};


export const reglaVacia: Regla = {
    id: "",
    descripcion: "",
    grupo: "",
};

export const validadoresGrupo = {
    id: (valor: string) => valor.trim() !== "",
    descripcion: (valor: string) => valor.trim() !== "",
};

export const validadoresRegla = {
    id: (valor: string) => valor.trim() !== "",
    descripcion: (valor: string) => valor.trim() !== "",
    grupo: (valor: string) => valor.trim() !== "",
};

const excepcionesRegla: string[] = [
    "publica"
];

const construirDescripcion = (idRegla: string): string => {
    const partes = idRegla.split('.');
    return partes.map(p => p.replace(/_/g, ' ')).join(' - ');
};

export const getReglasPorGrupoPermiso = (
    grupoId: string,
    reglas: Regla[],
    permisos: Permiso[]
): CategoriaReglas[] => {
    const permisosGrupo = permisos.filter(p => p.id_grupo === grupoId);

    const mapaPermisos: Record<string, boolean | null> = {};
    permisosGrupo.forEach(p => {
        mapaPermisos[p.id_regla] = p.valor;
    });

    // Filtrar reglas que NO estén en las excepciones
    const reglasFiltradas = reglas.filter(regla =>
        !excepcionesRegla.some(excepcion => regla.id.includes(excepcion))
    );

    const reglasConValor = reglasFiltradas.map(regla => ({
        ...regla,
        descripcion: regla.descripcion || construirDescripcion(regla.id),
        valor: mapaPermisos[regla.id] !== undefined ? mapaPermisos[regla.id] : null
    }));

    const categorias: Record<string, CategoriaReglas> = {};
    const reglasYaProcesadas = new Set<string>();

    reglasConValor.forEach(regla => {
        const partes = regla.id.split('.');
        const categoria = partes[0];
        const subnivel = partes.length > 1 ? partes[1] : null;
        const accion = partes.length > 2 ? partes[2] : null;

        if (!categorias[categoria]) {
            categorias[categoria] = {
                id: categoria,
                descripcion: construirDescripcion(categoria),
                reglas: [],
                valor: mapaPermisos[categoria] !== undefined ? mapaPermisos[categoria] : null
            };
        }

        // Si es una regla de primer nivel (ej: "ventas.factura")
        if (partes.length === 2 && !accion) {
            if (!reglasYaProcesadas.has(regla.id)) {
                reglasYaProcesadas.add(regla.id);
                categorias[categoria].reglas.push({
                    ...regla,
                    hijos: []
                });
            }
        }
        // Si es una regla de segundo nivel (ej: "ventas.factura.crear")
        else if (partes.length === 3) {
            const padreId = `${categoria}.${subnivel}`;
            const padre = categorias[categoria].reglas.find(r => r.id === padreId);
            if (padre) {
                padre.hijos = padre.hijos || [];
                if (!padre.hijos.find(h => h.id === regla.id)) {
                    padre.hijos.push(regla);
                }
            } else {
                // Si no existe el padre, lo creamos
                if (!reglasYaProcesadas.has(padreId)) {
                    reglasYaProcesadas.add(padreId);
                    categorias[categoria].reglas.push({
                        id: padreId,
                        grupo: padreId,
                        descripcion: construirDescripcion(padreId),
                        eventos: [],
                        valor: null,
                        hijos: [regla]
                    });
                }
            }
        }
    });

    return Object.values(categorias);
};

export const calcularClasesExtra = (
    regla: ReglaConValor | ReglaAnidada,
    reglaPadre?: ReglaAnidada,
    reglaGeneral?: CategoriaReglas
): { permitir: string; cancelar: string } => {
    const clases = {
        permitir: "",
        cancelar: "",
    };
    const permisoGeneral = reglaGeneral;

    if (regla.valor === null) {
        if (!reglaPadre) {
            if (permisoGeneral?.valor === false) {
                clases.cancelar = "BordeActivo";
            } else {
                clases.permitir = "BordeActivo";
            }
        } else {
            if (reglaPadre.valor === false) {
                clases.cancelar = "BordeActivo";
            } else if (reglaPadre.valor === true) {
                clases.permitir = "BordeActivo";
            } else if (permisoGeneral?.valor === false) {
                clases.cancelar = "BordeActivo";
            } else {
                clases.permitir = "BordeActivo";
            }
        }
    }

    return clases;
};