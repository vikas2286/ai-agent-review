import * as vscode from 'vscode';

export class DecorationService {
    private warningDecoration: vscode.TextEditorDecorationType;
    private suggestionDecoration: vscode.TextEditorDecorationType;

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

    addSuggestions(editor: vscode.TextEditor, reviewText: string) {
        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        if (!config.get('showInlineDecorations')) {
            return;
        }

        // Parse review text for line numbers and issues
        const warnings: vscode.DecorationOptions[] = [];
        const suggestions: vscode.DecorationOptions[] = [];

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

                const decoration: vscode.DecorationOptions = {
                    range,
                    hoverMessage: this.extractHoverMessage(reviewText, match.index)
                };

                if (isWarning) {
                    warnings.push(decoration);
                } else {
                    suggestions.push(decoration);
                }
            }
        }

        editor.setDecorations(this.warningDecoration, warnings);
        editor.setDecorations(this.suggestionDecoration, suggestions);
    }

    private extractHoverMessage(text: string, index: number): vscode.MarkdownString {
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

    clearDecorations(editor: vscode.TextEditor) {
        editor.setDecorations(this.warningDecoration, []);
        editor.setDecorations(this.suggestionDecoration, []);
    }

    dispose() {
        this.warningDecoration.dispose();
        this.suggestionDecoration.dispose();
    }
}