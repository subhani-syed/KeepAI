// Helper function to debounce
function debounce(func, delay) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearInterval(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Helper function to check for "kai:<anything between>; pattern"
const getTextParsed = (text) => {
    const parsed = /kai:(.*?)\;/gi.exec(text);
    return parsed ? parsed[1] : "";
};

// Helper function to get text content from the nodes
const getTextContentFromDOMElements = (nodes, textarea = false) => {
    if (!nodes || nodes.length === 0) {
      return null;
    }
  
    for (let node of nodes) {
      const value = textarea ? node.value : node.textContent;
      if (node && value) {
        const text = getTextParsed(value);
        if (text) return [node, text];
        else return null;
      }
    }
};

// Make API call
const callAPI = async (node,value) => {
    try{

        const headers = new Headers();
        headers.append("Content-Type","application/json");
        headers.append("Authorization", `Bearer ${YOUR_API_KEY}`);


        const payload = JSON.stringify({
            model:"text-davinci-003",
            prompt:value,
            max_tokens: 2048,
            temperature: 0,
            top_p: 1,
            n: 1,
            stream: false,
            logprobs: null,
        });

        const options = {
            method: "POST",
            headers: headers,
            body:payload,
            redirect:"follow",
        };

        // Show Loading Text
        // let loadingText = document.createElement("i");
        // loadingText.innerText=" KeepAI is generating answer....";
        // loadingText.contentEditable = false;
        // node.appendChild(loadingText);

        // Show Loading Icon
        let loadingImage = document.createElement("img");
        loadingImage.src = "https://cdn.pixabay.com/animation/2022/11/17/00/47/00-47-21-570_512.gif"
        loadingImage.alt = " KAI Loading.."
        loadingImage.width = "20"
        loadingImage.height = "25"

        node.appendChild(loadingImage)
        
        const response = await fetch("https://api.openai.com/v1/completions",options);
        const data = await response.json();

        const {choices} = data;
        const text = choices[0].text.replace(/^\s+|\s+$/g,"");
        node.innerText = text;

        node.removeChild(loadingImage);
        // node.removeChild(loadingText);

    }catch(err){
        console.error("Error occured while calling the OpenAI API",err);
    }

}

// Helper function to check the text enterd and call api
function getText() {
    const elements = document.querySelectorAll('[contenteditable="true"]');
    const parsedValue = getTextContentFromDOMElements(elements);
    if(parsedValue){
        const[node,value] = parsedValue;
        callAPI(node,value);
    }
    
}

const debouncedGetText = debounce(getText, 1000);

window.addEventListener("keypress", debouncedGetText);
