import React from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'
import styles from './SelectField.module.css'
import FieldMessage from '@/components/common/typography/FieldMessage'
import IconCaretDown from '@/assets/Caret Down.svg'

type SelectOption = {
    label: string
    value: string | number
}

interface SelectFieldProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    registration?: Partial<UseFormRegisterReturn>
    error?: string
    options: SelectOption[]
}

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    registration,
    error,
    options,
    id,
    ...props
}) => {
    const inputId = id || registration?.name
    return (
        <div className={styles.formGroup}>
            <label htmlFor={inputId} className={styles.label}>
                {label}
            </label>
            <div className={styles.inputWrapper}>
                <select
                    id={inputId}
                    className={`${styles.input} ${styles.select}`}
                    {...registration}
                    {...props}
                    aria-invalid={!!error}
                >
                    <option value="">-- Chọn --</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className={styles.icon}>
                    <img src={IconCaretDown} alt="Mũi tên xuống" />
                </div>
            </div>
            {error && (
                <FieldMessage variant="chip" tone="error">
                    {error}
                </FieldMessage>
            )}
        </div>
    )
}
