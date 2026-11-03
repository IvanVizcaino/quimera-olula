import { useEffect, useRef } from "react"

export function useFocus(seleccionado = false) {
    const inputRef = useRef(null)

    useEffect(() => {
        if (inputRef.current) {
            const input = inputRef.current as unknown as HTMLInputElement
            input.focus()
            if (seleccionado) {
                input.select()
            }
        }
    }, [])

    return inputRef
}