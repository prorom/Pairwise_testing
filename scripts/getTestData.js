const GenerateFixtures = require("../modules/GenerateFixtures");
const dataForTest = require( "../data/dataForTest");
const fs = require("fs");

const generate = new GenerateFixtures(dataForTest);
const fixtures = generate.generateTestFixtures;

fs.writeFileSync("data/testFixtures.json", JSON.stringify(fixtures));