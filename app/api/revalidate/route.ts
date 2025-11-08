import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

interface RevalidateBody {
  secret?: string;
  slugs?: string[];
}

export async function POST(request: NextRequest) {
  const headerSecret = request.headers.get('x-revalidate-secret');
  const body = (await request.json().catch(() => ({}))) as RevalidateBody;
  const secret = headerSecret ?? body.secret;

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ success: false, message: 'Invalid secret token.' }, { status: 401 });
  }

  const slugs = Array.isArray(body.slugs) ? body.slugs : null;
  const pathsToRevalidate = slugs?.length
    ? slugs.map((slug) => (slug.startsWith('/') ? slug : `/docs/${slug}`))
    : ['/'];

  try {
    pathsToRevalidate.forEach((path) => {
      revalidatePath(path);
    });

    return NextResponse.json({ success: true, revalidated: pathsToRevalidate });
  } catch (error) {
    console.error('Revalidation failed', error);
    return NextResponse.json({ success: false, message: 'Error revalidating paths.' }, { status: 500 });
  }
}
