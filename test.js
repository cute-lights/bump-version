const src = require('./src');

function randomVersion() {
    return Math.floor(Math.random() * 10) + "." + Math.floor(Math.random() * 10) + "." + Math.floor(Math.random() * 10);
}

let newVersion = randomVersion();


let files = src.parseFileArgs("testData/Cargo.toml testData/package.json testData/pubspec.yaml testData/Cargo.toml testData/pyproject.toml testData/meson.build testData/Project.csproj");
files.forEach((file) => {
    src.updateFile(file, newVersion);
});
