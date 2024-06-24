import React from 'react'

import {
  Pagination as ShadPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/view/components/ui/pagination'

import { ITEMS_PER_PAGE } from '../constants/ITEMS_PER_PAGE'

interface PaginationProps {
  currentPage: number
  total: number
  onChangePage: (page: number) => void
}

const PAGINATION_OFFSET = 5

export const Pagination = ({ currentPage, total, onChangePage }: PaginationProps) => {
  const numberOfPages = Math.ceil(total / ITEMS_PER_PAGE)

  const visiblePages = (() => {
    let start = 0
    let end = PAGINATION_OFFSET

    if (currentPage >= PAGINATION_OFFSET) {
      const offset = currentPage + 1 > numberOfPages ? numberOfPages : currentPage + 1

      start = offset - PAGINATION_OFFSET
      end = offset
    }

    return Array.from({ length: numberOfPages }, (_, i) => ++i).slice(start, end)
  })()

  const shouldDisplayPreviousEllipsis = visiblePages[0] > 1
  const shouldDisplayNextEllipsis = numberOfPages > PAGINATION_OFFSET && currentPage < numberOfPages - 1

  return (
    <ShadPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              if (currentPage === 1) return

              onChangePage(--currentPage)
            }}
          />
        </PaginationItem>

        {shouldDisplayPreviousEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => {
                onChangePage(page)
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {shouldDisplayNextEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => {
              if (currentPage === numberOfPages) return

              onChangePage(++currentPage)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadPagination>
  )
}
