import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"

type Sale = {
    id: number
    total_amount: string
    created_at: string
}

type Summary = {
    productCount: number
    salesCount: number
    totalRevenue: string
    recentSales: Sale[]
}

export function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null)
    const user = getCurrentUser()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchSummary() {
            const token = localStorage.getItem("token")

            const response = await fetch("http://localhost:4000/api/dashboard/summary", {
                headers: { Authorization: `Bearer ${token}` },
            })

             if (!response.ok) {
                localStorage.removeItem("token")
                navigate("/login")
                return
            }

            const data = await response.json()
            setSummary(data)
        }

        fetchSummary()
    }, [])

    if (!summary) {
        return (
            <div className="mx-auto w-full max-w-md p-8">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>

            <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="rounded border p-4">
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="text-2xl font-bold">{summary.productCount}</p>
                </div>
                <div className="rounded border p-4">
                    <p className="text-sm text-gray-500">Sales</p>
                    <p className="text-2xl font-bold">{summary.salesCount}</p>
                </div>
                <div className="col-span-2 rounded border p-4">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold">{summary.totalRevenue}</p>
                </div>
            </div>

            <div className="mb-8 flex gap-2">
                <Link to="/products"><Button type="button">Products</Button></Link>
                {(user?.role === "owner" || user?.role === "warehouse_staff") && (
                    <Link to="/stock-movements"><Button type="button">Stock Movements</Button></Link>
                )}
                {(user?.role === "owner" || user?.role === "cashier") && (
                    <Link to="/sales"><Button type="button">Sales</Button></Link>
                )}
                {user?.role === "owner" && (
                     <Link to="/users"><Button type="button">Add User</Button></Link>
                )}
                {user?.role === "owner" && (
                    <Link to="/reports"><Button type="button">Reports</Button></Link>
                )}
                {(user?.role === "owner" || user?.role === "warehouse_staff") && (
                    <Link to="/alerts"><Button type="button">Alerts</Button></Link>
                )}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/login")
                    }}
                >
                    Logout
                </Button>
                
            </div>

            <h2 className="mb-4 text-xl font-bold">Recent Sales</h2>
            <ul className="flex flex-col gap-2">
                {summary.recentSales.map((sale) => (
                    <li key={sale.id} className="rounded border p-3">
                        {sale.total_amount} — {new Date(sale.created_at).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    )
}