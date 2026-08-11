import { PanelAsistenteBase } from "#/asistente/vistas/PanelAsistente.tsx";
import { useNavigate } from "react-router";

/**
 * Se monta dentro de Plantilla (packages/componentes), vía Componentes.panel_asistente
 * — a diferencia del modo "flotante" (hermano de <RouterProvider> en main.tsx), aquí sí
 * hay <RouterProvider> como ancestro, así que se puede usar useNavigate() directamente
 * en vez de recibir la función de navegación desde fuera.
 */
export const AsistenteLateralOlula = () => {
    const navigate = useNavigate();
    return <PanelAsistenteBase modo="lateral" navigate={url => navigate(url)} />;
};
