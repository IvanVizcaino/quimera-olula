import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { getClientesTenant } from "../../clientes_tenant/infraestructura.js";

interface ClienteTenantProps {
    descripcion?: string;
    valor: string;
    nombre?: string;
    label?: string;
    deshabilitado?: boolean;
    soloLectura?: boolean;
    opcional?: boolean;
    ref?: React.RefObject<HTMLInputElement | null>;
    onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const ClienteTenant = ({
    descripcion = "",
    valor,
    nombre = "cliente_id",
    label = "Cliente",
    deshabilitado = false,
    onChange,
    ...props
}: ClienteTenantProps) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        const criteria = {
            filtro: id ? [["id", "=", id]] : ["nombre", "~", texto],
            orden: ["id"],
        };

        const { datos } = await getClientesTenant({
            filtro: criteria.filtro as unknown as Filtro,
            orden: criteria.orden as Orden,
            paginacion: { pagina: 1, limite: 10 },
        });

        if (!Array.isArray(datos)) {
            return [];
        }

        return datos.map((cliente) => ({
            valor: cliente.id,
            descripcion: cliente.nombre,
        }));
    };

    return (
        <QAutocompletar
            label={label}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={descripcion}
            soloLectura={deshabilitado}
            {...props}
        />
    );
};
