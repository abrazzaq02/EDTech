import type { Page, PrivateQuestion } from './contracts';
const ignored = new Set('about after again against also before being below between could during every first found further given have having important inside itself notes other outside should their there these those through under using very what when where which while whose with would your example examples process'.split(' '));
export function recallQuestions(pages: Page[], count: number): PrivateQuestion[] {
    const lines = pages.flatMap(page => page.text.split(/(?<=[.!?])\s+|\n/).map(text => ({ text: text.trim(), page: page.page }))).filter(l => l.text.length >= 50 && l.text.length <= 350);
    const words = [...new Set(lines.flatMap(l => l.text.match(/\b[A-Za-z]{5,}\b/g) || []).map(w => w.toLowerCase()).filter(w => !ignored.has(w)))];
    const selected: PrivateQuestion[] = [];
    const used = new Set<string>();
    for (const line of lines) {
        const candidates = [...new Set((line.text.match(/\b[A-Za-z]{5,}\b/g) || []).map(w => w.toLowerCase()))].filter(w => !ignored.has(w) && !used.has(w)).sort((a, b) => b.length - a.length);
        const word = candidates[0];
        if (!word)
            continue;
        const distractors = words.filter(w => w !== word && !new RegExp(`\\b${w}\\b`, 'i').test(line.text)).slice(0, 3);
        if (distractors.length < 3)
            continue;
        used.add(word);
        const options = [word, ...distractors];
        const shift = selected.length % 4;
        for (let i = 0; i < shift; i++)
            options.push(options.shift()!);
        selected.push({ id: `recall-${selected.length + 1}`, type: 'mcq', topic: 'Source recall', prompt: `Complete this exact sentence from your notes:\n${line.text.replace(new RegExp(`\\b${word}\\b`, 'i'), '_____')}`, options, answer: word, explanation: `The original sentence is: ${line.text}`, page: line.page, misconception: 'This recall response does not establish a reasoning error. Re-read the source sentence, explain its meaning, and try another example.' });
        if (selected.length === count)
            break;
    }
    return selected;
}
