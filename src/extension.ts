import * as vscode from 'vscode';
import {retrieveSnippets} from './retrieveSnippets';
import { clearSnippetFiles } from './snippets/localSnippetFiles';
import { writeSnippetFiles } from './writeSnippetFiles';
import { WriteSuccessResult, HttpFailResult, HttpErrorResult, WriteFailResult } from './types';

const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('shalom world, "snippet-sync-vscode" is now active');

  const snippetsDir: string = path.resolve(context.globalStorageUri.path, '../..', 'snippets');
  const snippetFilesList: string[] = vscode.workspace.getConfiguration('snippetSync').get<string[]>('snippetFiles') || [];

  let updateAllSnippetFiles = vscode.commands.registerCommand('snippet-sync-vscode.updateAllSnippetFiles', async () => {
    console.log('"snippet-sync-vscode.updateAllSnippetFiles" command called');
    clearSnippetFiles(snippetsDir);

    const session = await vscode.authentication.getSession('github', ['repo'], {createIfNone: false});
    const authToken = session?.accessToken || null;

    const httpFetchResults = await retrieveSnippets(snippetsDir, snippetFilesList, authToken);
    const writeResults = writeSnippetFiles(snippetsDir, httpFetchResults.successes);

    // Build success & fail reporting arrays
    const allSuccesses: WriteSuccessResult[] = writeResults.successes;
    const allFails: (HttpFailResult|HttpErrorResult|WriteFailResult)[] = [...httpFetchResults.fails, ...writeResults.fails];

    // Pop success & failure messages, and log full objects
    if (allFails.length > 0) {
      const fileOrFiles = allFails.length === 1 ? 'file' : 'files';
      const plural = allFails.length === 1;

      vscode.window.showWarningMessage(
        `${allFails.length} snippet ${fileOrFiles} couldn't be updated
        because ${plural ? 'it' : 'they'} couldn't be accessed.
        If the ${fileOrFiles} ${plural ? 'is' : 'are'} private, you may need to sign in to GitHub.
        Check that the ${fileOrFiles} can be accessed
        and that ${plural ? 'it contains' : 'they contain'} valid JSON.
        To stop seeing this message,
        remove the ${fileOrFiles} from the Snippet Sync config:
        ${allFails.map(fail => fail.url).join(', ')}`,
        {
          title: 'Sign in',
          command: 'signInToGitHub'
        },
        {
          title: 'Got it',
          isCloseAffordance: true
        }
      )
      .then(action => {
        if (!action) {return;}
        switch (action.command) {
          case 'signInToGitHub':
            vscode.commands.executeCommand('snippet-sync-vscode.signInToGitHub');
            break;
        }
      });
    }

    if (allSuccesses.length > 0) {
      const plural = allSuccesses.length === 1;
      vscode.window.showInformationMessage(
        `${allSuccesses.length} snippet ${plural ? 'file' : 'files'} updated:
        ${allSuccesses.map(success => success.url).join(', ')}`
      );
    }

    console.log('snippet-sync update results:', {allSuccesses, allFails});
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

  context.subscriptions.push(updateAllSnippetFiles, signInToGitHub);
}

// this method is called when your extension is deactivated
export function deactivate() {}
