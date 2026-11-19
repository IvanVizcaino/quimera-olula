import { util } from "quimera";
import { Field, Schema } from "quimera/lib";

// Esquemas de partes de carros (tabla escarros) y de su firma. Los usan las
// vistas de vbarba-almacen y AlbaranesVenta de vbarba-firma_albaranes.
export const schemasPartesCarros = {
  partescarros: Schema("escarros", "id")
    .fields({
      idParte: Field.Int("id", "id").auto(),
      nombreCliente: Field.Text("nombrecli", "Nombre cliente").default(""),
      codCliente: Field.Text("codcliente", "codcliente").validation(parte => {
        return (
          parte.porCliente &&
          parte.aplicadoA === "Cliente" &&
          !parte.codCliente && {
            error: true,
            message: "Selecciona un cliente",
          }
        );
      }),
      codAgente: Field.Text("codagente", "codagente").validation(parte => {
        return (
          !parte.codAgente && {
            error: true,
            message: "Selecciona un agente",
          }
        );
      }),
      codigoParte: Field.Text("codigoparte", "Codigo parte"),
      fecha: Field.Date("fecha", "Fecha")
        .validation(parte => {
          return (
            !parte.fecha && {
              error: true,
              message: "Selecciona una fecha",
            }
          );
        })
        .default(util.today()),
      firmado: Field.Bool("firmado", "firmado").default(false),
      firmadoPor: Field.Text("firmadopor", "Firmado por").dump(false),
      codProveedor: Field.Text("codproveedor", "codproveedor").validation(parte => {
        return (
          !parte.codProveedor &&
          !parte.porCliente && {
            error: true,
            message: "Selecciona un proveedor",
          }
        );
      }),
      aliasProv: Field.Text("aliasprov", "aliasprov"),
      nombreProv: Field.Text("nombreprov", "nombreprov"),
      aplicadoA: Field.Text("aplicadoa", "aplicadoa"),
      porCliente: Field.Text("porcliente", "porcliente"),
      codTransportista: Field.Text("codtransportista", "codtransportista").validation(parte => {
        return (
          parte.porCliente &&
          parte.aplicadoA === "Transportista" &&
          !parte.codTransportista && {
            error: true,
            message: "Selecciona un transportista",
          }
        );
      }),
      nombreTrans: Field.Text("nombretrans", "nombretrans"),
      tipoDocCli: Field.Text("tipodoccli", "tipodoccli").default(" "),
      idDocumentoCli: Field.Text("iddocumentocli", "iddocumentocli"),
      codDocumentoCli: Field.Text("coddocumentocli", "coddocumentocli").default(" "),
      observaciones: Field.Text("observaciones", "observaciones"),
    })
    .order(() => ({ field: "fecha", direction: "DESC" }))
    .filter(() => ["1", "eq", "1"]),
  tiposCarro: Schema("escarros", "codigo")
    .fields({
      codigo: Field.Int("codigo", "codigo").auto(),
      idCarro: Field.Int("idcarro", "idcarro"),
      descripcion: Field.Text("descripcion", "descripcion").default(""),
      entrada: Field.Text("entrada", "entrada").default(0),
      salida: Field.Int("salida", "salida").default(0),
      total: Field.Int("total", "total"),
      saldo_antes: Field.Float("saldo_antes", "saldo_antes").default(0),
      saldo_despues: Field.Float("saldo_despues", "saldo_despues").default(0),
    })
    .order(() => ({ field: "fecha", direction: "DESC" }))
    .filter(({ parteCarro }) => ["id", "eq", parteCarro.data.idParte]),
  firmasdecarros: Schema("firmasdecarros", "idescarro").fields({
    idEscarro: Field.Text("idescarro", "idescarro"),
    codigoParte: Field.Text("codigoparte", "codigoparte"),
    codContacto: Field.Text("codcontacto", "codcontacto"),
    firmadopor: Field.Text("firmadopor", "firmadopor"),
    cifnif: Field.Text("cifnif", "cifnif"),
    puesto: Field.Text("puesto", "puesto"),
    fecha: Field.Text("fecha", "fecha"),
    hora: Field.Text("hora", "hora"),
    observacionesfirma: Field.TextArea("observacionesfirma", "observacionesfirma").default(""),
    estado: Field.Text("estado", "estado"),
    firma: Field.Text("firma", "firma"),
  }),
};
