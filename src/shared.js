const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");

function getVersion() {
    let tag = github.context.ref;
    let pfx = core.getInput("version-prefix");

    if (!tag.startsWith("refs/tags/")) {
        core.warning(
            "Tag not found cute-lights/bump-version can only be used when checked out to a tag"
        );
        process.exit(0);
    }

    if (!tag.startsWith("refs/tags/" + pfx)) {
        core.warning(
            "Tag does not match the version prefix, skipping version bump"
        );
        process.exit(0);
    }

    return tag.replace("refs/tags/" + pfx, "");
}

function parseFileArgs(str) {
    return str
        .replace("\n", "")
        .split(" ")
        .filter((x) => x !== "");
}

function updateFile(filePath, version) {
    if (filePath.endsWith("Cargo.toml")) {
        cargo(filePath, version);
    } else if (filePath.endsWith("package.json")) {
        node(filePath, version);
    } else if (filePath.endsWith("pubspec.yaml")) {
        pubspec(filePath, version);
    } else if (filePath.endsWith("pyproject.toml")) {
        pyProject(filePath, version);
    } else if (filePath.endsWith("meson.build")) {
        meson(filePath, version);
    } else if (filePath.endsWith("csproj") || filePath.endsWith("csproj.xml")) {
        csproj(filePath, version);
    } else {
        throw new Error("Unsupported file type " + filePath);
    }
}

function node(filePath, version) {
    const data = fs.readFileSync(filePath, "utf8");
    const newData = JSON.parse(data);
    newData.version = version;
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), "utf8");
}

function pyProject(filePath, version) {
    const data = fs.readFileSync(filePath, "utf8");
    let isInPackage = false;
    let hasNewVersion = false;
    const newData = data
        .split("\n")
        .map((line) => {
            if (hasNewVersion) return line;

            if (line.includes("[project]")) {
                isInPackage = true;
            }

            if (isInPackage && line.trim().startsWith("version")) {
                hasNewVersion = true;
                isInPackage = false;
                return `version = "${version}"`;
            }

            return line;
        })
        .join("\n");

    fs.writeFileSync(filePath, newData, "utf8");
}
function cargo(filePath, version) {
    const data = fs.readFileSync(filePath, "utf8");
    let isInPackage = false;
    let hasNewVersion = false;
    const newData = data
        .split("\n")
        .map((line) => {
            if (hasNewVersion) return line;

            if (line.includes("[package]")) {
                isInPackage = true;
            }

            if (isInPackage && line.trim().startsWith("version")) {
                hasNewVersion = true;
                isInPackage = false;
                return `version = "${version}"`;
            }

            return line;
        })
        .join("\n");

    fs.writeFileSync(filePath, newData, "utf8");
}

function pubspec(filePath, version) {
    const data = fs.readFileSync(filePath, "utf8");
    let lines = data
        .split("\n")
        .map((line) => {
            if (!(line.startsWith(" ") || line.startsWith("\t"))) {
                if (line.trim().startsWith("version")) {
                    return `version: ${version}`;
                }
            }

            return line;
        })
        .join("\n");

    fs.writeFileSync(filePath, lines, "utf8");
}

function meson(filePath, version) {
    const data = fs.readFileSync(filePath, "utf8");
    let hasUpdatedVersion = false;

    const newData = data
        .split("\n")
        .map((line) => {
            if (hasUpdatedVersion) return line;

            if (line.startsWith("VERSION")) {
                hasUpdatedVersion = true;
                return `VERSION = '${version}'`;
            }

            return line;
        })
        .join("\n");

    fs.writeFileSync(filePath, newData, "utf8");
}

function csproj(filePath, version) {
    const data = fs.readFileSync(filePath, "utf8");

    let propertyGroup = data.match(
        /<PropertyGroup>([\s\S]*?)<\/PropertyGroup>/g
    );

    let newData = propertyGroup[0];

    let versionRegex = /<Version>([\s\S]*?)<\/Version>/g;
    let versionMatch = versionRegex.exec(propertyGroup[0]);
    newData = newData.replace(versionMatch[0], `<Version>${version}</Version>`);

    let fullData = data.replace(propertyGroup[0], newData);

    fs.writeFileSync(filePath, fullData, "utf8");
}

module.exports = {
    cargo,
    node,
    pubspec,
    pyProject,
    meson,getVersion,
    csproj,
    updateFile,parseFileArgs
};
