import { createClient } from "@supabase/supabase-js"
import { readFile } from "fs/promises"
import path from "path"

interface ServiceAreaRecord {
  city: string
  area: string
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const filePath = path.resolve(process.cwd(), "src/lib/data/nz-service-areas.json")
  const raw = await readFile(filePath, "utf-8")
  const records: ServiceAreaRecord[] = JSON.parse(raw)

  console.log(`Preparing to import ${records.length} service areas...`)

  const chunkSize = 200
  for (let i = 0; i < records.length; i += chunkSize) {
    const batch = records.slice(i, i + chunkSize).map(item => ({
      country: "New Zealand",
      city: item.city,
      area: item.area
    }))

    const { error } = await client
      .from("service_areas")
      .upsert(batch, { onConflict: "city,area" })

    if (error) {
      console.error(`Failed to upsert batch starting at index ${i}:`, error.message)
      process.exit(1)
    }

    console.log(`Inserted ${Math.min(i + chunkSize, records.length)} / ${records.length}`)
  }

  console.log("Service areas import completed ✓")
}

main().catch(error => {
  console.error("Unexpected error while importing service areas", error)
  process.exit(1)
})
