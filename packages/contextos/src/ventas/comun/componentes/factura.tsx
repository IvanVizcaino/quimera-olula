import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { getFacturas } from "../../factura/infraestructura.ts";

interface FacturaSelectorProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const FacturaSelector = ({
  descripcion = "",
  valor,
  nombre = "factura_id",
  label = "Seleccionar factura",
  autoFocus = false,
  deshabilitado = false,
  onChange,
}: FacturaSelectorProps) => {
  const obtenerOpciones = async (busqueda: string) => {
    if (busqueda.length < 3) return [];

    const criteria: Criteria = {
      filtro: [["codigo", "~", busqueda]],
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
      descripcion: `${factura.codigo} - ${factura.cliente?.nombre_cliente ?? ""}`,
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
