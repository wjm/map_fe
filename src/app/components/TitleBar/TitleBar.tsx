import React from 'react';
import './TitleBar.css';
// import Link from 'next/link';
// import { signOut,auth } from '@/app/login/authenticate';
import Button from './Button';
import Link from 'next/link';

interface TitleBarProps {
  title: string;
}

export default function TitleBar({ title }: TitleBarProps) {
  return (
    <div className="title-bar">
      <Link href='/'>
        <div className="title-bar-left">
          {/* Add your icon here */}
          <span role="img" aria-label="icon">
            🌟
          </span>
          {/* Title text */}
          <h1>{title}</h1>
        </div>
      </Link>
      <div className="title-bar-right">
        <Button />
      </div>
    </div>
  );
};

// async function Button(){
//   const session = await auth()
//   if (session){
//     return(
//       <form action={async () => {
//         "use server";
//         await signOut();
//       }}
//       >
//         <button>Sign Out</button>
//       </form>
//     )
//   }
//   return(
//     <Link href = "/login">
//       <button>Login</button>
//     </Link>
//   )
// }

