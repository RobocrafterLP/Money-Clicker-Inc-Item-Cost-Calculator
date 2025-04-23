const Cost = {
	Wire1: {
		Gold: 50,
		Aluminium: 1,
	},
	Wire2: {
		Gold: 500,
		Steel: 2,
		Wire1: 5,
	},
	Wire3: {
		Wire1: 10,
		Steel: 25,
		Wire2: 4,
		Gold: 20000,
	},
	Wire4: {
		'Special Steel': 50,
		Wire2: 20,
		Wire3: 10,
		Gold: 1000000,
		Steel: 425,
	},
	Chip1: {
		Aluminium: 5,
		Wire1: 5,
		Silver: 100,
	},
	Chip2: {
		Aluminium: 50,
		Wire2: 4,
		Silver: 1000,
		Gold: 100,
	},
	Chip3: {
		Aluminium: 500,
		Wire3: 5,
		Silver: 25000,
		Gold: 2000,
	},
	Chip4: {
		Steel: 1500,
		Wire4: 2,
		Silver: 1000000,
		Gold: 150000,
		Titanium: 2500,
	},
	Chip5: {
		Steel: 17500,
		Wire4: 25,
		Gold: 5000000,
		Mithril: 2500,
	},
	Chip6: {
		'Special Steel': 32500,
		Wire4: 500,
		Mithril: 250000,
	},
	Computer1: {
		Chip1: 3,
		Battery1: 5,
	},
	Computer2: {
		Chip2: 3,
		Battery1: 25,
	},
	Computer3: {
		Chip3: 3,
		Battery2: 2,
	},
	Computer4: {
		Chip4: 3,
		Battery2: 15,
	},
	Computer5: {
		Chip5: 3,
		Battery2: 100,
	},
	Computer6: {
		Chip6: 3,
		Battery2: 10,
	},
	Battery1: {
		Wire1: 2,
		Aluminium: 2,
		Gold: 100,
	},
	Battery2: {
		Wire3: 2,
		Steel: 100,
		Battery1: 100,
	},
	Battery3: {
		Wire4: 50,
		'Special Steel': 5000,
		Battery2: 100,
	},
	SpecialPlate: {
		'Toxic Steel': 1,
		Waste: 2,
		Uranium: 10,
		Wire4: 100,
	},
	Wire5: {
		SpecialPlate: 2,
		Battery3: 10,
		'Toxic Steel': 10,
		Wire4: 100,
	},
	Chip7: {
		SpecialPlate: 10,
		Battery4: 2,
		'Toxic Steel': 40,
		Wire5: 10,
	},
	Computer7: {
		SpecialPlate: 50,
		'Strong Fabric': 50,
		Battery4: 6,
		Chip7: 5,
	},
	Battery4: {
		SpecialPlate: 5,
		Battery3: 100,
		'Toxic Steel': 50,
		Wire5: 5,
	},
};

function populateItemList() {
	const itemList = document.getElementById('item-list');
	const items = Object.keys(Cost).sort();
	items.forEach((item) => {
		const prefix =
			item.match(/^(Battery|Chip|Computer|Wire|SpecialPlate)/)?.[0] || '';
		const number = item.match(/\d+$/)?.[0] || '';
		const className = prefix
			? `${prefix.toLowerCase()}${number ? `-${number}` : ''}`
			: 'item';
		const label = document.createElement('label');
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.value = item;
		const amountInput = document.createElement('input');
		amountInput.type = 'number';
		amountInput.id = `amount-${item}`;
		amountInput.value = '0';
		amountInput.min = '0';
		const span = document.createElement('span');
		span.className = className;
		span.textContent = item;
		label.appendChild(checkbox);
		label.appendChild(span);
		label.appendChild(amountInput);
		itemList.appendChild(label);
	});
}

// Populate item list on page load
populateItemList();

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
	const checkboxes = document.querySelectorAll(
		'#item-list input[type="checkbox"]:checked'
	);
	const selectedItems = Array.from(checkboxes).map((cb) => cb.value);
	const itemCostsDiv = document.getElementById('item-costs');
	const totalCostDiv = document.getElementById('total-cost');

	itemCostsDiv.innerHTML = '';
	totalCostDiv.innerHTML = '';

	if (selectedItems.length === 0) {
		itemCostsDiv.innerHTML =
			'<span class="error">Please select at least one item.</span>';
		return;
	}

	let itemOutput = '';
	let hasValidItem = false;
	const totalCost = {};

	// Calculate cost for each selected item
	selectedItems.forEach((item) => {
		const amountInput = document.getElementById(`amount-${item}`);
		const amount = parseInt(amountInput.value);

		if (isNaN(amount) || amount <= 0) {
			return; // Skip items with invalid or zero amount
		}

		const validItem = Object.keys(GetItem(item)).length > 0;
		if (!validItem) {
			itemOutput += `Invalid item: ${item}\n\n`;
			return;
		}

		hasValidItem = true;
		const prefix =
			item.match(/^(Battery|Chip|Computer|Wire|SpecialPlate)/)?.[0] || '';
		const number = item.match(/\d+$/)?.[0] || '';
		const className = prefix
			? `${prefix.toLowerCase()}${number ? `-${number}` : ''}`
			: 'item';

		const cost = sortObject(GetCost(item, amount));
		itemOutput += `Cost for x${amount} <span class="${className}">${item}</span>:\n`;
		for (const [material, qty] of Object.entries(cost)) {
			const materialPrefix =
				material.match(
					/^(Battery|Chip|Computer|Wire|SpecialPlate)/
				)?.[0] || '';
			const materialNumber = material.match(/\d+$/)?.[0] || '';
			const materialClass = materialPrefix
				? `${materialPrefix.toLowerCase()}${
						materialNumber ? `-${materialNumber}` : ''
				  }`
				: `material-${material.toLowerCase().replace(/\s+/g, '-')}`;
			itemOutput += `  <span class="${materialClass}">${material}</span>: <span class="cost-number">${qty}</span>\n`;
			totalCost[material] = (totalCost[material] || 0) + qty;
		}
		itemOutput += '\n';
	});

	if (!hasValidItem) {
		itemCostsDiv.innerHTML =
			'<span class="error">Please provide a valid amount (greater than 0) for at least one selected item.</span>';
		return;
	}

	// Display individual item costs
	itemCostsDiv.innerHTML = itemOutput;

	// Display total cost
	let totalOutput = 'Total Cost for All Selected Items:\n';
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
	const checkboxes = document.querySelectorAll(
		'#item-list input[type="checkbox"]'
	);
	const amountInputs = document.querySelectorAll(
		'#item-list input[type="number"]'
	);
	const itemCostsDiv = document.getElementById('item-costs');
	const totalCostDiv = document.getElementById('total-cost');

	checkboxes.forEach((checkbox) => {
		checkbox.checked = false;
	});
	amountInputs.forEach((input) => {
		input.value = '0';
	});
	itemCostsDiv.innerHTML = '';
	totalCostDiv.innerHTML = '';
}
