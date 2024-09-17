"use server";

import { redirect } from 'next/navigation'


export async function authenticate(prevState: string | undefined, formData: FormData) {

    //const password = String(formData.get('password'));
    
    
    const user = {
        username : formData.get('username'),
        password : formData.get('password'),
    }

    const response = await fetch(process.env.API_URL+'/api/user/register', {
        method: 'POST', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
        }
    );
    const res = await response.json();
    const errormessage = res.Error;
    if(!errormessage){
        redirect('/login');
    }
    return errormessage;
  }