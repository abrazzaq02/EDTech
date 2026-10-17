import type { Page } from './contracts';
export async function extractPDF(file: File, onProgress: (v: string) => void): Promise<{
    pages: Page[];
    pageCount: number;
    warning: string;
}> {
    if (file.size > 10 * 1024 * 1024)
        throw new Error('Please upload a PDF smaller than 10 MB.');
    if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf'))
        throw new Error('Please choose a PDF file.');
    const data = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(data.slice(0, 5)) !== '%PDF-')
        throw new Error('This file does not have a valid PDF signature.');
    onProgress('Opening your PDF…');
    // The vendored, same-origin PDF.js distribution is loaded only in the browser.
    const pdfjs = await import(/* @vite-ignore */ new URL('/vendor/pdf.mjs', window.location.origin).href);
    pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.mjs';
    const loading = pdfjs.getDocument({ data, isEvalSupported: false, useWorkerFetch: false, standardFontDataUrl: '/vendor/standard_fonts/', cMapUrl: '/vendor/cmaps/', cMapPacked: true });
    let doc;
    try {
        doc = await loading.promise;
    }
    catch {
        throw new Error('This PDF could not be opened. It may be corrupt or password-protected. Try an unlocked, text-based PDF.');
    }
    const pages: Page[] = [];
    let chars = 0;
    let skipped = 0;
    const total = doc.numPages;
    try {
        for (let n = 1; n <= Math.min(total, 40); n++) {
            onProgress(`Reading page ${n} of ${Math.min(total, 40)}…`);
            const page = await doc.getPage(n);
            const content = await page.getTextContent();
            const text = content.items.map((item: {
                str?: string;
                hasEOL?: boolean;
            }) => item.str ? (item.str + (item.hasEOL ? '\n' : ' ')) : '').join('').trim();
            if (text.replace(/\s/g, '').length < 20) {
                skipped++;
                continue;
            }
            const chunk = text.slice(0, Math.min(16000, 80000 - chars));
            if (!chunk)
                break;
            pages.push({ page: n, text: chunk });
            chars += chunk.length;
            if (chars >= 80000)
                break;
        }
    }
    finally {
        await doc.destroy();
    }
    if (chars < 100)
        throw new Error('Very little readable text was found. This appears to be a scanned or image-only PDF. OCR is needed and is not included in this MVP.');
    const warnings = [];
    if (total > 40 || chars >= 80000)
        warnings.push('Processing covers at most the first 40 pages and 80,000 characters.');
    if (skipped)
        warnings.push(`${skipped} page(s) had little readable text and were skipped; OCR may be needed.`);
    if (pages.some(p => p.text.length >= 16000))
        warnings.push('Dense pages were limited to 16,000 characters.');
    return { pages, pageCount: total, warning: warnings.join(' ') };
}
