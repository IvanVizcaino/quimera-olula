import { useEffect, useState } from "react";

export function useEsMovil(breakpoint = 768): boolean {
    const [esMovil, setEsMovil] = useState(
        () => typeof window !== "undefined" && window.innerWidth <= breakpoint
    );

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        setEsMovil(mq.matches);
        const handler = (e: MediaQueryListEvent) => setEsMovil(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [breakpoint]);

    return esMovil;
}
