Neutralino.init();

let editors = [];
let activeEditorIndex = 0;
let tabCounter = 1;

function initMonaco() {
    require.config({ 
        paths: { 
            'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
        }
    });

    require(['vs/editor/editor.main'], function() {
        registerCustomThemes();
        
        monaco.languages.register({ id: 'lua' });
        
        monaco.languages.setMonarchTokensProvider('lua', {
            defaultToken: '',
            tokenPostfix: '.lua',
            keywords: [
                "and", "break", "do", "else", "elseif", "end", "false", "for", "function", 
                "goto", "if", "in", "local", "nil", "not", "or", "repeat", "return", 
                "then", "true", "until", "while"
            ],
            builtins: [
                "assert", "collectgarbage", "dofile", "error", "getmetatable", "ipairs", "load", 
                "loadfile", "next", "pairs", "pcall", "print", "rawequal", "rawget", "rawlen", 
                "rawset", "require", "select", "setmetatable", "tonumber", "tostring", "type", "xpcall"
            ],
            robloxFunctions: [
                "game", "workspace", "script", "math", "string", "table", "Color3", "Vector3", "Vector2", 
                "CFrame", "Instance", "Enum", "task", "wait", "spawn", "delay", "tick", "UserInputService",
                "TweenService", "RunService", "Players", "Lighting", "ReplicatedStorage", "ServerStorage",
                "MarketplaceService", "HttpService", "ContentProvider", "Stats", "ContextActionService",
                "GetService", "FindFirstChild", "FindFirstChildOfClass", "IsA", "Destroy", "Clone", "GetChildren"
            ],
            brackets: [
                { open: '{', close: '}', token: 'delimiter.curly' },
                { open: '[', close: ']', token: 'delimiter.bracket' },
                { open: '(', close: ')', token: 'delimiter.parenthesis' }
            ],
            operators: [
                '+', '-', '*', '/', '%', '^', '#', '==', '~=', '<=', '>=', '<', '>', '=',
                ';', ':', ',', '.', '..', '...'
            ],
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            tokenizer: {
                root: [
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@builtins': 'type',
                            '@robloxFunctions': 'variable.predefined',
                            '@default': 'identifier'
                        }
                    }],
                    { include: '@whitespace' },
                    [/--\[([=]*)\[/, 'comment', '@comment'],
                    [/--.*$/, 'comment'],
                    [/\[(=*)\[/, { token: 'string.quote', bracket: '@open', next: '@mlstring.$1' }],
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/'([^'\\]|\\.)*$/, 'string.invalid'],
                    [/"/, 'string.quote', '@string."'],
                    [/'/, 'string.quote', '@string.\''],
                    [/[{}()\[\]]/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': ''
                        }
                    }],
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                    [/0[xX][0-9a-fA-F_]*[0-9a-fA-F]/, 'number.hex'],
                    [/\d+?/, 'number']
                ],
                mlstring: [
                    [/[^\]]+/, 'string'],
                    [/\]([=]*)\]/, {
                        cases: {
                            '$1==$S2': { token: 'string.quote', bracket: '@close', next: '@pop' },
                            '@default': 'string'
                        }
                    }],
                    [/./, 'string']
                ],
                string: [
                    [/[^\\"']+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/["']/, {
                        cases: {
                            '$#==$S2': { token: 'string.quote', bracket: '@close', next: '@pop' },
                            '@default': 'string'
                        }
                    }]
                ],
                whitespace: [
                    [/[ \t\r\n]+/, '']
                ],
                comment: [
                    [/[^\]]+/, 'comment'],
                    [/\]([=]*)\]/, {
                        cases: {
                            '$1==$S2': { token: 'comment', next: '@pop' },
                            '@default': 'comment'
                        }
                    }],
                    [/./, 'comment']
                ]
            }
        });

        monaco.languages.registerCompletionItemProvider('lua', {
            provideCompletionItems: function(model, position) {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                
                const suggestions = [];
                
                const keywords = [
                    "and", "break", "do", "else", "elseif", "end", "false", "for", "function", 
                    "goto", "if", "in", "local", "nil", "not", "or", "repeat", "return", 
                    "then", "true", "until", "while"
                ];
                
                const builtins = [
                    "assert", "collectgarbage", "dofile", "error", "getmetatable", "ipairs", "load", 
                    "loadfile", "next", "pairs", "pcall", "print", "rawequal", "rawget", "rawlen", 
                    "rawset", "require", "select", "setmetatable", "tonumber", "tostring", "type", "xpcall"
                ];
                
                const robloxFunctions = [
                    "game", "workspace", "script", "math", "string", "table", "Color3", "Vector3", "Vector2", 
                    "CFrame", "Instance", "Enum", "task", "wait", "spawn", "delay", "tick", "UserInputService",
                    "TweenService", "RunService", "Players", "Lighting", "ReplicatedStorage", "ServerStorage",
                    "MarketplaceService", "HttpService", "ContentProvider", "Stats", "ContextActionService",
                    "GetService", "FindFirstChild", "FindFirstChildOfClass", "IsA", "Destroy", "Clone", "GetChildren"
                ];

                // Common Lua snippets
                const snippets = [
                    {
                        label: 'if',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'If statement',
                        insertText: 'if ${1:condition} then\n\t${0}\nend',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'For loop',
                        insertText: 'for ${1:i}=${2:1},${3:10} do\n\t${0}\nend',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'function',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Function definition',
                        insertText: 'function ${1:name}(${2:params})\n\t${0}\nend',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }
                ];
                
                keywords.forEach(keyword => {
                    suggestions.push({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range
                    });
                });
                
                builtins.forEach(builtin => {
                    suggestions.push({
                        label: builtin,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: builtin,
                        range: range
                    });
                });
                
                robloxFunctions.forEach(item => {
                    suggestions.push({
                        label: item,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: item,
                        range: range
                    });
                });
                
                suggestions.push(...snippets);
                
                return {
                    suggestions: suggestions
                };
            }
        });

        monaco.languages.setLanguageConfiguration('lua', {
            comments: {
                lineComment: '--',
                blockComment: ['--[[', ']]']
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ],
            indentationRules: {
                increaseIndentPattern: /^\s*(function|then|do|repeat|else|elseif)\b.*/,
                decreaseIndentPattern: /^\s*(end|else|elseif|until)\b.*/
            }
        });

        createNewTab();

        const themeSelect = document.getElementById('theme');
        themeSelect.addEventListener('change', function() {
            const theme = this.value;
            applyTheme(theme);
        });
        
        // Apply initial theme (either system preference or user selection)
        applyTheme(themeSelect.value);
    });
}

