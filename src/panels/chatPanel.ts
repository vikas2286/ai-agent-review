import * as vscode from 'vscode';
import { AIService } from '../services/aiService';
import { SYSTEM_INSTRUCTIONS, PROMPTS } from '../prompts';

export class ChatPanel {
    private static currentPanel: vscode.WebviewPanel | undefined;
    private static messages: Array<{role: string, content: string}> = [];

    public static render(context: vscode.ExtensionContext) {
        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel.reveal(vscode.ViewColumn.Beside);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'aiChat',
                '💬 AI Code Chat',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            ChatPanel.currentPanel = panel;
            ChatPanel.messages = [];

            panel.webview.html = ChatPanel.getWebviewContent();

            panel.onDidDispose(() => {
                ChatPanel.currentPanel = undefined;
                ChatPanel.messages = [];
            });

            // Handle messages from webview
            panel.webview.onDidReceiveMessage(
                async message => {
                    if (message.command === 'send') {
                        await ChatPanel.handleUserMessage(context, panel, message.text);
                    } else if (message.command === 'clear') {
                        ChatPanel.messages = [];
                        panel.webview.postMessage({ command: 'clearChat' });
                   } else if (message.command === 'includeCode') {

    vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: false,
        openLabel: 'Include File'
    }).then(async result => {

        if (!result || result.length === 0) {
            return;
        }

        const fileUri = result[0];
        const document = await vscode.workspace.openTextDocument(fileUri);

        const code = document.getText();
        const language = document.languageId;

        panel.webview.postMessage({
            command: 'addContext',
            code,
            language
        });
    });
}

                },
                undefined,
                context.subscriptions
            );
        }
    }

    private static async handleUserMessage(
        context: vscode.ExtensionContext,
        panel: vscode.WebviewPanel,
        userMessage: string
    ) {
        // Add user message
        ChatPanel.messages.push({ role: 'user', content: userMessage });
        panel.webview.postMessage({
            command: 'addMessage',
            role: 'user',
            content: userMessage
        });

        // Show typing indicator
        panel.webview.postMessage({ command: 'showTyping' });

        try {
            const aiService = new AIService(context);
            
            // Get current code context if available
            const editor = vscode.window.activeTextEditor;
            let systemInstruction = SYSTEM_INSTRUCTIONS.CODE_REVIEWER;
            
            if (editor && ChatPanel.messages.length === 1) {
                // First message - include code context
                const code = editor.document.getText();
                const language = editor.document.languageId;
                systemInstruction = PROMPTS.CHAT_CONTEXT(code, language);
            }

            const response = await aiService.chat(
                ChatPanel.messages,
                systemInstruction
            );

            // Add assistant response
            ChatPanel.messages.push({ role: 'assistant', content: response });
            panel.webview.postMessage({
                command: 'addMessage',
                role: 'assistant',
                content: response
            });

        } catch (error: any) {
            panel.webview.postMessage({
                command: 'addMessage',
                role: 'error',
                content: `Error: ${error.message}`
            });
        } finally {
            panel.webview.postMessage({ command: 'hideTyping' });
        }
    }
    private static escapeForTemplate(str: string): string {
    return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}


    private static getWebviewContent(): string {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Code Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        .chat-header {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 15px;
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-header h2 {
            font-size: 18px;
            color: var(--vscode-textLink-foreground);
        }

        .header-buttons {
            display: flex;
            gap: 8px;
        }

        .header-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }

        .header-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .message {
            display: flex;
            gap: 10px;
            max-width: 85%;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .message.user {
            align-self: flex-end;
            flex-direction: row-reverse;
        }

        .message.assistant {
            align-self: flex-start;
        }

        .message.error {
            align-self: center;
            background: rgba(255, 81, 73, 0.1);
            border: 1px solid rgba(255, 81, 73, 0.3);
            padding: 10px;
            border-radius: 6px;
            color: #f85149;
        }

        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .user .avatar {
            background: var(--vscode-textLink-foreground);
        }

        .assistant .avatar {
            background: var(--vscode-button-background);
        }

        .message-content {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 12px 16px;
            border-radius: 12px;
            line-height: 1.6;
            word-wrap: break-word;
        }

        .user .message-content {
            background: var(--vscode-textLink-foreground);
            color: white;
        }

        .message-content code {
            background: rgba(0, 0, 0, 0.2);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', monospace;
            font-size: 13px;
        }

        .message-content pre {
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 10px 0;
        }

        .message-content pre code {
            background: none;
            padding: 0;
        }

        .typing-indicator {
            display: none;
            align-self: flex-start;
            padding: 12px 16px;
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 12px;
        }

        .typing-indicator.active {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        .dot {
            width: 8px;
            height: 8px;
            background: var(--vscode-textLink-foreground);
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-10px); opacity: 1; }
        }

        .input-container {
            border-top: 1px solid var(--vscode-panel-border);
            padding: 15px;
            background: var(--vscode-editor-background);
        }

        .input-wrapper {
            display: flex;
            gap: 8px;
            align-items: flex-end;
        }

        textarea {
            flex: 1;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            padding: 10px 12px;
            font-size: 14px;
            font-family: inherit;
            resize: none;
            max-height: 120px;
            line-height: 1.5;
        }

        textarea:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .send-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s;
        }

        .send-btn:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
        }

        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .welcome-message {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            padding: 40px 20px;
        }

        .welcome-message h3 {
            color: var(--vscode-textLink-foreground);
            margin-bottom: 10px;
        }

        .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            margin-top: 20px;
        }

        .quick-action {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            padding: 8px 16px;
            border-radius: 16px;
            cursor: pointer;
            font-size: 13px;
        }

        .quick-action:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
    </style>
