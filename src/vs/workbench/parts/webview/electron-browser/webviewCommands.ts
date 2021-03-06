/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { Command, ICommandOptions } from 'vs/editor/browser/editorExtensions';
import * as nls from 'vs/nls';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { BaseWebviewEditor } from './baseWebviewEditor';

export class ShowWebViewEditorFindWidgetCommand extends Command {
	public static readonly ID = 'editor.action.webvieweditor.showFind';

	public runCommand(accessor: ServicesAccessor, args: any): void {
		const webViewEditor = getActiveWebviewEditor(accessor);
		if (webViewEditor) {
			webViewEditor.showFind();
		}
	}
}

export class HideWebViewEditorFindCommand extends Command {
	public static readonly ID = 'editor.action.webvieweditor.hideFind';

	public runCommand(accessor: ServicesAccessor, args: any): void {
		const webViewEditor = getActiveWebviewEditor(accessor);
		if (webViewEditor) {
			webViewEditor.hideFind();
		}
	}
}

export class ShowWebViewEditorFindTermCommand extends Command {
	public static readonly Id = 'editor.action.webvieweditor.showPreviousFindTerm';

	constructor(opts: ICommandOptions, private _next: boolean) {
		super(opts);
	}

	public runCommand(accessor: ServicesAccessor, args: any): void {
		const webViewEditor = getActiveWebviewEditor(accessor);
		if (webViewEditor) {
			if (this._next) {
				webViewEditor.showNextFindTerm();
			} else {
				webViewEditor.showPreviousFindTerm();
			}
		}
	}
}

export class OpenWebviewDeveloperToolsAction extends Action {
	static readonly ID = 'workbench.action.webview.openDeveloperTools';
	static readonly LABEL = nls.localize('openToolsLabel', "Open Webview Developer Tools");

	public constructor(
		id: string,
		label: string
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const elements = document.querySelectorAll('webview.ready');
		for (let i = 0; i < elements.length; i++) {
			try {
				(elements.item(i) as Electron.WebviewTag).openDevTools();
			} catch (e) {
				console.error(e);
			}
		}
		return null;
	}
}

export class ReloadWebviewAction extends Action {
	static readonly ID = 'workbench.action.webview.reloadWebviewAction';
	static readonly LABEL = nls.localize('refreshWebviewLabel', "Reload Webviews");

	public constructor(
		id: string,
		label: string,
		@IWorkbenchEditorService private readonly workbenchEditorService: IWorkbenchEditorService
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		for (const webview of this.getVisibleWebviews()) {
			webview.reload();
		}
		return null;
	}

	private getVisibleWebviews() {
		return this.workbenchEditorService.getVisibleEditors()
			.filter(editor => editor && (editor as BaseWebviewEditor).isWebviewEditor)
			.map(editor => editor as BaseWebviewEditor);
	}
}

function getActiveWebviewEditor(accessor: ServicesAccessor): BaseWebviewEditor | null {
	const workbenchEditorService = accessor.get(IWorkbenchEditorService);
	const activeEditor = workbenchEditorService.getActiveEditor() as BaseWebviewEditor;
	return activeEditor.isWebviewEditor ? activeEditor : null;
}