function registerCustomThemes() {
    monaco.editor.defineTheme('monokai', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '#88846f' },
            { token: 'string', foreground: '#e6db74' },
            { token: 'keyword', foreground: '#f92672' },
            { token: 'number', foreground: '#ae81ff' },
            { token: 'type', foreground: '#66d9ef', fontStyle: 'italic' },
            { token: 'variable.predefined', foreground: '#a6e22e' },
            { token: 'operator', foreground: '#f92672' }
        ],
        colors: {
            'editor.background': '#272822',
            'editor.foreground': '#f8f8f2',
            'editorCursor.foreground': '#f8f8f0',
            'editor.lineHighlightBackground': '#3e3d32',
            'editorLineNumber.foreground': '#90908a',
            'editor.selectionBackground': '#49483e',
            'editor.wordHighlightBackground': '#49483e'
        }
    });

    monaco.editor.defineTheme('dracula', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '#6272a4' },
            { token: 'string', foreground: '#f1fa8c' },
            { token: 'keyword', foreground: '#ff79c6' },
            { token: 'number', foreground: '#bd93f9' },
            { token: 'type', foreground: '#8be9fd' },
            { token: 'variable.predefined', foreground: '#50fa7b' },
            { token: 'operator', foreground: '#ff79c6' }
        ],
        colors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2',
            'editorCursor.foreground': '#f8f8f0',
            'editor.lineHighlightBackground': '#44475a',
            'editorLineNumber.foreground': '#6272a4',
            'editor.selectionBackground': '#44475a',
            'editor.wordHighlightBackground': '#44475a'
        }
    });

    monaco.editor.defineTheme('night-owl', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '#637777' },
            { token: 'string', foreground: '#addb67' },
            { token: 'keyword', foreground: '#c792ea' },
            { token: 'number', foreground: '#f78c6c' },
            { token: 'type', foreground: '#82aaff' },
            { token: 'variable.predefined', foreground: '#ffcb8b' },
            { token: 'operator', foreground: '#c792ea' }
        ],
        colors: {
            'editor.background': '#011627',
            'editor.foreground': '#d6deeb',
            'editorCursor.foreground': '#80a4c2',
            'editor.lineHighlightBackground': '#0e293f',
            'editorLineNumber.foreground': '#4b6479',
            'editor.selectionBackground': '#1d3b53',
            'editor.wordHighlightBackground': '#1d3b53'
        }
    });
}

