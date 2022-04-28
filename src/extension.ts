import * as vscode from 'vscode';
import {retrieveSnippets} from './snippets/remoteSnippetFiles';
import { deleteLocalSnippetFiles, writeSnippetFiles } from './snippets/localSnippetFiles';
import { SnippetSyncStatus } from './types';
import { changeStatus } from './statuses/statuses';
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
  statusBarItem.command = 'snippet-sync-vscode.showCommandsMenu';
  statusBarItem.show();

  if (vscode.workspace.getConfiguration('snippetSync').get<boolean>('autoSyncSnippetFiles') === true) {
    setInterval(autoSyncSnippets, config.autoSyncTimeInterval);
  }

  let syncSnippetFiles = vscode.commands.registerCommand('snippet-sync-vscode.syncSnippetFiles', async () => {
    console.log('"snippet-sync-vscode.syncSnippetFiles" command called');
    statusBarItem = changeStatus(statusBarItem, SnippetSyncStatus.working);
    const snippetFilesList: string[] = vscode.workspace.getConfiguration('snippetSync').get<string[]>('snippetFiles') || [];
    deleteLocalSnippetFiles(snippetsDir);

    const authToken = await getCurrentGitHubSessionToken();

    if (snippetFilesList.length === 0) {
      vscode.window.showWarningMessage('No snippet files configured. Add snippet files in the settings in "Snippet Sync: Snippet Files".');
      statusBarItem = changeStatus(statusBarItem, SnippetSyncStatus.noFiles);
      return;
    }
    const httpFetchResults = await retrieveSnippets(snippetsDir, snippetFilesList, authToken);
    const writeResults = writeSnippetFiles(snippetsDir, httpFetchResults.successes);
    showSnippetFileWriteNotifications(httpFetchResults, writeResults);
    if (httpFetchResults.fails.length > 0) {
      statusBarItem = changeStatus(statusBarItem, SnippetSyncStatus.error);
    } else {
      statusBarItem = changeStatus(statusBarItem, SnippetSyncStatus.ok);
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

  let showCommandsMenu = vscode.commands.registerCommand('snippet-sync-vscode.showCommandsMenu', async () => {
    console.log('"snippet-sync-vscode.showCommandsMenu" command called');
    const commands = [
      {
        alwaysShow: true,
        command: 'snippet-sync-vscode.syncSnippetFiles',
        label: 'Sync Snippet Files',
        detail: '$(sync) Sync all configured snippet files'
      },
      {
        alwaysShow: true,
        command: 'snippet-sync-vscode.signInToGitHub',
        label: 'Sign In to GitHub',
        detail: '$(unlock) Required if any of the files are private'
      }
    ];
    vscode.window.showQuickPick(commands).then(command => {
      if (command) {
        vscode.commands.executeCommand(command.command);
      }
    });
  });

  subscriptions.push(syncSnippetFiles, signInToGitHub, statusBarItem, showCommandsMenu);
}

// this method is called when your extension is deactivated
export function deactivate() {}

export function autoSyncSnippets() {
  console.log(`Auto syncing snippets. Next sync in ${config.autoSyncTimeInterval / 1000 / 60} minutes.`);
  vscode.commands.executeCommand('snippet-sync-vscode.syncSnippetFiles');
}
