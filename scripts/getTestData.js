const GenerateFixtures = require("../modules/GenerateFixtures");
const dataForTest = require( "../data/dataForTest");
const fs = require("fs");

const Generate = new GenerateFixtures(dataForTest);
const fixtures = Generate.generateTestFixtures;

fs.writeFileSync("data/testFixtures.json", JSON.stringify(fixtures));