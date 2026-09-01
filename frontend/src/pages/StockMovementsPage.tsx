import { useState , useEffect, type SubmitEvent} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"

type Product= {
    id:number 
    name: string
}

type StockMovement = {
    id: number
    product_id : number
    product_name : string
    type: "in" | "out"
    quantity : number
    reason: string
}

export function StockMovementsPage(){
    
    const [products, setProducts] = useState<Product[]>([])
    const [movements, setMovements] = useState<StockMovement[]>([])

    const [productId, setProductId] = useState("")
    const [type, setType] = useState<"in" | "out">("in")
    const [quantity, setQuantity] = useState("")
    const [reason, setReason] = useState("")
    
    useEffect(()=>{
        async function fetchProducts(){
            const token = localStorage.getItem("token")

            const response = await fetch("http://localhost:4000/api/products", {
                headers : {Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            setProducts(data.products)
        }

        async function fetchMovements(){
            const token = localStorage.getItem("token")

            const response = await fetch("http://localhost:4000/api/stock-movements", {
                headers: { Authorization: `Bearer ${token}` },
            })

            const data = await response.json()
            setMovements(data.movements)
        }
        fetchMovements()
        fetchProducts()

    },[])

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>){
        e.preventDefault()

         const token = localStorage.getItem("token")

        const response = await fetch("http://localhost:4000/api/stock-movements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId: Number(productId), type, quantity, reason }),
        })

        const data = await response.json()
        setMovements([...movements, data.movement])
        setProductId("")
        setQuantity("")
        setReason("")
    }

    return(
        <div className="mx-auto w-full max-w-md p-8">
            <h1 className="mb-4 text-2xl font-bold">Stock Movements</h1>

            <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="product">Product</Label>
                    <select id="product"
                            value={productId}
                            onChange={(e)=> setProductId(e.target.value)}
                            className="rounded border p-2"
                            required>
                                <option value="">Select Product</option>
                                {products.map((product)=> (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="type">Type</Label>
                    <select id="type"
                    value={type}
                    onChange={(e)=> setType(e.target.value as "in" | "out")}
                    className="rounded border p-2">
                        <option value="in">Stock In</option>
                        <option value="out">Stock Out</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="quantity">Quantitiy</Label>
                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>

                <Button type="submit">Save</Button>
                
                <ul className="flex flex-col gap-2">
                    {movements.map((movement) => (
                    <li key={movement.id} className="rounded border p-3">
                        <p className="font-bold">{movement.product_name}</p>
                        <p className="text-sm text-gray-500">
                        {movement.type === "in" ? "Stock In" : "Stock Out"} · {movement.quantity}
                        </p>
                        {movement.reason && <p className="text-sm text-gray-500">{movement.reason}</p>}
                    </li>
            ))}
                </ul>
            </form>
        </div>
    )
}