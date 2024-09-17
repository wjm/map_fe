import React from 'react';
import SignupForm from './signup-form';

export default function SignupPage(){
  return(
    <main className='flex items-center justify-center md:h-screen'>
        <div className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32'>
            <div className='flex h-20 w-full items-center rounded-lg bg-black p-3 md:h-36'>
                <div className='w-60 text-white md:w-60 flex'>
                    <span role="img" aria-label="icon" className='text-[44px]'>🌟</span>
                    <h1 className='text-[30px] ml-2'>Map Collab</h1>
                </div>
            </div>
            <SignupForm/>
        </div>
    </main>
  );
}