const core = require("@actions/core");
const { getVersion, parseFileArgs, updateFile } = require("./shared");

try {
    let version = getVersion();
    let files = parseFileArgs(core.getInput("files"));
    files.forEach((file) => {
        updateFile(file, version);
    });

    core.setOutput("version", version);
} catch (error) {
    core.setFailed(error.message);
}
