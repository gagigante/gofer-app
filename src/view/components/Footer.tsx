import { type ReactNode } from 'react'

import { Pagination } from '@/view/components/Pagination'

interface FooterProps {
  children?: ReactNode
  page: number
  total: number
  onChange: (page: number) => void
}

export const Footer = ({ children, page, total, onChange }: FooterProps) => {
  return (
    <footer className="flex px-3 py-4 border-t border-border">
      <Pagination currentPage={page} total={total} onChangePage={onChange} />

      {children}
    </footer>
  )
}
