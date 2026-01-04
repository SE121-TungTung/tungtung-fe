import { createContext } from 'react'

export interface DialogOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'info' | 'danger' | 'confirm'
    renderConfirm?: () => React.ReactNode
}

export interface DialogContextType {
    alert: (message: string, title?: string) => Promise<void>
    confirm: (options: DialogOptions | string) => Promise<boolean>
}

export const DialogContext = createContext<DialogContextType | undefined>(
    undefined
)
