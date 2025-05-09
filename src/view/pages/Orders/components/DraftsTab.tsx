import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { TabsContent } from '@/view/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/view/components/ui/tooltip'
import { Button } from '@/view/components/ui/button'
import { DeleteDraftOrderAction } from './DeleteDraftOrderAction'

import { useToast } from '@/view/components/ui/use-toast'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { ORDERS_DRAFT_KEY } from '@/view/constants/LOCALSTORAGE_KEYS'
import { type Draft } from '../../CreateOrder'

export function DraftsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    return JSON.parse(localStorage.getItem('@gofer-app/order-draft') ?? '[]').reverse() as Draft[]
  })
  const [isDeleteDraftDialogOpen, setIsDeleteDraftDialogOpen] = useState(false)
  const [selectedDraftId, setSelectedDraftId] = useState<number>()

  function handleDeleteDraftOrder() {
    if (!selectedDraftId) return

    const newDrafts = drafts.filter((item) => item.id !== selectedDraftId)
    setDrafts(newDrafts)

    localStorage.setItem(ORDERS_DRAFT_KEY, JSON.stringify(newDrafts))

    toast({
      title: 'Rascunho removido com sucesso.',
      duration: 3000,
    })

    setIsDeleteDraftDialogOpen(false)
    setSelectedDraftId(undefined)
  }

  function handleRequestDraftEdition(draft: Draft) {
    navigate('new', { state: { selectedDraft: draft } })
  }

  return (
    <TabsContent className="mt-[4.5rem]" value="drafts">
      <>
        <Table>
          {drafts.length === 0 && <TableCaption>Nenhum rascunho salvo.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="min-w-[138px]">Preço do pedido</TableHead>
              <TableHead className="min-w-[138px]">Qtd. de produtos</TableHead>
              <TableHead className="min-w-[160px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {drafts.map(({ id, customer, orderTotal, products }) => (
              <TableRow key={id}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-medium line-clamp-1">{customer?.name ?? 'N/A'}</p>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>{customer?.name ?? 'N/A'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(orderTotal ?? 0))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{products.length}</p>
                </TableCell>

                <TableCell className="text-right space-x-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const draft = drafts.find((item) => item.id === id)

                          if (draft) {
                            handleRequestDraftEdition(draft)
                          }
                        }}
                      >
                        <FaPencilAlt className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>Criar pedido a partir do rascunho ou editar rascunho</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const draft = drafts.find((item) => item.id === id)

                          if (draft) {
                            setSelectedDraftId(draft.id)
                            setIsDeleteDraftDialogOpen(true)
                          }
                        }}
                      >
                        <FaTrash className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>Apagar rascunho</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DeleteDraftOrderAction
          onDelete={handleDeleteDraftOrder}
          isOpen={isDeleteDraftDialogOpen}
          onClose={() => setIsDeleteDraftDialogOpen(false)}
        />
      </>
    </TabsContent>
  )
}
