/**
 * Storage.js
 * 
 * Handles relational storage of all data tables.
 * Connects directly to the OneDrive local filesystem folder using HTML5 File System Access API.
 * Falls back to LocalStorage when the folder is not connected or not supported.
 */

// Embedded default seed data for immediate wow-factor on first loading
const DEFAULT_ACCOUNTS = [
  {
    "id": "acc-1",
    "name": "Conta Corrente Itaú",
    "initial_balance": 5000,
    "is_active": true,
    "created_at": "2026-07-01T10:00:00.000Z",
    "updated_at": "2026-07-01T10:00:00.000Z"
  },
  {
    "id": "acc-2",
    "name": "Reserva de Emergência",
    "initial_balance": 10000,
    "is_active": true,
    "created_at": "2026-07-01T10:00:00.000Z",
    "updated_at": "2026-07-01T10:00:00.000Z"
  }
];

const DEFAULT_CATEGORIES = [
  { "id": "cat-1", "name": "Salário Ana", "type": "income", "is_active": true },
  { "id": "cat-2", "name": "Salário Bruno", "type": "income", "is_active": true },
  { "id": "cat-3", "name": "Rendimentos", "type": "income", "is_active": true },
  { "id": "cat-4", "name": "Aluguel & Condomínio", "type": "expense", "is_active": true },
  { "id": "cat-5", "name": "Supermercado", "type": "expense", "is_active": true },
  { "id": "cat-6", "name": "Lazer & Restaurantes", "type": "expense", "is_active": true },
  { "id": "cat-7", "name": "Transporte", "type": "expense", "is_active": true },
  { "id": "cat-8", "name": "Saúde", "type": "expense", "is_active": true },
  { "id": "cat-9", "name": "Assinaturas & Serviços", "type": "expense", "is_active": true }
];

const DEFAULT_TRANSACTIONS = [
  {
    "id": "t-1",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-1",
    "description": "Salário Ana",
    "amount": 4500,
    "date": "2026-07-05",
    "status": "confirmed",
    "is_active": true,
    "created_at": "2026-07-05T08:00:00.000Z",
    "updated_at": "2026-07-05T08:00:00.000Z"
  },
  {
    "id": "t-2",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-2",
    "description": "Salário Bruno",
    "amount": 5000,
    "date": "2026-07-05",
    "status": "confirmed",
    "is_active": true,
    "created_at": "2026-07-05T08:00:00.000Z",
    "updated_at": "2026-07-05T08:00:00.000Z"
  },
  {
    "id": "t-3",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-4",
    "description": "Aluguel & Condomínio",
    "amount": -2500,
    "date": "2026-07-10",
    "status": "confirmed",
    "is_active": true,
    "created_at": "2026-07-10T10:00:00.000Z",
    "updated_at": "2026-07-10T10:00:00.000Z"
  },
  {
    "id": "t-4",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-5",
    "description": "Supermercado Semanal",
    "amount": -600,
    "date": "2026-07-08",
    "status": "confirmed",
    "is_active": true,
    "created_at": "2026-07-08T15:30:00.000Z",
    "updated_at": "2026-07-08T15:30:00.000Z"
  },
  {
    "id": "t-5",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-9",
    "description": "Netflix",
    "amount": -55,
    "date": "2026-07-08",
    "status": "confirmed",
    "is_active": true,
    "created_at": "2026-07-08T09:00:00.000Z",
    "updated_at": "2026-07-08T09:00:00.000Z"
  },
  {
    "id": "t-6",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-6",
    "description": "Jantar Especial de Casal",
    "amount": -250,
    "date": "2026-07-12",
    "status": "confirmed",
    "is_active": true,
    "created_at": "2026-07-12T21:00:00.000Z",
    "updated_at": "2026-07-12T21:00:00.000Z"
  },
  {
    "id": "t-7",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-5",
    "description": "Supermercado Previsto",
    "amount": -400,
    "date": "2026-07-18",
    "status": "planned",
    "is_active": true,
    "created_at": "2026-07-13T12:00:00.000Z",
    "updated_at": "2026-07-13T12:00:00.000Z"
  },
  {
    "id": "t-8",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-8",
    "description": "Farmácia Corrente",
    "amount": -150,
    "date": "2026-07-22",
    "status": "planned",
    "is_active": true,
    "created_at": "2026-07-13T12:00:00.000Z",
    "updated_at": "2026-07-13T12:00:00.000Z"
  },
  {
    "id": "t-9",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-9",
    "description": "Conta de Energia Elétrica",
    "amount": -350,
    "date": "2026-07-25",
    "status": "planned",
    "is_active": true,
    "created_at": "2026-07-13T12:00:00.000Z",
    "updated_at": "2026-07-13T12:00:00.000Z"
  },
  {
    "id": "t-10",
    "version": 1,
    "account_id": "acc-2",
    "category_id": "cat-3",
    "description": "Rendimentos Poupança",
    "amount": 150,
    "date": "2026-07-30",
    "status": "planned",
    "is_active": true,
    "created_at": "2026-07-13T12:00:00.000Z",
    "updated_at": "2026-07-13T12:00:00.000Z"
  },
  {
    "id": "t-11",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-7",
    "description": "Gasolina Semanal",
    "amount": -200,
    "date": "2026-07-14",
    "status": "planned",
    "is_active": true,
    "created_at": "2026-07-13T12:00:00.000Z",
    "updated_at": "2026-07-13T12:00:00.000Z"
  },
  {
    "id": "t-12",
    "version": 1,
    "account_id": "acc-1",
    "category_id": "cat-6",
    "description": "Viagem de Fim de Semana",
    "amount": -1200,
    "date": "2026-07-28",
    "status": "planned",
    "is_active": true,
    "created_at": "2026-07-13T12:00:00.000Z",
    "updated_at": "2026-07-13T12:00:00.000Z"
  }
];

