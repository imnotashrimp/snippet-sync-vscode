import * as vscode from 'vscode';
import {retrieveSnippets} from './retrieveSnippets';
import { clearSnippetsDir } from './clearSnippetsDir';
import { writeSnippetFiles } from './writeSnippetFiles';

const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('shalom world, "snippet-sync-vscode" is now active');

	const thisExtensionSnippetsSubfolder: string = context.globalStorageUri.path.split(path.sep).reverse()[0];
	const snippetsDir: string = path.resolve(context.globalStorageUri.path, '../..', 'snippets', thisExtensionSnippetsSubfolder);
	const snippetFilesList: string[] = vscode.workspace.getConfiguration('snippetSync').get<string[]>('snippetFiles') || [];

	let disposable = vscode.commands.registerCommand('snippet-sync-vscode.updateAllSnippetFiles', async () => {
		console.log('"snippet-sync-vscode.updateAllSnippetFiles" command called');
		clearSnippetsDir(snippetsDir);
		const retrievedSnippets = await retrieveSnippets(snippetsDir, snippetFilesList);
		writeSnippetFiles(snippetsDir, retrievedSnippets.successes);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
