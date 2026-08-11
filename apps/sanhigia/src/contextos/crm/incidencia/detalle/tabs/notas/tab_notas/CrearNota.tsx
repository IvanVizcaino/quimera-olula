import { QBoton, QTextArea } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useState } from "react";
import { postNota } from "../../../../infraestructura.ts";
import "./CrearNota.css";

export const CrearNota = ({
  incidenciaId,
  agenteId,
  emitir,
}: {
  incidenciaId: string;
  agenteId: string;
  emitir: EmitirEvento;
}) => {
  const [texto, setTexto] = useState("");

  const agregar_ = useCallback(async () => {
    const ahora = new Date().toISOString().split("T")[0];
    await postNota({
      texto,
      fecha: ahora,
      agenteId,
      incidenciaId,
    });
    setTexto("");
    emitir("nota_creada");
  }, [texto, agenteId, incidenciaId, emitir]);

  const cancelar_ = useCallback(() => {
    setTexto("");
    emitir("creacion_nota_cancelada");
  }, [emitir]);

  const [agregar, cancelar] = useForm(agregar_, cancelar_);

  return (
    <div className="CrearNota">
      <QTextArea
        nombre="texto"
        label=""
        valor={texto}
        onChange={(valor: string) => setTexto(valor)}
        placeholder="Ingresa el texto de la nueva nota..."
        rows={4}
      />
      <div className="CrearNota-Boton">
        <QBoton onClick={agregar} deshabilitado={!texto.trim()}>
          Añadir nota
        </QBoton>
        <QBoton onClick={cancelar}>Cancelar</QBoton>
      </div>
    </div>
  );
};
