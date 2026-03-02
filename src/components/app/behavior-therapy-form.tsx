///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Form schema from behavior-therapy-forms.json + user-entered field values
// Outcome: Fillable clinical form rendered faithfully with editable fields and PDF download
// Short Description: Renders a single Behavior Therapy form with editable text fields/textareas and client-side PDF export
/////////////////////////////////////////////////////////////

'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Download, Loader2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import formsData from '@/data/behavior-therapy-forms.json';

// ── Auto-fill placeholder definitions ──────────────────────
// Order matters: longer/more-specific patterns first to avoid partial replacements.

interface AutoFillKey {
    key: string;       // state key
    label: string;     // UI label
    placeholder: string;
    type: 'text' | 'date';
}

const AUTO_FILL_KEYS: AutoFillKey[] = [
    { key: 'clientName',     label: "Client\u2019s Name",    placeholder: 'e.g. John Smith',            type: 'text' },
    { key: 'doctorName',     label: "Doctor\u2019s Name",    placeholder: 'e.g. Dr. Jane Doe',          type: 'text' },
    { key: 'evaluatorName',  label: "Evaluator\u2019s Name", placeholder: 'e.g. Sarah Johnson',         type: 'text' },
    { key: 'practiceName',   label: 'Practice Name',         placeholder: 'e.g. Sunrise ABA Center',    type: 'text' },
    { key: 'schoolName',     label: 'School Name',           placeholder: 'e.g. Lincoln Elementary',     type: 'text' },
    { key: 'credential',     label: 'Credential',            placeholder: 'e.g. BCBA, M.Ed.',           type: 'text' },
    { key: 'date',           label: 'Date (xx/xx/xxxx)',     placeholder: 'e.g. 03/02/2026',            type: 'text' },
];

