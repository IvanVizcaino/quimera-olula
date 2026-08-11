export const imprimir_blob = (blob: Blob): Promise<void> => {
    return new Promise((resolve) => {
        const blobURL = URL.createObjectURL(blob);

        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);

        iframe.style.display = 'none';
        iframe.src = blobURL;
        iframe.onload = function () {
            setTimeout(function () {
                iframe.focus();
                window.addEventListener('focus', () => {
                    resolve();
                }, { once: true });
                iframe.contentWindow?.print();
            }, 1);
        };
    });
}

export const imprimir_pagina_blanca = () => {
    imprimir_blob(new Blob(['<!DOCTYPE html><html><body></body></html>'], { type: "text/html" }));
};

export function abrirCajon() {
    // 1. Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    // 2. Insertar un HTML vacío con estilos que eliminen márgenes
    iframe.srcdoc = `<html><head><style>@page { margin: 0; size: auto; } body { margin: 0; padding: 0; height: 1px; overflow: hidden; }</style></head><body></body></html>`;

    // 3. Lanzar la impresión directa (Chrome Kiosk lo gestionará en segundo plano)
    iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // 4. Eliminar el iframe del DOM tras la impresión
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };

    document.body.appendChild(iframe);
}