</head>
<body>
    <div class="chat-header">
        <h2>💬 AI Code Chat</h2>
        <div class="header-buttons">
            <button class="header-btn" onclick="includeCode()">📎 Include Code</button>
            <button class="header-btn" onclick="clearChat()">🗑️ Clear</button>
        </div>
    </div>

    <div class="messages-container" id="messages">
        <div class="welcome-message">
            <h3>👋 Hello! I'm your AI Code Assistant</h3>
            <p>Ask me anything about your code, request reviews, or get help with debugging.</p>
            <div class="quick-actions">
                <button class="quick-action" onclick="sendQuickMessage('Review my current file')">Review my code</button>
                <button class="quick-action" onclick="sendQuickMessage('Find bugs in my code')">Find bugs</button>
                <button class="quick-action" onclick="sendQuickMessage('Explain this code')">Explain code</button>
                <button class="quick-action" onclick="sendQuickMessage('Suggest improvements')">Suggest improvements</button>
            </div>
        </div>
        <div class="typing-indicator" id="typing">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </div>

    <div class="input-container">
        <div class="input-wrapper">
            <textarea 
                id="messageInput" 
                placeholder="Ask me anything about your code..."
                rows="1"
                onkeydown="handleKeyPress(event)"
                oninput="autoResize(this)"
            ></textarea>
            <button class="send-btn" id="sendBtn" onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        let typingIndicator = document.getElementById('typing');

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'addMessage':
                    addMessage(message.role, message.content);
                    break;
               case 'showTyping':
    if (!typingIndicator) typingIndicator = document.getElementById('typing');
    typingIndicator && typingIndicator.classList.add('active');
    scrollToBottom();
    break;

case 'hideTyping':
    if (!typingIndicator) typingIndicator = document.getElementById('typing');
    typingIndicator && typingIndicator.classList.remove('active');
    break;

case 'clearChat':
    clearMessages();
    break;

                case 'addContext':
    addMessage(
        'assistant',
        '📎 <strong>Included File</strong> (' + message.language + ')<br><br>' +
        '<pre><code>' + escapeHtml(message.code) + '</code></pre><br>' +
        'Ask me anything about this file.'
    );

    messageInput.value = '';
    messageInput.focus();
    break;

            }
        });

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            vscode.postMessage({
                command: 'send',
                text: text
            });

            messageInput.value = '';
            messageInput.style.height = 'auto';
            messageInput.focus();
        }

        function sendQuickMessage(text) {
            messageInput.value = text;
            sendMessage();
        }

        function addMessage(role, content) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;

            if (role !== 'error') {
                const avatar = document.createElement('div');
                avatar.className = 'avatar';
                avatar.textContent = role === 'user' ? '👤' : '🤖';
                messageDiv.appendChild(avatar);
            }

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            
            // Format content
            const formattedContent = formatMessage(content);
            contentDiv.innerHTML = formattedContent;
            
            messageDiv.appendChild(contentDiv);
            
            // Remove welcome message if exists
            const welcome = messagesContainer.querySelector('.welcome-message');
            if (welcome) welcome.remove();
            
            messagesContainer.insertBefore(messageDiv, typingIndicator);
            scrollToBottom();
        }

        function formatMessage(text) {
            // Convert code blocks
            text = text.replace(/\`\`\`(\\w+)?\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
                return \`<pre><code>\${escapeHtml(code.trim())}</code></pre>\`;
            });
            
            // Convert inline code
            text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
            
            // Convert markdown bold
            text = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
            
            // Convert markdown italic
            text = text.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
            
            // Convert line breaks
            text = text.replace(/\\n/g, '<br>');
            
            return text;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function clearChat() {
            vscode.postMessage({ command: 'clear' });
        }

     function clearMessages() {
    const allMessages = messagesContainer.querySelectorAll('.message, .welcome-message');
    allMessages.forEach(m => m.remove());

    scrollToBottom();

    messageInput.value = '';
    messageInput.focus();
}


        function includeCode() {
            vscode.postMessage({ command: 'includeCode' });
        }

        function scrollToBottom() {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }

        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }

        // Focus input on load
        messageInput.focus();
    </script>
</body>
</html>`;
        return htmlContent;
    }
}