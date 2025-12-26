import * as vscode from 'vscode';

interface ReviewData {
    title: string;
    content: string;
    type: string;
    metadata?: any;
}

export class ReviewPanel {
    private static currentPanel: vscode.WebviewPanel | undefined;

    public static render(context: vscode.ExtensionContext, data: ReviewData) {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ReviewPanel.currentPanel) {
            ReviewPanel.currentPanel.reveal(columnToShowIn);
            ReviewPanel.currentPanel.webview.html = ReviewPanel.getWebviewContent(data);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'aiCodeReview',
                data.title,
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: []
                }
            );

            panel.webview.html = ReviewPanel.getWebviewContent(data);
            ReviewPanel.currentPanel = panel;

            panel.onDidDispose(() => {
                ReviewPanel.currentPanel = undefined;
            });

            // Handle messages from webview
            panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'copy':
                            await vscode.env.clipboard.writeText(message.text);
                            vscode.window.showInformationMessage('Copied to clipboard!');
                            break;
                        case 'apply':
                            ReviewPanel.applyCodeChange(message.code);
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );
        }
    }

    private static applyCodeChange(code: string) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                const selection = editor.selection;
                if (!selection.isEmpty) {
                    editBuilder.replace(selection, code);
                } else {
                    const position = editor.selection.active;
                    editBuilder.insert(position, code);
                }
            });
            vscode.window.showInformationMessage('Code applied!');
        }
    }

    private static getWebviewContent(data: ReviewData): string {
        // Convert markdown-style formatting to HTML
        const formattedContent = data.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\n/g, '<br>');

        // Extract code blocks
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let contentWithCodeBlocks = formattedContent;
        let match;
        
        while ((match = codeBlockRegex.exec(formattedContent)) !== null) {
            const language = match[1] || '';
            const code = match[2];
            const codeHtml = `
                <div class="code-block">
                    <div class="code-header">
                        <span class="language">${language}</span>
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        ${data.type === 'tests' || data.type === 'documentation' ? 
                            '<button class="apply-btn" onclick="applyCode(this)">Apply</button>' : ''}
                    </div>
                    <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
                </div>
            `;
            contentWithCodeBlocks = contentWithCodeBlocks.replace(match[0], codeHtml);
        }

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .header {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid var(--vscode-textLink-foreground);
        }

        .header h1 {
            color: var(--vscode-textLink-foreground);
            font-size: 24px;
            margin-bottom: 10px;
        }

        .metadata {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }

        .metadata span {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .content {
            background: var(--vscode-editor-background);
            padding: 25px;
            border-radius: 8px;
            border: 1px solid var(--vscode-panel-border);
        }

        h1, h2, h3 {
            color: var(--vscode-textLink-foreground);
            margin-top: 20px;
            margin-bottom: 10px;
        }

        h1 { font-size: 28px; }
        h2 { font-size: 22px; }
        h3 { font-size: 18px; }

        p {
            margin-bottom: 15px;
        }

        code {
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 14px;
        }

        .code-block {
            margin: 20px 0;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid var(--vscode-panel-border);
        }

        .code-header {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .language {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--vscode-textLink-foreground);
        }

        .copy-btn, .apply-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 8px;
            transition: background 0.2s;
        }

        .copy-btn:hover, .apply-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .apply-btn {
            background: var(--vscode-textLink-foreground);
        }

        pre {
            margin: 0;
            padding: 15px;
            overflow-x: auto;
            background: var(--vscode-textCodeBlock-background);
        }

        pre code {
            background: transparent;
            padding: 0;
            font-size: 13px;
            line-height: 1.5;
        }

        .severity-critical {
            color: #f85149;
            font-weight: bold;
        }

        .severity-high {
            color: #ff8c00;
            font-weight: bold;
        }

        .severity-medium {
            color: #f1e05a;
            font-weight: bold;
        }

        .severity-low {
            color: #7ee787;
            font-weight: bold;
        }

        .issue-card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 15px;
            margin: 15px 0;
            border-radius: 6px;
            border-left: 4px solid var(--vscode-editorWarning-foreground);
        }

        .timestamp {
            text-align: right;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid var(--vscode-panel-border);
        }

        strong {
            color: var(--vscode-textLink-activeForeground);
        }

        em {
            color: var(--vscode-textPreformat-foreground);
            font-style: italic;
        }

        ul, ol {
            margin-left: 20px;
            margin-bottom: 15px;
        }

        li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.title}</h1>
            <div class="metadata">
                <span>📝 ${data.type.replace('-', ' ').toUpperCase()}</span>
                ${data.metadata?.language ? `<span>💻 ${data.metadata.language}</span>` : ''}
                ${data.metadata?.fileName ? `<span>📄 ${data.metadata.fileName}</span>` : ''}
                ${data.metadata?.fileCount ? `<span>📁 ${data.metadata.fileCount} files</span>` : ''}
            </div>
        </div>

        <div class="content">
            ${contentWithCodeBlocks}
        </div>

        <div class="timestamp">
            Generated: ${new Date().toLocaleString()}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function copyCode(button) {
            const codeBlock = button.closest('.code-block');
            const code = codeBlock.querySelector('code').textContent;
            vscode.postMessage({
                command: 'copy',
                text: code
            });
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        }

        function applyCode(button) {
            const codeBlock = button.closest('.code-block');
            const code = codeBlock.querySelector('code').textContent;
            vscode.postMessage({
                command: 'apply',
                code: code
            });
        }
    </script>
</body>
</html>`;
    }

    private static escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}