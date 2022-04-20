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
    const singular = allFails.length === 1;

    vscode.window.showWarningMessage(
      `${singular ? 'A' : allFails.length} snippet ${fileOrFiles} couldn't be accessed.
      If the ${fileOrFiles} ${singular ? 'is' : 'are'} private, sign in to GitHub.
      Check that the ${fileOrFiles} can be accessed
      and that ${singular ? "it's" : "they're"} valid JSON. \r\r
      Issues:
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

  console.log('snippet-sync update results:', {allSuccesses, allFails});
}