type WhoAmI = {
    empresas?: { id: string; nombre: string }[];
};

const EMPRESA_ACTUAL_KEY = "empresa_actual";

/**
 * Empresa con la que trabaja el usuario.
 *
 * - Si solo tiene una empresa, normaliza el valor almacenado a esa y la devuelve.
 * - Si tiene varias, devuelve la guardada en localStorage solo si está en la lista;
 *   si no está (sesión de otra app, empresa eliminada, etc.) devuelve "" para que el
 *   usuario la seleccione desde el selector de cabecera.
 *
 * Se lee de localStorage en cada llamada, no al cargar el módulo: el login hace
 * `navigate("/")` sin recargar, así que cualquier valor capturado al importar se
 * quedaría congelado con lo de antes de iniciar sesión.
 */
export const empresaActual = (): string => {
    const raw = localStorage.getItem("whoami");
    if (!raw) return "";

    try {
        const whoAmI = JSON.parse(raw) as WhoAmI;
        const empresas = whoAmI.empresas ?? [];
        if (empresas.length === 0) return "";

        if (empresas.length === 1) {
            const id = String(empresas[0].id);
            setEmpresaActual(id);
            return id;
        }

        const stored = localStorage.getItem(EMPRESA_ACTUAL_KEY) ?? "";
        return empresas.some((e) => String(e.id) === stored) ? stored : "";
    } catch {
        return "";
    }
};

export const setEmpresaActual = (id: string): void => {
    localStorage.setItem(EMPRESA_ACTUAL_KEY, id);
};

/**
 * Copia del modelo con la empresa activa ya puesta.
 *
 * Los formularios de alta la necesitan en el modelo inicial, no solo al enviar: el campo
 * es requerido y sin él el botón Guardar nace deshabilitado. El nombre del campo es
 * parametrizable porque el alta de factura lo llama `idEmpresa`.
 */
export const conEmpresaActual = <T extends object>(
    modelo: T,
    campo: string = "empresa_id"
): T => ({ ...modelo, [campo]: empresaActual() });
