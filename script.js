// API endpoint (for real app, this would be your server address)
const API_URL = 'http://localhost/ecopantry/api';

// Sample data for demo purposes
const samplePantryItems = [
    {id: '1', name: 'Carrots', quantity: 5, unit: 'pcs', category: 'vegetable', addedDate: '2025-04-30', expiryDate: '2025-05-07'},
    {id: '2', name: 'Apples', quantity: 6, unit: 'pcs', category: 'fruit', addedDate: '2025-05-01', expiryDate: '2025-05-15'},
    {id: '3', name: 'Milk', quantity: 1, unit: 'l', category: 'dairy', addedDate: '2025-05-02', expiryDate: '2025-05-06'},
    {id: '4', name: 'Chicken Breast', quantity: 0.5, unit: 'kg', category: 'protein', addedDate: '2025-05-01', expiryDate: '2025-05-05'},
    {id: '5', name: 'Pasta', quantity: 1, unit: 'kg', category: 'grain', addedDate: '2025-04-20', expiryDate: '2025-12-31'},
];

const sampleWasteItems = [
    {id: '1', name: 'Tomatoes', weight: 0.3, type: 'vegetable', reason: 'spoiled', date: '2025-04-28'},
    {id: '2', name: 'Bread', weight: 0.2, type: 'grain', reason: 'expired', date: '2025-05-01'},
    {id: '3', name: 'Yogurt', weight: 0.15, type: 'dairy', reason: 'expired', date: '2025-05-02'},
];

const sampleEcoReport = {
    currentMonth: 'May 2025',
    totalWaste: 0.65,
    wasteReduction: 0.35,
    percentChange: 35.0,
    composition: {
        'vegetable': 0.3,
        'grain': 0.2,
        'dairy': 0.15
    },
    environmentalImpact: {
        co2Saved: 0.88,
        waterSaved: 350
    },
    sustainabilityTips: [
        "Store bread in the freezer to extend its shelf life.",
        "Use vegetable scraps to make homemade stock.",
        "Plan your meals based on what needs to be used first."
    ],
    ecoRank: "Eco Champion"
};

const sampleRecipes = [
    {
        id: 'recipe1',
        name: 'Vegetable Stir Fry',
        ingredients: ['carrot', 'broccoli', 'bell pepper', 'onion'],
        sustainabilityScore: 85,
        instructions: "1. Chop all vegetables.\n2. Heat oil in pan.\n3. Stir fry vegetables for 5-7 minutes.\n4. Add sauce and serve."
    },
    {
        id: 'recipe2',
        name: 'Fruit Smoothie',
        ingredients: ['banana', 'apple', 'yogurt', 'honey'],
        sustainabilityScore: 90,
        instructions: "1. Peel and chop fruits.\n2. Add all ingredients to blender.\n3. Blend until smooth.\n4. Serve immediately."
    },
    {
        id: 'recipe3',
        name: 'Pasta Primavera',
        ingredients: ['pasta', 'tomato', 'zucchini', 'spinach'],
        sustainabilityScore: 80,
        instructions: "1. Cook pasta according to package.\n2. Sauté vegetables.\n3. Combine pasta and vegetables.\n4. Season and serve."
    }
];

// DOM setup
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const expiryInput = document.getElementById('item-expiry');
    if (expiryInput) expiryInput.value = today;

    // Tab navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const tabId = this.getAttribute('data-tab');

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Initialize app
    initApp();
});

function initApp() {
    loadPantryItems();
    loadWasteItems();
    loadRecipes();
    loadEcoReport();
    setupEventListeners();
}

function setupEventListeners() {
    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
        addItemForm.addEventListener('submit', function(event) {
            event.preventDefault();
            addPantryItem();
        });
    }

    const logWasteForm = document.getElementById('log-waste-form');
    if (logWasteForm) {
        logWasteForm.addEventListener('submit', function(event) {
            event.preventDefault();
            logWasteItem();
        });
    }
}

// ====== Pantry Functions ======
function loadPantryItems() {
    try {
        const items = JSON.parse(localStorage.getItem('pantryItems')) || samplePantryItems;
        displayPantryItems(items);
        checkExpiringItems(items);
    } catch (error) {
        showAlert('Failed to load pantry items', 'danger');
        console.error(error);
    }
}

