const _ = require("lodash");

module.exports = class GenerateFixtures {
  constructor(dataIn = {}) {
    this._dataIn = dataIn;
  }

  //
  // GENERATION DATA METHODS
  //

  get generateAll() {
    const count = this.countOfFields(this._dataInAsArray());
    const data = this._dataInAsArray();
    const result = [];
    for (let i = 0; i < count.total; i++) {
      const combination = this._generateCombination(data, count, i);
      result.push(this._fromArrayToObject(combination))
    }
    return result;
  }

  _generateCombination(data, count, currentIndex) {
    let fieldCount = count.total;
    const combination = [];
    data.forEach(([field, values]) => {
      fieldCount /= count[field];
      let index = this._getIndex(currentIndex, fieldCount, field, count);
      combination.push([field, values[index]])
    });
    return combination;
  }

  // with random
  get generateAllv2() {
    const resultOfArrays = [];
    const resultOfObjects = [];
    const count = this.countOfFields(this._addOtherValuesToDataIn());
    for (let i = 0; i < count.total; i++) {
      let uniqueParam = false;
      while (!uniqueParam) {
        const testArray = [];
        const testObject = {};
        for (const [field, values] of this._dataInAsArray()) {
          const index = this._getRandomNumber(count[field]);
          testArray.push(values[index]);
          testObject[field] = values[index];
        }
        if (this._checkUniqueValue(resultOfArrays, testArray)) {
          uniqueParam = true;
          resultOfArrays.push(testArray);
          resultOfObjects.push(testObject);
        }
      }
    }
    return resultOfObjects;
  }

  // the attempts to find index for pair combination

  /*
  generPairs() {
    const data = thehis._addOtherValuesToDataIn();
    const count = this.countOfFields(data);
    const totalPairs = 25;
    const result = [];
    for (let i = 0; i < totalPairs; i++) {
      const combination = this._generPairComb(data, count, i);
      result.push(this._fromArrayToObject(combination))
    }
    return result;
  }

  _generPairComb(data, count, currentIndex) {
    const combination = [];
    data.forEach(([field, values], dataIndex) => {
      const fieldCount = count[field];
      let valueIndex = this._getIndexPair(currentIndex, fieldCount, dataIndex);
      // console.log("valueIndex", valueIndex)
      combination.push([field, values[valueIndex]]);
    });
    return combination;
  }

  _getIndexPair(currentIndex, fieldCount, dataIndex) {
    const indexIn = (currentIndex / fieldCount - currentIndex % fieldCount / fieldCount) * dataIndex;
    return (currentIndex % fieldCount + indexIn % fieldCount);
  }
  */

  get generateTestFixtures() {
    return this.generateFixtures().map((object, index) => {
      return {
        name: `Case #${index + 1}`,
        testData: object,
      }
    })
  }

  generateAllPairs(valueObj) {
    const valueArray = Object.entries(valueObj);
    const uniquePairs = [];
    for (let i = 0; i < valueArray.length; i++) {
      const firstValue = valueArray.slice(i, i + 1)[0];
      for (let j = 0; j < valueArray.length; j++) {
        if (i !== j) {
          const secondValue = valueArray.slice(j, j + 1)[0];
          const pairSorted = [firstValue, secondValue].sort(this._sortOfArrays());
          const pairObj = this._fromArrayToObject(pairSorted);
          // if (this._checkUniqueObject(uniquePairs, pairObj)) {
          //   uniquePairs.push(pairObj);
          // }
          if (this._CUO(uniquePairs, pairObj)) {
            uniquePairs.push(pairObj);
          }
        }
      }
    }
    return uniquePairs;
  }

  generateFixtures() {
    const allCombinations = this.generateAll;
    const uniquePairs = [];
    const uniqueCombinations = [];
    for (const combination of allCombinations) {
      const pairsArrOfObj = this.generateAllPairs(combination);
      if (this._checkUniquePair(uniquePairs, pairsArrOfObj)) {
        uniquePairs.push(...pairsArrOfObj);
        uniqueCombinations.push(combination);
      }
    }
    return uniqueCombinations;
  }

  //
  // METHODS FOR TRANSFORMATION DATA
  //

  countOfFields(dataArr) {
    return this._clone(dataArr).reduce((res, [field, array]) => {
      res[field] = array.length;
      res.total ? res.total *= array.length : res.total = array.length;
      return res;
    }, {});
  }

  _getIndex(currentIndex, fieldCount, field, defaultCount) {
    return Math.ceil((currentIndex / fieldCount - currentIndex % fieldCount / fieldCount) % defaultCount[field]);
  }

  // for debug
  countOfComb() {
    const allCombinations = this.generateAll;
    const dataOfStr = allCombinations.map(obj => {
      const arr = Object.entries(obj).map(a => a.join());
      return arr.join();
    });
    const result = [];
    dataOfStr.forEach((comb) => {
      const filter = dataOfStr.filter(str => str === comb);
      if (filter.length > 1) {
        result.push({
          comb: comb,
          count: filter.length
        })
      }
    });
    return result;
  }

  _addOtherValuesToDataIn() {
    const count  = Object.assign({}, this.countOfFields(this._dataInAsArray()));
    delete count.total;
    const maxValue = Math.max(...Object.values(count));
    const dataArr = [].concat(this._dataInAsArray());
    for (const [field, values] of dataArr) {
      if (count[field] < maxValue) {
        for (let i = 0; i < maxValue - count[field]; i++) {
          values.push(`${field}${i}`)
        }
      }
    }
    return dataArr
  }

  _updateOnValidValues(arrayOfObj) {
    const count = this.countOfFields(this._dataInAsArray());
    for (const combination of arrayOfObj) {
      const combinationArr = Object.entries(combination);
      for (const [field, value] of combinationArr) {
        if (!this._dataIn[field].includes(value)) {
          const index = this._getRandomNumber(count[field]);
          combination[field] = this._dataIn[field][index];
        }
      }
    }
    return arrayOfObj;
  }

  //
  // ADDITIONAL METHODS
  //

  _clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  _dataInAsArray() {
    return Object.entries(this._clone(this._dataIn));
  }

  _getRandomNumber(number) {
    return Math.floor(Math.random() * Math.floor(number));
  }

  _fromArrayToObject(array) {
    return array.reduce((res, [name, value]) => {
      res[name] = value;
      return res;
    }, {});
  }

  _convertToOneArray(initialArray = []) {
    const result = [];
    initialArray.forEach((array) => result.push(...array));
    return result;
  }

  //
  // CHECKING METHODS
  //

  _checkUniqueValue(resultArray = [[]], currentArray = []) {
    const arrayOfStrings = resultArray.map((array) => array.join());
    const currentString = currentArray.join();
    return !arrayOfStrings.includes(currentString);
  }

  _checkIncludesPart(resultArray = [[]], currentArray = []) {
    const arrayOfStrings = resultArray.map((array) => array.join());
    const currentString = currentArray.join();
    return !arrayOfStrings.some((str) => str.includes(currentString));
  }

  _checkUniquePair(allPairs = [{}], currentPairs = [{}]) {
    const bool = [];
    for (const pair of currentPairs) {
      bool.push(this._CUO(allPairs, pair));
    }
    return bool.every((value) => value);
  }

  _checkUniqueObject(resultArray = [{}], currentObject = {}) {
    const arrayOfStrings = resultArray.map((obj) => JSON.stringify(obj));
    const currentString = JSON.stringify(currentObject);
    return !arrayOfStrings.includes(currentString);
  }

  _CUO(resultArray = [{}], currentObject = {}) {
    return resultArray.every((obj) => !_.isEqual(obj, currentObject));
  }

  _checkUniqueObjectArray(resultArray = [{}], currentObject = {}) {
    const arrayOfResultArrayOfArr = resultArray.map((obj) => Object.entries(obj));
    const currentArrayOfArr = Object.entries(currentObject);
    const arrayOfStrings = arrayOfResultArrayOfArr.map((array) => {
     const keyValueArr = array.map((arr) => arr.join());
     return keyValueArr.join();
    });
    const currentString = currentArrayOfArr.map((arr) => arr.join()).join();
    return !arrayOfStrings.includes(currentString);
  }

  //
  // SORTING METHODS
  //

  _sortArr() {
    return (a, b) => {
      a = a.toString().toLowerCase();
      b = b.toString().toLowerCase();
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    }
  }

  _sortOfArrays() {
    return (a, b) => {
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;
      return 0;
    }
  }

  _sortParamsObjByTemplate(object, pairObj) {
    const array = Object.entries(object);
    const template = Object.keys(pairObj);
    const arraySorted = array.sort((a, b) => {
      return template.indexOf(a[0]) - template.indexOf(b[0])
    });
    return this._fromArrayToObject(arraySorted);
  }

  _sortObjByValues(array, index = 0) {
    if (index < Object.keys(array[0]).length) {
      const count = this.countOfFields(this._dataInAsArray());
      const values = this._dataInAsArray()[index];
      const currentSortedArr = array.sort((a, b) => {
          return values[1].indexOf(a[values[0]]) - values[1].indexOf(b[values[0]])
      });
      let currentMax = array.length;
      let currentCount = currentMax / count[values[0]];
      let ind = index + 1;
      let arrayMixed1 = array.slice(0, currentCount);
      let arrayMixed2 = array.slice(currentCount, currentMax);
      let arrAll = [arrayMixed1, arrayMixed2];
      for (let arr of arrAll) {
        this._sortObjByValues(arr, ind)
      }
      return currentSortedArr;
    }
  }
};