const { spawnSync } = require("child_process");
const core = require("@actions/core");
const { getVersion } = require("./shared");




if (core.getInput("push-enabled") === "true") {
    let newVersion = getVersion();
    spawnSync("git", ["config", "--global", "user.email", "github-actions[bot]@users.noreply.github.com"]);
    spawnSync("git", ["config", "--global", "user.name", "github-actions[bot]"]);
    spawnSync("git", ["add", "."]);
    spawnSync("git", ["commit", "-m", "Bump version to " + newVersion]);
    spawnSync("git", [
        "push",
        core.getInput("push-to-remote"),
        "HEAD:" + core.getInput("push-to-branch"),
    ]);


}
