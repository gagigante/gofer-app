import { Link } from 'react-router-dom'

import { Pagination } from '@/view/components/Pagination'
import { Button } from '@/view/components/ui/button'

interface FooterProps {
  page: number
  total: number
  onChange: (page: number) => void
}

export const Footer = ({ page, total, onChange }: FooterProps) => {
  return (
    <footer className="flex px-3 py-4 border-t border-border">
      <Pagination currentPage={page} total={total} onChangePage={onChange} />

      <div className="flex gap-2">
        <Button asChild>
          <Link to="new">Adicionar produto</Link>
        </Button>
      </div>
    </footer>
  )
}
