import * as vscode from 'vscode';
import {SnippetSyncStatus} from '../types';

export function changeStatus(statusBarItem: vscode.StatusBarItem, status: SnippetSyncStatus): vscode.StatusBarItem {
  switch (status) {
    case SnippetSyncStatus.ok:
      statusBarItem.text = '$(check) Snippets';
      statusBarItem.tooltip = 'Snippet Sync: Synced';
      break;
    case SnippetSyncStatus.working:
      statusBarItem.text = '$(sync) Snippets';
      statusBarItem.tooltip = 'Snippet Sync: Syncing...';
      break;
    case SnippetSyncStatus.error:
      statusBarItem.text = '$(alert) Snippets';
      statusBarItem.tooltip = "Snippet Sync: Problem syncing files";
      break;
    case SnippetSyncStatus.noFiles:
      statusBarItem.text = '$(sync-ignored) Snippets';
      statusBarItem.tooltip = 'Snippet Sync: No files configured';
      break;
    }

    return statusBarItem;
};