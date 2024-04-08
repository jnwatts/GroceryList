class GroceryList {
    config;
    data;

    constructor() {
        var val;
        val = window.localStorage.getItem('grocerylist-config');
        this.config = val ? JSON.parse(val) : {};
        val = window.localStorage.getItem('grocerylist-data');
        this.data = val ? JSON.parse(val) : this.defaultData();
        this.upgradeData();
        this.renderLists();
        this.renderEntries();

        document.getElementById('lists').addEventListener('change', (e) => this.listChanged(e));
        document.getElementById('lists-checkout').addEventListener('click', (e) => this.listCheckout(e));
        document.getElementById('lists-clear').addEventListener('click', (e) => this.listClear(e));
        document.getElementById('lists-export').addEventListener('click', (e) => this.listExport(e));
        document.getElementById('lists-import').addEventListener('click', (e) => this.listImport(e));
        document.getElementById('lists-new').addEventListener('click', (e) => this.listNew(e));
        document.getElementById('lists-rename').addEventListener('click', (e) => this.listRename(e));
        document.getElementById('lists-delete').addEventListener('click', (e) => this.listDelete(e));

        document.getElementById('input-add').addEventListener('click', (e) => this.inputAddClick(e));
        document.getElementById('input').addEventListener('keyup', (e) => this.inputKeyup(e));
        document.getElementById('input-clear').addEventListener('click', (e) => this.inputClear(e));
    }

    save() {
        window.localStorage.setItem('grocerylist-config', JSON.stringify(this.config));
        window.localStorage.setItem('grocerylist-data', JSON.stringify(this.data));
    }

    defaultData() {
        return {
            'v': 2,
            'lists': {
                '0': {'id': 0, 'name': 'Groceries', 'next_id': 2, 'entries': [
                    {'id': 0, 'value': 'Beer', 'checked': true},
                    {'id': 1, 'value': 'More beer', 'checked': false}
                ]},
                '1': {'id': 1, 'name': 'TODO', 'next_id': 0, 'entries': [
                ]}
            },
            'last_list': 0,
            'next_id': 2
        };
    }

    upgradeData() {
        var v = ('v' in this.data ? this.data.v : 1);
        if (v == 1) {
            this.data.v = 2;
            this.data.lists = this.data.lists.reduce((lists,l) => (lists[l.id] = l,lists), {});
        }
        this.save();
    }

    async textRequest(user_args) {
        const default_args = {
            "ok": true,
            "cancel": true,
            "request": "Request",
            "hint": undefined,
            "default": undefined,
        };
        const args = {...default_args, ...user_args};
        const popup_template = document.getElementById('popup-text');
        var popup = popup_template.content.cloneNode(true);
        var response = popup.querySelector('#popup-response');
        if (args.hint) {
            response.setAttribute('placeholder', args.hint);
        }
        if (args.default) {
            response.value = args.default;
        }
        var ok = popup.querySelector('#popup-ok');
        if (!args.ok) {
            ok.parentNode.removeChild(ok);
        }
        var cancel = popup.querySelector('#popup-cancel');
        if (!args.cancel) {
            cancel.parentNode.removeChild(cancel);
        }
        var request = popup.querySelector('#popup-request');
        if (args.request) {
            request.innerText = args.request;
        }
        document.body.appendChild(popup);
        var result = await new Promise((resolve) => {
            ok.addEventListener('click', (e) => resolve(response.value));
            cancel.addEventListener('click', (e) => resolve(undefined));
            response.addEventListener('keyup', (e) => {
                if (e.keyCode === 27) {
                    e.preventDefault();
                    resolve(undefined);
                }
            })
        });
        document.body.removeChild(document.getElementById('popup'));
        return result;
    }

    listSet(id) {
        this.data.last_list = parseInt(id);
        var lists = document.getElementById('lists');
        lists.value = this.data.last_list;
        this.renderEntries();
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

    listExport(e) {
        const last_list = this.data.last_list;
        navigator.clipboard.writeText(JSON.stringify(this.data.lists[last_list]));
    }

    async listImport(e) {
        const response = await this.textRequest({"request": "Import list", "hint": "Paste json data here"})
        var list;
        try {
            list = JSON.parse(response);
        } catch {
            return;
        }
        console.log(list);
        if (list.id in this.data.lists) {
            delete this.data.lists[list.id];
        }
        this.data.lists[list.id] = list;
        this.renderLists();
        this.listSet(list.id);
    }

    async listNew(e) {
        const response = await this.textRequest({
            "request": "New list",
            "hint": "Name of list"
        });
        if (!response) {
            return;
        }
        var lists = Object.values(this.data.lists).map((l) => l.name);
        if (response in lists) {
            return;
        }
        var list_id = this.data.next_id++;
        this.data.lists[list_id] = {
            "id": list_id,
            "name": response,
            "next_id": 0,
            "entries": [],
        };
        this.renderLists();
        this.listSet(list_id);
        this.save();
    }

    async listRename(e) {
        const response = await this.textRequest({
            "request": "New list",
            "default": this.data.lists[this.data.last_list].name,
        });
        if (!response) {
            return;
        }
        var lists = Object.values(this.data.lists).map((l) => l.name);
        if (response in lists) {
            return;
        }
        this.data.lists[this.data.last_list].name = response;
        this.renderLists();
        this.save();
    }

    async listDelete(e) {
        if (Object.keys(this.data.lists).length <= 1) {
            return;
        }
        delete this.data.lists[this.data.last_list];
        this.renderLists();
        this.listSet(Object.keys(this.data.lists));
        this.save();
    }

    renderLists() {
        const last_list = this.data.last_list;
        var lists = Object.values(this.data.lists).map((l) => {
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
        var entries = this.data.lists[last_list].entries.map((e) => {
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
