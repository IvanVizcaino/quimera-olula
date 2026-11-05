type ModoListado = "tabla" | "tarjetas" | "kanban";

const etiquetas: Record<ModoListado, string> = {
  tarjetas: "Tarjetas",
  tabla: "Tabla",
  kanban: "Kanban",
};

/** Control segmentado para elegir el modo de vista del listado. */
export const SelectorModo = <M extends ModoListado>({
  modos,
  modo,
  onCambio,
}: {
  modos: M[];
  modo: M;
  onCambio: (modo: M) => void;
}) => (
  <div className="selector-modo" role="group" aria-label="Modo de vista">
    {modos.map((opcion) => (
      <button
        key={opcion}
        type="button"
        aria-pressed={opcion === modo}
        onClick={() => opcion !== modo && onCambio(opcion)}
      >
        {etiquetas[opcion]}
      </button>
    ))}
  </div>
);
