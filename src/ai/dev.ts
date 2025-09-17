import { config } from 'dotenv';
config();

import '@/ai/flows/compare-gstr-flow.ts';
import '@/ai/flows/reconcile-itc-flow.ts';
import '@/ai/flows/suggest-hsn-codes.ts';
import '@/ai/flows/compare-gstr-reports.ts';