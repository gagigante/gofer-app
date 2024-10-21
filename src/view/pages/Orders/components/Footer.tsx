import { Link } from 'react-router-dom'

import { Pagination } from '@/view/components/Pagination'
import { Button } from '@/view/components/ui/button'

interface FooterProps {
  page: number
  total: number
  onChange: (page: number) => void
}

export function Footer({ page, total, onChange }: FooterProps) {
  return (
    <footer className="flex justify-end px-3 py-4 border-t border-border">
       <Pagination currentPage={page} total={total} onChangePage={onChange} />

      <Button asChild>
        <Link to="new">Adicionar novo pedido</Link>
      </Button>
    </footer>
  )
}