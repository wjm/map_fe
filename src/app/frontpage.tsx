'use client'
import { useEffect, useState } from "react";
//import { Session } from "next-auth";
import { ButtonProps, MapInfo, MapResInfo } from "./common/interface/interfaces";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useSession } from "next-auth/react";


export default function Info() {
    const { data:session, update} = useSession();
    const [userMaps, setUserMaps] = useState<MapInfo[]>([]);
    const [sharedMaps, setSharedMaps] = useState<MapInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [isJoined, setIsJoined] = useState(false); 

    useEffect(() => {
        const fetchMapInfo = async () => {
            if (!session) {
                console.error('Session is null');
                setLoading(false);  // Stop loading if no session
                return;
            }

            try {
                console.log(JSON.stringify({ user_id: session.user?.id }));
                const response = await fetch(`/api/mapapi/map/get`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: session.user?.id }),
                });

                if (!response.ok) {
                    console.error('Failed to fetch map info');
                    setLoading(false);  // Stop loading if fetching fails
                    return;
                }

                const fetchedMaps: MapResInfo = await response.json();
                setUserMaps(fetchedMaps.maps.user);
                setSharedMaps(fetchedMaps.maps.shared);
                console.log('Fetched maps:', fetchedMaps.maps);
            } catch (error) {
                console.error('Error fetching map info:', error);
            } finally {
                setLoading(false);  // Stop loading once the request is complete
            }
        };
        if (session) {
            console.log('Fetching map info', session);
            setIsJoined(session.user?.companyId !== null);
            fetchMapInfo();
        }


    }, [session, isJoined]);


    const createMap = async (map_name: string) => {
        if (!session) {
            console.error('Session is null');
            return;
        }

        try {
            const response = await fetch(`/api/mapapi/map/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: session.user?.id, map_name: map_name }),
            });

            if (!response.ok) {
                console.error('Failed to create map');
                return;
            }

            const newMap: MapInfo = await response.json();
            console.log('Created map:', newMap);
            router.push(`/map/${newMap.map_id}`);

        } catch (error) {
            console.error('Error creating map:', error);
        }
    };
    const joinCompany = async (company: string | null) => {
        if (!session) {
            console.error('Session is null');
            return;
        }
        if (!company) {
            alert('Company id cannot be empty');
            return;
        }

        try {
            const response = await fetch(`/api/mapapi/user/joinCompany`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ company: company}),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(`Failed to join company: ${error.reason}`);
                return;
            }
            alert(`Successfully joined company ${company}`);
            setIsJoined(true);
            update({companyId: company});
            

        } catch (error) {
            console.error('Error creating map:', error);
        }
    };

    const createCompany = async () => {
        if (!session) {
            console.error('Session is null');
            return;
        }

        try {
            const response = await fetch(`/api/mapapi/user/createCompany`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: session.user?.id}),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(`Failed to create company: ${error.reason}`);
                return;
            }
            const createdCompany = await response.json();
            alert(`Successfully created company ${createdCompany.company}`);
            update({companyId: createdCompany.company});

        } catch (error) {
            console.error('Error creating map:', error);
        }
    };

    if (loading) {
        return <div>Loading maps...</div>;  // Show loading state
    }

    return (
        <main className='flex items-center justify-center md:h-screen'>
            <div className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32'>
                <div className='flex h-20 w-full items-center rounded-lg bg-black p-3 md:h-36'>
                    <div className='w-32 text-white md:w-36 flex'>
                        <span role="img" aria-label="icon" className='text-[44px]'>🌟</span>
                        <h1 className='text-[44px] ml-2'>Maps</h1>
                    </div>
                </div>
                <div>
                    <h4>User Maps</h4>
                    <ul>
                        {userMaps.length > 0 ? (
                            userMaps.map((u) => (
                                <li key={u.map_id}>
                                    <Link href={`/map/${u.map_id}`}>

                                        <Button title={u.map_id.toString()}>
                                            {u.map_name}
                                        </Button>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li>No maps available</li>
                        )}
                    </ul>
                    <h4>Shared Maps</h4>
                    <ul>
                        {sharedMaps.length > 0 ? (
                            sharedMaps.map((s) => (
                                <li key={s.map_id}>
                                    <Link href={`/map/${s.map_id}`}>

                                        <Button title={s.map_id.toString()}>
                                            {s.map_name}
                                        </Button>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li>No maps available</li>
                        )}
                    </ul>
                </div>
                <form
                    action={async () => {
                        await createMap(prompt('Enter map name') || 'New Map');
                    }}
                >
                    <Button >
                        Create New Map
                    </Button>
                </form>
                {!isJoined && (<><form action={async () => {
                    await joinCompany(prompt('Enter map name'));
                } }>
                    <Button>
                        Join Company
                    </Button>
                </form><form action={async () => {
                    await createCompany();
                } }>
                        <Button>
                            Create new Company
                        </Button>
                    </form></>)}
            </div>
        </main>
    );
}

function Button({ children, className, ...rest }: ButtonProps) {
    return (
        <button
            {...rest}
            className={clsx(
                'flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                className,
            )}
        >
            {children}
            <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </button>
    );
}
