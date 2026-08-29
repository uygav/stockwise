import {Routes, Route} from 'react-router'
import {LoginPage} from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RegisterPage} from "./pages/RegisterPage"
import { ProtectedRoute } from './components/ProtectedRoute'
import { ProductsPage } from './pages/ProductsPage'

function App() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Routes>
        <Route path='/login' element={<LoginPage/>} />
        <Route path='register' element={<RegisterPage/>}></Route>
        <Route path='/' element={
          <ProtectedRoute>
            <DashboardPage/>
          </ProtectedRoute>
        }></Route>
        <Route path='/products' 
        element={
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>}/>

      </Routes>
    </div>
  )
}

export default App