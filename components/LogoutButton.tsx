'use client';

import { signOut as serverSignOut } from '@/lib/actions/auth.action';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await serverSignOut();
            await firebaseSignOut(auth);
            toast.success('Berhasil logout');
            router.push('/sign-in');
            router.refresh();
        } catch (err) {
            toast.error('Gagal logout, coba lagi');
            console.error(err);
        }
    };

    return (
        <button onClick={handleLogout} className="text-primary-100 cursor-pointer">
            Logout
        </button>
    );
};

export default LogoutButton;
