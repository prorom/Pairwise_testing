module.exports = class GenerateFixtures {
  constructor(dataIn = {}) {
    this._dataIn = dataIn;
    this._allCombinations = this.generateAll;
  }

  //
  // GENERATION DATA METHODS
  //

  get generateAll() {
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

  get generateAllSorted() {
      return this._sortObjByValues(this._allCombinations)
  }

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
          if (this._checkUniqueObject(uniquePairs, pairObj)) {
            uniquePairs.push(pairObj);
          }
        }
      }
    }
    return uniquePairs;
  }

  generateFixtures() {const uniquePairs = [];
    const uniqueCombinations = [];
    for (const combination of this._allCombinations) {
      const pairsArrOfObj = this.generateAllPairs(combination);
      if (this._checkUniquePair(uniquePairs, pairsArrOfObj)) {
        uniquePairs.push(...pairsArrOfObj);
        uniqueCombinations.push(combination);
      }
    }
    return this._updateOnValidValues(uniqueCombinations);
  }

  //
  // METHODS FOR TRANSFORMATION DATA
  //

  countOfFields(dataArr) {
    return dataArr.reduce((res, [field, array]) => {
      res[field] = array.length;
      res.total ? res.total *= array.length : res.total = array.length;
      return res;
    }, {});
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

  _cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
  }

  _dataInAsArray() {
    return Object.entries(this._cloneObject(this._dataIn));
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
    for (const pair of currentPairs) {
      if (!this._checkUniqueObject(allPairs, pair)) {
        return false;
      }
    }
    return true;
  }

  _checkUniqueObject(resultArray = [{}], currentObject = {}) {
    const arrayOfStrings = resultArray.map((obj) => JSON.stringify(obj));
    const currentString = JSON.stringify(currentObject);
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