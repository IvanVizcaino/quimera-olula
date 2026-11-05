import { TipoComponente } from "../diseño.ts";
import { CATALOGO } from "../dominio.ts";

const GRUPOS = ["Indicadores", "Gráficos", "Datos", "Otros"] as const;

/**
 * Panel «Añadir componente» del modo edición. Lo que aún no está, se anuncia; la
 * pregunta a la IA solo aparece si hay un modelo activo.
 */
export const CatalogoComponentes = ({
  lleno,
  conIA,
  onElegir,
}: {
  lleno: boolean;
  conIA: boolean;
  onElegir: (tipo: TipoComponente) => void;
}) => (
  <aside className="catalogo-componentes" aria-labelledby="catalogo-componentes-titulo">
    <h2 id="catalogo-componentes-titulo">Añadir componente</h2>
    {lleno && (
      <p className="catalogo-componentes-lleno">Has llegado al máximo de componentes.</p>
    )}
    {GRUPOS.map((grupo) => (
      <section key={grupo}>
        <h3>{grupo}</h3>
        <ul>
          {CATALOGO.filter(
            (d) => d.grupo === grupo && (conIA || d.tipo !== "pregunta_ia")
          ).map((d) => (
            <li key={d.tipo}>
              <button
                type="button"
                disabled={!d.disponible || lleno}
                onClick={() => onElegir(d.tipo)}
              >
                <strong>
                  {d.nombre}
                  {!d.disponible && <span className="catalogo-componentes-pronto">pronto</span>}
                </strong>
                <span>{d.descripcion}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </aside>
);
