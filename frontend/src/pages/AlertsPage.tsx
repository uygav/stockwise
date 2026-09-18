import { useState, useEffect } from "react"
import { Link } from "react-router"

type LowStockProduct = {
    id: number
    name: string
    min_stock_level: number
    current_stock: string
}

export function AlertsPage() {
    const [products, setProducts] = useState<LowStockProduct[]>([])
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchLowStock() {
            const token = localStorage.getItem("token")

            const response = await fetch("http://localhost:4000/api/alerts/low-stock", {
                headers: { Authorization: `Bearer ${token}` },
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error ?? "there is an error fetching alerts")
                return
            }

            setProducts(data.lowStockProducts)
        }

        fetchLowStock()
    }, [])

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <Link to="/" className="mb-4 inline-block text-sm text-gray-500">← Dashboard</Link>
            <h1 className="mb-4 text-2xl font-bold">Low Stock Alerts</h1>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            {products.length === 0 && !error && (
                <p className="text-sm text-gray-500">No low stock products.</p>
            )}

            <ul className="flex flex-col gap-2">
                {products.map((product) => (
                    <li key={product.id} className="rounded border border-red-300 p-3">
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-red-500">
                            Current stock: {product.current_stock} (min: {product.min_stock_level})
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
