import { useRef, useState } from "react";
import { FormFieldProps } from "../atomos/_forminput.tsx";
import { QInput } from "../atomos/qinput.tsx";

type Opciones = { valor: string; descripcion: string }[];

type QAutocompletarProps = FormFieldProps & {
  tiempoEspera?: number;
  longitudMinima?: number;
  obtenerOpciones: (valor: string) => Promise<Opciones>;
};

export const QAutocompletar = ({
  nombre,
  valor,
  tiempoEspera = 250,
  longitudMinima = 2,
  obtenerOpciones,
  onBlur,
  onChange,
  ...props
}: QAutocompletarProps) => {
  const [opciones, setOpciones] = useState<Opciones>([]);

  const valorReal = useRef<HTMLInputElement>(null);
  const temporizador = useRef<number | undefined>(undefined);

  const renderOpciones = opciones.map((opcion) => (
    <option key={opcion.valor} value={opcion.valor}>
      {opcion.descripcion}
    </option>
  ));

  const listaId = nombre + "-datalist";

  const regenerarOpciones = async (valor: string) => {
    clearTimeout(temporizador.current);

    if (valor.length < longitudMinima) return;

    temporizador.current = setTimeout(
      async () => setOpciones(await obtenerOpciones(valor)),
      tiempoEspera
    );
  };

  const inputCallback = (
    valor: string,
    e: React.FormEvent<HTMLInputElement>
  ) => {
    regenerarOpciones(valor);

    const opcion = opciones.find((opcion) => opcion.valor === valor);
    if (!opcion) {
      valorReal.current!.value = "";
      onChange?.("", e as unknown as React.ChangeEvent<HTMLElement>);
      return;
    }

    const objetivo = e.target as HTMLInputElement;
    objetivo.value = opcion.descripcion;

    valorReal.current!.value = opcion.valor;
    onChange?.(opcion.valor, e as unknown as React.ChangeEvent<HTMLElement>);
  };

  const blurCallback = (valor: string, e: React.FocusEvent<HTMLElement>) => {
    const opcion = opciones.find((opcion) => opcion.descripcion === valor);
    if (opcion) {
      onBlur?.(opcion.valor, e);
      return;
    }

    const objetivo = e.target as HTMLInputElement;
    objetivo.value = "";

    valorReal.current!.value = "";
    onBlur?.("", e);
  };

  return (
    <quimera-autocompletar>
      <datalist id={listaId}>{renderOpciones}</datalist>
      <input
        ref={valorReal}
        type="hidden"
        name={nombre}
        value={valor}
        defaultValue={undefined}
        required={!props.opcional}
      />
      <QInput
        {...props}
        nombre=""
        lista={listaId}
        autocompletar="off"
        onInput={inputCallback}
        onBlur={blurCallback}
      />
    </quimera-autocompletar>
  );
};
