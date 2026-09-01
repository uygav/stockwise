import {Routes, Route} from 'react-router'
import {LoginPage} from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RegisterPage} from "./pages/RegisterPage"
import { ProtectedRoute } from './components/ProtectedRoute'
import { ProductsPage } from './pages/ProductsPage'
import { StockMovementsPage } from './pages/StockMovementsPage'
import { SalesPage } from './pages/SalesPages'

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Routes>
        <Route path='/login' element={<LoginPage/>} />
        <Route path='register' element={<RegisterPage/>}></Route>
        <Route path='/' element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}></Route>
        <Route path='/products' element={ <ProtectedRoute><ProductsPage /></ProtectedRoute>}/>
        <Route path='/stock-movements' element={<ProtectedRoute><StockMovementsPage /></ProtectedRoute>}/>
        <Route path='/sales' element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App