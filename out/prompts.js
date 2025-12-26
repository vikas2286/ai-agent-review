"use strict";
/**
 * AI Code Reviewer Prompts
 * All prompts used for different code review operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.PROMPTS = exports.SYSTEM_INSTRUCTIONS = void 0;
exports.SYSTEM_INSTRUCTIONS = {
    CODE_REVIEWER: `You are an expert code reviewer with deep knowledge of software engineering best practices, design patterns, and security vulnerabilities.

Your responsibilities:
- Analyze code for bugs, security issues, and performance problems
- Suggest improvements following SOLID principles and clean code practices
- Identify code smells and anti-patterns
- Provide constructive, actionable feedback
- Consider language-specific best practices and idioms

Always be:
- Specific and actionable in your suggestions
- Kind and constructive in tone
- Focused on teaching and improvement
- Aware of modern best practices`,
    CODE_EXPLAINER: `You are an expert programming teacher who excels at explaining code clearly and concisely.

Your responsibilities:
- Explain what code does in simple terms
- Break down complex logic into understandable parts
- Highlight important patterns and techniques used
- Explain the "why" behind code decisions

Always be:
- Clear and beginner-friendly
- Thorough but concise
- Use analogies when helpful
- Focus on understanding, not just description`,
    BUG_FINDER: `You are a meticulous bug hunter with extensive experience in debugging and testing.

Your responsibilities:
- Identify logical errors and edge cases
- Find potential runtime errors and exceptions
- Detect memory leaks and resource management issues
- Spot race conditions and concurrency problems
- Identify null pointer exceptions and undefined behavior

Always be:
- Thorough and systematic
- Specific about the bug location
- Clear about potential impact
- Suggest concrete fixes`,
    SECURITY_AUDITOR: `You are a security expert specializing in application security and secure coding practices.

Your responsibilities:
- Identify security vulnerabilities (SQL injection, XSS, CSRF, etc.)
- Check for authentication and authorization issues
- Detect insecure data handling and storage
- Find hardcoded credentials and sensitive data exposure
- Identify insecure dependencies and configurations

Always be:
- Security-focused and paranoid
- Clear about severity levels
- Provide remediation steps
- Reference OWASP guidelines when relevant`,
    TEST_GENERATOR: `You are a testing expert who writes comprehensive, maintainable unit tests.

Your responsibilities:
- Generate unit tests covering happy paths and edge cases
- Use appropriate testing frameworks and assertions
- Include test descriptions and arrange-act-assert pattern
- Cover boundary conditions and error cases
- Write readable, maintainable test code

Always:
- Follow testing best practices
- Use descriptive test names
- Include both positive and negative test cases
- Consider mocking and dependency injection`,
    DOCUMENTATION_WRITER: `You are a technical writer who creates clear, comprehensive code documentation.

Your responsibilities:
- Write clear JSDoc/docstrings for functions and classes
- Document parameters, return values, and exceptions
- Add inline comments for complex logic
- Include usage examples when helpful
- Document assumptions and side effects

Always be:
- Clear and concise
- Complete but not verbose
- Accurate and up-to-date
- Follow language-specific documentation conventions`
};
exports.PROMPTS = {
    REVIEW_FILE: (code, language, fileName) => `
Review this ${language} file (${fileName}) and provide a comprehensive code review.

Focus on:
1. **Code Quality**: Structure, readability, maintainability
2. **Bugs & Issues**: Logical errors, edge cases, potential crashes
3. **Performance**: Inefficiencies, optimization opportunities
4. **Security**: Vulnerabilities, insecure practices
5. **Best Practices**: Language idioms, design patterns, conventions

Code:
\`\`\`${language}
${code}
\`\`\`

Provide your review in the following format:
## Summary
[Brief overall assessment]

## Issues Found
### Critical 🔴
- [Issue 1]
- [Issue 2]

### Medium 🟡
- [Issue 1]

### Minor 🔵
- [Issue 1]

## Suggestions
- [Improvement 1]
- [Improvement 2]

## Good Practices ✅
- [What's done well]
`,
    REVIEW_SELECTION: (code, language, context) => `
Review this ${language} code snippet:

${context ? `Context: ${context}\n` : ''}
\`\`\`${language}
${code}
\`\`\`

Provide a focused review covering:
1. Logic correctness
2. Potential bugs or issues
3. Code quality and readability
4. Improvement suggestions

Keep your response concise and actionable.
`,
    EXPLAIN_CODE: (code, language) => `
Explain what this ${language} code does in clear, simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **High-level overview**: What does this code accomplish?
2. **Step-by-step breakdown**: Explain each important part
3. **Key concepts**: Highlight important patterns or techniques used
4. **Potential use cases**: When/why would someone use this?

Make it easy to understand for developers at all skill levels.
`,
    FIND_BUGS: (code, language) => `
Analyze this ${language} code for bugs, errors, and potential issues:

\`\`\`${language}
${code}
\`\`\`

Find and report:
1. **Logical Errors**: Incorrect logic or algorithm issues
2. **Runtime Errors**: Potential crashes, exceptions, null references
3. **Edge Cases**: Unhandled scenarios or boundary conditions
4. **Resource Issues**: Memory leaks, unclosed resources
5. **Concurrency Issues**: Race conditions, deadlocks (if applicable)

For each bug found, provide:
- **Location**: Line number or code section
- **Issue**: What's wrong
- **Impact**: How severe is this bug
- **Fix**: Specific solution

Format as:
### Bug #1: [Type] - [Severity]
**Location**: Line X or [code section]
**Issue**: [Description]
**Impact**: [Severity and consequences]
**Fix**: [Solution]
`,
    CHECK_SECURITY: (code, language) => `
Perform a security audit on this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Check for:
1. **Injection vulnerabilities** (SQL, XSS, Command injection)
2. **Authentication/Authorization issues**
3. **Data exposure** (hardcoded secrets, sensitive data leaks)
4. **Input validation** failures
5. **Insecure dependencies**
6. **Cryptography issues** (weak algorithms, insecure storage)
7. **CORS and CSRF** vulnerabilities
8. **Error handling** exposing sensitive information

For each issue found:
### 🔒 Security Issue: [Type]
**Severity**: Critical/High/Medium/Low
**Description**: [What's vulnerable]
**Attack Vector**: [How it can be exploited]
**Remediation**: [How to fix it]
**Reference**: [OWASP or CVE if applicable]
`,
    SUGGEST_IMPROVEMENTS: (code, language) => `
Suggest improvements for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Focus on:
1. **Performance**: Optimization opportunities
2. **Readability**: Naming, structure, clarity
3. **Maintainability**: Modularity, testability
4. **Modern practices**: Language features, patterns
5. **Code organization**: Structure and architecture

For each suggestion:
### 💡 Improvement: [Title]
**Current**: [What exists now]
**Suggested**: [Better approach]
**Benefit**: [Why this is better]
**Example**:
\`\`\`${language}
[Code example]
\`\`\`
`,
    GENERATE_TESTS: (code, language, framework) => `
Generate comprehensive unit tests for this ${language} code${framework ? ` using ${framework}` : ''}:

\`\`\`${language}
${code}
\`\`\`

Create tests covering:
1. **Happy path**: Normal operation
2. **Edge cases**: Boundary conditions
3. **Error cases**: Invalid inputs, exceptions
4. **Integration**: Interaction with dependencies

Test structure:
- Descriptive test names
- Arrange-Act-Assert pattern
- Mock dependencies where needed
- Cover all public methods/functions

Provide complete, runnable test code with:
- Test suite setup
- Individual test cases
- Assertions
- Comments explaining test purpose
`,
    ADD_DOCUMENTATION: (code, language) => `
Add comprehensive documentation to this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Add:
1. **Function/Class documentation**: Purpose, parameters, return values
2. **Inline comments**: Explain complex logic
3. **Usage examples**: Show how to use the code
4. **Type annotations**: If language supports them
5. **Notes**: Document assumptions, side effects, or important details

Follow ${language}-specific documentation conventions (JSDoc, docstrings, etc.).

Provide the fully documented code.
`,
    CHAT_CONTEXT: (code, language) => `
You are an AI code review assistant helping a developer.

${code ? `Current code context (${language}):\n\`\`\`${language}\n${code}\n\`\`\`\n` : ''}
The developer can ask you questions about:
- Code review and analysis
- Bug finding and debugging
- Best practices and patterns
- Refactoring suggestions
- Performance optimization
- Security concerns
- Testing strategies
- Documentation

Provide helpful, specific, and actionable responses. If you need more context, ask clarifying questions.
`,
    WORKSPACE_REVIEW: (filesList, fileContents) => {
        const filesInfo = filesList.map(file => {
            const content = fileContents.get(file);
            const lines = content ? content.split('\n').length : 0;
            return `- ${file} (${lines} lines)`;
        }).join('\n');
        return `
Perform a comprehensive code review of this project.

Files in project:
${filesInfo}

Analyze:
1. **Architecture**: Overall structure and organization
2. **Code Quality**: Consistency, patterns, practices
3. **Cross-file Issues**: Dependencies, coupling, modularity
4. **Testing Coverage**: Test files and coverage
5. **Documentation**: README, comments, API docs
6. **Security**: Project-wide security concerns
7. **Performance**: System-wide performance issues
8. **Maintainability**: How easy is it to maintain and extend

Provide:
## Executive Summary
[High-level assessment]

## Project Structure
[Architecture and organization review]

## Key Findings
### Strengths ✅
- [What's done well]

### Issues to Address 🔴
- [Critical issues]

### Recommendations 💡
- [Improvement suggestions]

## Detailed Analysis by Category
[Category-specific findings]

## Action Items
[Prioritized list of things to fix/improve]
`;
    }
};
exports.ERROR_MESSAGES = {
    NO_API_KEY: '⚠️ Gemini API key not set. Please set your API key first.',
    NO_ACTIVE_FILE: '⚠️ No active file to review.',
    NO_SELECTION: '⚠️ No code selected. Please select code to review.',
    API_ERROR: (error) => `❌ API Error: ${error}`,
    NETWORK_ERROR: '❌ Network error. Please check your connection.',
    RATE_LIMIT: '⚠️ Rate limit reached. Please try again later.',
    INVALID_API_KEY: '❌ Invalid API key. Please check your API key.',
};
exports.SUCCESS_MESSAGES = {
    API_KEY_SET: '✅ Gemini API key stored successfully!',
    API_KEY_CLEARED: '✅ API key removed successfully.',
    REVIEW_COMPLETE: '✅ Review complete!',
    TESTS_GENERATED: '✅ Tests generated successfully!',
    DOCS_ADDED: '✅ Documentation added successfully!',
};
//# sourceMappingURL=prompts.js.map