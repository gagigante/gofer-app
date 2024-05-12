import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '@/view/styles/global.css'

import { Button } from '@/view/components/ui/button'

const divElement = document.getElementById('root')
const root = createRoot(divElement)

root.render(
  <div>
    <h1>hello world</h1>
    <Button>Click me</Button>
  </div>
)
