import { useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TopProduct = {
    id: number
    name: string
    quantity_sold: string
    revenue: string
}

type SalesReport = {
    salesCount: number
    totalRevenue: string
    topProducts: TopProduct[]
}

export function ReportsPage() {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [report, setReport] = useState<SalesReport | null>(null)
    const [error, setError] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setReport(null)

        const token = localStorage.getItem("token")

        const response = await fetch(
            `http://localhost:4000/api/reports/sales?startDate=${startDate}&endDate=${endDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = await response.json()

        if (!response.ok) {
            setError(data.error ?? "there is an error fetching the report")
            return
        }

        setReport(data)
    }

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <Link to="/" className="mb-4 inline-block text-sm text-gray-500">← Dashboard</Link>
            <h1 className="mb-4 text-2xl font-bold">Reports</h1>

            <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4">
                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex flex-col gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>

                <Button type="submit">Generate Report</Button>
            </form>

            {report && (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded border p-4">
                            <p className="text-sm text-gray-500">Sales</p>
                            <p className="text-2xl font-bold">{report.salesCount}</p>
                        </div>
                        <div className="rounded border p-4">
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold">{report.totalRevenue}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-2 text-xl font-bold">Top Products</h2>
                        <ul className="flex flex-col gap-2">
                            {report.topProducts.map((p) => (
                                <li key={p.id} className="rounded border p-3">
                                    {p.name} — {p.quantity_sold} sold — {p.revenue}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}



