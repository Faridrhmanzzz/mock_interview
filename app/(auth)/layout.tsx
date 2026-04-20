import React, { ReactNode } from 'react'
import { redirect } from "next/navigation";
// TAMBAHAN: Jangan lupa import fungsinya
import { isAuthenticated } from "@/lib/actions/auth.action";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
    // FIX: Ubah nama variabel agar tidak bentrok dengan nama fungsi
    const isAuth = await isAuthenticated();

    if (isAuth) redirect('/');

    return (
        <div className="auth-layout">{children}</div>
    )
}

export default AuthLayout