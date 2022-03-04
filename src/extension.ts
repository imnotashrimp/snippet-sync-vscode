import * as vscode from 'vscode';
import {downloadSnippets} from './downloadSnippets';

const path = require('path');
// const snippetsPath = path.resolve(vscode.env.appRoot, 'snippets');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('shalom world, "snippet-sync-vscode" is now active');

	const snippetsDir = path.resolve(context.globalStorageUri.path, '../..', 'snippets');
	const snippetFilesList = vscode.workspace.getConfiguration('snippetSync').get<string[]>('snippetFiles') || [];

	let disposable = vscode.commands.registerCommand('snippet-sync-vscode.updateAllSnippetFiles', () => {
		console.log('"snippet-sync-vscode.updateAllSnippetFiles" command called');
		downloadSnippets(snippetsDir, snippetFilesList);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
