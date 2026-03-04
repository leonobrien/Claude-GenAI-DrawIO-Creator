/**
 * XmlFixer -- Auto-correction pipeline for AI-generated draw.io XML.
 *
 * Applies fixes iteratively (up to MAX_ROUNDS) to repair common
 * AI generation errors. Derived from the reference implementation's
 * autoFixXml pipeline.
 */
const MAX_ROUNDS = 10;
/**
 * Fixes JSON-escaped XML (e.g., \" to ").
 */
function fixJsonEscaping(xml) {
    const fixed = xml.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Removes CDATA wrappers.
 */
function removeCdataWrapper(xml) {
    const fixed = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Strips trailing LLM wrapper/artifact tags.
 */
function stripLlmArtifacts(xml) {
    let fixed = xml;
    // Remove common LLM wrapper patterns
    fixed = fixed.replace(/<antArtifact[^>]*>[\s\S]*?<\/antArtifact>/gi, '');
    fixed = fixed.replace(/<\/?antArtifact[^>]*>/gi, '');
    // Remove markdown code fences
    fixed = fixed.replace(/^```xml\s*/gm, '');
    fixed = fixed.replace(/^```\s*$/gm, '');
    return { xml: fixed.trim(), applied: fixed.trim() !== xml };
}
/**
 * Escapes bare & characters that are not valid entity references.
 */
function escapeAmpersands(xml) {
    const fixed = xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Fixes double-escaped entities (e.g., &amp;quot; -> &quot;).
 */
function fixDoubleEscaped(xml) {
    const fixed = xml
        .replace(/&amp;quot;/g, '&quot;')
        .replace(/&amp;lt;/g, '&lt;')
        .replace(/&amp;gt;/g, '&gt;')
        .replace(/&amp;apos;/g, '&apos;')
        .replace(/&amp;amp;/g, '&amp;');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Fixes <Cell> tags to <mxCell> (common LLM mistake).
 */
function fixCellTags(xml) {
    const fixed = xml
        .replace(/<Cell\b/g, '<mxCell')
        .replace(/<\/Cell>/g, '</mxCell>');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Fixes malformed closing tags (e.g., </tag/> -> </tag>).
 */
function fixMalformedClosingTags(xml) {
    const fixed = xml.replace(/<\/(\w+)\/>/g, '</$1>');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Fixes missing spaces between attributes (e.g., id="1"value="X" -> id="1" value="X").
 */
function fixMissingAttributeSpaces(xml) {
    const fixed = xml.replace(/"(\w+)="/g, '" $1="');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Removes garbage text before the first XML tag.
 */
function removeLeadingGarbage(xml) {
    const firstTagIndex = xml.indexOf('<');
    if (firstTagIndex > 0) {
        const fixed = xml.substring(firstTagIndex);
        return { xml: fixed, applied: true };
    }
    return { xml, applied: false };
}
/**
 * Fixes common closing tag typos.
 */
function fixClosingTagTypos(xml) {
    const fixed = xml
        .replace(/<\/mxElement>/g, '</mxCell>')
        .replace(/<\/Geometry>/g, '</mxGeometry>')
        .replace(/<\/geometry>/g, '</mxGeometry>');
    return { xml: fixed, applied: fixed !== xml };
}
/**
 * Generates unique suffixed IDs for duplicate mxCell IDs.
 */
function fixDuplicateIds(xml) {
    const idCounts = new Map();
    let anyFixed = false;
    const fixed = xml.replace(/<mxCell([^>]*)\sid="([^"]*)"([^>]*)/g, (match, before, id, after) => {
        const count = (idCounts.get(id) ?? 0) + 1;
        idCounts.set(id, count);
        if (count > 1) {
            anyFixed = true;
            return `<mxCell${before} id="${id}_dup${count - 1}"${after}`;
        }
        return match;
    });
    return { xml: fixed, applied: anyFixed };
}
const FIX_PIPELINE = [
    { name: 'Remove leading garbage', fix: removeLeadingGarbage },
    { name: 'Fix JSON escaping', fix: fixJsonEscaping },
    { name: 'Remove CDATA wrapper', fix: removeCdataWrapper },
    { name: 'Strip LLM artifacts', fix: stripLlmArtifacts },
    { name: 'Fix <Cell> to <mxCell>', fix: fixCellTags },
    { name: 'Fix closing tag typos', fix: fixClosingTagTypos },
    { name: 'Fix malformed closing tags', fix: fixMalformedClosingTags },
    { name: 'Fix missing attribute spaces', fix: fixMissingAttributeSpaces },
    { name: 'Fix double-escaped entities', fix: fixDoubleEscaped },
    { name: 'Escape bare ampersands', fix: escapeAmpersands },
    { name: 'Fix duplicate IDs', fix: fixDuplicateIds },
];
/**
 * Applies the full fix pipeline to the XML string.
 * Runs iteratively up to MAX_ROUNDS until no more fixes are applied.
 *
 * @param xml - The XML string to fix
 * @returns FixResult with the corrected XML, list of fixes applied, and remaining errors
 */
export function fixXml(xml) {
    let current = xml;
    const allFixes = [];
    for (let round = 0; round < MAX_ROUNDS; round++) {
        let anyApplied = false;
        for (const step of FIX_PIPELINE) {
            const result = step.fix(current);
            if (result.applied) {
                allFixes.push(`${step.name} (round ${round + 1})`);
                current = result.xml;
                anyApplied = true;
            }
        }
        if (!anyApplied) {
            break;
        }
    }
    return {
        xml: current,
        fixesApplied: allFixes,
        remainingErrors: [],
    };
}
//# sourceMappingURL=xml-fixer.js.map