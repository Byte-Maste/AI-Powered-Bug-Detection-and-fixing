import * as vscode from 'vscode';
import ollama from 'ollama';
import crypto from 'crypto';

// Store previous responses to detect duplicates
let previousResponses = new Map<string, string>();

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "krishna-bug-detection-fixing-ext" is now active!');
	
	const disposable = vscode.commands.registerCommand('krishna-bug-detection-fixing-ext.helloWorld', () => {
		const panel = vscode.window.createWebviewPanel(
			'Debugger',
			'AI Powered Python Debugger',
			vscode.ViewColumn.One,
			{enableScripts: true}
		);
		panel.webview.html = getWebviewContent();

		// Create a session ID for this panel instance
		const sessionId = crypto.randomUUID();
		
		// Store conversation history for this session
		let conversationHistory: Array<{role: string, content: string}> = [];
		
		panel.webview.onDidReceiveMessage(async (message: any) => {
           if(message.command === 'chat'){
			   const userPrompt = message.text;
			   let responseText = '';
			   
			   // Generate a unique request ID for this specific request
			   const requestId = Date.now().toString();

			   try {
                   // Inform user that processing is happening
                   panel.webview.postMessage({ 
                       command: 'chatResponse', 
                       text: 'Processing your request...' 
                   });
                   
                   // Model name - adjust based on how you've imported your model to Ollama
                   const modelName = 'hf.co/Krish-05/krishna-choudhary-codellama-gguf-quantized:Q4_K_M';
                   
                   console.log(`Attempting to query model: ${modelName}`);
                   
                   // Add system message to avoid repetition
                   if (conversationHistory.length === 0) {
                     conversationHistory.push({
                       role: 'system', 
                       content: 'You are a helpful coding assistant. Provide diverse and non-repetitive responses. Do not repeat previous answers. Be concise and direct.'
                     });
                   }
                   
                   // Add user's message with unique identifier to prevent repetition
                   const uniquePrompt = `${userPrompt}\n[Request ID: ${requestId}]`;
                   conversationHistory.push({role: 'user', content: uniquePrompt});
                   
                   // Make the Ollama API call with temperature and other settings
                   const streamResponse = await ollama.chat({
                        model: modelName,
                        messages: conversationHistory,
                        stream: true,
                        options: {
                          temperature: 0.7,
                          top_p: 0.9,
                          seed: parseInt(requestId.slice(-8), 10) // Use part of request ID as seed
                        }
                   });
                   
                   // Process the stream response
                   for await (const part of streamResponse) {
                        if (part.message && part.message.content) {
                            responseText += part.message.content; // Accumulate streamed data
                            panel.webview.postMessage({ 
                                command: 'chatResponse', 
                                text: responseText 
                            });
                        }
                   }
                   
                   // Check if this is a duplicate response
                   const promptHash = hashString(userPrompt);
                   if (previousResponses.has(promptHash) && 
                       areSimilarResponses(previousResponses.get(promptHash)!, responseText)) {
                       
                       // Generate a slightly modified response
                       const modifiedResponse = responseText + "\n\n[Note: I've provided an alternative perspective on your question.]";
                       
                       panel.webview.postMessage({ 
                           command: 'chatResponse', 
                           text: modifiedResponse 
                       });
                       
                       responseText = modifiedResponse;
                   }
                   
                   // Store this response for future comparison
                   previousResponses.set(promptHash, responseText);
                   
                   // Store assistant's response in conversation history
                   conversationHistory.push({role: 'assistant', content: responseText});
                   
                   // Limit conversation history to prevent context overflow
                   if (conversationHistory.length > 10) {
                       // Keep system message and trim older messages
                       const systemMessage = conversationHistory[0];
                       conversationHistory = [systemMessage, ...conversationHistory.slice(-5)];
                   }
                   
                   // If we got no response content
                   if (!responseText) {
                       panel.webview.postMessage({ 
                           command: 'chatResponse', 
                           text: 'The model did not generate any response. Please check your Ollama installation and model configuration.' 
                       });
                   }
			   } catch(err) {
                   console.error('Ollama API Error:', err);
                   panel.webview.postMessage({ 
                       command: 'chatResponse', 
                       text: `Error: ${err instanceof Error ? err.message : String(err)}\n\nPlease check your console for more details.` 
                   });
               }
		   } else if (message.command === 'reset') {
               // Reset conversation history when user requests
               conversationHistory = [];
               panel.webview.postMessage({
                   command: 'chatResponse',
                   text: 'Conversation has been reset.'
               });
           } else if (message.command === 'copyText') {
               // Handle copy command
               vscode.env.clipboard.writeText(message.text).then(() => {
                   panel.webview.postMessage({
                       command: 'copyStatus',
                       success: true
                   });
               }, (err) => {
                   console.error('Copy error:', err);
                   panel.webview.postMessage({
                       command: 'copyStatus',
                       success: false,
                       error: String(err)
                   });
               });
           }
		});
        
        // When panel is disposed, clear the stored responses for this session
        panel.onDidDispose(() => {
            previousResponses.delete(sessionId);
        });
	});

	context.subscriptions.push(disposable);
}

// Helper function to create a hash of a string
function hashString(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
}

