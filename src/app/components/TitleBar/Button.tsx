import Link from 'next/link';
import { signOut, auth } from '@/app/auth';

export default async function Button() {
  const session = await auth()
  if (session) {
    return (
      <form action={async () => {
        "use server";
        await signOut();
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '12px' }}>{session.user?.email}</div>
          <button>Sign Out</button>
        </div>

      </form>
    )
  }
  return (
    <Link href="/login">
      <button>Login</button>
    </Link>
  )
}

