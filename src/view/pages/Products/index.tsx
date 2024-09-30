import React, { useState } from 'react'
import { type Category } from '@prisma/client'

import { Tabs, TabsList, TabsTrigger } from '@/view/components/ui/tabs'
import { Input } from '@/view/components/ui/input'
import { CategoriesTab } from './components/CategoriesTab'
import { ProductsTab } from './components/ProductsTab'
import { Footer } from './components/Footer'
import { CreateCategoryAction } from './components/CreateCategoryAction'

import { useAuth } from '@/view/hooks/useAuth'
import { useCategories } from '@/view/hooks/queries/categories'
import { useProducts } from '@/view/hooks/queries/products'

export type CategoryWithProductsQuantity = Category & { productsQuantity: number }

export function Products() {
  const { user } = useAuth()

  const [categoriesPagination, setCategoriesPagination] = useState(1)
  const [productsPagination, setProductsPagination] = useState(1)

  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('products')
  const [nameFilter, setNameFilter] = useState('')

  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false)

  const { data: categoriesResponse } = useCategories(
    { loggedUserId: user?.id ?? '', name: nameFilter, page: categoriesPagination },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const categories = categoriesResponse?.categories ?? []

  const { data: productsResponse } = useProducts(
    {
      loggedUserId: user?.id ?? '',
      name: nameFilter,
      page: productsPagination,
    },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const products = productsResponse?.products ?? []

  const nameFilterPlaceholder = activeTab === 'products' ? 'Buscar por nome de produto' : 'Buscar por nome da categoria'
  const page = activeTab === 'products' ? productsPagination : categoriesPagination
  const total = (activeTab === 'products' ? productsResponse?.total ?? 0 : categoriesResponse?.total) ?? 0

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Gerenciar produtos</h2>

        <Tabs
          defaultValue="products"
          onValueChange={(tab) => {
            setActiveTab(tab as 'categories' | 'products')
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <Input
            className="mb-4"
            placeholder={nameFilterPlaceholder}
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value)
              setCategoriesPagination(1)
              setProductsPagination(1)
            }}
          />

          <ProductsTab products={products} />

          <CategoriesTab
            categories={categories}
            onDelete={() => {
              setCategoriesPagination(1)
            }}
          />
        </Tabs>
      </div>

      <Footer
        page={page}
        total={total}
        onChange={(page) => {
          if (activeTab === 'products') {
            setProductsPagination(page)
            return
          }

          setCategoriesPagination(page)
        }}
        onRequestCreateCategory={() => {
          setIsCreateCategoryDialogOpen(true)
        }}
      />

      <CreateCategoryAction
        isOpen={isCreateCategoryDialogOpen}
        onClose={() => {
          setIsCreateCategoryDialogOpen(false)
        }}
      />
    </div>
  )
}