function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'monokai', 'dracula', 'night-owl', 'system-theme');
    
    if (theme === 'system') {
        // Apply system preference
        document.body.classList.add('system-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        monaco.editor.setTheme(prefersDark ? 'vs-dark' : 'vs');
    } else {
        // Apply specific theme
        monaco.editor.setTheme(theme);
        
        if (theme === 'vs') {
            // Light theme - no additional class needed
        } else if (theme === 'vs-dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.add(theme);
        }
    }
}

function createNewTab(content = '', filename = '') {
    const tabName = filename || `Untitled ${tabCounter++}`;
    const tabId = `tab-${Date.now()}`;
    const editorId = `editor-${Date.now()}`;
    
    const tabHeader = document.getElementById('tab-header');
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tabId;
    tabElement.innerHTML = `
        <span class="tab-title">${tabName}</span>
        <span class="tab-close">×</span>
    `;
    
    tabHeader.appendChild(tabElement);
    
    const editorContainer = document.getElementById('editor-container');
    const editorElement = document.createElement('div');
    editorElement.id = editorId;
    editorElement.className = 'editor';
    editorElement.style.height = '100%';
    editorElement.style.display = 'none';
    
    editorContainer.appendChild(editorElement);
    
    const editor = monaco.editor.create(editorElement, {
        value: content,
        language: 'lua',
        theme: document.getElementById('theme').value === 'system' ? 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs') : 
            document.getElementById('theme').value,
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        lineHeight: 22,
        padding: { top: 10 },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
        wordWrap: 'on',
        wrappingIndent: 'same',
        linkedEditing: true,
        bracketPairColorization: { enabled: true }
    });
    
    editors.push({
        id: editorId,
        tabId: tabId,
        editor: editor,
        filename: filename,
        path: filename ? filename : ''
    });
    
    editor.onDidChangeModelContent(() => {
        updateStatusBar(editor);
    });
    
    editor.onDidChangeCursorPosition(() => {
        updateStatusBar(editor);
    });
    
    activateTab(editors.length - 1);
    
    tabElement.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-close')) {
            const tabId = tabElement.dataset.tabId;
            const index = editors.findIndex(e => e.tabId === tabId);
            activateTab(index);
        }
    });
    
    tabElement.querySelector('.tab-close').addEventListener('click', () => {
        const tabId = tabElement.dataset.tabId;
        const index = editors.findIndex(e => e.tabId === tabId);
        closeTab(index);
    });
    
    return editor;
}

function updateStatusBar(editor) {
    if (!editor) return;
    
    const position = editor.getPosition();
    const model = editor.getModel();
    
    if (position && model) {
        const statusPosition = document.querySelector('.status-position');
        statusPosition.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
        
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
            const selectedText = model.getValueInRange(selection);
            statusPosition.textContent += ` (${selectedText.length} selected)`;
        }
    }
}

function activateTab(index) {
    if (index >= 0 && index < editors.length) {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const editorElements = document.querySelectorAll('.editor');
        editorElements.forEach(editor => editor.style.display = 'none');
        
        const tabElement = document.querySelector(`[data-tab-id="${editors[index].tabId}"]`);
        if (tabElement) {
            tabElement.classList.add('active');
            
            // Scroll the tab into view if needed
            const tabHeader = document.getElementById('tab-header');
            const tabRect = tabElement.getBoundingClientRect();
            const headerRect = tabHeader.getBoundingClientRect();
            
            if (tabRect.left < headerRect.left) {
                tabHeader.scrollLeft += tabRect.left - headerRect.left - 10;
            } else if (tabRect.right > headerRect.right) {
                tabHeader.scrollLeft += tabRect.right - headerRect.right + 10;
            }
        }
        
        const editorElement = document.getElementById(editors[index].id);
        if (editorElement) {
            editorElement.style.display = 'block';
        }
        
        activeEditorIndex = index;
        updateStatusBar(editors[index].editor);
        
        document.querySelector('.status-message').textContent = 
            editors[index].path ? `Editing: ${editors[index].path}` : 'Ready';
    }
}

