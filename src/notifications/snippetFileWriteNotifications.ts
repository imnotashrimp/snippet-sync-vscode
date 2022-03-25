import * as vscode from 'vscode';
import {
  HttpFailResult,
  HttpErrorResult,
  WriteSuccessResult,
  WriteFailResult,
  AllWriteResults,
  AllHttpResults
} from "../types";

export function showSnippetFileWriteNotifications(httpFetchResults: AllHttpResults, writeResults: AllWriteResults): void {
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
}