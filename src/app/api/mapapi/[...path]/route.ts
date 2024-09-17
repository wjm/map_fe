import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';

const API_URL = process.env.API_URL;

export async function GET(req: NextRequest,{ params }: { params: { path: string[] }}) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const externalApiUrl = `${API_URL}/api/${params.path.join('/')}`;
  try {
    const res = await fetch(externalApiUrl, {
      headers: {
        Authorization: `Bearer ${session}`,
        userId: session.user.userId,
      },
    });
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Build the external API URL dynamically for POST request
  const externalApiUrl = `${API_URL}/api/${params.path.join('/')}`;

  try {
    const body = await req.json();  // Extract the body from the request
    if (body && 'user_id' in body) {
      if (body.user_id !== session.user.userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }
    const res = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userId: session.user.userId,
      },
      body: JSON.stringify(body),  // Pass the request body to the external API
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: 'Error posting data' }, { status: 500 });
  }
}
