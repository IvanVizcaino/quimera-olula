import { Entidad, Orden, Paginacion } from "@olula/lib/diseño.ts";
import {
  calcularPaginacionSimplificada,
  formatearFechaDate,
  formatearFechaString,
  formatearHoraString,
  formatearMoneda,
} from "@olula/lib/dominio.ts";
import { ReactNode } from "react";
import { QBoton } from "./qboton.tsx";
import "./qtabla.css";

type MetaColumna<T extends Entidad> = {
  id: string;
  cabecera: string;
  prioridad?: "alta" | "media" | "baja";
  esTitulo?: boolean;
  tipo?:
    | "texto"
    | "numero"
    | "moneda"
    | "fecha"
    | "hora"
    | "fechahora"
    | "booleano"
    | undefined;
  divisa?: string;
  ancho?: string;
  render?: (entidad: T) => string | ReactNode;
};

export type MetaTabla<T extends Entidad> = MetaColumna<T>[];

const cabecera = <T extends Entidad>(
  metaTabla: MetaTabla<T>,
  orden: Orden,
  onOrdenar?: (clave: string) => void
) => {
  const [colOrdenada, sentido] = orden;

  const renderCabecera = ({ id, cabecera, tipo, ancho }: MetaColumna<T>) => (
    <th
      key={id}
      data-modo="columna"
      data-orden={id === colOrdenada ? sentido : ""}
      className={`${id} ${tipo ?? ""}`}
      style={ancho ? { width: ancho } : undefined}
      onClick={() => onOrdenar && onOrdenar(id)}
    >
      {cabecera}
    </th>
  );

  return metaTabla.map(renderCabecera);
};

const fila = <T extends Entidad>(entidad: Entidad, metaTabla: MetaTabla<T>) => {
  const renderColumna = ({
    id,
    render,
    tipo,
    divisa,
    ancho,
  }: MetaColumna<T>) => {
    let datos = render?.(entidad as T) ?? (entidad[id] as unknown);

    // Formateo automático según tipo
    if (tipo === "moneda") {
      if (typeof datos === "number" || typeof datos === "string") {
        datos = formatearMoneda(datos, divisa ?? "EUR");
      }
    } else if (tipo === "fecha" && typeof datos === "string") {
      datos = formatearFechaString(datos);
    } else if (tipo === "fecha" && typeof datos === "object") {
      datos = formatearFechaDate(datos as Date);
    } else if (tipo === "hora" && typeof datos === "string") {
      datos = formatearHoraString(datos);
    } else if (tipo === "numero" && typeof datos === "number") {
      datos = datos.toLocaleString("es-ES");
    } else if (tipo === "booleano" && typeof datos === "boolean") {
      datos = datos ? "Sí" : "No";
    }

    return (
      <td
        key={[entidad.id, id].join("-")}
        className={`${id} ${tipo ?? ""}`}
        style={ancho ? { width: ancho } : undefined}
      >
        {datos as string}
      </td>
    );
  };

  return metaTabla.map(renderColumna);
};

const paginacionControlador = (
  totalEntidades: number | undefined,
  paginacion: Paginacion,
  onPaginacion?: (pagina: number, limite: number) => void
) => {
  if (!onPaginacion || totalEntidades === undefined || totalEntidades <= 0) {
    return null;
  }
  const { pagina, limite } = paginacion;
  if (limite >= totalEntidades) {
    return null;
  }
  const { paginasMostradas, totalPaginas } = calcularPaginacionSimplificada(
    totalEntidades,
    pagina,
    limite
  );

  return (
    <quimera-tabla-paginacion>
      <QBoton
        deshabilitado={pagina === 1 || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => onPaginacion?.(1, limite)}
      >
        &lt;&lt;
      </QBoton>

      <QBoton
        deshabilitado={pagina === 1 || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => onPaginacion?.(Math.max(1, pagina - 1), limite)}
      >
        &lt;
      </QBoton>

      {paginasMostradas.map((numPagina) => (
        <QBoton
          key={numPagina}
          tamaño="pequeño"
          deshabilitado={numPagina === pagina}
          variante={numPagina === pagina ? "borde" : "texto"}
          onClick={() => onPaginacion?.(numPagina, limite)}
        >
          {numPagina}
        </QBoton>
      ))}

      <QBoton
        deshabilitado={pagina >= totalPaginas || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() =>
          onPaginacion?.(Math.min(totalPaginas, pagina + 1), limite)
        }
      >
        &gt;
      </QBoton>

      <QBoton
        deshabilitado={pagina >= totalPaginas || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => onPaginacion?.(totalPaginas, limite)}
      >
        &gt;&gt;
      </QBoton>
    </quimera-tabla-paginacion>
  );
};

export type QTablaProps<T extends Entidad> = {
  metaTabla: MetaTabla<T>;
  datos: T[];
  cargando: boolean;
  seleccionadaId?: string;
  onSeleccion?: (entidad: T) => void;
  orden: Orden;
  onOrdenar?: (clave: string) => void;
  paginacion?: Paginacion;
  onPaginacion?: (pagina: number, limite: number) => void;
  totalEntidades?: number;
};

export const QTabla = <T extends Entidad>({
  metaTabla,
  datos,
  cargando,
  seleccionadaId,
  onSeleccion,
  orden,
  onOrdenar,
  paginacion,
  onPaginacion,
  totalEntidades = 0,
}: QTablaProps<T>) => {
  // Detectar si hay anchos específicos
  const tieneAnchosFijos = metaTabla.some((col) => col.ancho);

  // Completar columnas sin ancho
  const metaTablaCompleta = tieneAnchosFijos
    ? metaTabla.map((col) => {
        if (col.ancho) return col;

        const hayPorcentajes = metaTabla.some((c) => c.ancho?.includes("%"));
        const anchos = hayPorcentajes
          ? {
              texto: "20%",
              fecha: "10%",
              hora: "8%",
              moneda: "12%",
              numero: "10%",
              booleano: "8%",
              defecto: "15%",
            }
          : {
              texto: "150px",
              fecha: "90px",
              hora: "80px",
              moneda: "120px",
              numero: "100px",
              booleano: "100px",
              defecto: "150px",
            };

        return {
          ...col,
          ancho: anchos[col.tipo as keyof typeof anchos] || anchos.defecto,
        };
      })
    : metaTabla;

  return (
    <quimera-tabla>
      <div className="tabla-contenedor-scroll">
        <table data-anchos-fijos={tieneAnchosFijos}>
          <thead>
            <tr>{cabecera(metaTablaCompleta, orden, onOrdenar)}</tr>
          </thead>
          <tbody data-cargando={cargando}>
            {datos.map((entidad: T) => (
              <tr
                key={entidad.id}
                onClick={() => onSeleccion && onSeleccion(entidad)}
                data-seleccionada={entidad.id === seleccionadaId}
              >
                {fila(entidad, metaTablaCompleta)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginacion &&
        paginacionControlador(totalEntidades, paginacion, onPaginacion)}
    </quimera-tabla>
  );
};
