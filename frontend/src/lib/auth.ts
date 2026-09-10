type TokenPayload = {
    userId: number
    businessId: number
    role: "owner" | "cashier" | "warehouse_staff"
}

export function getCurrentUser(): TokenPayload | null {
    const token = localStorage.getItem("token")
    if (!token) return null

    try {
        const payload = token.split(".")[1]
        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}