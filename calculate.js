module.exports = function (filePath, isTestRun) {
    
var fs = require('fs');

/* Set file path  */
var fPath = filePath || 'sample.log';

/* EndPoint Object Declare */
var cntPenMsg = { pattern: /\/api\/users\/(\d)+\/count_pending_messages/, count: 0, dyno: {}, responseTime: [] },
getMsg = { pattern: /\/api\/users\/(\d)+\/get_messages/, count: 0, dyno: {}, responseTime: [] },
getFrndProgress = { pattern: /\/api\/users\/(\d)+\/get_friends_progress/, count: 0, dyno: {}, responseTime: [] },
getFrndScore = { pattern: /\/api\/users\/(\d)+\/get_friends_score/, count: 0, dyno: {}, responseTime: [] },
postUser = { pattern: /\/api\/users\/(\d)+/, count: 0, dyno: {}, responseTime: [] },
getUser = {  pattern: /\/api\/users\/(\d)+/, count: 0, dyno: {}, responseTime: [] };

/* File Read */
var rd = fs.readFileSync(fPath);
/* Split file string with new line char to array */
var rdArray = rd.toString().split("\n");

/**
 * Set count in each endpoints object.
 * Set each lines service + connect time as response time from each line object.
 * Increment corresponding dyno's count in each endpoints object(cntPenMsg.dyno)
 *
 * @param {Object} buildObj  //  cntPenMsg, getMsg .. objects etc
 * @param {Object} lineObj  
 *
 */
var buildObjOnEndPoints = function (buildObj, lineObj) {
	buildObj.count++;
	buildObj.responseTime.push(parseInt(lineObj.connect) + parseInt(lineObj.service));
	if (typeof buildObj.dyno[lineObj.dyno] !== 'undefined') {
		buildObj.dyno[lineObj.dyno] =  buildObj.dyno[lineObj.dyno] + 1;
	} else {
		buildObj.dyno[lineObj.dyno] = 1;
	}
}

/* Iterate file read array  to create each line object and manipulate the data in it */
rdArray.map(function(line) {
	var lineSplitColon = line.split(": ")[1].trim();
	var lineSplitSpace = lineSplitColon.split(' ');
    /**
     * Create line Obj for each line.
     *
     * Example
     * { at: 'info',  method: 'get', path: '/api/users/100001971407609', ...  dyno: 'web.10', connect: '2ms', service: '22ms' }
     */
	var lineObj = {};
	lineSplitSpace.map(function(n) {
		lineObj[n.split('=')[0]] = n.split('=')[1];
	});

    /* Check each endpoints path with regex */
	if (cntPenMsg.pattern.test(lineObj.path)) {
		buildObjOnEndPoints(cntPenMsg, lineObj);
	} else if (getMsg.pattern.test(lineObj.path)) {
		buildObjOnEndPoints(getMsg, lineObj);
	} else if (getFrndProgress.pattern.test(lineObj.path)) {
		buildObjOnEndPoints(getFrndProgress, lineObj);
	} else if (getFrndScore.pattern.test(lineObj.path)) {
		buildObjOnEndPoints(getFrndScore, lineObj);
	} else if (getUser.pattern.test(lineObj.path)) {
		if (lineObj.method == 'GET') {
			buildObjOnEndPoints(getUser, lineObj);
		} else if (lineObj.method == 'POST') {
			buildObjOnEndPoints(postUser, lineObj);
		}
	}
});

var mean = function (arr) {
    return arr.reduce(function(a, b){return a+b;}) / arr.length;
}

var median = function (arr) {
    arr.sort( function(a,b) {return a - b;} );
    var half = Math.floor(arr.length/2);
    if(arr.length % 2)
        return arr[half];
    else
        return (arr[half-1] + arr[half]) / 2.0;
}

var mode = function (arr) {
    return arr.reduce(function(current, item) {
        var val = current.numMapping[item] = (current.numMapping[item] || 0) + 1;
        if (val > current.greatestFreq) {
            current.greatestFreq = val;
            current.mode = item;
        }
        return current;
    }, {mode: null, greatestFreq: -Infinity, numMapping: {}}, arr).mode;
};

/**
 * Set Mean, Median, Mode object property for each endpoints
 */
var setMeasures = function (buildEndPointArr) {
	buildEndPointArr.map(function(buildObj) {
		if (buildObj.responseTime.length) {
			buildObj.mean = mean(buildObj.responseTime);
			buildObj.median = median(buildObj.responseTime);
			buildObj.mode = mode(buildObj.responseTime);
		} else {
			buildObj.mean = buildObj.median = buildObj.mode = null;
		}
	});
}

setMeasures([cntPenMsg, getMsg, getFrndProgress, getFrndScore, postUser, getUser]);

/**
 * Set max dyno to each endpoints objects
 */
var setMaxHitDyno = function(buildEndPointArr) {
	buildEndPointArr.map(function(buildObj) {
		var getDyno = {};
		for (var prop in buildObj.dyno) {
		  if (!getDyno.max || (buildObj.dyno[prop] > getDyno.max)) {
			getDyno.name = prop;
			getDyno.max = buildObj.dyno[prop];
		  }
		}
		buildObj.dynoName = getDyno.name;
	});
}

setMaxHitDyno([cntPenMsg, getMsg, getFrndProgress, getFrndScore, postUser, getUser]);

var writeParsedStream = function (writeObj) {
    return {
        count: writeObj.count,
        mean: writeObj.mean,
        median: writeObj.median,
        mode: writeObj.mode,
        dyno: writeObj.dynoName
    }
}

/* Final file parsed data */
var finalParsedData = {
    countPendingMsg: writeParsedStream(cntPenMsg),
    getMsg: writeParsedStream(getMsg),
    getFriendProgress: writeParsedStream(getFrndProgress),
    getFriendScore: writeParsedStream(getFrndScore),
    postUser: writeParsedStream(postUser),
    getUser: writeParsedStream(getUser)
};

/* Test Supress print */
if (isTestRun) {
    console.log = function () {};
}    

var printStream = function (writeObj) {
    console.log('Count:', writeObj.count);
    console.log('Mean:', writeObj.mean);
    console.log('Median:', writeObj.median);
    console.log('Mode:', writeObj.mode);
    console.log('Dyno:', writeObj.dyno);
    console.log('\n');
}

console.log('\n');
console.log('Endpoint: /api/users/{user_id}/count_pending_messages/ ');
printStream(finalParsedData.countPendingMsg);

console.log('Endpoint: /api/users/{user_id}/get_messages ');
printStream(finalParsedData.getMsg);

console.log('Endpoint: /api/users/{user_id}/get_friends_progress ');
printStream(finalParsedData.getFriendProgress);

console.log('Endpoint: /api/users/{user_id}/get_friends_score ');
printStream(finalParsedData.getFriendScore);

console.log('Endpoint - POST: /api/users/{user_id} ');
printStream(finalParsedData.postUser);

console.log('Endpoint - GET: /api/users/{user_id} ');
printStream(finalParsedData.getUser);

return finalParsedData;

};