function closeTab(index) {
    if (editors.length <= 1) {
        createNewTab();
    }
    
    if (index >= 0 && index < editors.length) {
        const editorInfo = editors[index];
        
        const tabElement = document.querySelector(`[data-tab-id="${editorInfo.tabId}"]`);
        if (tabElement) {
            tabElement.remove();
        }
        
        const editorElement = document.getElementById(editorInfo.id);
        if (editorElement) {
            editorElement.remove();
        }
        
        editors.splice(index, 1);
        
        if (activeEditorIndex === index) {
            activateTab(Math.min(index, editors.length - 1));
        } else if (activeEditorIndex > index) {
            activeEditorIndex--;
        }
    }
}

async function openFile() {
    try {
        const entries = await Neutralino.os.showOpenDialog('Open Lua or Text File', {
            filters: [
                {name: 'Lua/Text Files', extensions: ['lua', 'txt']},
                {name: 'All Files', extensions: ['*']}
            ]
        });
        
        if (entries && entries.length > 0) {
            const filePath = entries[0];
            const content = await Neutralino.filesystem.readFile(filePath);
            const filename = filePath.split(/[\/\\]/).pop();
            
            createNewTab('', filename);
            editors[activeEditorIndex].path = filePath;
            
            // Directly set the value instead of using typing animation
            const currentEditor = editors[activeEditorIndex].editor;
            currentEditor.setValue(content);
            
            document.querySelector('.status-message').textContent = `Opened: ${filename}`;
            showNotification('Success', `File opened: ${filename}`);
        }
    } catch (error) {
        showNotification('Error', `Could not open file: ${error.message}`);
    }
}

async function typeContent(content) {
    const currentEditor = editors[activeEditorIndex].editor;
    currentEditor.setValue('');
    
    const lines = content.split('\n');
    let fullText = '';
    
    document.querySelector('.status-message').textContent = 'Typing...';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (let j = 0; j < line.length; j++) {
            fullText += line[j];
            currentEditor.setValue(fullText);
            
            const position = currentEditor.getModel().getPositionAt(fullText.length);
            currentEditor.setPosition(position);
            currentEditor.revealPositionInCenter(position);
            
            await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 10));
        }
        
        if (i < lines.length - 1) {
            fullText += '\n';
            currentEditor.setValue(fullText);
        }
    }
    
    const editorInfo = editors[activeEditorIndex];
    document.querySelector('.status-message').textContent = 
        editorInfo.path ? `Editing: ${editorInfo.path}` : 'Ready';
}

