import { formatearFechaHora, formatearMoneda } from "@olula/lib/dominio.js";
import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router";
import { CuadreBancario, CuadreCuenta } from "../diseño.js";
import { urlConciliacionCuentaBancaria } from "../dominio.js";
import { getCuadreBancario } from "../infraestructura.js";
import { PartidasSinConciliar } from "./PartidasSinConciliar.js";

/**
 * Panel de cuadre bancario-contable: muestra el saldo banco vs. saldo contable
 * y las alertas de discrepancia de la cuenta bancaria indicada. Sin cuenta
 * (listado de todas las cuentas) no se muestra.
 *
 * Se recarga en el montaje y cada vez que `version` cambia (p.ej. tras sync o
 * conciliación automática). Cada badge es un enlace al maestro con el filtro
 * correspondiente preseleccionado.
 */
export const PanelCuadreBancario = ({
    cuentaBancoId,
    version = 0,
}: {
    cuentaBancoId: string | null;
    version?: number;
}) => {

    const [cuadre, setCuadre] = useState<CuadreBancario | null>(null);

    useEffect(() => {
        if (!cuentaBancoId) return;
        getCuadreBancario().then(setCuadre).catch(console.error);
    }, [cuentaBancoId, version]);

    const cuenta = cuentaBancoId
        ? cuadre?.cuentas.find((c) => c.cuentaBancoId === cuentaBancoId)
        : undefined;
    if (!cuenta) return null;

    return (
        <div className="CuadreBancario">
            <FilaCuadreCuenta cuenta={cuenta} />
        </div>
    );
};

/**
 * Construye la URL al maestro de conciliación de una cuenta bancaria con filtros
 * de cuadre preseleccionados. Incluye `_label` para que el maestro sepa que son
 * filtros de cuadre (no del usuario) y los trate por separado.
 *
 * Los filtros usan el formato que entiende `getUrlParams`:
 *   - operador `=` o `in` → `campo=operador__valor`
 *   - operador `~` (defecto) → `campo=valor`
 */
const urlMovimientosCuenta = (cuentaBancoId: string, filtros: Record<string, string>, label: string): string => {
    const params = new URLSearchParams({ ...filtros, _label: label });
    return `${urlConciliacionCuentaBancaria(cuentaBancoId)}?${params}`;
};

/** Badge de alerta: enlace si hay cuenta bancaria enlazada, botón si abre algo
 * en la propia pantalla y span estático si no. */
const Alerta = ({
    variante,
    children,
    href,
    onClick,
}: {
    variante: string;
    children: ReactNode;
    href?: string;
    onClick?: () => void;
}) => {
    const className = `alerta alerta--${variante}`;
    if (href) {
        return <Link className={className} to={href}>{children}</Link>;
    }
    if (onClick) {
        return <button type="button" className={className} onClick={onClick}>{children}</button>;
    }
    return <span className={className}>{children}</span>;
};

const FilaCuadreCuenta = ({ cuenta }: { cuenta: CuadreCuenta }) => {
    const { diferencia, cuentaBancoId } = cuenta;
    const hayAlertas = cuenta.totalAlertas > 0;
    const hayDiferencia = diferencia !== null && diferencia !== 0;
    const [verPartidas, setVerPartidas] = useState(false);

    // Construye la URL al maestro con filtros; null si la cuenta no tiene codcuenta ERP.
    const url = cuentaBancoId
        ? (filtros: Record<string, string>, label: string) => urlMovimientosCuenta(cuentaBancoId, filtros, label)
        : null;

    return (
        <div className={`CuadreCuenta ${hayAlertas || hayDiferencia ? "CuadreCuenta--alertas" : ""}`}>
            <div className="CuadreCuenta-cabecera">
                <span className="CuadreCuenta-nombre">
                    {cuenta.institucion ? `${cuenta.institucion} — ` : ""}{cuenta.nombreCuenta}
                </span>
                <span className="CuadreCuenta-sincronizacion">
                    Última sincronización:{" "}
                    <strong>
                        {cuenta.ultimaSincronizacion
                            ? formatearFechaHora(cuenta.ultimaSincronizacion)
                            : "nunca"}
                    </strong>
                </span>
                <span className="CuadreCuenta-saldos">
                    {cuenta.saldoBanco !== null && (
                        <span>
                            Banco: <strong>{formatearMoneda(cuenta.saldoBanco, "EUR")}</strong>
                        </span>
                    )}
                    {cuenta.saldoContable !== null && (
                        <span>
                            Contable: <strong>{formatearMoneda(cuenta.saldoContable, "EUR")}</strong>
                        </span>
                    )}
                    {diferencia !== null && (
                        <span className={Math.abs(diferencia) > 0.01 ? "CuadreCuenta-diferencia--error" : ""}>
                            Diferencia: <strong>{formatearMoneda(diferencia, "EUR")}</strong>
                        </span>
                    )}
                </span>
            </div>

            {hayAlertas && (
                <div className="CuadreCuenta-alertas">
                    {cuenta.bancarioSinConciliar > 0 && (
                        <Alerta
                            variante="pendiente"
                            href={url?.({ estado: "in__pendiente,candidatos" }, "sin conciliar")}
                        >
                            {cuenta.bancarioSinConciliar} sin conciliar
                            {" "}({formatearMoneda(cuenta.importeSinConciliar, "EUR")})
                        </Alerta>
                    )}
                    {cuenta.bancarioIgnorado > 0 && (
                        <Alerta
                            variante="ignorado"
                            href={url?.({ estado: "in__ignorado" }, "ignorados")}
                        >
                            {cuenta.bancarioIgnorado} ignorado{cuenta.bancarioIgnorado > 1 ? "s" : ""}
                            {" "}({formatearMoneda(cuenta.importeIgnorado, "EUR")})
                        </Alerta>
                    )}
                    {cuenta.requiereRevision > 0 && (
                        <Alerta
                            variante="revision"
                            href={url?.({ requiere_revision: "=__true" }, "requieren revisión")}
                        >
                            {cuenta.requiereRevision} requiere{cuenta.requiereRevision > 1 ? "n" : ""} revisión
                        </Alerta>
                    )}
                    {cuenta.bancoEliminoConciliado > 0 && (
                        <Alerta
                            variante="eliminado"
                            href={url?.({ eliminado_en_banco: "=__true", estado: "in__conciliado" }, "eliminados por el banco")}
                        >
                            {cuenta.bancoEliminoConciliado} eliminado{cuenta.bancoEliminoConciliado > 1 ? "s" : ""} por el banco
                        </Alerta>
                    )}
                    {cuenta.asientoDescuadrado > 0 && (
                        <Alerta
                            variante="error"
                            href={url?.({ asiento_descuadrado: "=__true" }, "asientos descuadrados")}
                        >
                            {cuenta.asientoDescuadrado} asiento{cuenta.asientoDescuadrado > 1 ? "s" : ""} descuadrado{cuenta.asientoDescuadrado > 1 ? "s" : ""}
                        </Alerta>
                    )}
                    {cuenta.partidaHuerfana > 0 && (
                        <Alerta variante="error" onClick={() => setVerPartidas(true)}>
                            {cuenta.partidaHuerfana} partida{cuenta.partidaHuerfana > 1 ? "s" : ""} contable{cuenta.partidaHuerfana > 1 ? "s" : ""} sin conciliar
                        </Alerta>
                    )}
                </div>
            )}

            {verPartidas && (
                <PartidasSinConciliar cuentaId={cuenta.cuentaId} onCerrar={() => setVerPartidas(false)} />
            )}
        </div>
    );
};
