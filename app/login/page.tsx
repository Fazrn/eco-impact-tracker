"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error , setError] = useState<String | null>(null);

    async function handleLogin(e:React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password
        })

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        router.push("/dashboard");
    }

    return(
        <div className="mx-auto p-6 max-w-sm">
            <h1 className="text-2xl font-semibold">Log in</h1>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <input
                className="w-full rounded border p-2"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required/>
            
                <input
                className="w-full rounded border p-2"
                value={password}
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required/>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button 
                className="w-full rounded bg-black p-2 text-white disabled:opacity-50"
                disabled={loading}>
                {loading ? "Logging in ..." : "Log in"}
                </button>
            </form>

            <p className="mt-4 text-sm">No account?
                <Link className="underline" href="/signup">
                Sign up
                </Link>
            </p>
        </div>
    )
}