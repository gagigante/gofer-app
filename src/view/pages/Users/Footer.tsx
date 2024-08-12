import React from 'react'
import { Link } from 'react-router-dom'

import { Pagination } from '@/view/components/Pagination'
import { Button } from '@/view/components/ui/button'

import type { UserRole } from '@/api/types/user-role'

interface FooterProps {
  role?: UserRole
  page: number
  total: number
  onChange: (page: number) => void
}

export const Footer = ({ role, page, total, onChange }: FooterProps) => {
  return (
    <footer className="flex px-3 py-4 border-t border-border">
      <Pagination currentPage={page} total={total} onChangePage={onChange} />

      {role !== 'operator' && (
        <Button asChild>
          <Link to="new">Adicionar usuário</Link>
        </Button>
      )}
    </footer>
  )
}