// Simple IndexedDB wrapper to store folder handles across page reloads
const dbHelper = {
  open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("lumen_db_store", 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles");
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },
  async get(key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("handles", "readonly");
      const req = tx.objectStore("handles").get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async set(key, val) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("handles", "readwrite");
      const req = tx.objectStore("handles").put(val, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },
  async delete(key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("handles", "readwrite");
      const req = tx.objectStore("handles").delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }
};

class Storage {
  constructor() {
    this.directoryHandle = null;
    this.isUsingFileSystem = false;
    this.supabase = null;
    this.isUsingSupabase = false;
  }

  /**
   * Initializes the storage. Checks if a directory handle or Supabase connection was previously saved.
   */
  async init() {
    // 1. Initialize Supabase if connected
    let savedUrl = localStorage.getItem("lumen_supabase_url");
    let savedKey = localStorage.getItem("lumen_supabase_key");
    let isConnected = localStorage.getItem("lumen_supabase_connected") === "true";

    // Fallback to window config injection
    if (!savedUrl && window.LUMEN_CONFIG && window.LUMEN_CONFIG.SUPABASE_URL) {
      savedUrl = window.LUMEN_CONFIG.SUPABASE_URL;
    }
    if (!savedKey && window.LUMEN_CONFIG && window.LUMEN_CONFIG.SUPABASE_KEY) {
      savedKey = window.LUMEN_CONFIG.SUPABASE_KEY;
    }

    // Se encontrarmos URL e KEY via configuração, consideramos a conexão como ativa
    if (!isConnected && savedUrl && savedKey) {
      isConnected = true;
    }

    if (savedUrl && savedKey && isConnected && window.supabase) {
      try {
        let cleanUrl = savedUrl.trim().replace(/\/$/, "");
        if (cleanUrl.endsWith("/rest/v1")) {
          cleanUrl = cleanUrl.slice(0, -8).replace(/\/$/, "");
        }
        const client = window.supabase.createClient(cleanUrl, savedKey);
        const { data: { session } } = await client.auth.getSession();
        if (session) {
          this.supabase = client;
          this.isUsingSupabase = true;
          console.log("Conectado com sucesso ao Supabase Cloud.");
        } else {
          console.warn("Sessão do Supabase expirada. Necessário fazer login novamente.");
          this.isUsingSupabase = false;
        }
      } catch (err) {
        console.error("Erro ao restabelecer conexão com o Supabase:", err);
        this.isUsingSupabase = false;
      }
    }

    // 2. Fallback to check OneDrive if not using Supabase
    if (!this.isUsingSupabase) {
      try {
        const savedHandle = await dbHelper.get("onedrive_dir_handle");
        if (savedHandle) {
          const opts = { mode: "readwrite" };
          if ((await savedHandle.queryPermission(opts)) === "granted") {
            this.directoryHandle = savedHandle;
            this.isUsingFileSystem = true;
            console.log("Conectado com sucesso ao diretório do OneDrive persistido.");
          } else {
            console.log("Diretório OneDrive persistido encontrado, necessita de re-autorização.");
          }
        }
      } catch (e) {
        console.warn("IndexedDB indisponível ou erro na inicialização do OneDrive:", e);
      }
    }

    // 3. Initialize LocalStorage with seed data if completely empty
    if (!localStorage.getItem("lumen_accounts")) {
      localStorage.setItem("lumen_accounts", JSON.stringify(DEFAULT_ACCOUNTS));
      localStorage.setItem("lumen_categories", JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem("lumen_transactions", JSON.stringify(DEFAULT_TRANSACTIONS));
      localStorage.setItem("lumen_batches", JSON.stringify([]));
      localStorage.setItem("lumen_settings", JSON.stringify({ couple_names: "Paula & Alcides" }));
    }
  }

  /**
   * Log into Supabase database, persisting connection parameters.
   */
  async loginSupabase(url, anonKey, email, password) {
    if (!window.supabase) {
      throw new Error("A biblioteca do Supabase não foi carregada no navegador.");
    }

    let cleanUrl = url.trim().replace(/\/$/, "");
    if (cleanUrl.endsWith("/rest/v1")) {
      cleanUrl = cleanUrl.slice(0, -8).replace(/\/$/, "");
    }

    const client = window.supabase.createClient(cleanUrl, anonKey);
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }

    this.supabase = client;
    this.isUsingSupabase = true;
    localStorage.setItem("lumen_supabase_url", cleanUrl);
    localStorage.setItem("lumen_supabase_key", anonKey);
    localStorage.setItem("lumen_supabase_connected", "true");

    // Also disable OneDrive if active to prevent dual synchronization
    this.directoryHandle = null;
    this.isUsingFileSystem = false;
    await dbHelper.delete("onedrive_dir_handle");

    return data;
  }

  /**
   * Log out from Supabase database.
   */
  async logoutSupabase() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
    this.supabase = null;
    this.isUsingSupabase = false;
    localStorage.removeItem("lumen_supabase_connected");
    localStorage.removeItem("lumen_supabase_url");
    localStorage.removeItem("lumen_supabase_key");
  }

  isSupabaseConnected() {
    return this.isUsingSupabase && this.supabase !== null;
  }

  /**
   * Resets the entire database state (both LocalStorage and OneDrive)
   */
  async clearDatabase() {
    localStorage.setItem("lumen_accounts", JSON.stringify([]));
    localStorage.setItem("lumen_categories", JSON.stringify([]));
    localStorage.setItem("lumen_transactions", JSON.stringify([]));
    localStorage.setItem("lumen_batches", JSON.stringify([]));
    localStorage.setItem("lumen_settings", JSON.stringify({ couple_names: "Paula & Alcides" }));

    if (this.isUsingFileSystem && this.directoryHandle) {
      await this.saveToFileSystem({
        accounts: [],
        categories: [],
        transactions: [],
        batches: [],
        settings: { couple_names: "Paula & Alcides" }
      });
    }
  }

  /**
   * Prompts user to select the OneDrive folder, getting persistent read/write access.
   * If a handle was previously connected, it attempts to directly ask the browser for re-permission
   * without launching the folder picker overlay.
   */
  async connectOneDriveFolder() {
    if (!window.showDirectoryPicker) {
      throw new Error("A File System Access API não é suportada neste navegador. Use Chrome, Edge ou Opera.");
    }
    try {
      // 1. Try to reuse the previously saved handle to bypass selecting the folder again
      const savedHandle = await dbHelper.get("onedrive_dir_handle");
      if (savedHandle) {
        const opts = { mode: "readwrite" };
        const perm = await savedHandle.requestPermission(opts);
        if (perm === "granted") {
          this.directoryHandle = savedHandle;
          this.isUsingFileSystem = true;
          return true;
        }
      }

      // 2. If no saved handle or permission denied/dismissed, show directory picker
      const handle = await window.showDirectoryPicker();
      this.directoryHandle = handle;
      this.isUsingFileSystem = true;
      await dbHelper.set("onedrive_dir_handle", handle);
      
      // Load current local data and merge/sync to files on initial connect
      const localData = this.loadFromLocalStorage();
      await this.saveToFileSystem(localData);
      
      return true;
    } catch (e) {
      console.error("Falha ao conectar pasta:", e);
      throw e;
    }
  }

  /**
   * Disconnects OneDrive folder, reverting to browser LocalStorage.
   */
  async disconnectOneDriveFolder() {
    this.directoryHandle = null;
    this.isUsingFileSystem = false;
    await dbHelper.delete("onedrive_dir_handle");
  }

  isOneDriveConnected() {
    return this.isUsingFileSystem && this.directoryHandle !== null;
  }

  async hasSavedFolder() {
    try {
      const savedHandle = await dbHelper.get("onedrive_dir_handle");
      return savedHandle !== undefined && savedHandle !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * Loads all relational data tables.
   */
  async loadData() {
    if (this.isUsingSupabase && this.supabase) {
      try {
        console.log("Lendo dados diretamente do Supabase Cloud...");
        const { data: accounts, error: errAcc } = await this.supabase.from("accounts").select("*");
        if (errAcc) throw errAcc;

        const { data: categories, error: errCat } = await this.supabase.from("categories").select("*");
        if (errCat) throw errCat;

        const { data: transactions, error: errTx } = await this.supabase.from("transactions").select("*");
        if (errTx) throw errTx;

        const { data: batches, error: errBat } = await this.supabase.from("batches").select("*");
        if (errBat) throw errBat;

        const { data: settings, error: errSet } = await this.supabase.from("settings").select("*");
        if (errSet) throw errSet;

        // Reconstruct settings object from key-value rows
        let settingsObj = { couple_names: "Paula & Alcides" };
        if (settings && settings.length > 0) {
          settings.forEach(s => {
            settingsObj[s.key] = s.value;
          });
        }

        const data = {
          accounts: accounts || [],
          categories: categories || [],
          transactions: transactions || [],
          batches: batches || [],
          settings: settingsObj
        };

        // Cache locally for offline read availability
        this.saveToLocalStorage(data);
        return data;
      } catch (e) {
        console.error("Falha ao carregar do Supabase Cloud:", e);
        throw new Error("Erro ao carregar do Supabase: " + e.message);
      }
    }

    if (this.isUsingFileSystem && this.directoryHandle) {
      try {
        const accounts = await this.readJsonFile("accounts.json");
        const categories = await this.readJsonFile("categories.json");
        const transactions = await this.readJsonFile("transactions.json");
        const batches = await this.readJsonFile("batches.json");
        let settings = await this.readJsonFile("settings.json");
        
        if (!settings) {
          settings = { couple_names: "Paula & Alcides" };
        }
        
        if (accounts && categories && transactions && batches) {
          // Sync back to LocalStorage to ensure fallback is warm
          const data = { accounts, categories, transactions, batches, settings };
          this.saveToLocalStorage(data);
          return data;
        } else {
          console.warn("Arquivos ausentes ou vazios no OneDrive, usando dados locais.");
        }
      } catch (e) {
        console.error("Erro ao ler arquivos do OneDrive, revertendo para dados locais:", e);
      }
    }
    return this.loadFromLocalStorage();
  }

  /**
   * Saves all relational data tables.
   */
  async saveData({ accounts, categories, transactions, batches, settings }) {
    const data = { accounts, categories, transactions, batches, settings };
    
    if (this.isUsingSupabase && this.supabase) {
      try {
        console.log("Gravando dados diretamente no Supabase Cloud...");
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) {
          throw new Error("Usuário não autenticado no Supabase.");
        }

        // Add user_id to all rows
        const accountsWithUser = accounts.map(a => ({ ...a, user_id: user.id }));
        const categoriesWithUser = categories.map(c => ({ ...c, user_id: user.id }));
        const batchesWithUser = batches.map(b => ({ ...b, user_id: user.id }));
        const txsWithUser = transactions.map(t => ({ ...t, user_id: user.id }));
        const settingsRows = Object.entries(settings || {}).map(([key, val]) => ({
          key,
          value: val,
          user_id: user.id
        }));

        // Upsert all tables in parallel
        const results = await Promise.all([
          this.supabase.from("accounts").upsert(accountsWithUser),
          this.supabase.from("categories").upsert(categoriesWithUser),
          this.supabase.from("batches").upsert(batchesWithUser),
          this.supabase.from("transactions").upsert(txsWithUser),
          this.supabase.from("settings").upsert(settingsRows)
        ]);

        for (const res of results) {
          if (res.error) throw res.error;
        }

        // Also save to local storage for quick access
        this.saveToLocalStorage(data);
        return;
      } catch (e) {
        console.error("Falha ao salvar no Supabase Cloud:", e);
        throw new Error("Falha ao salvar na nuvem: " + e.message);
      }
    }

    // 1. Always save to LocalStorage for offline performance & safety
    this.saveToLocalStorage(data);

    // 2. Try to sync to the OneDrive folder
    if (this.isUsingFileSystem && this.directoryHandle) {
      try {
        await this.saveToFileSystem(data);
      } catch (e) {
        console.error("Falha ao salvar no OneDrive, mantendo cópia em LocalStorage:", e);
        throw new Error("Erro de sincronização com o OneDrive. Suas alterações foram salvas localmente no navegador.");
      }
    }
  }

  /**
   * Pushes current local storage database state to the Supabase Cloud.
   */
  async migrateLocalDataToSupabase() {
    if (!this.isUsingSupabase || !this.supabase) {
      throw new Error("Supabase não está conectado.");
    }
    const localData = this.loadFromLocalStorage();
    await this.saveData(localData);
  }

  // --- File System Helpers ---

  async readJsonFile(filename) {
    try {
      const fileHandle = await this.directoryHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch (e) {
      // Return null to signify missing file rather than crashing
      return null;
    }
  }

  async writeJsonFile(filename, data) {
    const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  async saveToFileSystem({ accounts, categories, transactions, batches, settings }) {
    await this.writeJsonFile("accounts.json", accounts);
    await this.writeJsonFile("categories.json", categories);
    await this.writeJsonFile("transactions.json", transactions);
    await this.writeJsonFile("batches.json", batches);
    await this.writeJsonFile("settings.json", settings || { couple_names: "Paula & Alcides" });
  }

  // --- LocalStorage Helpers ---

  loadFromLocalStorage() {
    return {
      accounts: JSON.parse(localStorage.getItem("lumen_accounts") || "[]"),
      categories: JSON.parse(localStorage.getItem("lumen_categories") || "[]"),
      transactions: JSON.parse(localStorage.getItem("lumen_transactions") || "[]"),
      batches: JSON.parse(localStorage.getItem("lumen_batches") || "[]"),
      settings: JSON.parse(localStorage.getItem("lumen_settings") || '{"couple_names": "Paula & Alcides"}')
    };
  }

  saveToLocalStorage({ accounts, categories, transactions, batches, settings }) {
    localStorage.setItem("lumen_accounts", JSON.stringify(accounts));
    localStorage.setItem("lumen_categories", JSON.stringify(categories));
    localStorage.setItem("lumen_transactions", JSON.stringify(transactions));
    localStorage.setItem("lumen_batches", JSON.stringify(batches));
    if (settings) {
      localStorage.setItem("lumen_settings", JSON.stringify(settings));
    }
  }
}
