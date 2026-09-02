import { useState, useEffect, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router"

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
    const [editingId, setEditingId] = useState<number | null>(null)
    const [error, setError] = useState("")

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

            const url = editingId
            ? `http://localhost:4000/api/products/${editingId}`
            : "http://localhost:4000/api/products"
        const method = editingId ? "PUT" : "POST"

        const response = await fetch(url, {
            method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, category, barcode, purchasePrice, salePrice }),
            })

            const data = await response.json()
            
            if (editingId) {
                setProducts(products.map((product) => (product.id === editingId ? data.product : product)))
            } else {
                setProducts([...products, data.product])
            }

            setName("")
            setCategory("")
            setBarcode("")
            setPurchasePrice("")
            setSalePrice("")
            setEditingId(null)

            }


        function handleEdit(product: Product) {
            setEditingId(product.id)
            setName(product.name)
            setCategory(product.category || "")
            setBarcode(product.barcode || "")
            setPurchasePrice(product.purchase_price)
            setSalePrice(product.sale_price)
        }

        function handleCancelEdit() {
            setEditingId(null)
            setName("")
            setCategory("")
            setBarcode("")
            setPurchasePrice("")
            setSalePrice("")
        }


        async function handleDelete(id: number) {

            setError("")
            const token = localStorage.getItem("token")

            const response = await fetch(`http://localhost:4000/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.error ?? "An error occurred while deleting the product.")
                return
            }

            setProducts(products.filter((product) => product.id !== id))
        }



    return(
        <div className="mx-auto w-full max-w-md p-8">
            <Link to="/" className="mb-4 inline-block text-sm text-gray-500">← Dashboard</Link>
            <h1 className="mb-4 text-2xl font-bold">Products</h1>
            
            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

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

                <div className="flex gap-2">
                    <Button type="submit">{editingId ? "Update Product" : "Add Product"}</Button>
                    {editingId && (
                        <Button type="button" onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>

            <ul className="flex flex-col gap-2">
            {products.map((product)=>(
                <li key={product.id} className="rounded border p-3">
                    <p className="font-bold">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category || "there is no category"}</p>
                    <p>{product.sale_price}</p>

                    <div className="mt-2 flex gap-2">
                        <Button type="button" onClick={() => handleEdit(product)}>
                            Edit
                        </Button>
                        <Button type="button" onClick={() => handleDelete(product.id)}>
                            Delete
                        </Button>
                    </div>
                </li>
            ))}
            </ul>
        </div>
    )
}