async function saveFile() {
    try {
        if (activeEditorIndex < 0 || activeEditorIndex >= editors.length) {
            throw new Error('No active editor');
        }
        
        const editorInfo = editors[activeEditorIndex];
        const content = editorInfo.editor.getValue();
        
        let filePath = editorInfo.path;
        
        if (!filePath) {
            filePath = await Neutralino.os.showSaveDialog('Save File', {
                filters: [
                    {name: 'Lua Files', extensions: ['lua']},
                    {name: 'Text Files', extensions: ['txt']}
                ]
            });
            
            if (!filePath) return;
        }
        
        await Neutralino.filesystem.writeFile(filePath, content);
        
        const filename = filePath.split(/[\/\\]/).pop();
        editorInfo.filename = filename;
        editorInfo.path = filePath;
        
        const tabElement = document.querySelector(`[data-tab-id="${editorInfo.tabId}"]`);
        if (tabElement) {
            tabElement.querySelector('.tab-title').textContent = filename;
        }
        
        document.querySelector('.status-message').textContent = `Saved: ${filename}`;
        showNotification('Success', `File saved: ${filename}`);
    } catch (error) {
        showNotification('Error', `Could not save file: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initMonaco();

    const executeButton = document.getElementById('executeButton');
    const newTabButton = document.getElementById('newTabButton');
    const openFileButton = document.getElementById('openFileButton');
    const saveFileButton = document.getElementById('saveFileButton');
    const pasteButton = document.getElementById('pasteButton');
    const resultDiv = document.getElementById('result');
    
    // Setup system theme detection
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', (e) => {
        if (document.getElementById('theme').value === 'system') {
            applyTheme('system');
        }
    });
    
    executeButton.addEventListener('click', async () => {
        try {
            executeButton.disabled = true;
            executeButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing...';
            resultDiv.style.display = 'none';
            document.querySelector('.status-message').textContent = 'Executing script...';
            
            const scriptContent = editors[activeEditorIndex].editor.getValue();
            
            if (!scriptContent) {
                throw new Error('Script content cannot be empty');
            }
            
            const result = await scanPorts(scriptContent);
            
            resultDiv.style.display = 'block';
            
            if (result.success) {
                resultDiv.innerHTML = `<h3 class="success">Success!</h3>
                <p>Server found on port: ${result.port}</p>
                <p>${result.message}</p>`;
                
                document.querySelector('.status-message').textContent = 'Script executed successfully';
                showNotification('Success', `Script executed successfully on port ${result.port}`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `<h3 class="error">Error</h3><p>${error.message}</p>`;
            
            document.querySelector('.status-message').textContent = 'Execution failed';
            showNotification('Error', error.message);
        } finally {
            executeButton.disabled = false;
            executeButton.innerHTML = '<i class="fa-solid fa-play"></i> Execute';
        }
    });

    newTabButton.addEventListener('click', () => {
        createNewTab();
    });
    
    openFileButton.addEventListener('click', () => {
        openFile();
    });
    
    saveFileButton.addEventListener('click', () => {
        saveFile();
    });
    
pasteButton.addEventListener('click', async () => {
    try {
        const clipboardText = await Neutralino.clipboard.readText();
        if (clipboardText) {
            document.querySelector('.status-message').textContent = 'Pasted from clipboard';
            
            // Directly set the value instead of using typing animation
            const currentEditor = editors[activeEditorIndex].editor;
            currentEditor.setValue(clipboardText);
            
            showNotification('Success', 'Pasted from clipboard');
        }
    } catch (error) {
        showNotification('Error', `Could not paste from clipboard: ${error.message}`);
        document.querySelector('.status-message').textContent = 'Failed to paste from clipboard';
    }
});

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault();
                saveFile();
            } else if (e.key === 'o') {
                e.preventDefault();
                openFile();
            } else if (e.key === 'n') {
                e.preventDefault();
                createNewTab();
            } else if (e.key === 'w') {
                e.preventDefault();
                closeTab(activeEditorIndex);
            } else if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                activateTab((activeEditorIndex - 1 + editors.length) % editors.length);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                activateTab((activeEditorIndex + 1) % editors.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                executeButton.click();
            }
        }
    });
});

async function showNotification(title, message) {
    try {
        if (await isOSMac()) {
            const escapedMessage = message.replace(/'/g, "'\\''");
            const script = `display notification "${escapedMessage}" with title "${title}"`;
            await Neutralino.os.execCommand(`osascript -e '${script}'`);
        } else {
            const notificationElement = document.createElement('div');
            notificationElement.className = `app-notification ${title.toLowerCase()}`;
            notificationElement.innerHTML = `
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            `;
            
            document.body.appendChild(notificationElement);
            
            setTimeout(() => {
                notificationElement.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                notificationElement.classList.remove('show');
                setTimeout(() => {
                    notificationElement.remove();
                }, 300);
            }, 3000);
        }
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

async function isOSMac() {
    const osInfo = await Neutralino.os.getOSInfo();
    return osInfo.name.toLowerCase().includes('darwin') || 
           osInfo.name.toLowerCase().includes('mac');
}

async function scanPorts(scriptContent) {
    const START_PORT = 6969;
    const END_PORT = 7069;
    let serverPort = null;
    let lastError = '';

    try {
        for (let port = START_PORT; port <= END_PORT; port++) {
            const url = `http://127.0.0.1:${port}/secret`;

            try {
                const response = await fetch(url, {
                    method: 'GET'
                });
                
                if (response.ok) {
                    const text = await response.text();
                    if (text === '0xdeadbeef') {
                        serverPort = port;
                        console.log(`✅ Server found on port ${port}`);
                        break;
                    }
                }
            } catch (e) {
                lastError = e.message;
            }
        }

        if (!serverPort) {
            throw new Error(`Could not locate HTTP server on ports ${START_PORT}-${END_PORT}. Last error: ${lastError}`);
        }

        const postUrl = `http://127.0.0.1:${serverPort}/execute`;
        console.log(`Sending script to ${postUrl}`);

        const response = await fetch(postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: scriptContent
        });

        if (response.ok) {
            const resultText = await response.text();
            console.log(`✅ Script submitted successfully: ${resultText}`);
            return {
                success: true,
                message: `Script submitted successfully: ${resultText}`,
                port: serverPort
            };
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});

