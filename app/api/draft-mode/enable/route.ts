import { draftMode } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Enables Next.js [Draft Mode](https://nextjs.org/docs/app/guides/draft-mode) for
 * [Sanity Visual Editing / Presentation](https://www.sanity.io/docs/presentation) preview links.
 * Sanity calls `/api/draft-mode/enable?sanity-preview-secret=…&sanity-preview-pathname=…` — that
 * route did not exist in this repo, so the request always returned 404.
 *
 * Set `SANITY_PREVIEW_SECRET` in the environment to the same value as in your Sanity
 * “Presentation tool / Preview / Share access” settings.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('sanity-preview-secret') ?? searchParams.get('secret')
  const expected = process.env.SANITY_PREVIEW_SECRET

  if (!expected) {
    return new NextResponse('Configure SANITY_PREVIEW_SECRET in the environment to match your Sanity project.', {
      status: 503,
    })
  }
  if (secret !== expected) {
    return new NextResponse('Invalid preview secret.', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  const rel = searchParams.get('sanity-preview-pathname') || '/'
  if (!rel.startsWith('/') || rel.startsWith('//')) {
    return new NextResponse('Invalid sanity-preview-pathname (must be a same-origin path).', { status: 400 })
  }
  return NextResponse.redirect(new URL(rel, request.nextUrl.origin))
}
