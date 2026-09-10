import { Navigate } from "react-router"
import { getCurrentUser } from "@/lib/auth"

export function RoleProtectedRoute({
    allowedRoles,
    children,
}: {
    allowedRoles: string[]
    children: React.ReactNode
}) {
    const user = getCurrentUser()

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children
}