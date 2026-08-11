import "./_forminput.css";
import "./qradio.css";
import { Etiqueta, FormFieldProps, Validacion } from "./_forminput.tsx";

type Opcion = { valor: string; descripcion: string };

export type QRadioProps = Omit<FormFieldProps, "onChange" | "onBlur"> & {
  opciones: Opcion[];
  onChange?: (
    opcion: Opcion | null,
    evento: React.ChangeEvent<HTMLInputElement>
  ) => void;
  evaluarCambio?: () => void;
};

export const QRadio = ({
  label,
  nombre,
  deshabilitado,
  opciones,
  valor = "",
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  onChange,
  evaluarCambio,
}: QRadioProps) => {
  const attrs = {
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
  };

  const manejarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opcion = opciones.find((o) => o.valor === e.target.value) ?? null;
    onChange?.(opcion, e);
    evaluarCambio?.();
  };

  return (
    <quimera-radio {...attrs}>
      <fieldset>
        <legend>
          <Etiqueta label={label} />
        </legend>
        <div className="radio-opciones">
          {opciones.map((opcion) => (
            <label key={opcion.valor} className="radio-opcion">
              <input
                type="radio"
                name={nombre}
                value={opcion.valor}
                checked={onChange ? valor === opcion.valor : undefined}
                defaultChecked={onChange ? undefined : valor === opcion.valor}
                disabled={deshabilitado}
                required={!opcional}
                onChange={manejarChange}
              />
              <span>{opcion.descripcion}</span>
            </label>
          ))}
        </div>
        <Validacion textoValidacion={textoValidacion} />
      </fieldset>
    </quimera-radio>
  );
};
