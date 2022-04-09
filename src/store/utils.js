export function convertNFTListToMap(nftList) {
	let dictionary = Object.assign({}, ...nftList.map((x) => ({[x.leapTokenId]: x})));
	return dictionary;
}

export function getNFTDictOperations(incomingDict, currentDict) {
	var incomingKeys = Object.keys(incomingDict);
	var currentKeys = Object.keys(currentDict);
	var operations = {delete:[], insert:[]};
	operations.insert = incomingKeys.filter(x=> currentKeys.indexOf(x) === -1)
	operations.delete = currentKeys.filter(x=> incomingKeys.indexOf(x) === -1)
	return operations;
}
