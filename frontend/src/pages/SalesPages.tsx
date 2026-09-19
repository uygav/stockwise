import { useState, useEffect, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router"

type Product = {
    id: number
    name: string
    sale_price: string
}

type CartItem = {
    id: string
    productId: number
    productName: string
    quantity: number
    unitPrice: number
}

type Sale = {
    id:number
    total_amount : string
    created_at : string
}

export function SalesPage(){
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [sales, setSales] = useState<Sale[]>([])

    const [productId, setProductId] = useState("")
    const [quantity, setQuantity] = useState("")
    const [error, setError] = useState("")


    useEffect(() => {
        async function fetchProducts() {
            const token = localStorage.getItem("token")

            const response = await fetch("http://localhost:4000/api/products", {
                headers: { Authorization: `Bearer ${token}` },
            })

            const data = await response.json()
            setProducts(data.products)
        }

        async function fetchSales(){
            const token = localStorage.getItem("token")

            const response = await fetch("http://localhost:4000/api/sales", {
                headers: { Authorization : `Bearer ${token}`}
            })

            const data = await response.json()  
            setSales(data.sales)
        }

        fetchProducts()
        fetchSales()
    }, [])

    function handleAddToCart(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        const product = products.find((p) => p.id === Number(productId))
        if (!product) return

        setCart([
            ...cart,
        {   
            id: crypto.randomUUID(),
            productId: product.id,
            productName: product.name,
            quantity: Number(quantity),
            unitPrice: Number(product.sale_price),
        },
    ])

        setProductId("")
        setQuantity("")
    }

    async function handleCompleteSale() {
        if (cart.length === 0) return

        setError("")
        const token = localStorage.getItem("token")

        const response = await fetch("http://localhost:4000/api/sales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            setError(data.error ?? "there is an error completing the sale")
            return
        }

        setSales([data.sale, ...sales])
        setCart([])
    }

    const total = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    return (
    <div className="mx-auto w-full max-w-md p-8">
        <Link to="/" className="mb-4 inline-block text-sm text-gray-500">← Dashboard</Link>
        <h1 className="mb-4 text-2xl font-bold">Sales</h1>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleAddToCart} className="mb-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="product">Product</Label>
                <select
                    id="product"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="rounded border p-2"
                    required
                >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>

            <Button type="submit">Add to Cart</Button>
        </form>

        <ul className="mb-4 flex flex-col gap-2">
            {cart.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 rounded border p-3">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{(item.quantity * item.unitPrice).toFixed(2)}</span>
                </li>
            ))}
        </ul>

        <p className="mb-4 text-lg font-bold">Total: {total.toFixed(2)}</p>

        <Button onClick={handleCompleteSale} disabled={cart.length === 0}>Complete Sale</Button>

        <h2 className="mt-8 mb-4 text-xl font-bold">Sales History</h2>
        <ul className="flex flex-col gap-2">
            {sales.map((sale) => (
                <li key={sale.id} className="rounded border p-3">
                    {sale.total_amount} — {new Date(sale.created_at).toLocaleString()}
                </li>
            ))}
        </ul>
    </div>
)
}




