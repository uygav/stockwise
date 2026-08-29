import { useState, useEffect, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Product = {
    id: number
    name: string
    category: string | null
    barcode: string | null
    purchase_price: string
    sale_price: string
}

export function ProductsPage(){
    const [products, setProducts] = useState<Product[]>([])
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [barcode, setBarcode] = useState("")
    const [purchasePrice, setPurchasePrice] = useState("")
    const [salePrice, setSalePrice] = useState("")

    useEffect(() => {
        async function fetchProducts(){
            const token = localStorage.getItem("token")

            const response = await fetch("http://localhost:4000/api/products", {
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = await response.json()
            setProducts(data.products)
        }

        fetchProducts()
    }, [])

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>){
        e.preventDefault()

        const token = localStorage.getItem("token")

        const response = await fetch("http://localhost:4000/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, category, barcode, purchasePrice, salePrice }),
        })

        const data = await response.json()
        setProducts([...products, data.product])

        setName("")
        setCategory("")
        setBarcode("")
        setPurchasePrice("")
        setSalePrice("")
    }

    return(
        <div className="mx-auto max-w-xl p-8">
            <h1 className="mb-4 text-2xl font-bold">Products</h1>

            <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={name} onChange={(e)=> setName(e.target.value)} required/>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={category} onChange={(e)=> setCategory(e.target.value)} />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input id="barcode"
                    value={barcode}
                    onChange={(e)=> setBarcode(e.target.value)} />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={(e)=> setPurchasePrice(e.target.value)} required />
                </div>

                <div className="flex flex-col gap-2">
                   <Label htmlFor="salePrice">Sale Price</Label>
                   <Input id="salePrice" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
                </div>

                <Button type="submit">Add Product</Button>
            </form>

            <ul className="flex flex-col gap-2">
            {products.map((product)=>(
                <li key={product.id} className="rounded border p-3">
                    <p className="font-bold">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category || "there is no category"}</p>
                    <p>{product.sale_price}</p>
                </li>
            ))}
            </ul>
        </div>
    )
}
