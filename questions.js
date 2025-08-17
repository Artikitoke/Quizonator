export async function waitForMathJax() {
    return new Promise((resolve, reject) => {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise().then(() => {
                resolve();
            }).catch((err) => {
                console.error('MathJax rendering failed', err);
                reject(err);
            });
        } else {
            resolve();
        }
    });
}

export function parseMathJax(input) {
    const mathMLMatch = input.match(/<math.*<\/math>/);
    if (!mathMLMatch) {
        return input;
    }
    const mathML = mathMLMatch[0];

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(mathML, "text/xml");

    function traverse(node) {
        if (node.nodeName === "mfrac") {
            const numerator = traverse(node.firstElementChild);
            const denominator = traverse(node.lastElementChild);
            return `\\frac{${numerator}}{${denominator}}`;
        } else if (node.nodeName === "msqrt") {
            const content = traverse(node.firstElementChild);
            return `\\sqrt{${content}}`;
        } else if (node.nodeName === "mn") {
            return node.textContent;
        } else if (node.nodeName === "mo") {
            return node.textContent;
        } else if (node.nodeName === "mrow" || node.nodeName === "math") {
            let result = '';
            for (let i = 0; i < node.childNodes.length; i++) {
                result += traverse(node.childNodes[i]);
            }
            return result;
        } else {
            return '';
        }
    }

    const latex = traverse(xmlDoc.documentElement);
    return `\\(${latex}\\)`;
}

export async function checkDatabaseForQuestion(question) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                action: 'checkDatabase',
                question: question
            },
            (response) => {
                if (response && response.found) {
                    resolve(response.correctAnswer);
                } else {
                    resolve(null);
                }
            }
        );
    });
}

export async function checkPossibleAnswers(question) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                action: 'checkDatabase',
                question: question
            },
            (response) => {
                if (response && response.found && response.possibleAnswers) {
                    resolve(response.possibleAnswers);
                } else {
                    resolve(null);
                }
            }
        );
    });
}
