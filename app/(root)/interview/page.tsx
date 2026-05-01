import React from 'react'
import Agent from "@/components/Agent"
import { getCurrentUser } from "@/lib/actions/auth.action";

// Tambahkan kata kunci 'async' di depan (props) =>
const Page = async () => {
    const user = await getCurrentUser();

    return (
        <>
            <h3>Interview Generation</h3>

            {/* Pastikan prop name dan id sesuai dengan struktur objek user Anda */}
            <Agent
                userName={user?.firstName || user?.name}
                userId={user?.$id || user?.id}
                type="generate"
            />
        </>
    )
}

export default Page