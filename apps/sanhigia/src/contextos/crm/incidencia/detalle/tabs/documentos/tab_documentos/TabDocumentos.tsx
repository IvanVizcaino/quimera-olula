import { QArbolDocumentos } from "@olula/componentes/index.js";

const TAMANIO_MAXIMO_BYTES = 20 * 1024 * 1024; // 20 MB

export const TabDocumentos = ({ incidenciaId }: { incidenciaId: string }) => {
  return (
    <div className="TabDocumentos">
      <QArbolDocumentos
        tipoObjeto="incidencia"
        objetoId={incidenciaId}
        tamanioMaximoBytes={TAMANIO_MAXIMO_BYTES}
      />
    </div>
  );
};
