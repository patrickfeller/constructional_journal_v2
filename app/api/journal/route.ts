import { NextResponse } from "next/server";
import { createJournalEntry } from "app/(app)/journal/actions";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await createJournalEntry(formData);
    
    return NextResponse.redirect(new URL('/journal', request.url));
  } catch (error) {
    console.error('Journal creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}
