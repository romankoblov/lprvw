const vscode = require('vscode');
const path = require('path');
const log = (...txt) => vscode.window.showInformationMessage(txt.join(' '));
let panel;
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('lprvw.sidePreview', () => {
      let te = vscode.window.activeTextEditor;
      if (!te || !te.document) return;
      panel = vscode.window.createWebviewPanel('lprvw', 'Live HTML Preview', vscode.ViewColumn.Two, {
        enableScripts: true,
      });
      panel.onDidDispose = () => {
        panel = undefined;
      };
      panel.updateHTML = () => {
        panel.webview.html = te.document
          .getText()
          .replace(/((?:src|href)=['"])((?!http|\/).*?)(['"])/gim, (_, s, src, e) => {
            const fpath = path.join(path.dirname(te.document.fileName), src);
            const wvPath = panel.webview.asWebviewUri(vscode.Uri.file(fpath));
            return [s, wvPath, `?ts=${Date.now()}`, e].join('');
          });
      };
      panel.updateHTML();
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (panel) panel.updateHTML();
    })
  );
}
module.exports = { activate };