function displayPantryItems(items) {
    const tbody = document.getElementById('pantry-items');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No items in pantry</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => {
        const today = new Date();
        const expiryDate = new Date(item.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        const expiryClass = daysUntilExpiry <= 3 ? 'expiring' : '';

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>${item.category}</td>
                <td class="${expiryClass}">${item.expiryDate} ${daysUntilExpiry <= 3 ? `(${daysUntilExpiry} days)` : ''}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeItem('${item.id}')">Remove</button>
                    <button class="btn btn-sm" onclick="logItemAsWaste('${item.id}')">Log as Waste</button>
                </td>
            </tr>
        `;
    }).join('');
}

function addPantryItem() {
    const name = document.getElementById('item-name').value.trim();
    const quantity = parseFloat(document.getElementById('item-quantity').value);
    const unit = document.getElementById('item-unit').value;
    const category = document.getElementById('item-category').value;
    const expiryDate = document.getElementById('item-expiry').value;

    if (!name || isNaN(quantity) || quantity <= 0) {
        showAlert('Please enter a valid name and quantity.', 'danger');
        return;
    }

    const newItem = {
        id: Date.now().toString(),
        name,
        quantity,
        unit,
        category,
        addedDate: new Date().toISOString().split('T')[0],
        expiryDate
    };

    const items = JSON.parse(localStorage.getItem('pantryItems')) || samplePantryItems;
    items.push(newItem);
    localStorage.setItem('pantryItems', JSON.stringify(items));

    loadPantryItems();
    document.getElementById('add-item-form').reset();
    showAlert(`${name} added to pantry`, 'success');
}

function removeItem(id) {
    const items = JSON.parse(localStorage.getItem('pantryItems')) || samplePantryItems;
    const updated = items.filter(it => it.id !== id);
    localStorage.setItem('pantryItems', JSON.stringify(updated));
    loadPantryItems();
    showAlert('Item removed from pantry', 'success');
}

function logItemAsWaste(id) {
    const items = JSON.parse(localStorage.getItem('pantryItems')) || samplePantryItems;
    const item = items.find(it => it.id === id);
    if (!item) return;

    const wasteName = document.getElementById('waste-name');
    const wasteType = document.getElementById('waste-type');
    const wasteWeight = document.getElementById('waste-weight');
    if (wasteName) wasteName.value = item.name;
    if (wasteType) wasteType.value = item.category;
    if (wasteWeight) {
        let estimated = 0.1;
        if (item.unit === 'kg') estimated = item.quantity;
        else if (item.unit === 'g') estimated = item.quantity / 1000;
        else if (item.unit === 'pcs') estimated = item.quantity * 0.1;
        wasteWeight.value = estimated;
    }

    // Switch to waste tab
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-tab="waste"]').classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('waste').classList.add('active');

    // Remove from pantry
    removeItem(id);
}

function checkExpiringItems(items) {
    const today = new Date();
    const expiring = items.filter(item => {
        const expiry = new Date(item.expiryDate);
        const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return days <= 3 && days >= 0;
    });

    const container = document.getElementById('expiring-items');
    if (!container) return;

    if (expiring.length === 0) {
        container.innerHTML = '<p>No items expiring soon. Great job!</p>';
        return;
    }

    container.innerHTML = `
        <p>You have ${expiring.length} items expiring soon:</p>
        <ul>
            ${expiring.map(item => `<li><strong>${item.name}</strong> (${item.quantity} ${item.unit}) expires on ${item.expiryDate}</li>`).join('')}
        </ul>
        <p>Consider using these items soon to reduce waste!</p>
    `;
}

// ====== Waste Functions ======
function loadWasteItems() {
    try {
        const items = JSON.parse(localStorage.getItem('wasteItems')) || sampleWasteItems;
        displayWasteItems(items);
        updateWasteSummary(items);
    } catch (error) {
        showAlert('Failed to load waste log', 'danger');
        console.error(error);
    }
}

function displayWasteItems(items) {
    const tbody = document.getElementById('waste-items');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No waste logged yet</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.name}</td>
            <td>${item.weight}</td>
            <td>${item.type}</td>
            <td>${item.reason}</td>
        </tr>
    `).join('');
}

function logWasteItem() {
    const name = document.getElementById('waste-name').value.trim();
    const weight = parseFloat(document.getElementById('waste-weight').value);
    const type = document.getElementById('waste-type').value;
    const reason = document.getElementById('waste-reason').value;

    if (!name || isNaN(weight) || weight <= 0) {
        showAlert('Enter a valid item name and weight.', 'danger');
        return;
    }

    const newWaste = {
        id: Date.now().toString(),
        name,
        weight,
        type,
        reason,
        date: new Date().toISOString().split('T')[0]
    };

    const items = JSON.parse(localStorage.getItem('wasteItems')) || sampleWasteItems;
    items.push(newWaste);
    localStorage.setItem('wasteItems', JSON.stringify(items));

    loadWasteItems();
    loadEcoReport();
    document.getElementById('log-waste-form').reset();
    showAlert(`${name} logged as waste`, 'success');
}

function updateWasteSummary(items) {
    const el = document.getElementById('waste-summary');
    if (!el) return;

    const today = new Date();
    const m = today.getMonth();
    const y = today.getFullYear();

    const thisMonth = items.filter(item => {
        const d = new Date(item.date);
        return d.getMonth() === m && d.getFullYear() === y;
    });

    const total = thisMonth.reduce((sum, it) => sum + parseFloat(it.weight), 0);
    el.innerHTML = `<p>This month's total food waste: <strong>${total.toFixed(2)} kg</strong></p>`;
}

// ====== Recipe Functions ======
function loadRecipes() {
    try {
        const pantry = JSON.parse(localStorage.getItem('pantryItems')) || samplePantryItems;
        const matching = findMatchingRecipes(pantry, sampleRecipes);
        displayRecipeSuggestions(matching);
    } catch (error) {
        showAlert('Failed to load recipe suggestions', 'danger');
        console.error(error);
    }
}

function findMatchingRecipes(pantryItems, recipes) {
    const pantryIngredients = pantryItems.map(i => i.name.toLowerCase());
    return recipes.filter(recipe => {
        let match = 0;
        recipe.ingredients.forEach(ing => {
            if (pantryIngredients.some(item => item.includes(ing) || ing.includes(item))) match++;
        });
        return match >= recipe.ingredients.length / 2;
    });
}

function displayRecipeSuggestions(recipes) {
    const dashEl = document.getElementById('recipe-suggestions');
    const listEl = document.getElementById('recipe-list');
    if (!dashEl || !listEl) return;

    if (recipes.length === 0) {
        dashEl.innerHTML = '<p>No recipe suggestions available.</p>';
        listEl.innerHTML = '<p>No recipe suggestions available. Add more items to your pantry!</p>';
        return;
    }

    dashEl.innerHTML = `
        <p>We found ${recipes.length} recipes you can make with your pantry items!</p>
        <ul>
            ${recipes.slice(0, 3).map(r => `<li><strong>${r.name}</strong> - Sustainability Score: <span class="eco-badge">${r.sustainabilityScore}%</span></li>`).join('')}
        </ul>
    `;

    listEl.innerHTML = recipes.map(r => `
        <div class="card" style="margin-bottom: 1rem;">
            <h4>${r.name}</h4>
            <p>Sustainability Score: <span class="eco-badge">${r.sustainabilityScore}%</span></p>
            <p><strong>Ingredients:</strong> ${r.ingredients.join(', ')}</p>
            <p><strong>Instructions:</strong></p>
            <pre>${r.instructions}</pre>
        </div>
    `).join('');
}

// ====== Eco Report Functions ======
function loadEcoReport() {
    try {
        const wasteItems = JSON.parse(localStorage.getItem('wasteItems')) || sampleWasteItems;
        const report = {...sampleEcoReport};

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const thisMonthWaste = wasteItems.filter(item => {
            const d = new Date(item.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalWeight = thisMonthWaste.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        report.totalWaste = totalWeight;

        displayEcoReport(report);
    } catch (error) {
        showAlert('Failed to load eco report', 'danger');
        console.error(error);
    }
}

function displayEcoReport(report) {
    // Monthly summary
    const monthlyEl = document.getElementById('monthly-summary');
    if (monthlyEl) {
        monthlyEl.innerHTML = `
            <p>Month: <strong>${report.currentMonth}</strong></p>
            <p>Total Food Waste: <strong>${report.totalWaste.toFixed(2)} kg</strong></p>
            <p>Waste Reduction: <strong>${report.wasteReduction.toFixed(2)} kg</strong> (${report.percentChange.toFixed(1)}% less than last month)</p>
            <p>Your Eco Rank: <span class="eco-badge">${report.ecoRank}</span></p>
        `;
    }

    // Environmental impact
    const envEl = document.getElementById('env-impact');
    if (envEl) {
        envEl.innerHTML = `
            <p>By reducing food waste, you've saved:</p>
            <ul>
                <li><strong>${report.environmentalImpact.co2Saved.toFixed(2)} kg</strong> of CO2 emissions</li>
                <li><strong>${report.environmentalImpact.waterSaved} liters</strong> of water</li>
            </ul>
            <p>That's equivalent to:</p>
            <ul>
                <li>Driving ${(report.environmentalImpact.co2Saved * 4).toFixed(1)} km less in a car</li>
                <li>${Math.round(report.environmentalImpact.waterSaved / 250)} days of household water usage</li>
            </ul>
        `;
    }

    // Dashboard progress/rank
    const rankEl = document.getElementById('eco-rank');
    if (rankEl) {
        const progressPercent = Math.min(100, Math.max(0, report.percentChange));
        rankEl.innerHTML = `
            <p>Your current rank: <span class="eco-badge">${report.ecoRank}</span></p>
            <p>You've reduced your food waste by ${report.percentChange.toFixed(1)}% compared to last month!</p>
        `;

        const bar = document.getElementById('eco-progress');
        if (bar) {
            bar.style.width = `${progressPercent}%`;
            bar.textContent = `${Math.round(progressPercent)}%`;
        }
    }

    // Personalized tips
    const tipsEl = document.getElementById('personalized-tips');
    if (tipsEl) {
        tipsEl.innerHTML = report.sustainabilityTips.map(t => `<div class="sustainability-tip">${t}</div>`).join('');
    }
}

// ====== Utility ======
function showAlert(message, type) {
    const alertsEl = document.getElementById('alerts');
    if (!alertsEl) return;
    const el = document.createElement('div');
    el.className = `alert alert-${type}`;
    el.textContent = message;
    alertsEl.appendChild(el);
    setTimeout(() => el.remove(), 5000);
}

// In a real app, this would be used for API calls
async function fetchData(url, method, data = null) {
    try {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
