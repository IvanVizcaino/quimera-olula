import { getPedidos } from "#/ventas/pedido/infraestructura.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { filtroPedidosCliente } from "../dominio.ts";

export type OpcionPedidoCliente = {
    /** Código del pedido (`pedidoscli.codigo`), que es lo que guarda la orden. */
    valor: string;
    descripcion: string;
    clienteId: string;
    nombreCliente: string;
};

/**
 * Pedido de cliente existente, por código. Con `clienteId`, solo los de ese cliente. Se usa con
 * `{...uiProps("pedidoId")}`.
 */
export const SelectorPedidoCliente = ({
    valor,
    clienteId,
    nombre = "pedidoId",
    label = "Pedido de cliente",
    onChange,
    evaluarCambio,
    soloLectura,
}: {
    valor: unknown;
    clienteId?: string;
    nombre?: string;
    label?: string;
    onChange?: (opcion: OpcionPedidoCliente | null) => void;
    evaluarCambio?: () => void;
    soloLectura?: boolean;
}) => {
    const obtenerOpciones = async (texto: string, codigo?: string): Promise<OpcionPedidoCliente[]> => {
        const { datos } = await getPedidos(
            filtroPedidosCliente(texto, clienteId, codigo), ["fecha", "DESC"], { pagina: 1, limite: 10 });
        return datos.map((p) => ({
            valor: p.codigo,
            descripcion: p.cliente?.nombre_cliente ? `${p.codigo} · ${p.cliente.nombre_cliente}` : p.codigo,
            clienteId: p.cliente?.cliente_id ?? "",
            nombreCliente: p.cliente?.nombre_cliente ?? "",
        }));
    };

    return (
        <QAutocompletar<OpcionPedidoCliente>
            label={label}
            nombre={nombre}
            valor={valor ? String(valor) : ""}
            obtenerOpciones={obtenerOpciones}
            onChange={(opcion) => onChange?.(opcion)}
            evaluarCambio={evaluarCambio}
            soloLectura={soloLectura}
            opcional
            placeholder="Código del pedido"
        />
    );
};
