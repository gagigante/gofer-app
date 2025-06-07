# Gofer App 

Gofer App é uma aplicação desktop desenvolvida com Electron que oferece um dashboard completo para análise de performance de negócios, com foco em métricas de vendas, produtos e clientes.

## 🚀 Tecnologias

- **Frontend:**
  - React 18
  - TypeScript
  - TailwindCSS
  - Radix UI (Componentes de interface)
  - React Query (Gerenciamento de estado e cache)
  - React Router (Navegação)
  - Recharts (Visualização de dados)
  - React Hook Form (Formulários)
  - Zod (Validação de dados)

- **Backend:**
  - Electron
  - Drizzle ORM
  - SQLite (via libSQL)
  - bcryptjs (Autenticação)

- **Desenvolvimento:**
  - Vite
  - Webpack
  - Vitest (Testes)
  - ESLint + Prettier
  - TypeScript

## ✨ Principais Funcionalidades

### Dashboard de Performance
- Visualização de métricas-chave (KPIs)
- Gráficos interativos de vendas e performance
- Análise de produtos mais vendidos
- Distribuição de vendas por categoria
- Análise de margem de lucro

### Análise de Produtos
- Performance por produto
- Análise de receita e lucro
- Distribuição de margens
- Alertas de estoque baixo

### Métricas de Clientes
- Distribuição geográfica
- Frequência de compras
- Valor do cliente
- Análise de retenção

### Recursos Interativos
- Filtros por período
- Seleção de categorias
- Exportação de dados (CSV, PDF)
- Design responsivo
- Drill-down em visualizações

## 🛠️ Instalação

1. Clone o repositório
```bash
git clone [url-do-repositorio]
```

2. Instale as dependências
```bash
pnpm install
```

3. Execute as migrações do banco de dados
```bash
pnpm db:migrate
```

4. Inicie a aplicação em modo de desenvolvimento
```bash
pnpm start
```

## 📦 Scripts Disponíveis

- `pnpm start` - Inicia a aplicação em modo de desenvolvimento
- `pnpm package` - Empacota a aplicação
- `pnpm make` - Cria instaladores para diferentes plataformas
- `pnpm test` - Executa os testes
- `pnpm db:generate` - Gera migrações do banco de dados
- `pnpm db:migrate` - Executa migrações do banco de dados
- `pnpm db:studio` - Abre o Drizzle Studio para gerenciamento do banco de dados

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

- **Gabriel Gigante** - [gabrielgigante29@gmail.com](mailto:gabrielgigante29@gmail.com)
