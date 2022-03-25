import * as vscode from 'vscode';

export async function getCurrentGitHubSessionToken(): Promise<string|null> {
  const session = await vscode.authentication.getSession('github', ['repo'], {createIfNone: false});
  return session ? session.accessToken : null;
}