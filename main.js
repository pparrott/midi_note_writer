let {midi} = require('./midi');
const fs = require("fs");
const readline = require('readline');

const rli = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let midiWriteMode = false;
let bindingTextContent = "";
let controllerName

// Initiate midi and readline requirements
midi.init();
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Timeout for 2 seconds to make sure the promise is fulfilled
setTimeout(function() {
    console.log("");
    // List current inputs and assign the text write function upon incoming notes
    midi.listInputsAndOutputs(midi.midiAccess);
    midi.setMIDIHandlers(midi.midiAccess, midiTextWrite);

    // Key mappings
    process.stdin.on("keypress", (key, data) => {
        // save file
        if (data.ctrl && data.name == 's') fileSave(bindingTextContent, controllerName);
        
        // Move to next button 
        if (data.name == 'n') {
            if (midiWriteMode) {
                midiWriteMode = false;
                bindingTextContent += '\n';
                buttonWrite();
            }
        }
    });

    rli.question("What midi controller are you recording?: ", (name) => {
        controllerName = name;
        buttonWrite();
    });
}, 2000);

function midiTextWrite(event) {
    let note = event.data;
    let midiId = event.srcElement.name;
    // Make sure it's time to write to midi
    if (midiWriteMode) {
        // Add event.data to text file in the form [x, y, z] 
        bindingTextContent += '  [';
        for (element of note) {
            bindingTextContent += `${element}, `;
        }
        bindingTextContent = bindingTextContent.slice(0, bindingTextContent.length - 2);
        bindingTextContent += ']\n';
        console.log(`Note recorded from ${midiId}\n`);
    }
}
// Function that requires user to label the button
function buttonWrite() {
    console.log("\nIf you are finished, press ctrl + s to save.")
    rli.question("What button/knob are you testing now?: ", (button) => {
        bindingTextContent += `Midi notes for: ${button}\n`;
        midiWriteMode = true;
        console.log("")
        console.log("Press the button/turn the knob.\nWhen completed, press n to move on to the next button/knob")
    });
}
// Save the file
function fileSave(textData, name) {
    fs.writeFile(`${name}_bindings.txt`, textData, (err) => {
        if (err) console.log(err);
        console.log("\nSuccessfully saved bindings");
        process.exit();
    });
}