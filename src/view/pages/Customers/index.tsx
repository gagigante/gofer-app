export function Customers() {
  // const { user } = useAuth()

  // const [brandsPagination, setBrandsPagination] = useState(1)
  // const [categoriesPagination, setCategoriesPagination] = useState(1)
  // const [productsPagination, setProductsPagination] = useState(1)

  // const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'brands'>('products')

  // const [brandsNameFilter, setBrandsNameFilter] = useState('')
  // const { data: brandsResponse } = useBrands(
  //   { loggedUserId: user?.id ?? '', name: brandsNameFilter, page: categoriesPagination },
  //   {
  //     enabled: !!user,
  //     placeholderData: (previousData) => previousData,
  //   },
  // )
  // const brands = brandsResponse?.brands ?? []

  // const [categoriesNameFilter, setCategoriesNameFilter] = useState('')
  // const { data: categoriesResponse } = useCategories(
  //   { loggedUserId: user?.id ?? '', name: categoriesNameFilter, page: categoriesPagination },
  //   {
  //     enabled: !!user,
  //     placeholderData: (previousData) => previousData,
  //   },
  // )
  // const categories = categoriesResponse?.categories ?? []

  // const [productsNameFilter, setProductsNameFilter] = useState('')
  // const { data: productsResponse } = useProducts(
  //   {
  //     loggedUserId: user?.id ?? '',
  //     name: productsNameFilter,
  //     page: productsPagination,
  //   },
  //   {
  //     enabled: !!user,
  //     placeholderData: (previousData) => previousData,
  //   },
  // )
  // const products = productsResponse?.products ?? []

  // const page = (() => {
  //   const TABS_PAGE = {
  //     products: productsPagination,
  //     categories: categoriesPagination,
  //     brands: brandsPagination,
  //   }

  //   return TABS_PAGE[activeTab]
  // })()

  // const total = (() => {
  //   const TABS_TOTAL = {
  //     products: productsResponse?.total ?? 0,
  //     categories: categoriesResponse?.total ?? 0,
  //     brands: brandsResponse?.total ?? 0,
  //   }

  //   return TABS_TOTAL[activeTab]
  // })()

  return (
    <div className="h-full flex flex-col">
      {/* <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Gerenciar produtos</h2>

        <Tabs
          defaultValue="products"
          onValueChange={(tab) => {
            setActiveTab(tab as 'categories' | 'products')
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
            onChangeFilter={(filter) => {
              setBrandsNameFilter(filter)
              setBrandsPagination(1)
            }}
            onDelete={() => {
              setBrandsPagination(1)
            }}
          />
        </Tabs>
      </div> */}

      {/* <Footer
        page={page}
        total={total}
        onChange={(page) => {
          if (activeTab === 'products') {
            setProductsPagination(page)
            return
          }

          setCategoriesPagination(page)
        }}
      /> */}
    </div>
  )
}
