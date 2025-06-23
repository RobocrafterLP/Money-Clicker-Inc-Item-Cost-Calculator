let Cost = {};
let selectedItems = [];
let itemQuantities = new Map();

async function loadCostData() {
	try {
		const response = await fetch('cost.json');
		if (!response.ok) throw new Error('Failed to load cost.json');
		Cost = await response.json();
		populateItemGrid();
	} catch (error) {
		console.error('Error loading cost data:', error);
		document.getElementById('item-grid').innerHTML =
			'<span class="error">Failed to load cost data. Please try again later.</span>';
	}
}

function populateItemGrid() {
	const itemGrid = document.getElementById('item-grid');
	const itemOrder = [
		'Wire1',
		'Wire2',
		'Wire3',
		'Wire4',
		'Chip1',
		'Chip2',
		'Chip3',
		'Chip4',
		'Chip5',
		'Chip6',
		'Computer1',
		'Computer2',
		'Computer3',
		'Computer4',
		'Computer5',
		'Computer6',
		'Battery1',
		'Battery2',
		'Battery3',
		'SpecialPlate',
		'Wire5',
		'Chip7',
		'Computer7',
		'Battery4',
	];
	itemOrder.forEach((item) => {
		if (Cost[item]) {
			const prefix =
				item.match(/^(Battery|Chip|Computer|Wire|SpecialPlate)/)?.[0] ||
				'';
			const number = item.match(/\d+$/)?.[0] || '';
			const className = prefix
				? `${prefix.toLowerCase()}${number ? `-${number}` : ''}`
				: 'item';
			const itemDiv = document.createElement('div');
			itemDiv.className = `item ${className}`;
			itemDiv.textContent = item;
			itemDiv.onclick = () => addItem(item);
			itemGrid.appendChild(itemDiv);
		}
	});
}

function addItem(item) {
	if (!selectedItems.includes(item)) {
		selectedItems.push(item);
		itemQuantities.set(item, 1);
		updateSelectedList();
	}
}

function removeItem(item) {
	selectedItems = selectedItems.filter((i) => i !== item);
	itemQuantities.delete(item);
	updateSelectedList();
}

function updateSelectedList() {
	const selectedList = document.getElementById('selected-list');
	selectedList.innerHTML = '';
	selectedItems.forEach((item) => {
		const prefix =
			item.match(/^(Battery|Chip|Computer|Wire|SpecialPlate)/)?.[0] || '';
		const number = item.match(/\d+$/)?.[0] || '';
		const className = prefix
			? `${prefix.toLowerCase()}${number ? `-${number}` : ''}`
			: 'item';
		const itemDiv = document.createElement('div');
		itemDiv.className = 'selected-item';
		const span = document.createElement('span');
		span.className = className;
		span.textContent = item;
		const amountInput = document.createElement('input');
		amountInput.type = 'number';
		amountInput.id = `amount-${item}`;
		amountInput.value = itemQuantities.get(item) || 1;
		amountInput.min = '0';
		amountInput.oninput = () =>
			itemQuantities.set(item, parseInt(amountInput.value) || 0);
		const removeBtn = document.createElement('button');
		removeBtn.textContent = 'Remove';
		removeBtn.onclick = () => removeItem(item);
		itemDiv.appendChild(span);
		itemDiv.appendChild(amountInput);
		itemDiv.appendChild(removeBtn);
		selectedList.appendChild(itemDiv);
	});
}

const sortObject = (o) =>
	Object.keys(o)
		.sort()
		.reduce((r, k) => ((r[k] = o[k]), r), {});

function GetItem(Item) {
	return Cost[Item] || {};
}

function GetCost(Item, Amount, CostTable) {
	CostTable = CostTable || {};
	Object.entries(GetItem(Item)).forEach(([item, cost]) => {
		CostTable[item] = (CostTable[item] || 0) + cost * Amount;
		GetCost(item, cost * Amount, CostTable);
	});
	return CostTable;
}

function calculateCost() {
	const totalCostDiv = document.getElementById('total-cost');
	totalCostDiv.innerHTML = '';

	const validItems = selectedItems.filter((item) => {
		const amountInput = document.getElementById(`amount-${item}`);
		return amountInput && parseInt(amountInput.value) > 0;
	});

	if (validItems.length === 0) {
		totalCostDiv.innerHTML =
			'<span class="error">Please select at least one item with a valid amount (greater than 0).</span>';
		return;
	}

	const totalCost = {};
	validItems.forEach((item) => {
		const amountInput = document.getElementById(`amount-${item}`);
		const amount = parseInt(amountInput.value);
		const cost = GetCost(item, amount);
		Object.entries(cost).forEach(([material, qty]) => {
			totalCost[material] = (totalCost[material] || 0) + qty;
		});
	});

	let totalOutput = 'Total Cost:\n';
	for (const [material, qty] of Object.entries(sortObject(totalCost))) {
		const materialPrefix =
			material.match(/^(Battery|Chip|Computer|Wire|SpecialPlate)/)?.[0] ||
			'';
		const materialNumber = material.match(/\d+$/)?.[0] || '';
		const materialClass = materialPrefix
			? `${materialPrefix.toLowerCase()}${
					materialNumber ? `-${materialNumber}` : ''
			  }`
			: `material-${material.toLowerCase().replace(/\s+/g, '-')}`;
		totalOutput += `  <span class="${materialClass}">${material}</span>: <span class="cost-number">${qty}</span>\n`;
	}
	totalCostDiv.innerHTML = totalOutput;
}

function resetAll() {
	selectedItems = [];
	itemQuantities.clear();
	updateSelectedList();
	document.getElementById('total-cost').innerHTML = '';
}

loadCostData();
