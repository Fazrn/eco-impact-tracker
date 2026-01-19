import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";


export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value, options}) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    }

                    )
                }
            }
        }
    )
    const {data, error} = await supabase.auth.getClaims();
    const isAuthed = !!data?.claims && !error;

    if(!isAuthed && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ]
}