"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationService = void 0;
const vscode = __importStar(require("vscode"));
class DecorationService {
    constructor() {
        this.warningDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 200, 0, 0.1)',
            border: '3px solid orange',
            overviewRulerColor: 'orange',
            overviewRulerLane: vscode.OverviewRulerLane.Left
        });
        this.suggestionDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(0, 150, 255, 0.1)',
            border: '3px solid blue',
            overviewRulerColor: 'blue',
            overviewRulerLane: vscode.OverviewRulerLane.Left
        });
    }
    addSuggestions(editor, reviewText) {
        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        if (!config.get('showInlineDecorations')) {
            return;
        }
        // Parse review text for line numbers and issues
        const warnings = [];
        const suggestions = [];
        // Simple parsing - look for patterns like "Line X" or "line X"
        const linePattern = /line\s+(\d+)/gi;
        let match;
        while ((match = linePattern.exec(reviewText)) !== null) {
            const lineNumber = parseInt(match[1]) - 1; // Convert to 0-based
            if (lineNumber >= 0 && lineNumber < editor.document.lineCount) {
                const line = editor.document.lineAt(lineNumber);
                const range = line.range;
                // Determine if it's a warning or suggestion based on context
                const context = reviewText.substring(Math.max(0, match.index - 50), match.index + 50);
                const isWarning = /critical|error|bug|issue|problem/i.test(context);
                const decoration = {
                    range,
                    hoverMessage: this.extractHoverMessage(reviewText, match.index)
                };
                if (isWarning) {
                    warnings.push(decoration);
                }
                else {
                    suggestions.push(decoration);
                }
            }
        }
        editor.setDecorations(this.warningDecoration, warnings);
        editor.setDecorations(this.suggestionDecoration, suggestions);
    }
    extractHoverMessage(text, index) {
        // Extract surrounding context
        const start = Math.max(0, text.lastIndexOf('\n', index - 100));
        const end = text.indexOf('\n\n', index + 100);
        const context = text.substring(start, end > -1 ? end : undefined).trim();
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown('**AI Code Reviewer**\n\n');
        markdown.appendMarkdown(context);
        markdown.isTrusted = true;
        return markdown;
    }
    clearDecorations(editor) {
        editor.setDecorations(this.warningDecoration, []);
        editor.setDecorations(this.suggestionDecoration, []);
    }
    dispose() {
        this.warningDecoration.dispose();
        this.suggestionDecoration.dispose();
    }
}
exports.DecorationService = DecorationService;
//# sourceMappingURL=decorationService.js.map