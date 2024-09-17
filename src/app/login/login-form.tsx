'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { authenticate } from './authenticate';
import {
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { ButtonProps } from '../common/interface/interfaces';


export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className='mb-3 text-2xl'>
          Please login to continue.
        </h1>
        <div className="w-full">
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="username">
              Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500"
                id="username"
                //type="email"
                name="username"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
              />
            </div>
          </div>
        </div>
        <LoginButton />
        <p className='mb-3 mt-4 text-sm'>
          Don&apos;t have an acount yet?
          <Link href="/signup">
            <span className='pl-2 underline font-bold'>Sign up here</span>
          </Link>
        </p>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>

      </div>
    </form>
  )
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
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
    </button>
  );
}
