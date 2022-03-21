import * as vscode from 'vscode';
import {retrieveSnippets} from './retrieveSnippets';
import { clearSnippets } from './clearSnippetFiles';
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
		clearSnippets(snippetsDir);

		const httpFetchResults = await retrieveSnippets(snippetsDir, snippetFilesList);
		const writeResults = writeSnippetFiles(snippetsDir, httpFetchResults.successes);

		// Build success & fail reporting arrays
		const allSuccesses: WriteSuccessResult[] = writeResults.successes;
		const allFails: (HttpFailResult|HttpErrorResult|WriteFailResult)[] = [...httpFetchResults.fails, ...writeResults.fails];

		// Pop success & failure messages, and log full objects
		if (allFails.length > 0) {
			const fileOrFiles = allFails.length === 1 ? 'file' : 'files';

			vscode.window.showWarningMessage(
				`${allFails.length} snippet ${fileOrFiles} couldn't be updated.
				Please check that the ${fileOrFiles} can be accessed without authentication
				and that ${allFails.length === 1 ? 'it contains' : 'they contain'} valid JSON.
				To stop seeing this message, remove the ${fileOrFiles} from the Snippet Sync config:
				${allFails.map(fail => fail.url).join(', ')}`
			);
		}

		if (allSuccesses.length > 0) {
			vscode.window.showInformationMessage(
				`${allSuccesses.length} snippet ${allSuccesses.length === 1 ? 'file was' : 'files were'} updated:
				${allSuccesses.map(success => success.url).join(', ')}`
			);
		}

		console.log('snippet-sync update results:', {allSuccesses, allFails});
	});

	let authenticateWithGitHub = vscode.commands.registerCommand('snippet-sync-vscode.authenticateWithGitHub', async () => {
		console.log('"snippet-sync-vscode.authenticateWithGitHub" command called');
	});

	context.subscriptions.push(updateAllSnippetFiles, authenticateWithGitHub);
}

// this method is called when your extension is deactivated
export function deactivate() {}
