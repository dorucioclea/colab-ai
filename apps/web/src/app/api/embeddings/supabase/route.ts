import { NextResponse } from 'next/server'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { DocumentProps } from '@/lib/types/document'

const secretKey = process.env.SUPABASE_SECRET_KEY!
const url = process.env.SUPABASE_PROJECT_URL!

export async function POST (req: Request) {
  const { name, docId, content } = await req.json() as {
    name: DocumentProps['name']
    docId: DocumentProps['id']
    content: DocumentProps['content']
  }

  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null || docId === null) {
    return NextResponse.json({ error: 'Something went wrong creating embedding' })
  }

  const { data: settings } = await supabase.from('users')
    .select('openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user?.id)

  const {
    openaiKey,
    openaiOrg = null
  } = settings?.[0] as any // refact

  const client = createClient(url, secretKey)

  const embeddings = new OpenAIEmbeddings(
    {
      openAIApiKey: openaiKey
    },
    openaiOrg ? { organization: openaiOrg } : {}
  )

  const store = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'embeddings'
  })

  const parsedDocs = content.map((doc) => {
    return {
      ...doc,
      pageContent: doc.pageContent.replace(/\n/g, ' ')
    }
  })

  const ids = await store.addDocuments(parsedDocs)

  // update document to trained 'true' status
  await supabase.from('documents')
    .update({ name, is_trained: true, embeddings_ids: ids })
    .eq('id', docId)

  return NextResponse.json({ finished: true, docId })
}

export async function DELETE (req: Request) {
  const { docId, ids } = await req.json() as { docId: DocumentProps['id'], ids: number[] }

  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null || !docId) {
    return NextResponse.json({ error: 'Something went wrong deleting embeddings' })
  }

  const { data: settings } = await supabase.from('users')
    .select('openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user?.id)

  const {
    openaiKey,
    openaiOrg = null
  } = settings?.[0] as any // refact

  const client = createClient(url, secretKey)

  const embeddings = new OpenAIEmbeddings(
    {
      openAIApiKey: openaiKey
    },
    openaiOrg ? { organization: openaiOrg } : {}
  )

  const store = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'embeddings'
  })

  // @ts-expect-error: library types are wrong (doesn't accept ids as number[])
  // Update: https://github.com/langchain-ai/langchainjs/pull/2745 PR submitted to fix it 🙌✨
  await store.delete({ ids })

  // update document previously trained to 'false' status
  await supabase.from('documents')
    .update({ is_trained: false, embeddings_ids: null })
    .eq('id', docId)

  return NextResponse.json({ test: true, ids })
}
