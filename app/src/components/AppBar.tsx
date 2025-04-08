"use client"
import React from 'react'
import { Button } from './ui/button'
import { ToggleThemeButton } from './ToggleTheme'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

function AppBar() {
    const session = useSession();
    return (
        <div className='py-5 px-2 bg-orange-400 dark:bg-orange-600 flex items-center justify-between'>
            <div>
                <h1 className='text-3xl font-semibold'>Songzy</h1>
            </div>
            <div className='flex gap-2 items-center'>
                {
                    session.data?.user ?
                        <>
                            <Image
                                height={40}
                                width={40}
                                alt={session.data.user.name || ""}
                                src={session.data.user.image || ""}
                                className='rounded-full object-contain'
                            />
                            <Button onClick={() => signOut()}>
                                Logout
                            </Button>
                        </>
                        :
                        <>
                            <Button
                                onClick={() => signIn()}
                                variant={'secondary'}>Login</Button>
                            <Button
                                onClick={() => signIn()}
                            >Signup</Button>
                        </>
                }
                <ToggleThemeButton />
            </div>
        </div>
    )
}

export default AppBar
