import * as vscode from 'vscode';
import {retrieveSnippets} from './retrieveSnippets';
import { clearSnippets } from './clearSnippetFiles';
import { writeSnippetFiles } from './writeSnippetFiles';

const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('shalom world, "snippet-sync-vscode" is now active');

	const snippetsDir: string = path.resolve(context.globalStorageUri.path, '../..', 'snippets');
	const snippetFilesList: string[] = vscode.workspace.getConfiguration('snippetSync').get<string[]>('snippetFiles') || [];

	let disposable = vscode.commands.registerCommand('snippet-sync-vscode.updateAllSnippetFiles', async () => {
		console.log('"snippet-sync-vscode.updateAllSnippetFiles" command called');
		clearSnippets(snippetsDir);

		const retrievedSnippets = await retrieveSnippets(snippetsDir, snippetFilesList);
		vscode.window.showWarningMessage(`${retrievedSnippets.fails.length} snippet files can't be retrieved:
			${retrievedSnippets.fails.map(failedFile => failedFile.url).join(', \n')}`
		);

		writeSnippetFiles(snippetsDir, retrievedSnippets.successes);
		// TODO pop success message for written files
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
