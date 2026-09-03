const fs = require("fs").promises;
const path = require("path");

async function readData(fileName) {
    const filePath = path.join(__dirname, "..", "data", fileName);

    try {
        const data = await fs.readFile(filePath, "utf8");

        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);

        throw new Error("Unable to read data");
    }
}

async function writeData(fileName, data) {
    const filePath = path.join(__dirname, "..", "data", fileName);

    try {
        await fs.writeFile(
            filePath,
            JSON.stringify(data, null, 2),
            "utf8"
        );
    } catch (error) {
        console.error(`Error writing ${fileName}:`, error);

        throw new Error("Unable to save data");
    }
}

module.exports = {
    readData,
    writeData
};
