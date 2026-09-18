import {Routes, Route} from 'react-router'
import {LoginPage} from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RegisterPage} from "./pages/RegisterPage"
import { ProtectedRoute } from './components/ProtectedRoute'
import { ProductsPage } from './pages/ProductsPage'
import { StockMovementsPage } from './pages/StockMovementsPage'
import { SalesPage } from './pages/SalesPages'
import { RoleProtectedRoute } from './components/RoleProtectedRoute'
import { UsersPage } from './pages/UsersPage'
import { ReportsPage } from './pages/ReportsPage'
import { AlertsPage } from './pages/AlertsPage'

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Routes>
        <Route path='/login' element={<LoginPage/>} />
        <Route path='register' element={<RegisterPage/>}></Route>
        <Route path='/' element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}></Route>
        <Route path='/products' element={ <ProtectedRoute><ProductsPage /></ProtectedRoute>}/>
        <Route path='/stock-movements' element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['owner', 'warehouse_staff']}><StockMovementsPage /></RoleProtectedRoute></ProtectedRoute>}/>
        <Route path='/sales' element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['owner', 'cashier']}><SalesPage /></RoleProtectedRoute></ProtectedRoute>} />
        <Route path='/users' element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['owner']}><UsersPage /></RoleProtectedRoute></ProtectedRoute>} />
         <Route path='/reports' element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['owner']}><ReportsPage /></RoleProtectedRoute></ProtectedRoute>} />
        <Route path='/alerts' element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['owner', 'warehouse_staff']}><AlertsPage /></RoleProtectedRoute></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App