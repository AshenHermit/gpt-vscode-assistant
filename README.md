# GPT VScode Assistant

This extension uses gpt chat to provide simple code generation and documentation, and its free!

## Features
* Ask GPT a question
* Generate Code
* Process Code
* Document the code

## How it works

This thing is so fucking complex, i don't even know if I can describe how it works.  
It just writes to uumm...  gpt... and retrieves code from answer...

## Commands

### Ask GPT
Just ask gpt a question and it will popup its answer.  
<img src="doc/ask.gif" style="width: 580px; aspect-ratio: 16 / 9;" />

### Ask GPT to Generate Code
Ask gpt a to generate code, it will insert it in text editor.  
<img src="doc/generate.gif" style="width: 580px; aspect-ratio: 16 / 9;" />

### Ask GPT to Process Code
Ask gpt a to process your code, it will replace selected text with code from answer.  
<img src="doc/process.gif" style="width: 580px; aspect-ratio: 16 / 9;" />

### Ask GPT to Document the Code
Ask gpt a to document your code, acts like Process but you dont need to write a request.  
You can also specify request in extension settings to your needs, for example to write it in another language.  
<img src="doc/document.gif" style="width: 580px; aspect-ratio: 16 / 9;" />

## Settings
* `apiKey`
* * yeah.
* `documentMessage`
* * Defines the request to gpt after which the selected code already goes.
* * *default: "write this code in md code block but with documentation"*
* `modelName`
* * Defines the model version to use in gpt api request.
* * *default: "gpt-3.5-turbo"*
* `systemPrompt`
* * Defines a system prompt to use in gpt api request.
* * *default: "You are a helpful assistant."*
