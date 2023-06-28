const vscode = require('vscode');
const { GPTAPI } = require('./api');

class Assistant{
	constructor(context, extensionId){
		this.context = context
		this.extensionId = extensionId
		this.api = new GPTAPI(this.getApiKey())

		// they are values that saves editor state when command is executed
		this.document = null
		this.selection = null
		this.editor = null
	}
	getConfigurationVar(varId){
		return vscode.workspace.getConfiguration(this.extensionId).get(varId)
	}
	getApiKey(){
		return this.getConfigurationVar("apiKey")
	}
	initialize(){
		this.registerAskCommand()
		this.registerGenerateCommand()
		this.registerImproveCommand()
		this.registerDocumentCommand()
	}
	start(){
		
	}
	loadingWrapper(asyncfunction){
		return new Promise(async (resolve, reject)=>{
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'gpt is typing...',
				cancellable: true 
			}, async (progress, token) => {
				resolve(await asyncfunction(token))
			});
		})
	}
	getSelectedText(){
		const editor = this.editor;
		if (editor) {
			const document = this.document;
			const selection = this.selection;
			const offsets = [selection.start, selection.end].map(document.offsetAt)
			var text = "";
			if(offsets[0]==offsets[1]){
				text = document.lineAt(selection.active.line).text
			}else{
				text = document.getText().substring(offsets[0], offsets[1])
			}
			return text
		}
		return ""
	}
	extractCodeBlocksFromText(text){
		const regex = /```(?:\w+)?\s([\s\S]+?)\s```/gm;
		let code = ""

		let m;
		while ((m = regex.exec(text)) !== null) {
			if(code!="") code+="\n\n"
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			let codeBlock = m[1]
			code+=codeBlock
		}
		return code
	}
	replaceSelectionWithText(text){
		const selection = this.selection;
		const edit = new vscode.WorkspaceEdit();
		edit.replace(this.document.uri, selection, text);
		vscode.workspace.applyEdit(edit);
	}
	insertTextAfterSelection(text){
		const document = this.document;
		const selection = this.selection;
		
		const edit = new vscode.WorkspaceEdit();
		const position = selection.end;
		const isCursorAtEnd = position.isEqual(document.lineAt(document.lineCount - 1).range.end);
		if(isCursorAtEnd){
			edit.insert(document.uri, position, "\n");
		}

		const insertPosition = new vscode.Position(position.line + 1, 0);
		edit.insert(document.uri, insertPosition, text);

		vscode.workspace.applyEdit(edit);
	}

	async fetchAnswerFromApi(message){
		this.api.apiKey = this.getApiKey()
		this.api.modelName = this.getConfigurationVar("modelName")
		this.api.systemPrompt = this.getConfigurationVar("systemPrompt")

		return await this.loadingWrapper((async(token)=>{
			token.onCancellationRequested(_ => this.api.abortController.abort());
			try{
				let answer = await this.api.fetchAnswer(message)
				return answer
			}catch(e){
				vscode.window.showErrorMessage(e.message);
				return ""
			}
		}).bind(this))
	}

	registerAskCommand(){
		this.registerCommand("ask", async ()=>{
			let message = this.getSelectedText()
			
			let answer = await this.fetchAnswerFromApi(message)
			if(!answer) return;
			vscode.window.showInformationMessage(answer)
		})
	}

	registerGenerateCommand(){
		this.registerCommand("generate", async ()=>{
			let message = this.getSelectedText()

			let text = await this.fetchAnswerFromApi(message)
			if(!text) return;
			vscode.window.showInformationMessage(text)
			let code = this.extractCodeBlocksFromText(text)
			if(code=="") return

			this.insertTextAfterSelection(code)
		})
	}
	registerImproveCommand(){
		this.registerCommand("improve", async ()=>{
			let message = this.getSelectedText()

			let text = await this.fetchAnswerFromApi(message)
			if(!text) return;
			vscode.window.showInformationMessage(text)
			let code = this.extractCodeBlocksFromText(text)
			if(code=="") return

			this.replaceSelectionWithText(code)
		})
	}
	registerDocumentCommand(){
		this.registerCommand("document", async ()=>{
			let message = this.getConfigurationVar("documentMessage")
			message += "\n"
			message += this.getSelectedText()

			let text = await this.fetchAnswerFromApi(message)
			if(!text) return;
			vscode.window.showInformationMessage(text)
			let code = this.extractCodeBlocksFromText(text)
			if(code=="") return

			this.replaceSelectionWithText(code)
		})
	}

	registerCommand(commandId, method){
		let disposable = vscode.commands.registerCommand(this.extensionId+'.'+commandId, (function () {
			try{
				this.editor = vscode.window.activeTextEditor;
				if(this.editor){
					this.document = this.editor.document
					this.selection = this.editor.selection
					method()
				}
			}
			catch(e){
				vscode.window.showErrorMessage(e);
			}
		}).bind(this));	
		this.context.subscriptions.push(disposable);
	}
}

exports.Assistant = Assistant