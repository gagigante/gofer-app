import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Tabs, TabsList, TabsTrigger } from '@/view/components/ui/tabs'
import { Button } from '@/view/components/ui/button'
import { Footer } from '@/view/components/Footer'
import { BrandsTab } from './components/BrandsTab'
import { CategoriesTab } from './components/CategoriesTab'
import { ProductsTab } from './components/ProductsTab'

import { useAuth } from '@/view/hooks/useAuth'
import { useCategories } from '@/view/hooks/queries/categories'
import { useProducts } from '@/view/hooks/queries/products'
import { useBrands } from '@/view/hooks/queries/brands'

import { type Brand, type Category } from '@/api/db/schema'

export type CategoryWithProductsQuantity = Category & { products: number }
export type BrandWithProductsQuantity = Brand & { products: number }

export function Products() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [brandsPagination, setBrandsPagination] = useState(1)
  const [categoriesPagination, setCategoriesPagination] = useState(1)
  const [productsPagination, setProductsPagination] = useState(1)

  const activeTab = (searchParams.get('tab') as 'categories' | 'products' | 'brands') || 'products'

  const [brandsNameFilter, setBrandsNameFilter] = useState('')
  const { data: brandsResponse, isFetching: isFetchingBrands } = useBrands(
    { loggedUserId: user?.id ?? '', name: brandsNameFilter, page: brandsPagination },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const brands = brandsResponse?.brands ?? []

  const [categoriesNameFilter, setCategoriesNameFilter] = useState('')
  const { data: categoriesResponse, isFetching: isFetchingCategories } = useCategories(
    { loggedUserId: user?.id ?? '', name: categoriesNameFilter, page: categoriesPagination },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const categories = categoriesResponse?.categories ?? []

  const [productsNameFilter, setProductsNameFilter] = useState('')
  const { data: productsResponse } = useProducts(
    {
      loggedUserId: user?.id ?? '',
      filterOptions: {
        name: productsNameFilter,
      },
      page: productsPagination,
    },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const products = productsResponse?.products ?? []

  function updatePagination(page: number) {
    const states = {
      products: setProductsPagination,
      categories: setCategoriesPagination,
      brands: setBrandsPagination,
    }

    states[activeTab](page)
  }

  const page = (() => {
    const TABS_PAGE = {
      products: productsPagination,
      categories: categoriesPagination,
      brands: brandsPagination,
    }

    return TABS_PAGE[activeTab]
  })()

  const total = (() => {
    const TABS_TOTAL = {
      products: productsResponse?.total ?? 0,
      categories: categoriesResponse?.total ?? 0,
      brands: brandsResponse?.total ?? 0,
    }

    return TABS_TOTAL[activeTab]
  })()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Gerenciar produtos</h2>

        <Tabs
          value={activeTab}
          onValueChange={(tab) => {
            setSearchParams((prev) => {
              prev.set('tab', tab)

              return prev
            })
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="brands">Marcas</TabsTrigger>
          </TabsList>

          <ProductsTab
            products={products}
            onChangeFilter={(filter) => {
              setProductsNameFilter(filter)
              setProductsPagination(1)
            }}
          />

          <CategoriesTab
            categories={categories}
            isFetching={isFetchingCategories}
            onChangeFilter={(filter) => {
              setCategoriesNameFilter(filter)
              setCategoriesPagination(1)
            }}
            onDelete={() => {
              setCategoriesPagination(1)
            }}
          />

          <BrandsTab
            brands={brands}
            isFetching={isFetchingBrands}
            onChangeFilter={(filter) => {
              setBrandsNameFilter(filter)
              setBrandsPagination(1)
            }}
            onDelete={() => {
              setBrandsPagination(1)
            }}
          />
        </Tabs>
      </div>

      <Footer page={page} total={total} onChange={updatePagination}>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="new">Adicionar produto</Link>
          </Button>
        </div>
      </Footer>
    </div>
  )
}