// Helper function to determine if two responses are too similar
function areSimilarResponses(resp1: string, resp2: string): boolean {
    // Remove common formatting and whitespace
    const normalize = (text: string) => {
        return text.replace(/\s+/g, ' ').trim().toLowerCase();
    };
    
    const norm1 = normalize(resp1);
    const norm2 = normalize(resp2);
    
    // Simple similarity check - could be improved
    if (norm1 === norm2) {return true;}
    
    // Check if one is a substring of the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) {return true;}
    
    // Check if they're very similar by comparing character frequency
    const charCount1 = countCharacters(norm1);
    const charCount2 = countCharacters(norm2);
    
    let similarityScore = 0;
    for (const char in charCount1) {
        if (charCount2[char]) {
            similarityScore += Math.min(charCount1[char], charCount2[char]);
        }
    }
    
    const maxLength = Math.max(norm1.length, norm2.length);
    const similarity = similarityScore / maxLength;
    
    return similarity > 0.85; // Responses are more than 85% similar
}

// Helper function to count characters in a string
function countCharacters(str: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const char of str) {
        counts[char] = (counts[char] || 0) + 1;
    }
    return counts;
}

function getWebviewContent(): string {
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI-powered Debugger</title>
        <style>
            body { 
                font-family: sans-serif; 
                margin: 1rem; 
            }
            #prompt { 
                width: 100%; 
                box-sizing: border-box; 
                padding: 0.5rem;
            }
            #askBtn {
                margin-top: 0.5rem;
                padding: 0.5rem 1rem;
                cursor: pointer;
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 4px;
            }
            #askBtn:hover {
                background-color: #005f99;
            }
            #resetBtn {
                margin-top: 0.5rem;
                margin-left: 0.5rem;
                padding: 0.5rem 1rem;
                cursor: pointer;
                background-color: #cc3300;
                color: white;
                border: none;
                border-radius: 4px;
            }
            #resetBtn:hover {
                background-color: #a62900;
            }
            #response {
                border: 1px solid #ccc; 
                margin-top: 1rem; 
                padding: 0.5rem;
                min-height: 100px;
                white-space: pre-wrap;
                overflow-y: auto;
                max-height: 500px;
                position: relative;
            }
            .loading {
                color: #888;
                font-style: italic;
            }
            #copyBtn {
                position: absolute;
                top: 5px;
                right: 5px;
                padding: 3px 8px;
                background-color: #f0f0f0;
                border: 1px solid #ccc;
                border-radius: 3px;
                cursor: pointer;
                display: none;
            }
            #copyBtn:hover {
                background-color: #e0e0e0;
            }
            .copy-success {
                background-color: #4CAF50 !important;
                color: white !important;
                transition: background-color 0.3s;
            }
        </style>
    </head>
    <body>
        <h2>AI-powered Debugger</h2>
        <textarea id="prompt" rows="5" placeholder="Ask something about your Python code..."></textarea> <br />
        <button id="askBtn">ASK</button>
        <button id="resetBtn">Reset Conversation</button>
        <div id="response">
            <button id="copyBtn">Copy</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const responseEl = document.getElementById('response');
            const promptEl = document.getElementById('prompt');
            const askBtn = document.getElementById('askBtn');
            const resetBtn = document.getElementById('resetBtn');
            const copyBtn = document.getElementById('copyBtn');

            askBtn.addEventListener('click', () => {
                const text = promptEl.value;
                if (!text.trim()) return;
                
                responseEl.innerText = 'Waiting for response...';
                responseEl.classList.add('loading');
                askBtn.disabled = true;
                copyBtn.style.display = 'none';
                
                vscode.postMessage({ command: 'chat', text });
            });
            
            resetBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'reset' });
                promptEl.value = '';
                copyBtn.style.display = 'none';
            });
            
            copyBtn.addEventListener('click', () => {
                const textToCopy = responseEl.innerText.replace('Copy', '').trim();
                vscode.postMessage({ command: 'copyText', text: textToCopy });
            });

            window.addEventListener('message', event => {
                const message = event.data;
                
                if (message.command === 'chatResponse') {
                    responseEl.innerText = message.text;
                    responseEl.appendChild(copyBtn);
                    responseEl.classList.remove('loading');
                    askBtn.disabled = false;
                    
                    // Only show copy button if we have content
                    if (message.text && !message.text.startsWith('Waiting') && 
                        !message.text.startsWith('Processing') && 
                        !message.text.startsWith('Error:') &&
                        !message.text.startsWith('Conversation has been reset')) {
                        copyBtn.style.display = 'block';
                    } else {
                        copyBtn.style.display = 'none';
                    }
                } else if (message.command === 'copyStatus') {
                    if (message.success) {
                        copyBtn.classList.add('copy-success');
                        copyBtn.innerText = 'Copied!';
                        
                        setTimeout(() => {
                            copyBtn.classList.remove('copy-success');
                            copyBtn.innerText = 'Copy';
                        }, 1500);
                    } else {
                        copyBtn.innerText = 'Failed to copy';
                        setTimeout(() => {
                            copyBtn.innerText = 'Copy';
                        }, 1500);
                    }
                }
            });
        </script>
    </body>
    </html>
    `;
}

export function deactivate() {}