"use client";


import {useState, useEffect} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";


export default function DasshboardPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        async function loadUser() {
            const {data} = await supabase.auth.getUser();
            if(!data.user) {
                router.push("/signup");
                return;
            }
            setEmail(data.user.email ?? null);
        }
        loadUser();
    },[router]);

    async function handleLoguout() {
        await supabase.auth.signOut();
        router.push("/signup");
    }
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-2">Signed in as: {email ?? "Loading..."}</p>
            <button onClick={handleLoguout} className="mt-6 px-4 py-2 rounded bg-black text-white">Log out</button>
        </div>
    );
}