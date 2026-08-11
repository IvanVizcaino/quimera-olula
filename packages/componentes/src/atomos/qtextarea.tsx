import { Etiqueta, FormFieldProps, Validacion } from "./_forminput.tsx";
import "./qtextarea.css";

type TextAreaProps = Omit<
  FormFieldProps,
  "onChange" | "onBlur" | "onKeyDown"
> & {
  onInput?: (
    valor: string,
    evento: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  onChange?: (
    valor: string,
    evento: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onBlur?: (
    valor: string,
    evento: React.FocusEvent<HTMLTextAreaElement>
  ) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  rows?: number;
  evaluarCambio?: () => void;
};

export const QTextArea = ({
  label,
  nombre,
  deshabilitado,
  textoValidacion = "",
  placeholder,
  valor = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  ref,
  onChange,
  onBlur,
  onInput,
  evaluarCambio,
  ...props
}: TextAreaProps) => {
  const attrs = {
    nombre,
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
  };

  // const inputAttrs = {
  //   nombre,
  //   deshabilitado,
  //   opcional,
  //   tipo,
  //   ...props,
  // };

  const manejarFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select();
  };

  const manejarChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value || "", e);
  };

  const manejarBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    onBlur?.(e.target.value || "", e);
    evaluarCambio?.();
  };

  const manejarInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    onInput?.((e.target as HTMLTextAreaElement).value, e);
  };

  return (
    <quimera-textarea {...attrs}>
      <label>
        <Etiqueta label={label} />
        <textarea
          {...props}
          name={nombre}
          placeholder={placeholder}
          value={onChange ? valor || "" : undefined}
          defaultValue={onChange ? undefined : valor}
          disabled={deshabilitado}
          required={!opcional}
          onChange={manejarChange}
          onBlur={manejarBlur}
          onFocus={manejarFocus}
          onInput={manejarInput}
          ref={ref as React.RefObject<HTMLTextAreaElement>}
        />
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-textarea>
  );
};
