let midi = (function() {
    "use strict";

    let JZZ = require('jzz');
    let module = {};

    module.init = function() {
        if (JZZ.requestMIDIAccess) {
            JZZ.requestMIDIAccess({sysex: false})
                .then(onMIDISuccess, onMIDIFailure)
        } else {
            showError("No midi supported in the browser");
        }
    };

    function onMIDIFailure(e) {
        showError(`Couldn't access midi`);
        JZZ.close();
    }

    function onMIDISuccess(mAccess) {
        console.log("Midi ready");
        module.midiAccess = mAccess;
        JZZ.close();
    } 

    module.setMIDIHandlers = function(midiAccess, onMIDIMessage) {
        if (!midiAccess) return;
        
        let inputs = midiAccess.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = (event) => {onMIDIMessage(event)};
        } 
        
    };

    module.listInputsAndOutputs = function(midiAccess) {
        if (!midiAccess) {
            console.log('kein access')
            return;
        }

        let inputsAndOutputs = [
            ["inputs", midiAccess.inputs.values()]
            // ["outputs", midiAccess.outputs.values()]
        ];
        for (let io of inputsAndOutputs) {
            // let currNode = document.body.querySelector("#" + io[0]);
            console.log(io[0] + ' available:');
            for (let data = io[1].next(); data && !data.done; data = io[1].next()) {
                // let putName = document.createElement("p");
                // putName.textContent = data.value.name;
                console.log("  " + data.value.name);
                // currNode.appendChild(putName);
            }
            console.log("");
        }
    };
    
    return module;
})();

exports.midi = midi;