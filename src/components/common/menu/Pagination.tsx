import React from 'react'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './Pagination.module.css'

import ChevronLeftIcon from '@/assets/Chevron Left.svg'
import ChevronRightIcon from '@/assets/Chevron Right.svg'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (pageIndex: number) => void
    className?: string
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}: PaginationProps) {
    const handlePrevious = () => {
        if (currentPage > 0) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            onPageChange(currentPage + 1)
        }
    }

    if (totalPages <= 1) {
        return null
    }

    return (
        <nav className={`${s.pagination} ${className}`} aria-label="Pagination">
            <ButtonGhost
                size="sm"
                mode="light"
                onClick={handlePrevious}
                disabled={currentPage === 0}
                aria-label="Previous Page"
                leftIcon={<img src={ChevronLeftIcon} alt="Previous" />}
                className={s.navButton}
            >
                Trước
            </ButtonGhost>

            <span className={s.pageInfo} aria-live="polite">
                Trang {currentPage + 1} / {totalPages}
            </span>

            <ButtonGhost
                size="sm"
                mode="light"
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
                aria-label="Next Page"
                rightIcon={<img src={ChevronRightIcon} alt="Next" />}
                className={s.navButton}
            >
                Sau
            </ButtonGhost>
        </nav>
    )
}
