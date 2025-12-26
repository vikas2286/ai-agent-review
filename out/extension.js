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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
// const { GoogleGenAI }  = require("@google/genai"); // This import is not used in this file.
const prompts_1 = require("./prompts");
const reviewPanel_1 = require("./panels/reviewPanel");
const chatPanel_1 = require("./panels/chatPanel");
const historyProvider_1 = require("./providers/historyProvider");
const aiService_1 = require("./services/aiService");
const decorationService_1 = require("./services/decorationService");
function activate(context) {
    console.log('AI Code Reviewer Pro is now active!');
    // Initialize services
    const aiService = new aiService_1.AIService(context);
    const decorationService = new decorationService_1.DecorationService();
    const historyProvider = new historyProvider_1.HistoryProvider(context);
    // Register Tree View
    vscode.window.registerTreeDataProvider('aiCodeReviewer.historyView', historyProvider);
    // Status Bar
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = 'aiCodeReviewer.setApiKey';
    context.subscriptions.push(statusBar);
    updateStatusBar(context, statusBar);
    const openChatCommand = vscode.commands.registerCommand('aiCodeReviewer.openChat', () => {
        chatPanel_1.ChatPanel.render(context);
    });
    context.subscriptions.push(openChatCommand);
    // Command: Set API Key
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.setApiKey', async () => {
        const key = await vscode.window.showInputBox({
            prompt: 'Enter your Gemini API Key (from https://aistudio.google.com/app/apikey)',
            password: true,
            ignoreFocusOut: true,
            placeHolder: 'AIza...',
            validateInput: (value) => {
                return value && value.startsWith('AIza') ? null : 'Invalid API key format';
            }
        });
        if (key && key.trim()) {
            await context.secrets.store('gemini_api_key', key.trim());
            vscode.window.showInformationMessage(prompts_1.SUCCESS_MESSAGES.API_KEY_SET);
            updateStatusBar(context, statusBar);
        }
    }));
    // Command: Clear API Key
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.clearApiKey', async () => {
        const confirm = await vscode.window.showWarningMessage('Are you sure you want to remove the API key?', 'Yes', 'No');
        if (confirm === 'Yes') {
            await context.secrets.delete('gemini_api_key');
            vscode.window.showInformationMessage(prompts_1.SUCCESS_MESSAGES.API_KEY_CLEARED);
            updateStatusBar(context, statusBar);
        }
    }));
    // Helper to get code from selection or entire document
    const getCodeToAnalyze = (editor) => {
        return editor.selection.isEmpty
            ? editor.document.getText()
            : editor.document.getText(editor.selection);
    };
    // Command: Review Current File
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.reviewCurrentFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_ACTIVE_FILE);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'AI Code Reviewer',
            cancellable: true
        }, async (progress, token) => {
            progress.report({ message: 'Reviewing file...' });
            try {
                const document = editor.document;
                const code = document.getText();
                const language = document.languageId;
                const fileName = document.fileName.split(/[\\/]/).pop() || 'file';
                const prompt = prompts_1.PROMPTS.REVIEW_FILE(code, language, fileName);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.CODE_REVIEWER, token);
                // Show result in panel
                reviewPanel_1.ReviewPanel.render(context, {
                    title: `Review: ${fileName}`,
                    content: result,
                    type: 'file-review',
                    metadata: { fileName, language }
                });
                // Add to history
                historyProvider.addReview({
                    type: 'file',
                    fileName,
                    timestamp: new Date(),
                    summary: result.split('\n')[0]
                });
                vscode.window.showInformationMessage(prompts_1.SUCCESS_MESSAGES.REVIEW_COMPLETE);
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Review Selection
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.reviewSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_SELECTION);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Reviewing selection...',
            cancellable: true
        }, async (progress, token) => {
            try {
                const selection = editor.document.getText(editor.selection);
                const language = editor.document.languageId;
                const prompt = prompts_1.PROMPTS.REVIEW_SELECTION(selection, language);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.CODE_REVIEWER, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Selection Review',
                    content: result,
                    type: 'selection-review',
                    metadata: { language }
                });
                // Add inline decorations
                decorationService.addSuggestions(editor, result);
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Explain Code
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.explainCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_SELECTION);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Explaining code...',
            cancellable: true
        }, async (progress, token) => {
            try {
                const selection = editor.document.getText(editor.selection);
                const language = editor.document.languageId;
                const prompt = prompts_1.PROMPTS.EXPLAIN_CODE(selection, language);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.CODE_EXPLAINER, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Code Explanation',
                    content: result,
                    type: 'explanation',
                    metadata: { language }
                });
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Find Bugs
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.findBugs', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_ACTIVE_FILE);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Finding bugs...',
            cancellable: true
        }, async (progress, token) => {
            try {
                const code = getCodeToAnalyze(editor);
                const language = editor.document.languageId;
                const prompt = prompts_1.PROMPTS.FIND_BUGS(code, language);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.BUG_FINDER, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Bug Analysis',
                    content: result,
                    type: 'bug-analysis',
                    metadata: { language }
                });
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Security Check
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.checkSecurity', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_ACTIVE_FILE);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Performing security audit...',
            cancellable: true
        }, async (progress, token) => {
            try {
                const code = getCodeToAnalyze(editor);
                const language = editor.document.languageId;
                const prompt = prompts_1.PROMPTS.CHECK_SECURITY(code, language);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.SECURITY_AUDITOR, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Security Audit',
                    content: result,
                    type: 'security-audit',
                    metadata: { language }
                });
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Suggest Improvements
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.suggestImprovements', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_ACTIVE_FILE);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing improvements...',
            cancellable: true
        }, async (progress, token) => {
            try {
                const code = getCodeToAnalyze(editor);
                const language = editor.document.languageId;
                const prompt = prompts_1.PROMPTS.SUGGEST_IMPROVEMENTS(code, language);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.CODE_REVIEWER, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Improvement Suggestions',
                    content: result,
                    type: 'improvements',
                    metadata: { language }
                });
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Generate Tests
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.generateTests', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_ACTIVE_FILE);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        // Ask for test framework
        const framework = await vscode.window.showQuickPick(['Jest', 'Mocha', 'Pytest', 'JUnit', 'NUnit', 'Other'], { placeHolder: 'Select testing framework (optional)' });
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating tests...',
            cancellable: true
        }, async (progress, token) => {
            try {
                const code = getCodeToAnalyze(editor);
                const language = editor.document.languageId;
                const prompt = prompts_1.PROMPTS.GENERATE_TESTS(code, language, framework);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.TEST_GENERATOR, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Generated Tests',
                    content: result,
                    type: 'tests',
                    metadata: { language, framework }
                });
                vscode.window.showInformationMessage(prompts_1.SUCCESS_MESSAGES.TESTS_GENERATED);
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Add Documentation
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.addComments', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_ACTIVE_FILE);
            return;
        }
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Adding documentation...',
            cancellable: true
        }, async (progress, token) => {
            try {
                const code = getCodeToAnalyze(editor);
                const language = editor.document.languageId;
                const prompt = prompts_1.PROMPTS.ADD_DOCUMENTATION(code, language);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.DOCUMENTATION_WRITER, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Documented Code',
                    content: result,
                    type: 'documentation',
                    metadata: { language }
                });
                vscode.window.showInformationMessage(prompts_1.SUCCESS_MESSAGES.DOCS_ADDED);
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Constants for workspace review limits
    const MAX_WORKSPACE_FILES = 100;
    const MAX_FILE_CONTENT_SIZE = 5000; // characters
    // Command: Review Workspace
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.reviewWorkspace', async () => {
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'AI Code Reviewer',
            cancellable: true
        }, async (progress, token) => {
            progress.report({ message: 'Scanning workspace...' });
            try {
                // Find all code files
                const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,cpp,cs,go,rs,php,rb}', '**/node_modules/**', MAX_WORKSPACE_FILES // Limit to MAX_WORKSPACE_FILES files
                );
                progress.report({ message: `Found ${files.length} files. Analyzing...` });
                // Read file contents
                const fileContents = new Map();
                for (const file of files) {
                    // Check for cancellation before reading each file
                    if (token.isCancellationRequested) {
                        vscode.window.showInformationMessage('Workspace review cancelled.');
                        return;
                    }
                    const content = await vscode.workspace.fs.readFile(file);
                    fileContents.set(file.fsPath, Buffer.from(content).toString('utf8').substring(0, MAX_FILE_CONTENT_SIZE) // Limit size
                    );
                }
                const filesList = files.map(f => f.fsPath);
                const prompt = prompts_1.PROMPTS.WORKSPACE_REVIEW(filesList, fileContents);
                const result = await aiService.analyze(prompt, prompts_1.SYSTEM_INSTRUCTIONS.CODE_REVIEWER, token);
                reviewPanel_1.ReviewPanel.render(context, {
                    title: 'Workspace Review',
                    content: result,
                    type: 'workspace-review',
                    metadata: { fileCount: files.length }
                });
            }
            catch (error) {
                let errorMessage = 'An unknown error occurred.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.API_ERROR(errorMessage));
            }
        });
    }));
    // Command: Open Chat
    context.subscriptions.push(vscode.commands.registerCommand('aiCodeReviewer.chat', async () => {
        const apiKey = await context.secrets.get('gemini_api_key');
        if (!apiKey) {
            promptForApiKey();
            return;
        }
        chatPanel_1.ChatPanel.render(context);
    }));
    // Auto-review on save (if enabled)
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async (document) => {
        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        if (config.get('autoReviewOnSave')) {
            // Ensure there's an active editor for the saved document to trigger reviewCurrentFile
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.uri.toString() === document.uri.toString()) {
                vscode.commands.executeCommand('aiCodeReviewer.reviewCurrentFile');
            }
        }
    }));
}
async function updateStatusBar(context, statusBar) {
    const apiKey = await context.secrets.get('gemini_api_key');
    statusBar.text = apiKey ? '$(check) AI Reviewer Ready' : '$(key) Set API Key';
    statusBar.tooltip = apiKey ? 'AI Code Reviewer is ready' : 'Click to set Gemini API Key';
    statusBar.show();
}
function promptForApiKey() {
    vscode.window.showErrorMessage(prompts_1.ERROR_MESSAGES.NO_API_KEY, 'Set API Key').then(selection => {
        if (selection === 'Set API Key') {
            vscode.commands.executeCommand('aiCodeReviewer.setApiKey');
        }
    });
}
function deactivate() {
    console.log('AI Code Reviewer Pro is now deactivated');
}
//# sourceMappingURL=extension.js.map