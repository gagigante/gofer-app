import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/view/components/ui/button'

import { useAuth } from '@/view/hooks/useAuth'

import { type OrdersApi, apiName } from '@/api/exposes/orders-api'

interface FooterProps {
  orderId: string
}

export function Footer({ orderId }: FooterProps) {
  const navigate = useNavigate()

  const { user } = useAuth()

  const [isLoadingFile, setIsLoadingFile] = useState(false)

  async function handleSaveOrderFile(orderId: string) {
    if (!user) return

    setIsLoadingFile(true)

    const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.downloadFile({
      loggedUserId: user.id,
      orderId,
    })

    if (err) {
      toast('Houve um erro ao tentar gerar o arquivo. Tente novamente.')

      setIsLoadingFile(false)
      return
    }

    if (data?.is_canceled) {
      setIsLoadingFile(false)
      return
    }

    toast('Arquivo salvo com sucesso.')

    setIsLoadingFile(false)
  }

  return (
    <footer className="flex px-3 py-4 border-t border-border">
      <div className="flex gap-2 ml-auto">
        <Button
          variant="default"
          className="ml-auto"
          onClick={() => handleSaveOrderFile(orderId)}
          disabled={isLoadingFile}
        >
          {isLoadingFile && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Salvar arquivo do pedido
        </Button>

        <Button variant="outline" className="ml-auto" onClick={() => navigate(-1)} disabled={isLoadingFile}>
          Voltar
        </Button>
      </div>
    </footer>
  )
}
