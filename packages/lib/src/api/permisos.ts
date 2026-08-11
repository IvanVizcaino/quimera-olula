import { Entidad } from "../diseño.ts";

export interface Permiso extends Entidad {
    id: string;
    id_regla: string;
    id_grupo: string;
    valor: boolean | null;
}

type WhoAmI = {
    tipo: string;
    permisos: Permiso[];
    plugins: Record<string, string>;
    usuario_id: string;
};


const parseWhoAmIStorage = (): WhoAmI | null => {
    const raw = localStorage.getItem("whoami");
    if (!raw) return null;

    try {
        return JSON.parse(raw) as WhoAmI;
    } catch {
        return null;
    }
}

export const permisosGrupo = {
    actualizar: (permisosGrupo: Permiso[]) => {
        const whoAmIActual = parseWhoAmIStorage();
        if (whoAmIActual) {
            localStorage.setItem("whoami", JSON.stringify({ ...whoAmIActual, permisos: permisosGrupo }));
        }
    },
    obtener: () => {
        const whoAmIActual = parseWhoAmIStorage();
        if (whoAmIActual) {
            return JSON.stringify(whoAmIActual.permisos);
        }
    },
    eliminar: () => {
        localStorage.removeItem("whoami");
    },
};
