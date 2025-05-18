import { plot } from "./d3.js";
import { BST } from "./BST.js";

var bst = new BST();
var tree;
let delay = 500;
let isRunningSomething = false;
let willDelete = false;

t refreshTreeStructure = (currValue, isInserting) => {
    // Clean up existing SVG first
    let svg = document.querySelectorAll("svg");
    if (svg.length) {
        svg[0].remove();
    }
    
    // If isInserting is provided, check if value exists in tree already
    if (isInserting !== undefined) {
        if (isInserting) {
            isInserting = !findInTree(currValue);
        }
    }
    
    // Get the tree data
    tree = bst.getTree(bst.getRoot());

    // Only attempt to plot if the tree exists
    if (tree !== undefined) {
        plot(tree, currValue, isInserting);
        
        // After plotting, make more significant adjustments to the SVG
        setTimeout(() => {
            const svg = document.querySelector("svg");
            if (svg) {
                // Make SVG responsive
                svg.setAttribute("width", "100%");
                svg.removeAttribute("height");
                svg.style.display = "block";
                
                // Find all node groups and adjust their positions
                const nodeGroups = svg.querySelectorAll("g.node");
                if (nodeGroups.length > 0) {
                    let minX = Infinity;
                    let maxX = -Infinity;
                    
                    // Find the leftmost and rightmost node positions
                    nodeGroups.forEach(node => {
                        const transform = node.getAttribute("transform");
                        if (transform) {
                            const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
                            if (match) {
                                const x = parseFloat(match[1]);
                                minX = Math.min(minX, x);
                                maxX = Math.max(maxX, x);
                            }
                        }
                    });
                    
                    // Calculate center offset
                    const treeWidth = maxX - minX;
                    const viewBoxWidth = parseFloat(svg.getAttribute("width") || 800);
                    const centerOffset = (viewBoxWidth - treeWidth) / 2 - minX;
                    
                    // Apply offset to the main group
                    const mainGroup = svg.querySelector("g");
                    if (mainGroup) {
                        mainGroup.setAttribute("transform", `translate(${centerOffset}, 0)`);
                    }
                }
                
                // Alternative approach: Set the viewBox to center the tree
                const bbox = svg.getBBox();
                const padding = 50;
                svg.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding*2} ${bbox.height + padding*2}`);
            }
        }, 100); // Give more time for SVG to fully render
    }
}

// Initialize with a random value
let initialValue = parseInt(Math.random()*100);
bst.insert(initialValue);
// Explicitly pass the initial value to refreshTreeStructure so it gets highlighted
refreshTreeStructure(initialValue, true);

const find = (key, root) => {
    return new Promise((resolve) => {
      if (root == undefined) {
        resolve();
        return;
      }
      refreshTreeStructure(root.name);
      if (root.name == key) {
        changeHeading(`${key} Found`);
        clearMeassge();
        if (willDelete == true) {
          bst.remove(key);
          clearMeassge();
          appendMessage(`${key} Deleted`);
        }

        setTimeout(() => {
          refreshTreeStructure(root.name);
          resolve();
        }, delay);
      }
      else if (root.children != undefined && root.children.length == 2) {
        if (root.name > key) {
          setTimeout(() => {
            find(key, root.children[0]).then(resolve);
          }, delay);
        }
        else {
          setTimeout(() => {
            find(key, root.children[1]).then(resolve);
          }, delay);
        }
      }
  
      else if (root.children != undefined && root.children.length == 1) {
        if (
          (root.name > key && root.name > root.children[0].name) ||
          (root.name < key && root.name < root.children[0].name)
        ) {
          setTimeout(() => {
            find(key, root.children[0]).then(resolve);
          }, delay);
        }
        else {
          refreshTreeStructure(null);
          changeHeading(`${key} Not found`);
          clearMeassge();
          resolve();
        }
      }
  
      else {
        refreshTreeStructure(null);
        changeHeading(`${key} Not found`);
        clearMeassge();
        resolve();
      }
    });
  };
  


let forms = Array.from(document.forms);
forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (isRunningSomething == false) {
            isRunningSomething = true;
            changeHeading("Message");
            clearMeassge();
            let msg = "";
            let inputBox = event.target[0];
            let value = parseInt(inputBox.value);
            inputBox.inputMode = "none";
            setTimeout(() => {
                inputBox.inputMode = "numeric";
            }, 50);
            inputBox.value = "";
            if (value == "" || Number.isInteger((value)) == false) {
                msg = "Wrong input\nKindly insert an integer value.";
                isRunningSomething = false;
            }
            else {
                switch (event.target.id) {
                    case 'form1':
                        bst.insert(value);
                        msg = `${value} is inserted`;
                        refreshTreeStructure(value, true);
                        isRunningSomething = false;
                        break;
                    case 'form2':
                        willDelete = true;
                        find(value, tree).then(()=>{
                            isRunningSomething = false;
                        });
                        break;
                    case 'form3':
                        willDelete = false;
                        find(value, tree).then(()=>{
                            isRunningSomething = false;
                        });

                        break;
                }
            }
            appendMessage(msg);
        }
    });
});

document.getElementById("animation-delay")
.addEventListener("input",(e)=>{
    delay = e.target.value;
});
document.querySelectorAll(".traversal")
    .forEach(traversal => {
        traversal.addEventListener("click", e => {
            e.preventDefault();
            if (isRunningSomething == false) {

                clearMeassge();
                let arr = [];
                switch (e.target.id) {
                    case "pre":
                        changeHeading("Preorder");
                        isRunningSomething = true;
                       arr =  bst.getPreOrder();
                       traverseArrayWithDelay(arr).then(() => {
                           refreshTreeStructure();
                           isRunningSomething = false;
                      });
                        break;
                    case "post":
                        changeHeading("Postorder");
                        isRunningSomething = true;
                       arr =  bst.getPostOrder();
                       traverseArrayWithDelay(arr).then(() => {
                           refreshTreeStructure();
                           isRunningSomething = false;
                      });
                        break;
                    case "in":
                        changeHeading("Inorder");
                        isRunningSomething = true;
                        arr =  bst.getInOrder();
                       traverseArrayWithDelay(arr).then(() => {
                           refreshTreeStructure();
                           isRunningSomething = false;
                      });
                        break;
                    case "level":
                        changeHeading("Level order");
                        isRunningSomething = true;
                       arr =  bst.getLevelOrder();
                       traverseArrayWithDelay(arr).then(() => {
                           refreshTreeStructure();
                           isRunningSomething = false;
                      });
                }
            }

        });
    });
function traverseArrayWithDelay(array) {
  return new Promise((resolve) => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index >= array.length) {
        clearInterval(intervalId);
        resolve();
      } else {
        refreshTreeStructure(array[index]);
        appendMessage(array[index]);
        index++;
      }
    }, delay);
  });
}

function changeHeading(meassge) {
    document.getElementById("message-heading")
        .innerText = meassge;
}
function clearMeassge() {
    document.getElementById("message").innerText = "";

}
function appendMessage(m) {
    let messageBox = document.getElementById("message");
    messageBox.style.padding = '5px';
    if (messageBox.innerText == '') {
        messageBox.innerText = m;
    }
    else {
        messageBox.innerText += `, ${m}`;
    }
}
function findInTree(val) {
    let flag = false;
    document.querySelectorAll("text").forEach(text => {
        if (text.innerHTML == val)
            flag = true;
    });
    return flag;
}
