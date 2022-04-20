import * as vscode from 'vscode';
import {retrieveSnippets} from './snippets/remoteSnippetFiles';
import { deleteLocalSnippetFiles, writeSnippetFiles } from './snippets/localSnippetFiles';
import { WriteSuccessResult, HttpFailResult, HttpErrorResult, WriteFailResult } from './types';
import { getCurrentGitHubSessionToken } from './auth/sessionToken';
import { showSnippetFileWriteNotifications } from './notifications/snippetFileWriteNotifications';
import config from './config';

import path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({subscriptions, globalStorageUri}: vscode.ExtensionContext) {
  console.log('shalom world, "snippet-sync-vscode" is now active');

  const snippetsDir: string = path.resolve(globalStorageUri.path, '../..', 'snippets');

	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
  statusBarItem.tooltip = 'Snippet Sync';
  statusBarItem.text = 'Snippets';
  statusBarItem.show();

  autoSyncSnippets();

  let syncSnippetFiles = vscode.commands.registerCommand('snippet-sync-vscode.syncSnippetFiles', async () => {
    console.log('"snippet-sync-vscode.syncSnippetFiles" command called');
    statusBarItem = snippetSyncWorking(statusBarItem);
    const snippetFilesList: string[] = vscode.workspace.getConfiguration('snippetSync').get<string[]>('snippetFiles') || [];
    deleteLocalSnippetFiles(snippetsDir);

    const authToken = await getCurrentGitHubSessionToken();

    if (snippetFilesList.length === 0) {
      vscode.window.showWarningMessage('No snippet files configured. Add snippet files in the settings in "Snippet Sync: Snippet Files".');
      statusBarItem = snippetSyncNoFiles(statusBarItem);
      return;
    }
    const httpFetchResults = await retrieveSnippets(snippetsDir, snippetFilesList, authToken);
    const writeResults = writeSnippetFiles(snippetsDir, httpFetchResults.successes);
    showSnippetFileWriteNotifications(httpFetchResults, writeResults);
    if (httpFetchResults.fails.length > 0) {
      statusBarItem = snippetSyncError(statusBarItem);
    } else {
      statusBarItem = snippetSyncOk(statusBarItem);
    }
  });

  let signInToGitHub = vscode.commands.registerCommand('snippet-sync-vscode.signInToGitHub', async () => {
    console.log('"snippet-sync-vscode.signInToGitHub" command called');

      const getSession = vscode.authentication.getSession('github', ['repo'], {createIfNone: true})
        .then(() => {
          vscode.window.showInformationMessage("Snippet Sync is signed in to GitHub");
          console.log('GitHub session created successfully');
        });

      // Set timeout for the previous promise
      const timeout = new Promise((resolve) => {
        setTimeout(() => {
          resolve('timeout');
        }, 10000); // 10s
      });

      // If the session creation takes too long, show a warning message.
      // This doesn't block the extension from joining the session,
      // but it at least gives the user an idea of when they can try again.
      const result = await Promise.race([getSession, timeout]);
      if (result === 'timeout') {
        vscode.window.showWarningMessage("Snippet Sync couldn't sign into GitHub. Wait a minute before trying again.");
        console.log('GitHub signin timed out');
      }
  });

  subscriptions.push(syncSnippetFiles, signInToGitHub, statusBarItem);
}

// this method is called when your extension is deactivated
export function deactivate() {}

export function autoSyncSnippets() {
  if (vscode.workspace.getConfiguration('snippetSync').get<boolean>('autoSyncSnippetFiles') === true) {
    console.log(`Auto syncing snippets. Next sync in ${config.autoSyncTimeInterval / 1000 / 60} minutes.`);
    vscode.commands.executeCommand('snippet-sync-vscode.syncSnippetFiles');
  }

  setTimeout(autoSyncSnippets, config.autoSyncTimeInterval);
}

export function snippetSyncWorking(statusBarItem: vscode.StatusBarItem): vscode.StatusBarItem {
  statusBarItem.text = '$(sync) Snippets';
  statusBarItem.tooltip = 'Snippet Sync: Syncing...';
  return statusBarItem;
}

export function snippetSyncOk(statusBarItem: vscode.StatusBarItem): vscode.StatusBarItem {
  statusBarItem.text = '$(check) Snippets';
  statusBarItem.tooltip = 'Snippet Sync: Synced';
  return statusBarItem;
}

export function snippetSyncError(statusBarItem: vscode.StatusBarItem): vscode.StatusBarItem {
  statusBarItem.text = '$(alert) Snippets';
  statusBarItem.tooltip = "Snippet Sync: Problem syncing files";
  return statusBarItem;
}

export function snippetSyncNoFiles(statusBarItem: vscode.StatusBarItem): vscode.StatusBarItem {
  statusBarItem.text = '$(sync-ignored) Snippets';
  statusBarItem.tooltip = 'Snippet Sync: No files configured';
  return statusBarItem;
}