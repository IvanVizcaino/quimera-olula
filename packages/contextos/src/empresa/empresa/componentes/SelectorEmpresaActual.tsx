import { useEffect, useState } from "react";
import { AUTH_STORAGE_CHANGED_EVENT } from "@olula/lib/api/auth_storage_events.ts";
import { empresaActual, setEmpresaActual } from "../../../valores/empresaActual.ts";
import { whoAmI, whoAmIStorage } from "../../../auth/login/infraestructura.ts";
import "./SelectorEmpresaActual.css";

type ItemEmpresa = { id: string; nombre: string };

const empresasDeStorage = (): ItemEmpresa[] => {
    const raw = whoAmIStorage.obtener();
    if (!raw) return [];
    try {
        const whoAmI = JSON.parse(raw);
        return whoAmI.empresas ?? [];
    } catch {
        return [];
    }
};

export const SelectorEmpresaActual = () => {
    const [empresas, setEmpresas] = useState<ItemEmpresa[]>(empresasDeStorage);
    const [actual, setActual] = useState(empresaActual());

    useEffect(() => {
        const onAuthChanged = () => {
            setEmpresas(empresasDeStorage());
            setActual(empresaActual());
        };
        window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, onAuthChanged);

        whoAmI().then((datos) => whoAmIStorage.actualizar(datos)).catch(() => {});

        return () => window.removeEventListener(AUTH_STORAGE_CHANGED_EVENT, onAuthChanged);
    }, []);

    if (empresas.length <= 1) return null;

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setEmpresaActual(id);
        setActual(id);
        window.dispatchEvent(new CustomEvent("empresa_actual_cambiada", { detail: id }));
    };

    return (
        <select className="selector-empresa-actual" value={actual} onChange={onChange} aria-label="Empresa activa">
            {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                </option>
            ))}
        </select>
    );
};
