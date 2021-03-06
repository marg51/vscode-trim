// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, workspace, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';
import * as vscode from 'vscode';
import { EOL } from 'os';

export function activate(ctx: ExtensionContext) {
    
    // create a new word counter
    let wordCounter = new WordCounter();
    let controller = new WordCounterController(wordCounter);

    // add to a list of disposables which are disposed when this extension
    // is deactivated again.
    ctx.subscriptions.push(controller);
    ctx.subscriptions.push(wordCounter);
}

export class WordCounter {

    public trim() {
        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            return;
        }

        // only one block so that we save only once
        editor.edit(function(editbuilder) {
            
            let doc = editor.document;
          
            // trim all lines
            doc._lines.map((line, index) => {
                if (line.match(/[\s]$/ )) {
                    var addText ="";
                    if (index > 1 && index === doc.lineCount-1 && line !== '') {
                        addText = EOL
                    }
                    editbuilder.replace(new vscode.Range(new vscode.Position(index, 0), new vscode.Position(index, line.length)), line.replace(/[\s]+$/,'')+addText);
                }
                else if (index > 1 && index === doc.lineCount-1 && line !== '') {
                   editbuilder.insert(new vscode.Position(index, line.length), EOL);
                }
            })

            setTimeout(function() {
                doc.save();
            }, 200);
            
        }).then(()=>{}, (error)=>console.log(error))
    }

    public dispose() {
    }
}

class WordCounterController {

    private _wordCounter: WordCounter;
    private _disposables: Disposable[];

    constructor(wordCounter: WordCounter) {
        this._wordCounter = wordCounter;
        workspace.onDidSaveTextDocument(this._onEvent, this, this._disposables);
    }

    private _onEvent() {
        this._wordCounter.trim()
    }

    public dispose() {
        this._disposables[0].dispose();
    }
}
