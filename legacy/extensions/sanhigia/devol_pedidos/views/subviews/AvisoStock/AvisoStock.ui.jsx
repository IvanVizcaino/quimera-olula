import { Box, Typography } from "@quimera/comps";
import Quimera, { useStateValue } from "quimera";

function AvisoStock({ useStyles }) {
  const [{ stock, linea }, dispatch] = useStateValue();
  const classes = useStyles();

  const stockInsuficiente =
    linea.buffer.referencia &&
    stock.disponible !== null &&
    stock.disponible < linea.buffer.cantidad;

  // console.log("mimensaje_por_recibir", stock);

  return (
    <Quimera.Template id="AvisoStock">
      {stockInsuficiente && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography
              variant="body1"
              color="secondary"
            >{`Este artículo no tiene stock suficiente (${stock.disponible} < ${linea.buffer.cantidad})`}</Typography>
          </Box>
          {stock?.recepciones?.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body1" color="secondary">
                Recepciones pendientes:
              </Typography>
              {stock.recepciones.map((recepcion, index) => (
                <Typography key={index} variant="body1" color="secondary">
                  {`${recepcion.por_recibir} undidad${recepcion.por_recibir > 1 ? "es pedidas" : " pedida"
                    } el ${new Date(recepcion.fecha_pedido).toLocaleDateString(
                      "es-ES",
                    )}, fecha de recepción el ${new Date(
                      recepcion.fecha_recepcion,
                    ).toLocaleDateString("es-ES")}`}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="secondary">
              No hay recepciones pendientes de este producto
            </Typography>
          )}
        </>
      )}
    </Quimera.Template>
  );
}

export default AvisoStock;
