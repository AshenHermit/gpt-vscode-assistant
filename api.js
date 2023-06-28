const { default: fetch } = require('node-fetch');
const vscode = require('vscode');

class GPTAPI{
	constructor(apiKey){
		this.apiKey = apiKey
		this.apiUrl = "https://api.openai.com/v1/chat/completions"
        
        this.modelName = "gpt-3.5-turbo"
        this.systemPrompt = "You are a helpful assistant."
		this.abortController = new AbortController()
	}
	fetchAnswer(message){
		this.abortController = new AbortController()
		if(this.apiKey==""){
			throw new Error("The API key is not specified. Сonfigure it in the settings.")
		}
		return new Promise((resolve, reject)=>{
			const requestData = {
				"model": this.modelName,
				"messages": [
					{"role": "system", "content": this.systemPrompt},
					{"role": "user", "content": message}
				]
			};
			fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.apiKey}`
				},
				body: JSON.stringify(requestData),
				signal: this.abortController.signal
			})
			.then(response => response.json())
			.then(data => {
				const reply = data.choices[0].message.content;
				resolve(reply)
			})
			.catch(error => {
				reject(error)
			});
		})
	}
}

exports.GPTAPI = GPTAPI