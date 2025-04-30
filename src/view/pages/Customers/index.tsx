import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Footer } from '@/view/components/Footer'
import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { DeleteCustomerAction } from './components/DeleteCustomerAction'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useCustomers } from '@/view/hooks/queries/customers'
import { useMutateOnDeleteCustomer } from '@/view/hooks/mutations/customers'

import { formatCNPJ, formatCPF, formatPhone, formatRG } from '@/view/utils/formatters'

import { type Customer } from '@/api/db/schema'

export function Customers() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [nameFilter, setNameFilter] = useState('')
  const [pagination, setPagination] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>()
  const [isDeleteCustomerDialogOpen, setIsDeleteCustomerDialogOpen] = useState(false)

  const { data } = useCustomers(
    { loggedUserId: user?.id ?? '', name: nameFilter, page: pagination },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const customers = data?.customers ?? []

  const { mutateAsync: mutateOnDelete } = useMutateOnDeleteCustomer()

  function handleRequestCustomerDeletion(customer: Customer) {
    setSelectedCustomer(customer)
    setIsDeleteCustomerDialogOpen(true)
  }

  function handleRequestCustomerDetails(customer: Customer) {
    navigate(customer.id)
  }

  function handleRequestCustomerUpdate(customer: Customer) {
    navigate('update', { state: { selectedCustomer: customer } })
  }

  async function handleDeleteCustomer(customerId: string) {
    if (!user) return

    setIsDeleteCustomerDialogOpen(false)
    setSelectedCustomer(undefined)

    await mutateOnDelete(
      { loggedUserId: user.id, customerId },
      {
        onSuccess: () => {
          toast({
            title: 'Cliente removido com sucesso.',
            duration: 3000,
          })
        },
        onError: () => {
          toast({
            title: 'Houve um erro ao apagar o cliente. Tente novamente.',
            duration: 3000,
          })
        },
      },
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Gerenciar clientes</h2>

        <Input
          className="mb-4"
          placeholder="Buscar por nome do cliente"
          value={nameFilter}
          onChange={(e) => {
            setNameFilter(e.target.value)
            setPagination(1)
          }}
        />

        <Table>
          {customers.length === 0 && <TableCaption>Nenhum cliente encontrado.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="min-w-[156px]">Telefone</TableHead>
              <TableHead className="min-w-[172px]">CNPJ</TableHead>
              <TableHead className="min-w-[140px]">CPF</TableHead>
              <TableHead className="min-w-[128px]">RG</TableHead>
              <TableHead className="min-w-[160px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map(({ id, name, phone, cnpj, cpf, rg }) => {
              return (
                <TableRow key={id}>
                  <TableCell>
                    <div className="flex">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="font-medium line-clamp-1">{name}</p>
                        </TooltipTrigger>

                        <TooltipContent>
                          <p>{name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex">
                      <p className="font-medium">{formatPhone(phone ?? '') || 'N/A'}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex">
                      <p className="font-medium">{formatCNPJ(cnpj ?? '') || 'N/A'}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex">
                      <p className="font-medium">{formatCPF(cpf ?? '') || 'N/A'}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex">
                      <p className="font-medium">{formatRG(rg ?? '') || 'N/A'}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right space-x-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const customer = customers.find((item) => item.id === id)

                            if (customer) {
                              handleRequestCustomerDetails(customer)
                            }
                          }}
                        >
                          <FaEye className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>Ver detalhes do cliente</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const customer = customers.find((item) => item.id === id)

                            if (customer) {
                              handleRequestCustomerUpdate(customer)
                            }
                          }}
                        >
                          <FaPencilAlt className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>Editar cliente</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const customer = customers.find((item) => item.id === id)

                            if (customer) {
                              handleRequestCustomerDeletion(customer)
                            }
                          }}
                        >
                          <FaTrash className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>Apagar cliente</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Footer page={pagination} total={data?.total ?? 0} onChange={setPagination}>
        <Button asChild>
          <Link to="new">Adicionar cliente</Link>
        </Button>
      </Footer>

      <DeleteCustomerAction
        isOpen={isDeleteCustomerDialogOpen}
        onClose={() => setIsDeleteCustomerDialogOpen(false)}
        onDelete={async () => {
          if (selectedCustomer) {
            await handleDeleteCustomer(selectedCustomer.id)
          }
        }}
      />
    </div>
  )
}
