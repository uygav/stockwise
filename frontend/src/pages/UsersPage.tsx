import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router"

export function UsersPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("cashier")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setSuccess("")

        const token = localStorage.getItem("token")

        const response = await fetch("http://localhost:4000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email, password, role }),
        })

        const data = await response.json()

        if (!response.ok) {
            setError(data.error ?? "there is an error during user creation")
            return
        }

        setSuccess(`user created: ${data.user.email} (${data.user.role})`)
        setEmail("")
        setPassword("")
    }

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <Link to="/" className="mb-4 inline-block text-sm text-gray-500">← Dashboard</Link>
            <h1 className="mb-4 text-2xl font-bold">Add User</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="rounded border p-2"
                    >
                        <option value="cashier">Cashier</option>
                        <option value="warehouse_staff">Warehouse Staff</option>
                    </select>
                </div>

                <Button type="submit">Create User</Button>
            </form>
        </div>
    )
}

