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

        this.updateLightMode();
        this.renderLists();
        this.renderEntries();

        document.getElementById('light-mode').checked = !!this.data?.light_mode;
        document.getElementById('light-mode').addEventListener('change', (e) => this.lightMode(e));
        document.getElementById('nuke').addEventListener('click', (e) => this.nuke());
        document.getElementById('lists').addEventListener('change', (e) => this.listChanged(e));
        document.getElementById('lists-checkout').addEventListener('click', (e) => this.listCheckout(e));
        document.getElementById('lists-clear').addEventListener('click', (e) => this.listClear(e));
        document.getElementById('lists-export').addEventListener('click', (e) => this.listExport(e));
        document.getElementById('lists-import').addEventListener('click', (e) => this.listImport(e));
        document.getElementById('lists-new').addEventListener('click', (e) => this.listNew(e));
        document.getElementById('lists-rename').addEventListener('click', (e) => this.listRename(e));
        document.getElementById('lists-delete').addEventListener('click', (e) => this.listDelete(e));
        document.getElementById('lists-expand').addEventListener('click', (e) => this.listPanelExpand(e));

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
            'lists': [
                {'name': 'Groceries', 'next_id': 2, 'entries': [
                    {'value': 'Beer', 'checked': true},
                    {'value': 'More beer', 'checked': false}
                ]},
                {'name': 'TODO', 'next_id': 0, 'entries': []}
            ],
            'last_list': 0,
        };
    }

    nuke() {
        this.data = this.defaultData();
        this.renderLists();
        this.renderEntries();
        this.save();
    }

    upgradeData() {
        var old_v = ('v' in this.data ? this.data.v : 1);
        var new_v = 1;

        if (old_v == 1) {
            if (this.data.lists == undefined) {
                this.data = this.defaultData();
                old_v = undefined;
            }
        }

        if (old_v != new_v) {
            this.save();
        }
    }

    lightMode(e) {
        this.data.light_mode = !!e.target.checked;
        this.updateLightMode();
        this.save();
    }

    updateLightMode(e) {
        document.body.setAttribute('data-theme', (this.data?.light_mode ? 'light' : 'dark'));
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

    listGet() {
        return this.data.lists[this.data.last_list];
    }

    listAdd(list) {
        this.listDeleteByName(list.name);
        this.data.lists.push(list);
        this.renderLists();
        this.listSet(this.listGetByName(list.name));
        this.save();
    }

    listGetByName(name) {
        return this.data.lists.find((l) => l.name == name);
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
        navigator.clipboard.writeText(JSON.stringify(this.listGet()));
    }

    async listImport(e) {
        const response = await this.textRequest({"request": "Import list", "hint": "Paste json data here"})
        var list;
        try {
            list = JSON.parse(response);
        } catch {
            return;
        }

        this.listAdd(list);
    }

    async listNew(e) {
        const response = await this.textRequest({
            "request": "New list",
            "hint": "Name of list"
        });
        if (!response) {
            return;
        }
        this.listAdd({
            "name": response,
            "entries": [],
        });
    }

    async listRename(e) {
        var list = this.listGet();
        const response = await this.textRequest({
            "request": "New list",
            "default": list.name,
        });
        if (!response) {
            return;
        }
        if (response == list.name) {
            return;
        }
        if (this.listGetByName(response) != undefined) {
            return;
        }
        list.name = response;
        this.renderLists();
        this.save();
    }

    listDelete(e) {
        if (this.data.lists.length <= 1) {
            return;
        }
        if (this.data.last_list >= this.data.lists.length) {
            return;
        }
        delete this.data.lists[this.data.last_list];
        this.renderLists();
        this.listSet(0);
        this.save();
    }

    listDeleteByName(name) {
        this.data.lists.filter((l) => l.name == name);
    }

    listPanelExpand(e) {
        const el = document.getElementById('lists-panel'),
              ch = el.clientHeight,
              sh = el.scrollHeight,
              isCollapsed = !ch,
              noHeightSet = !el.style.height;
        el.style.height = el.style.height = (isCollapsed || noHeightSet ? sh : 0) + "px";
    }

    renderLists() {
        const last_list = this.data.last_list;
        document.getElementById('lists').innerHTML = this.data.lists.map((l,i) => {
            if (!l) { return null; }
            return `<option value='${i}' ${(i == last_list) ? 'selected' : ''}>${l.name}</option>`
        }).join('');
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
        const list = this.listGet();
        list.entries.push({
            'value': value,
            'checked': false
        });
        this.renderEntries();
        this.save();
    }

    entryChanged(e) {
        const list = this.listGet();
        const i = e.target.dataset.id;
        list.entries[i].checked = !!e.target.checked;
        this.save();
    }

    renderEntries() {
        const list = this.listGet();
        document.getElementById('entries').innerHTML = list?.entries?.map((e, i) => {
            return `<li class="entry"><label><input type="checkbox" data-id="${i}" ${e.checked ? 'checked' : ''}>${e.value}</label> </li>`;
        })?.join('') || `<span id="list-empty">This list is empty</span>`;
        
        for (let o of document.getElementsByClassName('entry')) {
            o.addEventListener('change', (e) => this.entryChanged(e));
        };
    }
}

window.addEventListener('load', () => {
    window.GroceryList = new GroceryList();
});
