import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { getFacturas } from "@olula/ctx/ventas/factura/infraestructura.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { formatearFechaDate } from "@olula/lib/dominio.ts";

interface FacturaSelectorDevolucionesProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const FacturaSelectorDevoluciones = ({
  descripcion = "",
  valor,
  nombre = "factura_id",
  label = "Seleccionar factura",
  autoFocus = false,
  deshabilitado = false,
  onChange,
}: FacturaSelectorDevolucionesProps) => {
  const obtenerOpciones = async (busqueda: string) => {
    if (busqueda.length < 3) return [];

    const criteria: Criteria = {
      filtro: {
        or: [
          ["nombre_cliente", "~", busqueda],
          ["codigo", "~", busqueda],
        ],
      },
      orden: ["fecha", "DESC"],
      paginacion: { pagina: 1, limite: 10 },
    };

    const { datos } = await getFacturas(
      criteria.filtro,
      criteria.orden,
      criteria.paginacion
    );

    return datos.map((factura) => ({
      valor: factura.id,
      descripcion: `${factura.cliente?.nombre_cliente ?? ""} - ${factura.codigo} - ${formatearFechaDate(factura.fecha)}`,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      autoSeleccion
      autoFocus={autoFocus}
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
    />
  );
};
