import {useState, type SubmitEvent} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {useNavigate} from 'react-router'

export function LoginPage(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>){
        e.preventDefault()
        setError("")

        const response = await fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const data = await response.json()
            setError(data.error ?? "there is an error during login")
            return
        }

        const data = await response.json()
        localStorage.setItem("token", data.token)
        navigate("/")
    }

    return(
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className='flex w-80 flex-col gap-4'>
                <h1 className='text-2xl font-bold'>Login</h1>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className='flex flex-col gap-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    required />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    required />
                </div>
                <Button type='submit'>Login</Button>
            </form>
        </div>
    )
}