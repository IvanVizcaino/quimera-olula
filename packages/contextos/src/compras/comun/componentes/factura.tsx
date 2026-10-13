import { getFacturas } from "#/compras/factura/infraestructura.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";

interface FacturaCompraProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  /** Cláusulas adicionales, combinadas (AND) con la búsqueda por código. */
  filtroExtra?: ClausulaFiltro[];
  onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const FacturaCompra = ({
  descripcion = "",
  valor,
  nombre = "factura_id",
  label = "Factura",
  deshabilitado = false,
  filtroExtra = [],
  onChange,
  ...props
}: FacturaCompraProps) => {
  const obtenerOpciones = async (texto: string, id?: string) => {
    if (!id && texto.length < 2) return [];

    const criteria: Criteria = {
      filtro: id
        ? [["id", "=", id]]
        : ([["codigo", "~", texto], ...filtroExtra] as ClausulaFiltro[]),
      orden: ["fecha", "DESC"],
      paginacion: { pagina: 1, limite: 10 },
    };

    const { datos: facturas } = await getFacturas(criteria);

    return facturas.map((factura) => ({
      valor: factura.id,
      descripcion: factura.codigo,
      descripcionOpcion: `${factura.codigo} · ${factura.nombreProveedor}`,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      autoSeleccion
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
      {...props}
    />
  );
};
