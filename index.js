const fs = require("fs");

async function loadData(csvPath) {
    let fileContents = fs.readFileSync(csvPath);
    fileContents = fileContents.toString();
    return (fileContents);
}

async function getAllFrequencyRelations(dataString, positiveAttribute) {
    let rowsInString = dataString.split('\n');
    rowsInString.pop();
    let attributeNames = rowsInString.splice(0, 1)[0].split(',');
    let classAttribute = attributeNames.pop();
    let rows = [], classValues = [];
    rowsInString.forEach(element => {
        let row = element.split(',');
        classValues.push(row.pop());
        rows.push(row);
    });

    let totalNeg = 0, totalPos = 0;
    classValues.forEach(el => el !== positiveAttribute ? totalNeg++ : totalPos++);

    let numberOfTables = attributeNames.length;

    let freqTableList = [];

    for (let i = 0; i < numberOfTables; i++) {
        let currentAttribute = {
            attrName: attributeNames[i]
        };

        let cache = [], yCount = {}, nCount = {};
        for (let j = 0; j < rows.length; j++) {
            if (!cache.includes(rows[j][i])) {
                cache.push(rows[j][i]);
                // console.log(rows[j][i] + ' pushed in cache');
                yCount[cache[cache.indexOf(rows[j][i])]] = 0;
                nCount[cache[cache.indexOf(rows[j][i])]] = 0;
            }

            let y = classValues[j] === positiveAttribute ? 1 : 0;
            let n = classValues[j] !== positiveAttribute ? 1 : 0;

            yCount[cache[cache.indexOf(rows[j][i])]] += y;
            nCount[cache[cache.indexOf(rows[j][i])]] += n;

        }
        currentAttribute['positive'] = yCount;
        currentAttribute['negative'] = nCount;
        freqTableList.push(currentAttribute);
    }

    return ({
        frequecyTableList: freqTableList,
        classAttributeName: classAttribute,
        totalPositiveOutcome: totalPos,
        totalNegativeOutcome: totalNeg
    });

    // console.log(attributeNames);
    // console.log(classAttribute);
    // console.log(classValues);
    // console.log(rows);
}

async function calculateProbability(testData, previousData, totalNegativeOutcome, totalPositiveOutcome) {
    if (totalNegativeOutcome === 0 || totalPositiveOutcome === 0) {
        throw new Error('Incomplete Data');
    }
    let total = totalNegativeOutcome + totalPositiveOutcome;
    let positiveTotalProbability = totalPositiveOutcome / total;
    let negativeTotalProbability = totalNegativeOutcome / total;
    let positiveProbability = positiveTotalProbability;
    let negativeProbability = negativeTotalProbability;

    Object.keys(testData).forEach(el => {
        let target = previousData.find(ele => ele.attrName == el);
        positiveProbability *= (target.positive[testData[el]] / totalPositiveOutcome);
        negativeProbability *= (target.negative[testData[el]] / totalNegativeOutcome);
    });

    let pos = (positiveProbability) / (positiveProbability + negativeProbability);
    let neg = (negativeProbability) / (positiveProbability + negativeProbability);

    return {
        positive: pos,
        negative: neg
    };
}

async function naiveBayes(csvPath, positiveClassLabel, testData) {
    let dataString = await loadData(csvPath);
    let frequencyRelations = await getAllFrequencyRelations(dataString, positiveClassLabel);
    let probability = await calculateProbability(
        testData,
        frequencyRelations.frequecyTableList,
        frequencyRelations.totalNegativeOutcome,
        frequencyRelations.totalPositiveOutcome
    );
    console.log(probability);
    return probability;
}

let prediction = naiveBayes('./computer buys.csv', 'yes', {
    age: '<=30',
    income: 'high',
    student: 'yes',
    credit_rating: 'fair'
});
console.log(prediction);

