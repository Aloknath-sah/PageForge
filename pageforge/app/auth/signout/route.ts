import { revalidatePath } from 'next/cache';
import {
  NextResponse,
  type NextRequest,
} from 'next/server';

import { createClient } from '../../../lib/supabase/server';

export async function POST(
  request: NextRequest,
) {
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  if (claimsData?.claims) {
    await supabase.auth.signOut({
      scope: 'local',
    });
  }

  revalidatePath('/', 'layout');

  return NextResponse.redirect(
    new URL('/login', request.url),
    {
      status: 302,
    },
  );
}