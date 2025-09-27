
import { NextRequest, NextResponse } from 'next/server';
import { parseTallyXml } from '@/services/tally-importer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (file.type !== 'text/xml' && file.type !== 'application/xml') {
        return NextResponse.json({ error: 'Invalid file type. Please upload an XML file.' }, { status: 400 });
    }

    const fileContent = await file.text();
    
    // In a real application, this would do more than just parse.
    // It would interact with the database to create ledgers, vouchers, etc.
    const processingResult = await parseTallyXml(fileContent);

    return NextResponse.json({
      message: `Successfully processed ${processingResult.voucherCount} vouchers and ${processingResult.ledgerCount} ledgers from Tally export.`,
      data: processingResult,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Tally Import Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process Tally XML file.' }, { status: 500 });
  }
}
