import * as vscode from 'vscode';
import {retrieveSnippets} from './snippets/remoteSnippetFiles';
import { deleteLocalSnippetFiles, writeSnippetFiles } from './snippets/localSnippetFiles';
import { WriteSuccessResult, HttpFailResult, HttpErrorResult, WriteFailResult } from './types';
import { getCurrentGitHubSessionToken } from './auth/sessionToken';
import { showSnippetFileWriteNotifications } from './notifications/snippetFileWriteNotifications';
import config from './config';

const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('shalom world, "snippet-sync-vscode" is now active');

  const snippetsDir: string = path.resolve(context.globalStorageUri.path, '../..', 'snippets');

  autoSyncSnippets();

  let syncSnippetFiles = vscode.commands.registerCommand('snippet-sync-vscode.syncSnippetFiles', async () => {
    console.log('"snippet-sync-vscode.syncSnippetFiles" command called');
    const snippetFilesList: string[] = vscode.workspace.getConfiguration('snippetSync').get<string[]>('snippetFiles') || [];
    deleteLocalSnippetFiles(snippetsDir);

    const authToken = await getCurrentGitHubSessionToken();

    if (snippetFilesList.length === 0) {
      vscode.window.showWarningMessage('No snippet files configured. Add snippet files in the settings in "Snippet Sync: Snippet Files".');
      return;
    }
    const httpFetchResults = await retrieveSnippets(snippetsDir, snippetFilesList, authToken);
    const writeResults = writeSnippetFiles(snippetsDir, httpFetchResults.successes);
    showSnippetFileWriteNotifications(httpFetchResults, writeResults);
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

  context.subscriptions.push(syncSnippetFiles, signInToGitHub);
}

// this method is called when your extension is deactivated
export function deactivate() {}

export function autoSyncSnippets() {
  if (vscode.workspace.getConfiguration('snippetSync').get<boolean>('autoSyncSnippetFiles') === true) {
    console.log(`Auto syncing snippets. Next sync in ${config.autoSyncTimeInterval / 1000} seconds.`);
    vscode.commands.executeCommand('snippet-sync-vscode.syncSnippetFiles');
  }

  setTimeout(autoSyncSnippets, config.autoSyncTimeInterval);
}