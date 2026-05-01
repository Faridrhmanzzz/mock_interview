import React from 'react'
import Agent from "@/components/Agent"
import { getCurrentUser } from "@/lib/actions/auth.action";

// Tambahkan kata kunci 'async' di depan (props) =>
const Page = async () => {
    const user = await getCurrentUser();

    // 🔥 TAMBAHKAN INI
    if (!user) {
        return <div>Please login first</div>;
    }

    return (
        <>
            <h3>Interview Generation</h3>

            <Agent
                userName={user.firstName || user.name || "User"}
                userId={user.$id || user.id}
                type="generate"
            />
        </>
    )
}

export default Page