/** Apply all placeholder replacements to a string */
function applyReplacements(text: string, values: Record<string, string>): string {
    let result = text;
    const cn = values.clientName || '';
    const dn = values.doctorName || '';
    const en = values.evaluatorName || '';
    const pn = values.practiceName || '';
    const sn = values.schoolName || '';
    const cr = values.credential || '';
    const dt = values.date || '';

    if (cn) {
        // Exact table-cell labels (mixed case with smart/straight quotes)
        result = result.replace(/^Client[\u2019']s Name$/g, cn);
        result = result.replace(/\bClient[\u2019']s Name\b/g, cn);
        // Upper-case paragraph patterns
        result = result.replace(/\bCLIENT[\u2019']S NAME\b/g, cn);
        result = result.replace(/\bCLIENT NAME\b/g, cn);
        // XX Client / XX client
        result = result.replace(/\bXX Client\b/g, cn);
        result = result.replace(/\bXX client\b/g, cn);
        // Legacy leftover name from template
        result = result.replace(/\bMadison\b/g, cn);
        // Standalone XX before lowercase word (e.g. "XX will", "XX ability", "XX  ability")
        result = result.replace(/\bXX\b(?=\s+[a-z])/g, cn);
        // XX before possessive 's
        result = result.replace(/\bXX\b(?=[\u2019']s\b)/g, cn);
        // XX at end of sentence (before period/comma) or end of string
        result = result.replace(/\bXX\b(?=[.,;!?\s]*$)/g, cn);
        // XX before hyphen-connected word (e.g. "YY-Any instance where XX")
        result = result.replace(/(where |that |for )\bXX\b/g, '$1' + cn);
    }
    if (dn) {
        // Mixed case: Doctor's Name (table cells)
        result = result.replace(/^Doctor[\u2019']s Name$/g, dn);
        result = result.replace(/\bDoctor[\u2019']s Name\b/g, dn);
        // Upper-case: DOCTOR'S NAME (paragraphs)
        result = result.replace(/\bDOCTOR[\u2019']S NAME\b/g, dn);
    }
    if (en) {
        // Evaluator's Name, Credentials (with credential auto-fill if provided)
        const evalWithCreds = cr ? `${en}, ${cr}` : en;
        result = result.replace(/^Evaluator[\u2019']s Name,?\s*Credentials?$/g, evalWithCreds);
        result = result.replace(/\bEvaluator[\u2019']s Name,?\s*Credentials?\b/g, evalWithCreds);
        // Plain Evaluator's Name
        result = result.replace(/^Evaluator[\u2019']s Name$/g, en);
        result = result.replace(/\bEvaluator[\u2019']s Name\b/g, en);
    }
    if (pn) {
        result = result.replace(/\bNAME OF PRACTICE\b/g, pn);
        result = result.replace(/\bName of Practice\b/g, pn);
    }
    if (sn) {
        result = result.replace(/^School[\u2019']s Name$/g, sn);
        result = result.replace(/\bSchool[\u2019']s Name\b/g, sn);
    }
    if (cr) {
        result = result.replace(/\bCRENDENTIAL\b/g, cr);
        result = result.replace(/\bCREDENTIAL\b/g, cr);
        // Standalone "Credentials" only when it's the entire cell text
        result = result.replace(/^Credentials?$/g, cr);
    }
    if (dt) {
        // Longer date pattern first
        result = result.replace(/xx\/xx\/xxxx/g, dt);
        result = result.replace(/x\/xx\/xxxx/g, dt);
        result = result.replace(/xx\/xx\/xxx(?!x)/g, dt);
    }
    return result;
}

// ── Type definitions matching the JSON schema ──────────────

interface TableCell {
    text: string;
    isField: boolean;
    fieldId: string | null;
}

interface TextItem {
    type: 'text';
    text: string;
}

interface HeadingItem {
    type: 'heading';
    text: string;
}

interface FieldItem {
    type: 'field';
    fieldType: string;
    fieldId: string;
    defaultValue: string;
}

interface TableItem {
    type: 'table';
    rows: TableCell[][];
}

type FormItem = TextItem | HeadingItem | FieldItem | TableItem;

interface FormSection {
    heading: string;
    items: FormItem[];
}

interface FormSchema {
    formId: string;
    title: string;
    fileName: string;
    sections: FormSection[];
}

// ── Component props ────────────────────────────────────────

interface BehaviorTherapyFormProps {
    formId: string;
    onBack: () => void;
}

export function BehaviorTherapyForm({ formId, onBack }: BehaviorTherapyFormProps) {
    const form = (formsData as FormSchema[]).find((f) => f.formId === formId);
    const formRef = useRef<HTMLDivElement>(null);
    const [fields, setFields] = useState<Record<string, string>>({});
    const [exporting, setExporting] = useState(false);

    // ── Auto-fill state ────────────────────────────────────
    const [autoFillValues, setAutoFillValues] = useState<Record<string, string>>({});
    const [showAutoFill, setShowAutoFill] = useState(true);
    const [lastFillCount, setLastFillCount] = useState<number | null>(null);

    const handleAutoFillChange = useCallback((key: string, value: string) => {
        setAutoFillValues((prev) => ({ ...prev, [key]: value }));
    }, []);

    /** Count how many fields contain at least one known placeholder */
    const fillableFieldCount = useMemo(() => {
        if (!form) return 0;
        const placeholderRe = /CLIENT NAME|Client[\u2019']s Name|XX Client|XX client|\bXX\b(?=\s+[a-z])|Doctor[\u2019']s Name|DOCTOR[\u2019']S NAME|Evaluator[\u2019']s Name|School[\u2019']s Name|NAME OF PRACTICE|CRENDENTIAL|CREDENTIAL|xx\/xx\/xxx|Madison/i;
        let count = 0;
        form.sections.forEach((s) =>
            s.items.forEach((i) => {
                if (i.type === 'field' && (i as FieldItem).defaultValue && placeholderRe.test((i as FieldItem).defaultValue)) count++;
                if (i.type === 'table' && (i as TableItem).rows) {
                    (i as TableItem).rows.forEach((r) =>
                        r.forEach((c) => {
                            if (c.isField && c.text && placeholderRe.test(c.text)) count++;
                        })
                    );
                }
            })
        );
        return count;
    }, [form]);

    /** Apply auto-fill values to all fields in the form */
    const handleApplyAutoFill = useCallback(() => {
        if (!form) return;
        const hasAnyValue = Object.values(autoFillValues).some((v) => v.trim());
        if (!hasAnyValue) return;

        let updated = 0;
        const newFields: Record<string, string> = { ...fields };

        form.sections.forEach((s) =>
            s.items.forEach((i) => {
                if (i.type === 'field') {
                    const fi = i as FieldItem;
                    // Use current field value if user already typed, otherwise use defaultValue template
                    const base = newFields[fi.fieldId] || fi.defaultValue || '';
                    const replaced = applyReplacements(base, autoFillValues);
                    if (replaced !== base) {
                        newFields[fi.fieldId] = replaced;
                        updated++;
                    }
                }
                if (i.type === 'table' && (i as TableItem).rows) {
                    (i as TableItem).rows.forEach((r) =>
                        r.forEach((c) => {
                            if (c.isField && c.fieldId) {
                                const base = newFields[c.fieldId] || c.text || '';
                                const replaced = applyReplacements(base, autoFillValues);
                                if (replaced !== base) {
                                    newFields[c.fieldId] = replaced;
                                    updated++;
                                }
                            }
                        })
                    );
                }
            })
        );

        setFields(newFields);
        setLastFillCount(updated);
        // Auto-dismiss count after 3s
        setTimeout(() => setLastFillCount(null), 3000);
    }, [form, fields, autoFillValues]);

    const handleFieldChange = useCallback((fieldId: string, value: string) => {
        setFields((prev) => ({ ...prev, [fieldId]: value }));
    }, []);

    const handleDownloadPDF = useCallback(async () => {
        if (!formRef.current) return;
        setExporting(true);
        try {
            // Dynamic import — html2pdf.js is browser-only
            const mod = await import('html2pdf.js');
            const html2pdf = (mod.default || mod) as any;

            // Temporarily replace inputs with their values for PDF
            const container = formRef.current;
            const inputs = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
            const originals: { el: HTMLInputElement | HTMLTextAreaElement; display: string }[] = [];

            // Create visible value spans for each input
            const spans: HTMLSpanElement[] = [];
            inputs.forEach((input) => {
                const span = document.createElement('span');
                span.textContent = input.value || input.placeholder || '';
                span.style.cssText = `
                    display: inline-block;
                    border-bottom: 1px solid #999;
                    min-width: 120px;
                    padding: 2px 4px;
                    font-size: inherit;
                    font-family: inherit;
                    white-space: pre-wrap;
                    word-break: break-word;
                `;
                input.parentNode?.insertBefore(span, input);
                originals.push({ el: input, display: input.style.display });
                input.style.display = 'none';
                spans.push(span);
            });

            await html2pdf()
                .set({
                    margin: [10, 10, 10, 10],
                    filename: `${form?.title || 'form'}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                } as any)
                .from(container)
                .save();

            // Restore inputs
            originals.forEach(({ el, display }) => {
                el.style.display = display;
            });
            spans.forEach((s) => s.remove());
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setExporting(false);
        }
    }, [form?.title]);

    if (!form) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                Form not found: <code>{formId}</code>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header bar */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 border-b">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Forms
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold">{form.title}</h2>
                        <p className="text-xs text-muted-foreground">{form.fileName} · {form.sections.length} sections</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={showAutoFill ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setShowAutoFill((v) => !v)}
                        className="gap-1.5"
                    >
                        <Wand2 className="h-4 w-4" />
                        Smart Fill
                        {showAutoFill ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={exporting} className="gap-2">
                        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {exporting ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                </div>
            </div>

            {/* ── Auto-Fill Panel ────────────────────────────── */}
            {showAutoFill && (
                <div className="max-w-4xl mx-auto border rounded-lg bg-muted/30 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Wand2 className="h-4 w-4 text-primary" />
                                Smart Fill — Auto-populate repeated fields
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Enter values below and click &quot;Apply&quot; to fill {fillableFieldCount} matching fields across the entire form.
                            </p>
                        </div>
                        {lastFillCount !== null && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950 px-2 py-1 rounded-full animate-in fade-in">
                                ✓ Updated {lastFillCount} field{lastFillCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {AUTO_FILL_KEYS.map((af) => (
                            <div key={af.key} className="space-y-1">
                                <Label htmlFor={`af-${af.key}`} className="text-xs font-medium">
                                    {af.label}
                                </Label>
                                <Input
                                    id={`af-${af.key}`}
                                    className="h-8 text-sm"
                                    placeholder={af.placeholder}
                                    value={autoFillValues[af.key] ?? ''}
                                    onChange={(e) => handleAutoFillChange(af.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button size="sm" onClick={handleApplyAutoFill} className="gap-1.5">
                            <Wand2 className="h-3.5 w-3.5" />
                            Apply Smart Fill
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Fills Client&apos;s Name, Doctor&apos;s Name, Evaluator, School, Practice, Credentials &amp; Dates everywhere.
                        </span>
                    </div>
                </div>
            )}

            {/* Form content */}
            <div ref={formRef} className="max-w-4xl mx-auto space-y-8 pb-12 px-2">
                {/* PDF Title */}
                <div className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold">{form.title}</h1>
                    <p className="text-sm text-muted-foreground">Respect Behavior Therapy</p>
                </div>

                {form.sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-4">
                        {/* Section heading */}
                        <h2 className="text-lg font-bold border-b pb-1 text-primary">{section.heading}</h2>

                        {section.items.map((item, iIdx) => {
                            const key = `${sIdx}-${iIdx}`;

                            if (item.type === 'heading') {
                                return (
                                    <h3 key={key} className="text-base font-semibold mt-3">
                                        {(item as HeadingItem).text}
                                    </h3>
                                );
                            }

                            if (item.type === 'text') {
                                return (
                                    <p key={key} className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {(item as TextItem).text}
                                    </p>
                                );
                            }

                            if (item.type === 'field') {
                                const fi = item as FieldItem;
                                if (fi.fieldType === 'textarea') {
                                    return (
                                        <Textarea
                                            key={key}
                                            className="min-h-[100px] text-sm"
                                            placeholder={fi.defaultValue || 'Enter text...'}
                                            value={fields[fi.fieldId] ?? ''}
                                            onChange={(e) => handleFieldChange(fi.fieldId, e.target.value)}
                                        />
                                    );
                                }
                                return (
                                    <Input
                                        key={key}
                                        className="text-sm"
                                        placeholder={fi.defaultValue || 'Enter text...'}
                                        value={fields[fi.fieldId] ?? ''}
                                        onChange={(e) => handleFieldChange(fi.fieldId, e.target.value)}
                                    />
                                );
                            }

                            if (item.type === 'table') {
                                const ti = item as TableItem;
                                return (
                                    <div key={key} className="overflow-x-auto border rounded-md">
                                        <table className="w-full text-sm border-collapse">
                                            <tbody>
                                                {ti.rows.map((row, rIdx) => (
                                                    <tr key={rIdx} className={rIdx === 0 ? 'bg-muted/50 font-medium' : ''}>
                                                        {row.map((cell, cIdx) => (
                                                            <td
                                                                key={cIdx}
                                                                className="border px-3 py-2 align-top"
                                                            >
                                                                {cell.isField && cell.fieldId ? (
                                                                    <Input
                                                                        className="h-8 text-sm border-0 border-b border-dashed bg-transparent px-0 rounded-none focus-visible:ring-0 focus-visible:border-primary"
                                                                        placeholder={cell.text || '...'}
                                                                        value={fields[cell.fieldId] ?? ''}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(cell.fieldId!, e.target.value)
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <span className="whitespace-pre-wrap">{cell.text}</span>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
