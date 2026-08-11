import "./_forminput.css";
import { Etiqueta, FormFieldProps, Validacion } from "./_forminput.tsx";

type Opcion = { valor: string; descripcion: string };

export type QSelectProps = Omit<FormFieldProps, "onChange" | "onBlur"> & {
  opciones: Opcion[] | Opcion[][];
  soloTexto?: boolean;
  onChange?: (
    opcion: Opcion | null,
    evento: React.ChangeEvent<HTMLElement>
  ) => void;
  onBlur?: (
    opcion: Opcion | null,
    evento: React.FocusEvent<HTMLElement>
  ) => void;
  evaluarCambio?: () => void;
};

export const QSelect = ({
  label,
  nombre,
  deshabilitado,
  placeholder,
  opciones,
  valor = "",
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  soloTexto,
  ref,
  onChange,
  onBlur,
  evaluarCambio,
}: QSelectProps) => {
  if (soloTexto) {
    const descripcion = opciones
      .flat()
      .find((o) => o.valor === valor)?.descripcion;
    return (
      <quimera-select solo-texto="" nombre={nombre} condensado={condensado}>
        <label>
          <Etiqueta label={label} />
          <span className="valor-solo-texto">{descripcion || "—"}</span>
        </label>
      </quimera-select>
    );
  }
  const attrs = {
    nombre,
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
  };

  const renderOpciones = (opciones: Opcion[] | Opcion[][]) =>
    opciones.map((opcion) =>
      Array.isArray(opcion) ? (
        <optgroup label={opcion[0].descripcion} key={opcion[0].descripcion}>
          {renderOpciones(opcion.slice(1))}
        </optgroup>
      ) : (
        <option key={opcion.valor} value={opcion.valor}>
          {opcion.descripcion}
        </option>
      )
    );

  const manejarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opcion = opciones
      .flat()
      .find((opcion) => opcion.valor === e.target.value);
    if (!opcion) {
      onChange?.(null, e);
      return;
    }
    onChange?.(opcion, e);
    evaluarCambio?.();
  };

  const manejarBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    const opcion = opciones
      .flat()
      .find((opcion) => opcion.valor === e.target.value);
    if (!opcion) {
      onBlur?.(null, e);
      return;
    }
    onBlur?.(opcion, e);
    evaluarCambio?.();
  };

  return (
    <quimera-select {...attrs}>
      <label>
        <Etiqueta label={label} />
        <select
          name={nombre}
          defaultValue={onChange ? undefined : valor}
          value={onChange ? valor : undefined}
          required={!opcional}
          disabled={deshabilitado}
          onChange={manejarChange}
          onBlur={manejarBlur}
          ref={ref as React.RefObject<HTMLSelectElement>}
        >
          <option hidden value="">
            -{placeholder}-
          </option>
          {renderOpciones(opciones)}
        </select>
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-select>
  );
};
