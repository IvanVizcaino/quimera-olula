import "./_forminput.css";
import {
  Etiqueta,
  FormInput,
  FormInputProps,
  Validacion,
} from "./_forminput.tsx";

export type QInputProps = FormInputProps & {
  modificado?: boolean;
  soloTexto?: boolean;
};

export const QInput = ({
  label,
  nombre,
  deshabilitado,
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  tipo,
  modificado,
  soloTexto,
  valor,
  ...props
}: QInputProps) => {
  if (soloTexto) {
    return (
      <quimera-input solo-texto="" nombre={nombre} tipo={tipo} condensado={condensado}>
        <label>
          <Etiqueta label={label} />
          {tipo === "checkbox" ? (
            <input type="checkbox" checked={valor === "true"} disabled readOnly />
          ) : (
            <span className="valor-solo-texto">{valor || "—"}</span>
          )}
        </label>
      </quimera-input>
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
    modificado,
    tipo,
  };

  const inputAttrs = {
    nombre,
    deshabilitado,
    opcional,
    tipo,
    valor,
    ...props,
  };

  return (
    <quimera-input {...attrs}>
      <label>
        <Etiqueta label={label} />
        <FormInput {...inputAttrs} />
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-input>
  );
};
