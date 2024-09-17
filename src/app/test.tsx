'use client'
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { ButtonProps, MapInfo, MapResInfo } from "./common/interface/interfaces";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useSession, SessionProvider } from 'next-auth/react';


export default function Info() {
    const {data: session, status, update } = useSession();
    console.log(session);

    return (
        <SessionProvider>
            test
        </SessionProvider>
    );
}
