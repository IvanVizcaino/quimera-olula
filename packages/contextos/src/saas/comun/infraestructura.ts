/**
 * Algunas operaciones del backoffice responden 204 (sin cuerpo): RestAPI intenta
 * parsear JSON y falla con SyntaxError aunque la operación haya ido bien.
 * Los errores HTTP reales llegan como objeto { nombre, descripcion, estado }.
 */
export const sinCuerpo = async (llamada: () => Promise<unknown>): Promise<void> => {
    try {
        await llamada();
    } catch (error) {
        if (error instanceof SyntaxError) return;
        throw error;
    }
};
