"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({data}) => {
            setIsAuthed(!!data.session);
        })

        const {data: sub} = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthed(!!session);
        })

        return () => {
            sub.subscription.unsubscribe();
        }
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    return(
        <nav className="flex items-center justify-between border-b p-4">
            <Link href="/" className="font-semibold">Eco Impact Tracker</Link>
            <div className="flex items-center gap-4">
                {isAuthed ? (
                    <>
                        <Link href="/dashboard" className="underline">Dashboard</Link>
                        <button onClick={handleLogout} className="underline">Logout</button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="underline">Login</Link>
                        <Link href="/signup" className="underline">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}