import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { Empresa } from "../../componentes/empresa.js";
import { getConfiguracionCredenciales } from "../configuracion.js";
import { CamposSecreto } from "../componentes/CamposSecreto.js";
import { CategoriaCredencialExterna, SecretoCredencialExterna, TipoAuthCredencialExterna } from "../diseño.js";
import {
    OPCIONES_TIPO_AUTH,
    OTRO_PROVEEDOR,
    buscarProveedorConocido,
    opcionesProveedorPorCategoria,
    secretoCompleto,
} from "../dominio.js";
import { postCredencialExterna } from "../infraestructura.js";
import "./CrearCredencialExterna.css";
import {
    metaNuevaCredencialExterna,
    nuevaCredencialExternaVaciaConector,
    nuevaCredencialExternaVaciaLlm,
} from "./crear.js";

/**
 * Modal de alta de credencial de terceros.
 *
 * Patrón:
 *   - El maestro lo renderiza condicionalmente cuando estado === "CREANDO", con
 *     `categoriaFiltro` fijado por qué sección (LLM/Conectores) disparó el alta —
 *     ver MaestroConDetalleCredencialExterna.tsx. El selector de proveedor solo
 *     ofrece los conocidos de esa categoría (+ "Otro" solo para conectores: un
 *     proveedor de LLM sin soporte en el backend no serviría de nada).
 *   - Llama a postCredencialExterna internamente y emite:
 *       "credencial_externa_creada"  con el ID devuelto por la API (éxito)
 *       "alta_cancelada"             sin payload                    (cancelar)
 */
export const CrearCredencialExterna = ({
    categoriaFiltro,
    publicar,
}: {
    categoriaFiltro: CategoriaCredencialExterna;
    publicar: EmitirEvento;
}) => {
    const { empresaFija } = getConfiguracionCredenciales();
    // Referencia estable (ver useModelo); con empresa fija ya viene rellena.
    const inicial = useMemo(() => {
        const base = categoriaFiltro === "llm" ? nuevaCredencialExternaVaciaLlm : nuevaCredencialExternaVaciaConector;
        return empresaFija ? { ...base, empresaId: empresaFija } : base;
    }, [categoriaFiltro, empresaFija]);
    const { modelo: credencial, uiProps, valido, set } = useModelo(metaNuevaCredencialExterna, inicial);

    const opcionesProveedor = opcionesProveedorPorCategoria(categoriaFiltro);

    const [secreto, setSecreto] = useState<SecretoCredencialExterna>({});

    const tipoAuthProps = uiProps("tipoAuth");
    const proveedorProps = uiProps("proveedor");
    const empresaIdProps = uiProps("empresaId");
    const personalProps = uiProps("personal");

    const esOtroProveedor = !buscarProveedorConocido(credencial.proveedor);

    const crear_ = useCallback(
        async () => {
            const id = await postCredencialExterna(credencial, secreto);
            publicar("credencial_externa_creada", id);
        },
        [credencial, secreto, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearCredencialExterna"
            titulo={categoriaFiltro === "llm" ? "Nuevo modelo de IA" : "Nuevo conector"}
            onCerrar={cancelar}
        >
            <div className="CrearCredencialExterna">
                <quimera-formulario>
                    <QInput label="Nombre" {...uiProps("nombre")} ref={focus} />
                    <QSelect
                        label="Proveedor"
                        nombre="proveedor_conocido"
                        valor={esOtroProveedor ? OTRO_PROVEEDOR : credencial.proveedor}
                        opciones={opcionesProveedor}
                        onChange={(opcion) => {
                            const proveedorConocido = buscarProveedorConocido(opcion?.valor ?? "");
                            set({
                                ...credencial,
                                proveedor: proveedorConocido?.valor ?? "",
                                tipoAuth: proveedorConocido?.tipoAuth ?? "api_key",
                                categoria: proveedorConocido?.categoria ?? "conector",
                            });
                            setSecreto({});
                        }}
                    />
                    {esOtroProveedor && (
                        <QInput label="Nombre del proveedor" {...proveedorProps} />
                    )}
                    {!empresaFija && (
                        <Empresa
                            valor={empresaIdProps.valor}
                            onChange={(opcion) => empresaIdProps.onChange?.(opcion?.valor ?? "")}
                        />
                    )}
                    {categoriaFiltro === "conector" && (
                        <QSelect
                            label="Ámbito"
                            nombre="ambito"
                            valor={credencial.personal ? "personal" : "empresa"}
                            opciones={[
                                { valor: "empresa", descripcion: "Toda la empresa" },
                                { valor: "personal", descripcion: "Solo para mí" },
                            ]}
                            onChange={(opcion) => personalProps.onChange?.(opcion?.valor === "personal")}
                        />
                    )}
                    {esOtroProveedor && (
                        <QSelect
                            label="Tipo de autenticación"
                            {...tipoAuthProps}
                            opciones={OPCIONES_TIPO_AUTH}
                            onChange={(opcion) => {
                                tipoAuthProps.onChange?.(opcion?.valor ?? "api_key");
                                setSecreto({});
                            }}
                        />
                    )}
                    <CamposSecreto
                        proveedor={credencial.proveedor}
                        tipoAuth={credencial.tipoAuth as TipoAuthCredencialExterna}
                        valor={secreto}
                        onChange={setSecreto}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton
                        onClick={crear}
                        deshabilitado={
                            !valido ||
                            !secretoCompleto(credencial.proveedor, credencial.tipoAuth as TipoAuthCredencialExterna, secreto)
                        }
                    >
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
