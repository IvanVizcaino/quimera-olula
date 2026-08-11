import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import {
  descargarDocumento,
  QBoton,
  QIcono,
} from "@olula/componentes/index.js";
import { DocumentoArbol, DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { AnadirDocumento } from "./AnadirDocumento.tsx";
import { CrearCarpeta } from "./CrearCarpeta.tsx";
import { ConfiguracionArbolDocumentos } from "./diseño.ts";
import { getMaquinaArbolDocumentos } from "./maquina.ts";
import { NodoArbolItem } from "./NodoArbolItem.tsx";
import { useSeleccionArchivosMovil } from "./useSeleccionArchivosMovil.ts";
import "./QArbolDocumentos.css";

export interface QArbolDocumentosProps {
  tipoObjeto: string;
  objetoId: string;
  tamanioMaximoBytes?: number;
  onDescargar?: (documento: DocumentoArbol) => void;
  onError?: (error: Error) => void;
}

export const QArbolDocumentos = ({
  tipoObjeto,
  objetoId,
  tamanioMaximoBytes,
  onDescargar,
  onError,
}: QArbolDocumentosProps) => {
  const handleError = useCallback(
    (error: Error) => onError?.(error),
    [onError]
  );

  const configuracion: ConfiguracionArbolDocumentos = { tipoObjeto, objetoId };

  const { ctx, emitir } = useMaquina(getMaquinaArbolDocumentos, {
    estado: "cargando" as const,
    nodos: [],
    configuracion,
    carpetaPadreId: null,
  });
  const { intentar } = useContext(ContextoError);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  // Archivos ya elegidos por el selector nativo en móvil (ver useSeleccionArchivosMovil),
  // a la espera de que se monte AnadirDocumento para pasárselos como archivosIniciales.
  // undefined en el flujo normal de escritorio (el modal se abre vacío, sin preselección).
  const [archivosPendientes, setArchivosPendientes] = useState<
    File[] | undefined
  >(undefined);

  useEffect(() => {
    setExpandidos(new Set());
    emitir("cargar_arbol", { tipoObjeto, objetoId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoObjeto, objetoId]);

  useEffect(() => {
    if (ctx.estado === "cargado" && ctx.carpetaPadreId) {
      const carpetaPadreId = ctx.carpetaPadreId;
      setExpandidos((actual) =>
        actual.has(carpetaPadreId)
          ? actual
          : new Set(actual).add(carpetaPadreId)
      );
    }
  }, [ctx.estado, ctx.carpetaPadreId]);

  const handleToggle = useCallback((id: string) => {
    setExpandidos((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  }, []);

  const handleDescargar = useCallback(
    async (documento: DocumentoArbol) => {
      if (onDescargar) {
        onDescargar(documento);
        return;
      }
      try {
        await intentar(async () => {
          const blob = await DocumentosAPI.descargar(documento.id);
          await descargarDocumento(blob, documento.nombre);
        });
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error("Error desconocido")
        );
      }
    },
    [intentar, onDescargar, handleError]
  );

  const handleCrearCarpeta = useCallback(
    (carpetaPadreId: string | null) => {
      emitir("creacion_carpeta_solicitada", carpetaPadreId);
    },
    [emitir]
  );

  const handleAnadirDocumento = useCallback(
    (carpetaPadreId: string | null, archivosIniciales?: File[]) => {
      // Siempre se fija (incluso a undefined) para que un clic normal de escritorio
      // no reutilice por error archivos de una selección móvil anterior.
      setArchivosPendientes(archivosIniciales);
      emitir("adicion_documento_solicitada", carpetaPadreId);
    },
    [emitir]
  );

  // Botón raíz "Añadir": en móvil abre el selector nativo directamente (carpetaPadreId null = raíz);
  // en escritorio abre el modal vacío como antes.
  const {
    inputRef: inputRefRaiz,
    handleClick: handleClickAnadirRaiz,
    handleChange: handleChangeAnadirRaiz,
  } = useSeleccionArchivosMovil(null, handleAnadirDocumento);

  return (
    <div className="QArbolDocumentos">
      {ctx.estado === "cargando" && (
        <div className="QArbolDocumentos-cargando">
          <p>Cargando árbol de documentos...</p>
        </div>
      )}
      {ctx.estado !== "cargando" && (
        <div className="QArbolDocumentos-cabecera">
          <div className="QArbolDocumentos-titulo">
            <span className="QArbolDocumentos-chevron-espaciador" />
            <span className="QArbolDocumentos-raiz">/</span>
          </div>
          <div className="QArbolDocumentos-botones">
            <QBoton
              tamaño="pequeño"
              variante="texto"
              onClick={() => handleCrearCarpeta(null)}
            >
              <QIcono nombre="carpeta_nueva" tamaño="md" />
            </QBoton>
            <QBoton
              tamaño="pequeño"
              variante="texto"
              onClick={handleClickAnadirRaiz}
            >
              <QIcono nombre="documento_nuevo" tamaño="md" />
            </QBoton>
          </div>
        </div>
      )}
      <input
        ref={inputRefRaiz}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleChangeAnadirRaiz}
      />
      {ctx.estado === "cargado" && ctx.nodos.length === 0 && (
        <div className="QArbolDocumentos-vacio">
          <p>No hay documentos</p>
        </div>
      )}
      {ctx.estado !== "cargando" && ctx.nodos.length > 0 && (
        <div className="QArbolDocumentos-arbol" role="tree">
          {ctx.nodos.map((nodo) => (
            <NodoArbolItem
              key={nodo.id}
              nodo={nodo}
              nivel={0}
              expandidos={expandidos}
              onToggle={handleToggle}
              onDescargar={handleDescargar}
              onCrearCarpeta={handleCrearCarpeta}
              onAnadirDocumento={handleAnadirDocumento}
            />
          ))}
        </div>
      )}
      {ctx.estado === "creando_carpeta" && (
        <CrearCarpeta
          vinculoTipo={ctx.carpetaPadreId ? "gd_documentos" : tipoObjeto}
          vinculoId={ctx.carpetaPadreId ?? objetoId}
          publicar={emitir}
        />
      )}
      {ctx.estado === "anadiendo_documento" && (
        <AnadirDocumento
          vinculoTipo={ctx.carpetaPadreId ? "gd_documentos" : tipoObjeto}
          vinculoId={ctx.carpetaPadreId ?? objetoId}
          archivosIniciales={archivosPendientes}
          tamanioMaximoBytes={tamanioMaximoBytes}
          publicar={emitir}
        />
      )}
    </div>
  );
};
