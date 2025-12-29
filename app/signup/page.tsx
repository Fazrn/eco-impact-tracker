"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError]= useState<String | null>(null);

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const {error} = await supabase.auth.signUp({
            email,
            password,
        });

        setLoading(false);

        if(error) {
            setError(error.message);
            return;
        }

        router.push("/dashboard");
    }

    return(
        <div className="m-x auto max-w-sm p-6">
            <h1 className="text-2xl font-semibold">Create account</h1>
            <form onSubmit={handleSignup} className="mt-6 space-y-4">
                <input
                className="w-full rounded border p-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
                <input
                className="w-full rounded border p-2"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button className="w-full rounded bg-black p-2 text-white idsabled:opacity-50" disabled={loading}>{loading ? "Creating account..." : "Sign up" }</button>
            </form>
        </div>
    )
}