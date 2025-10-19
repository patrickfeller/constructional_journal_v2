import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, _clientPayload) => {
        // Validate file types and size
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB max
          addRandomSuffix: true, // Prevent filename conflicts
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Photo upload completed:', blob.url);
        // You could update a database here if needed
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
