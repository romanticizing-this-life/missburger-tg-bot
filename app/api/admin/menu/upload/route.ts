import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/adminAuth'

const BUCKET = 'menu-images'

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  const itemId = form.get('itemId') as string | null

  if (!file || !itemId) {
    return NextResponse.json({ error: 'Missing file or itemId' }, { status: 400 })
  }

  const db = createServiceClient()
  const bytes = await file.arrayBuffer()
  const path = `menu-items/${itemId}.webp`

  // Ensure bucket exists (first-time setup)
  const { data: buckets } = await db.storage.listBuckets()
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await db.storage.createBucket(BUCKET, { public: true })
  }

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(path, Buffer.from(bytes), { contentType: 'image/webp', upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path)

  const { error: updateError } = await db
    .from('menu_items')
    .update({ image_url: publicUrl })
    .eq('id', itemId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrl })
}
