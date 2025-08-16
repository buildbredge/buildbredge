import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting migration: Adding category_id column to tradie_professions table...")

    // Step 1: Check if the column already exists
    const { data: existingColumns, error: checkError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tradie_professions' 
        AND column_name = 'category_id';
      `
    })

    if (checkError) {
      console.error("Error checking existing columns:", checkError)
      // If RPC doesn't work, try direct query
      const { data: tableInfo } = await supabase
        .from('tradie_professions')
        .select('*')
        .limit(1)
      
      console.log("Table structure sample:", tableInfo)
    }

    // Step 2: Add the category_id column if it doesn't exist
    const addColumnQuery = `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tradie_professions' 
          AND column_name = 'category_id'
        ) THEN
          ALTER TABLE tradie_professions 
          ADD COLUMN category_id UUID REFERENCES categories(id);
          
          RAISE NOTICE 'Added category_id column to tradie_professions table';
        ELSE
          RAISE NOTICE 'category_id column already exists in tradie_professions table';
        END IF;
      END $$;
    `

    // Execute the migration using raw SQL
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      query: addColumnQuery
    })

    if (migrationError) {
      console.error("Migration error:", migrationError)
      return NextResponse.json({
        success: false,
        error: `Migration failed: ${migrationError.message}`
      }, { status: 500 })
    }

    console.log("Migration step 1 completed: Added category_id column")

    // Step 3: Update existing records to populate category_id
    const updateExistingQuery = `
      UPDATE tradie_professions 
      SET category_id = professions.category_id 
      FROM professions 
      WHERE tradie_professions.profession_id = professions.id 
      AND tradie_professions.category_id IS NULL;
    `

    const { error: updateError } = await supabase.rpc('exec_sql', {
      query: updateExistingQuery
    })

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({
        success: false,
        error: `Failed to update existing records: ${updateError.message}`
      }, { status: 500 })
    }

    console.log("Migration step 2 completed: Updated existing records")

    // Step 4: Check the results
    const { data: verificationData, error: verifyError } = await supabase
      .from('tradie_professions')
      .select(`
        id,
        tradie_id,
        profession_id,
        category_id,
        professions(name_zh, category_id)
      `)
      .limit(5)

    console.log("Migration verification - sample records:", verificationData)

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      details: {
        columnAdded: true,
        existingRecordsUpdated: true,
        sampleRecords: verificationData
      }
    })

  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json({
      success: false,
      error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    // Check if category_id column exists
    const { data: sampleData } = await supabase
      .from('tradie_professions')
      .select('id, tradie_id, profession_id, category_id')
      .limit(5)

    const hasCategoryId = sampleData && sampleData.length > 0 && 'category_id' in sampleData[0]

    return NextResponse.json({
      success: true,
      hasCategoryIdColumn: hasCategoryId,
      sampleRecords: sampleData,
      message: hasCategoryId 
        ? "category_id column exists in tradie_professions table"
        : "category_id column does NOT exist in tradie_professions table"
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}