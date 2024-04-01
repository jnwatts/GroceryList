class GroceryList {
    config;
    data;

    constructor() {
        var val;
        val = window.localStorage.getItem('grocerylist-config');
        this.config = val ? JSON.parse(val) : {};
        val = window.localStorage.getItem('grocerylist-data');
        this.data = val ? JSON.parse(val) : {
            'lists': [
                {'id': 0, 'name': 'Groceries', 'next_id': 2, 'entries': [
                    {'id': 0, 'value': 'Beer', 'checked': true},
                    {'id': 1, 'value': 'More beer', 'checked': false}
                ]},
                {'id': 1, 'name': 'TODO', 'next_id': 0, 'entries': [
                ]}
            ],
            'last_list': 0,
            'next_id': 2
        }
        this.renderLists();
        this.renderEntries();

        document.getElementById('lists').addEventListener('change', (e) => this.listChanged(e));
        document.getElementById('lists-checkout').addEventListener('click', (e) => this.listCheckout(e));
        document.getElementById('lists-clear').addEventListener('click', (e) => this.listClear(e));

        document.getElementById('input-add').addEventListener('click', (e) => this.inputAddClick(e));
        document.getElementById('input').addEventListener('keyup', (e) => this.inputKeyup(e));
        document.getElementById('input-clear').addEventListener('click', (e) => this.inputClear(e));
    }

    save() {
        window.localStorage.setItem('grocerylist-config', JSON.stringify(this.config));
        window.localStorage.setItem('grocerylist-data', JSON.stringify(this.data));
    }

    listChanged(e) {
        this.data.last_list = parseInt(e.target.value);
        this.save();
        this.renderEntries();
    }

    listCheckout(e) {
        const last_list = this.data.last_list;
        this.data.lists[last_list].entries = this.data.lists[last_list]?.entries?.filter((e) => !e.checked);
        this.save();
        this.renderEntries();
    }

    listClear(e) {
        const last_list = this.data.last_list;
        this.data.lists[last_list].entries = [];
        this.save();
        this.renderEntries();
    }

    renderLists() {
        const last_list = this.data.last_list;
        var lists = this.data.lists.map((l) => {
            return `<option value='${l.id}' ${(l.id == last_list) ? 'selected' : ''}>${l.name}</option>`
        });
        document.getElementById('lists').innerHTML = lists.join('\n');
    }

    inputAddClick(e) {
        var o = document.getElementById('input');
        this.entryAdd(o.value);
        this.inputClear(e);
    }

    inputKeyup(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.entryAdd(e.target.value);
            this.inputClear(e);
        }
    }

    inputClear(e) {
        var o = document.getElementById('input');
        o.value = '';
    }

    entryAdd(value) {
        if (value === undefined || value === null)
            return;
        value = value.trim();
        if (value == '')
            return;
        const last_list = this.data.last_list;
        var list = this.data.lists[last_list];
        this.data.lists[last_list].entries.push({
            'id': list.next_id++,
            'value': value,
            'checked': false
        });
        this.renderEntries();
        this.save();
    }

    entryChanged(e) {
        const last_list = this.data.last_list;
        this.data.lists[last_list].entries[e.target.dataset.id].checked = !!e.target.checked;
    }

    renderEntries() {
        const last_list = this.data.last_list;
        var entries = this.data.lists[last_list]?.entries?.map((e) => {
            return `<li class="entry"><label><input type="checkbox" data-id="${e.id}" ${e.checked ? 'checked' : ''}>${e.value}</label> </li>`;
        });
        document.getElementById('entries').innerHTML = entries?.join('\n') || 'This list is empty';
        
        for (let o of document.getElementsByClassName('entry')) {
            o.addEventListener('change', (e) => this.entryChanged(e));
        };
    }
}

window.addEventListener('load', () => {
    window.GroceryList = new GroceryList();
});
