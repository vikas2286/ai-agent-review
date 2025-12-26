import * as vscode from 'vscode';

export interface ReviewHistoryItem {
    type: string;
    fileName?: string;
    timestamp: Date;
    summary: string;
}

export class HistoryProvider implements vscode.TreeDataProvider<ReviewHistoryItem> {

    private _onDidChangeTreeData = new vscode.EventEmitter<ReviewHistoryItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private history: ReviewHistoryItem[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadHistory();
    }

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
        this.saveHistory();
    }

    addReview(item: ReviewHistoryItem) {
        this.history.unshift(item);
        this.refresh();
    }

    getTreeItem(item: ReviewHistoryItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            item.fileName || 'Review',
            vscode.TreeItemCollapsibleState.None
        );
        treeItem.description = item.summary;
        treeItem.tooltip = item.timestamp.toLocaleString();
        return treeItem;
    }

    getChildren(): Thenable<ReviewHistoryItem[]> {
        return Promise.resolve(this.history);
    }

    private saveHistory() {
        this.context.globalState.update('reviewHistory', this.history);
    }

    private loadHistory() {
        this.history = this.context.globalState.get<ReviewHistoryItem[]>('reviewHistory', []);
    }
}
