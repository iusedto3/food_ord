import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import StoreContextProvider from './contexts/StoreContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>  
  <StoreContextProvider>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StoreContextProvider>
    </BrowserRouter>
  
)
