import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/view/components/ui/table'
import { Button } from "@/view/components/ui/button";
import { AddOrderProductDialog } from "./components/AddOrderProductDialog";

import { useToast } from "@/view/components/ui/use-toast";
import { useAuth } from "@/view/hooks/useAuth";
import { useMutateOnCreateOrder } from "@/view/hooks/mutations/orders";

import { formatCurrency } from "@/view/utils/formatters";
import { parseCentsToDecimal } from "@/view/utils/parsers";

interface OrderProduct {
  id: string
  name: string
  unityPrice: number
  quantity: number
  totalPrice: number
}

export function CreateOrder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { mutateAsync } = useMutateOnCreateOrder()

  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([])
  const [isAddOrderProductDialogOpen, setIsAddOrderProductDialogOpen] = useState(false)

  async function handleSubmit() {
    mutateAsync({
      loggedUserId: user?.id ?? '',
      products: orderProducts.map(({ id, quantity }) => ({ id, quantity })),
    }, {
      onError: () => {
        toast({
          title: 'Algo deu errado ao tentar criar o pedido. Tente novamente.',
          duration: 3000,
        })
      },
      onSuccess: () => {
        toast({
          title: 'Pedido criado com sucesso.',
          duration: 3000,
        })

        navigate('..', { relative: 'path' })
      },
    })
  }

  const orderTotal = (() => {
    return orderProducts.reduce((acc, item) => {
      return acc + item.totalPrice
    }, 0)
  })()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Criar novo pedido</h2>

        <div className="flex justify-end my-4">
          <Button onClick={() => setIsAddOrderProductDialogOpen(true)}>Adicionar produto</Button>
        </div>

        <Table>
          {orderProducts.length === 0 && <TableCaption>Nenhum produto adicionado no pedido.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>              
              <TableHead>Preço unitário</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Preço total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orderProducts.map(({ id, name, unityPrice, quantity, totalPrice }) => (
              <TableRow key={id}>
                <TableCell>
                  <p className="font-medium">{name}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(unityPrice))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{quantity}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(totalPrice))}</p>
                </TableCell>

                <TableCell className="flex items-end justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setOrderProducts(prevState => prevState.filter(item => item.id !== id))
                    }}
                  >
                    <FaTrash className="w-3 h-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}           
          </TableBody>
        </Table>
      </div>

      <footer className="flex items-center px-3 py-4 border-t border-border">
        <p><strong>Total a pagar:</strong>{formatCurrency(parseCentsToDecimal(orderTotal))}</p>

        <div className="flex gap-2 ml-auto">
          <Button onClick={handleSubmit} disabled={orderProducts.length === 0}>Criar pedido</Button>

          <Button variant="outline" asChild>
            <Link to=".." relative="path">
              Cancelar
            </Link>
          </Button>
        </div>
      </footer>

      <AddOrderProductDialog 
        isOpen={isAddOrderProductDialogOpen} 
        onClose={() => setIsAddOrderProductDialogOpen(false)} 
        onSubmit={({ id, name, price }, quantity) => setOrderProducts(prevState => {
          if (prevState.length === 0) {
            return [
              {
                id,
                name: name ?? '',
                unityPrice: price ?? 0,
                quantity,
                totalPrice: (price ?? 0) * quantity,
              },
              ...prevState,
            ]
          }

          const alreadyInOrder = prevState.find(item => item.id === id)

          if (!alreadyInOrder) {
            return [
              {
                id,
                name: name ?? '',
                unityPrice: price ?? 0,
                quantity,
                totalPrice: (price ?? 0) * quantity,
              },
              ...prevState,
            ]
          }

          return prevState.map(item => {
            if (item.id === id) {
              return { ...item, quantity: item.quantity + quantity }
            }

            return item
          })        
        })}       
      />
    </div>
  )
}