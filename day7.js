const { rawInput } = require('./source-data')

const inputs = rawInput.replace(/%24/g, "$").replace(/%2F/g, "/").split("%0A").map(cmd => cmd.split("%20"));


class BaseNode {
    parentNode = null;
    name = "";
    size = 0;
    
    constructor(parentNode = null, name, size) {
        this.parentNode = parentNode;
        this.name = name;
        this.size = size;
    }
}

class DirNode extends BaseNode {
    contents = [];

    constructor(parentNode, name, size) {        
        super(parentNode, name, size);
    }

    addDirNode(name, size = 0) {
        this.contents.push(new DirNode(this, name, size));
        return this.contents.at(-1)
    }

    addFileNode(name, size) {
        this.contents.push(new FileNode(this, name, size));

        this.recalculateContentSize();

        return this.contents.at(-1)
    }

    recalculateContentSize() {
        this.size = this.contents.reduce((acc, node) => node.size + acc, 0);
        
        if (this.parentNode) {
            this.parentNode.recalculateContentSize();            
        }
    }
}

class FileNode extends BaseNode {
    constructor(parentNode, name, size) {        
        super(parentNode, name, size);
    }
}

function setupFileSystemFromInputCommands() {
    const rootNode = new DirNode(null, "/", 0);
    let currentNode = rootNode;
    let isListingDirContents = false;

    inputs.forEach((terminalText, index) => {
        if (terminalText[0] === "$" && terminalText[1] === "cd") {
            isListingDirContents = false;
            const destDir = terminalText[2];

            if (destDir === "/") {
                currentNode = rootNode;
            } else if (destDir === "..") {
                currentNode = currentNode.parentNode;
            } else {
                currentNode = currentNode.contents.find((node) => node instanceof DirNode && node.name === destDir);
            }
        }

        if (terminalText[0] === "$" && terminalText[1] === "ls") { 
            isListingDirContents = true;
        }

        if (terminalText[0] === "dir" && isListingDirContents === true) {
            const newDirName = terminalText[1];          
            currentNode.addDirNode(newDirName);
        }

        if (!isNaN(terminalText[0]) && isListingDirContents === true) {
            const newFileSize = parseInt(terminalText[0]);
            const newFileName = terminalText[1]            
            currentNode.addFileNode(newFileName, newFileSize);
        }
    })


    return rootNode;
}

function findAllDirsWithSizeLte100000(node) {
    let dirCollection = [];

    if (node.size <= 100000 && node instanceof DirNode) {
        dirCollection = [...dirCollection, node];
    }

    node.contents.forEach(childNode => {
        if (childNode instanceof DirNode) {
            dirCollection = [...dirCollection, ...findAllDirsWithSizeLte100000(childNode)]
        }
    })    

    return dirCollection;
}

function findAllDirsGteSize(node, size) {
    let dirCollection = [];

    if (node.size >= size && node instanceof DirNode) {
        dirCollection = [...dirCollection, node];
    }

    node.contents.forEach(childNode => {
        if (childNode instanceof DirNode) {
            dirCollection = [...dirCollection, ...findAllDirsGteSize(childNode, size)]
        }
    })    

    return dirCollection;
}

const rootNode = setupFileSystemFromInputCommands();

const dirLte100000 = findAllDirsWithSizeLte100000(rootNode)
const totalDirSizeLte100000 = dirLte100000.reduce((acc, node) => node.size + acc, 0);

const usedSpace = rootNode.size;
const spaceNeededToBeFreedUp = usedSpace - (70000000 - 30000000);
const dirGteNeededSpace = findAllDirsGteSize(rootNode, spaceNeededToBeFreedUp)
const smallestDirToDelete = dirGteNeededSpace.reduce((acc, node) => node.size < acc.size ? node : acc);
const sizeOfSmallestDirToDelete = smallestDirToDelete.size;

console.log(`Part 1 answer: Total size of all directories having a size of 100,000 or less: ${totalDirSizeLte100000}`)
console.log(`Part 2 answer: Size of smallest directory to delete is: ${sizeOfSmallestDirToDelete}`)