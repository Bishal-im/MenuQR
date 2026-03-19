import { NextResponse } from 'next/server';
import { getSession } from '@/services/authService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    
    console.log(`[API] Checking session for role: ${role || 'any'}...`);
    const session = await getSession(role);
    console.log(`[API] Session found: ${session ? 'yes (' + session.role + ')' : 'no'}`);
    
    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }
    
    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error('[API] Session check error:', error);
    return NextResponse.json({ session: null, error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
