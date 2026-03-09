(() => {
  "use strict";

  const ENTITIES = [
    {
      name: "Comment",
      route: "Comment",
      pk: "CommentId",
      idType: "int",
      fields: [
        { name: "CommentId", type: "int" },
        { name: "Message", type: "string" },
        { name: "MasterId", type: "int?" },
        { name: "RequestId", type: "int" }
      ]
    },
    {
      name: "Request",
      route: "Request",
      pk: "RequestId",
      idType: "int",
      fields: [
        { name: "RequestId", type: "int" },
        { name: "StartDate", type: "DateOnly?" },
        { name: "ClimateTechType", type: "string" },
        { name: "ClimateTechModel", type: "string" },
        { name: "ProblemDescription", type: "string" },
        { name: "RequestStatus", type: "string" },
        { name: "CompletionDate", type: "DateOnly?" },
        { name: "RepairParts", type: "string" },
        { name: "MasterId", type: "int?" },
        { name: "ClientId", type: "int" }
      ]
    },
    {
      name: "User",
      route: "User",
      pk: "UserId",
      idType: "int",
      fields: [
        { name: "UserId", type: "int" },
        { name: "Fio", type: "string" },
        { name: "Phone", type: "string" },
        { name: "Login", type: "string" },
        { name: "Password", type: "string" },
        { name: "Type", type: "string" }
      ]
    }
  ];

  const QUALITY_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdhZcExx6LSIXxk0ub55mSu-WIh23WYdGG9HY5EZhLDo7P8eA/viewform?usp=sf_link";

  const $ = (id) => document.getElementById(id);
  const page = document.body.getAttribute("data-page") || "app";

  const shared = {
    msgModal: $("msg_modal"),
    msgKind: $("msg_kind"),
    msgTitle: $("msg_title"),
    msgBody: $("msg_body"),
    msgDetails: $("msg_details"),
    loginUser: $("login_user"),
    loginPass: $("login_pass"),
    btnDoLogin: $("btn_do_login"),
    btnRegister: $("btn_register"),
    btnGoApp: $("btn_go_app"),
    errLogin: $("err_login"),
    errPass: $("err_pass"),
  };

  const app = {
    navTables: $("nav_tables"),
    navStats: $("nav_stats"),
    navLogs: $("nav_logs"),
    navHistory: $("nav_history"),
    navExit: $("nav_exit"),

    viewTables: $("view_tables"),
    viewStats: $("view_stats"),
    viewLogs: $("view_logs"),
    viewHistory: $("view_history"),

    authStatus: $("auth_status"),
    btnTokenToggle: $("btn_token_toggle"),
    btnTokenCopy: $("btn_token_copy"),
    tokenBox: $("token_box"),
    tokenModal: $("token_modal"),
    btnLoginPage: $("btn_login_page"),
    btnLogout: $("btn_logout"),

    entitySelect: $("entity_select"),
    searchQ: $("search_q"),
    btnReload: $("btn_reload"),
    btnOpenCreate: $("btn_open_create"),
    btnOpenEdit: $("btn_open_edit"),
    btnOpenDelete: $("btn_open_delete"),
    btnOpenView: $("btn_open_view"),
    searchCount: $("search_count"),
    selectedId: $("selected_id"),
    pageLabel: $("page_label"),

    btnPrev: $("btn_page_prev"),
    btnNext: $("btn_page_next"),
    pageInput: $("page_input"),
    btnPageGo: $("btn_page_go"),
    gotoId: $("goto_id"),
    btnGotoId: $("btn_goto_id"),
    pageSize: $("page_size"),
    btnPageApply: $("btn_page_apply"),

    cardsGrid: $("cards_grid"),
    log: $("log"),
    btnLogsClear: $("btn_logs_clear"),

    formModal: $("form_modal"),
    formBadge: $("form_badge"),
    formTitle: $("form_title"),
    formFields: $("form_fields"),
    btnFormSubmit: $("btn_form_submit"),

    confirmModal: $("confirm_modal"),
    confirmTitle: $("confirm_title"),
    confirmBody: $("confirm_body"),
    btnConfirmYes: $("btn_confirm_yes"),

    detailsModal: $("details_modal"),
    detailsTitle: $("details_title"),
    detailsBody: $("details_body"),
    btnDetailsCopy: $("btn_details_copy"),

    btnStatsReload: $("btn_stats_reload"),
    statTotal: $("stat_total"),
    statCompleted: $("stat_completed"),
    statAvgDays: $("stat_avg_days"),
    statsByStatus: $("stats_by_status"),
    statsByType: $("stats_by_type"),

    qualityQrImg: $("quality_qr_img"),
    qualityFormLink: $("quality_form_link"),
    btnOpenQualityForm: $("btn_open_quality_form"),
    btnCopyQualityLink: $("btn_copy_quality_link"),

    requestManagerPanel: $("request_manager_panel"),
    managerCurrentRequest: $("manager_current_request"),
    managerMasterId: $("manager_master_id"),
    btnAssignMaster: $("btn_assign_master"),
    managerStatus: $("manager_status"),
    btnChangeStatus: $("btn_change_status"),
    managerCompletionDate: $("manager_completion_date"),
    managerComment: $("manager_comment"),
    btnExtendDeadline: $("btn_extend_deadline"),
  };

  const state = {
    token: localStorage.getItem("pggen_token") || "",
    apiBase: "/api",
    selectedRowId: null,
    selectedRowObj: null,
    allRows: [],
    viewRows: [],
    pageRows: [],
    isBusy: false,
    page: 1,
    pageSize: 12,
    currentFormMode: null,
    currentEntity: null,
    confirmResolve: null,
  };

  function openModal(el){ if (el) el.classList.add("open"); }
  function closeModal(el){ if (el) el.classList.remove("open"); }

  function wireModalClose(modalEl) {
    if (!modalEl) return;
    modalEl.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") closeModal(modalEl);
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modalEl.classList.contains("open")) closeModal(modalEl);
    });
  }

  function setBadge(el, kind) {
    if (!el) return;
    el.classList.remove("ok","warn","err");
    if (kind === "ok") el.classList.add("ok");
    if (kind === "warn") el.classList.add("warn");
    if (kind === "err") el.classList.add("err");
  }

  function showMessage(kind, title, body, details) {
    if (!shared.msgModal) {
      alert(`${title}\n\n${body || ""}`);
      return;
    }
    shared.msgKind.textContent = kind === "err" ? "ERROR" : (kind === "warn" ? "WARN" : "INFO");
    setBadge(shared.msgKind, kind);
    shared.msgTitle.textContent = title || "Message";
    shared.msgBody.textContent = body || "";
    if (shared.msgDetails) shared.msgDetails.textContent = details || "";
    openModal(shared.msgModal);
  }

  function confirmDialog(title, body) {
    return new Promise((resolve) => {
      if (!app.confirmModal) {
        resolve(window.confirm(`${title}\n\n${body}`));
        return;
      }
      app.confirmTitle.textContent = title || "Confirm";
      app.confirmBody.textContent = body || "";
      state.confirmResolve = resolve;
      openModal(app.confirmModal);
    });
  }

  function log(line) {
    if (!app.log) return;
    const ts = new Date().toISOString();
    app.log.textContent = `[${ts}] ${line}\n` + app.log.textContent;
  }

  function setBusy(isBusy, label) {
    state.isBusy = !!isBusy;
    const btns = page === "login"
      ? [shared.btnDoLogin, shared.btnRegister, shared.btnGoApp].filter(Boolean)
      : [
          app.btnReload, app.btnOpenCreate, app.btnOpenEdit, app.btnOpenDelete, app.btnOpenView,
          app.btnTokenToggle, app.btnTokenCopy, app.btnLogout, app.btnLoginPage,
          app.btnFormSubmit, app.btnLogsClear, app.btnStatsReload,
          app.navTables, app.navStats, app.navLogs, app.navHistory, app.navExit,
          app.btnPrev, app.btnNext, app.btnPageGo, app.btnGotoId, app.btnPageApply,
          app.btnConfirmYes, app.btnDetailsCopy,
          app.btnAssignMaster, app.btnChangeStatus, app.btnExtendDeadline,
          app.btnOpenQualityForm, app.btnCopyQualityLink
        ].filter(Boolean);

    for (const b of btns) b.disabled = state.isBusy;
    if (label && page !== "login") log(label + (state.isBusy ? "..." : " OK"));
  }

  function normalizeApiBase(apiBase){
    if (!apiBase) return "/api";
    let b = apiBase.trim();
    if (!b.startsWith("/")) b = "/" + b;
    while (b.endsWith("/") && b.length > 1) b = b.slice(0,-1);
    return b;
  }

  function apiUrl(path){
    const base = normalizeApiBase(state.apiBase);
    if (!path.startsWith("/")) path = "/" + path;
    path = path.replace(/^\/{2,}/, "/");
    if (path.startsWith(base + "/")) return path;
    return base + path;
  }

  async function http(method, url, body, expectJson = true){
    const headers = {};
    if (state.token) headers["Authorization"] = `Bearer ${state.token}`;
    const init = { method, headers };
    if (body !== undefined){
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    const res = await fetch(url, init);
    const text = await res.text();
    if (!res.ok){
      let msg = `${res.status} ${res.statusText}`;
      if (text) msg += ` | ${text}`;
      const err = new Error(msg);
      err._details = text || "";
      err._status = res.status;
      throw err;
    }
    if (!expectJson) return text;
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  }

  function goToLogin() { window.location.href = "login.html"; }
  function goToApp() { window.location.href = "index.html"; }

  async function doLogin(isRegister){
    const user = (shared.loginUser?.value || "").trim();
    const pass = (shared.loginPass?.value || "").trim();

    if (shared.errLogin) shared.errLogin.textContent = "";
    if (shared.errPass) shared.errPass.textContent = "";
    if (!user) { if (shared.errLogin) shared.errLogin.textContent = "Введите логин."; }
    if (!pass) { if (shared.errPass) shared.errPass.textContent = "Введите пароль."; }
    if (!user || !pass) return;

    try{
      setBusy(true, "Auth");
      const url = apiUrl(isRegister ? "/Auth/register" : "/Auth/login");
      const res = await http("POST", url, { username: user, password: pass }, true);
      const token =
        res?.token ?? res?.Token ??
        res?.accessToken ?? res?.AccessToken ??
        res?.jwt ?? res?.Jwt ??
        (typeof res === "string" ? res : "");
      if (!token) throw new Error("Token not found in API response.");
      state.token = token;
      localStorage.setItem("pggen_token", token);
      showMessage("ok", "Success", isRegister ? "Registered + logged in." : "Logged in.");
      setTimeout(() => goToApp(), 250);
    } catch(e){
      showMessage("err","Auth error", String(e?.message || e), e?._details || "");
    } finally {
      setBusy(false);
    }
  }

  function doLogout(){
    state.token = "";
    localStorage.removeItem("pggen_token");
    if (page === "app") {
      showMessage("ok","Done","Logged out.");
      setTimeout(() => goToLogin(), 200);
    }
  }

  function parseJwt(token){
    try{
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(atob(payload).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
      return JSON.parse(json);
    } catch { return null; }
  }

  function getUserRole(){
    const p = parseJwt(state.token);
    if (!p) return "";
    return p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || p["role"] || p["Role"] || "";
  }

  function canViewStats(){
    return ["Менеджер", "Оператор", "Мастер"].includes(getUserRole());
  }

  function canManageRequests(){
    return ["Менеджер", "Оператор"].includes(getUserRole());
  }

  function setAuthUI(){
    if (!app.authStatus) return;
    const role = getUserRole();
    app.authStatus.textContent = state.token ? (role || "Authorized") : "Not authorized";
    if (app.tokenBox) app.tokenBox.textContent = state.token || "—";
  }

  function getSelectedEntity(){
    const name = app.entitySelect?.value;
    return ENTITIES.find(x => x.name === name) || null;
  }

  function renderEntities(){
    if (!app.entitySelect) return;
    app.entitySelect.innerHTML = "";
    for (const e of ENTITIES){
      const opt = document.createElement("option");
      opt.value = e.name;
      opt.textContent = e.name;
      app.entitySelect.appendChild(opt);
    }
  }

  function camelCase(s){ return !s ? s : (s.length===1 ? s.toLowerCase() : s[0].toLowerCase()+s.slice(1)); }
  function findKeyCI(obj, wanted){
    if (!obj || !wanted) return null;
    const w = wanted.toLowerCase();
    return Object.keys(obj).find(k => k.toLowerCase() === w) || null;
  }

  function getRowId(row, entity){
    if (!row) return null;
    const pk = entity?.pk;
    if (pk){
      const k1 = findKeyCI(row, pk);
      if (k1) return row[k1];
      const k2 = findKeyCI(row, camelCase(pk));
      if (k2) return row[k2];
    }
    const k3 = findKeyCI(row, "id");
    if (k3) return row[k3];
    const last = Object.keys(row).find(k => k.toLowerCase().endsWith("id"));
    return last ? row[last] : null;
  }

  function normRoute(entity){ return String(entity?.route || "").replace(/^\/+/, ""); }

  function compareIds(a, b, entity){
    const av = getRowId(a, entity);
    const bv = getRowId(b, entity);
    const an = (typeof av === "number") ? av : (av != null && av !== "" && !isNaN(Number(av)) ? Number(av) : null);
    const bn = (typeof bv === "number") ? bv : (bv != null && bv !== "" && !isNaN(Number(bv)) ? Number(bv) : null);
    if (an != null && bn != null) return an - bn;
    return String(av ?? "").localeCompare(String(bv ?? ""));
  }

  function resetSelection(){
    state.selectedRowId = null;
    state.selectedRowObj = null;
    if (app.selectedId) app.selectedId.textContent = "—";
    if (app.btnOpenEdit) app.btnOpenEdit.disabled = true;
    if (app.btnOpenDelete) app.btnOpenDelete.disabled = true;
    if (app.btnOpenView) app.btnOpenView.disabled = true;
    syncRequestManagerPanel();
  }

  function safeText(v){
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  function pickCardTitle(row, entity){
    const candidates = ["name","title","model","type"];
    for (const c of candidates){
      const k = findKeyCI(row, c);
      if (k && safeText(row[k]).trim()) return safeText(row[k]);
    }
    const id = getRowId(row, entity);
    return `${entity.name} #${id ?? "?"}`;
  }

  function applyPagination(){
    const total = state.viewRows.length;
    const pageSize = Math.max(1, state.pageSize);
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (state.page < 1) state.page = 1;
    if (state.page > pages) state.page = pages;
    const start = (state.page - 1) * pageSize;
    state.pageRows = state.viewRows.slice(start, start + pageSize);
    if (app.pageLabel) app.pageLabel.textContent = `${state.page} / ${pages}`;
    if (app.searchCount) app.searchCount.textContent = String(total);
    if (app.btnPrev) app.btnPrev.disabled = (state.page <= 1) || state.isBusy;
    if (app.btnNext) app.btnNext.disabled = (state.page >= pages) || state.isBusy;
  }

  function renderCards(entity){
    resetSelection();
    if (!app.cardsGrid) return;
    app.cardsGrid.innerHTML = "";
    const rows = state.pageRows;
    if (!Array.isArray(rows) || rows.length === 0){
      const div = document.createElement("div");
      div.className = "carditem";
      div.textContent = "Empty";
      app.cardsGrid.appendChild(div);
      return;
    }

    const fields = (entity.fields || []).map(f => f.name);
    for (const r of rows){
      const id = getRowId(r, entity);
      const card = document.createElement("div");
      card.className = "carditem";
      card.dataset.id = (id === null || id === undefined) ? "" : String(id);

      const title = document.createElement("div");
      title.className = "cardtitle";
      const left = document.createElement("div");
      left.textContent = pickCardTitle(r, entity);
      const right = document.createElement("div");
      right.style.fontWeight = "900";
      right.style.color = "rgba(0,0,0,.65)";
      right.textContent = id === null || id === undefined ? "" : `#${id}`;
      title.appendChild(left);
      title.appendChild(right);

      const kv = document.createElement("div");
      kv.className = "cardkv";
      let shown = 0;
      for (const name of fields){
        if (shown >= 6) break;
        const key = findKeyCI(r, name) || findKeyCI(r, camelCase(name));
        if (!key) continue;
        const value = r[key];
        if (value && typeof value === "object") continue;
        const k = document.createElement("div");
        k.className = "k";
        k.textContent = name;
        const v = document.createElement("div");
        v.className = "v";
        v.textContent = safeText(value);
        kv.appendChild(k);
        kv.appendChild(v);
        shown++;
      }

      card.appendChild(title);
      card.appendChild(kv);

      const selectCard = () => {
        for (const x of app.cardsGrid.querySelectorAll(".carditem.selected")) x.classList.remove("selected");
        card.classList.add("selected");
        state.selectedRowId = id;
        state.selectedRowObj = r;
        if (app.selectedId) app.selectedId.textContent = id === null || id === undefined ? "—" : String(id);
        if (app.btnOpenEdit) app.btnOpenEdit.disabled = false;
        if (app.btnOpenDelete) app.btnOpenDelete.disabled = false;
        if (app.btnOpenView) app.btnOpenView.disabled = false;
        syncRequestManagerPanel();
      };

      card.addEventListener("click", selectCard);
      card.addEventListener("dblclick", () => { selectCard(); openDetails(); });
      app.cardsGrid.appendChild(card);
    }
  }

  function localFilter(rows, q){
    const needle = (q||"").trim().toLowerCase();
    if (!needle) return rows;
    return (rows||[]).filter(r => Object.values(r||{}).some(v => {
      if (v===null || v===undefined) return false;
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return s.toLowerCase().includes(needle);
    }));
  }

  function setViewRows(entity, rows){
    state.allRows = Array.isArray(rows) ? rows.slice() : [];
    state.allRows.sort((a,b) => compareIds(a,b,entity));
    const q = (app.searchQ?.value || "").trim();
    state.viewRows = entity?.name === "Request" ? state.allRows.slice() : (q ? localFilter(state.allRows, q) : state.allRows.slice());
    state.page = 1;
    applyPagination();
    renderCards(entity);
    syncRequestManagerPanel();
  }

  async function reload(){
    const entity = getSelectedEntity();
    if (!entity) return;
    try{
      setBusy(true,"Loading");
      let url = apiUrl(`/${normRoute(entity)}`);
      const q = (app.searchQ?.value || "").trim();
      if (entity.name === "Request" && q) {
        const params = new URLSearchParams();
        if (!isNaN(Number(q))) params.set("requestId", q);
        else params.set("status", q);
        url += `?${params.toString()}`;
      }
      const rows = await http("GET", url, undefined, true);
      const list = Array.isArray(rows) ? rows : (rows || []);
      setViewRows(entity, list);
      log(`GET ${url} OK`);
    } catch(e){
      showMessage("err","Load error", String(e?.message || e), e?._details || "");
      log(`GET FAIL: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  function searchLocal(){
    const entity = getSelectedEntity();
    if (!entity) return;
    if (entity.name === "Request") {
      reload();
      return;
    }
    state.viewRows = localFilter(state.allRows, (app.searchQ?.value||""));
    state.page = 1;
    applyPagination();
    renderCards(entity);
  }

  function gotoPage(p){
    const total = state.viewRows.length;
    const pages = Math.max(1, Math.ceil(total / Math.max(1,state.pageSize)));
    const n = Math.max(1, Math.min(p, pages));
    state.page = n;
    applyPagination();
    renderCards(getSelectedEntity());
  }

  function gotoId(){
    const entity = getSelectedEntity();
    if (!entity) return;
    const raw = (app.gotoId?.value || "").trim();
    if (!raw){
      showMessage("warn","Go to ID","Введите ID.");
      return;
    }
    const target = raw.toLowerCase();
    let idx = -1;
    for (let i=0;i<state.viewRows.length;i++){
      const id = getRowId(state.viewRows[i], entity);
      if (id === null || id === undefined) continue;
      if (String(id).toLowerCase() === target){ idx = i; break; }
    }
    if (idx < 0){
      showMessage("warn","Not found",`ID ${raw} не найден в текущем списке.`);
      return;
    }
    const pageSize = Math.max(1,state.pageSize);
    const pageNum = Math.floor(idx / pageSize) + 1;
    gotoPage(pageNum);
    setTimeout(() => {
      const card = app.cardsGrid.querySelector(`.carditem[data-id="${raw}"]`);
      if (card) card.click();
    }, 0);
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function openDetails(){
    const entity = getSelectedEntity();
    if (!entity) return;
    if (!state.selectedRowObj){
      showMessage("warn","No selection","Select a card first.");
      return;
    }
    const id = getRowId(state.selectedRowObj, entity);
    app.detailsTitle.textContent = `${entity.name} #${id ?? "?"}`;
    const row = state.selectedRowObj;
    const keys = Object.keys(row || {}).sort((a,b) => a.localeCompare(b));
    const html = [];
    html.push(`<div style="display:grid;grid-template-columns:200px 1fr;gap:8px 12px;">`);
    for (const k of keys){
      const v = row[k];
      const vv = (v && typeof v === "object") ? JSON.stringify(v) : (v === null || v === undefined ? "" : String(v));
      html.push(`<div style="font-weight:900;color:rgba(0,0,0,.65);">${escapeHtml(k)}</div>`);
      html.push(`<div style="white-space:pre-wrap;word-break:break-word;">${escapeHtml(vv)}</div>`);
    }
    html.push(`</div>`);
    app.detailsBody.innerHTML = html.join("");
    openModal(app.detailsModal);
  }

  function renderStatsList(container, items){
    if (!container) return;
    container.innerHTML = "";
    const arr = Array.isArray(items) ? items : [];
    if (arr.length === 0){
      const row = document.createElement("div");
      row.className = "statsrow";
      row.innerHTML = `<div class="statsname">Нет данных</div><div class="statscount">0</div>`;
      container.appendChild(row);
      return;
    }
    for (const item of arr){
      const row = document.createElement("div");
      row.className = "statsrow";
      row.innerHTML = `<div class="statsname">${escapeHtml(item?.name ?? "")}</div><div class="statscount">${escapeHtml(String(item?.count ?? 0))}</div>`;
      container.appendChild(row);
    }
  }

  async function loadStats(){
    if (!canViewStats()){
      showMessage("warn", "Нет доступа", "У вас нет прав для просмотра статистики.");
      return;
    }
    try{
      setBusy(true, "Loading stats");
      const url = apiUrl("/Request/stats");
      const res = await http("GET", url, undefined, true);
      if (app.statTotal) app.statTotal.textContent = String(res?.totalCount ?? 0);
      if (app.statCompleted) app.statCompleted.textContent = String(res?.completedCount ?? 0);
      if (app.statAvgDays) app.statAvgDays.textContent = `${res?.averageRepairDays ?? 0} дн.`;
      renderStatsList(app.statsByStatus, res?.byStatus || []);
      renderStatsList(app.statsByType, res?.byClimateTechType || []);
      log(`GET ${url} OK`);
    } catch(e){
      showMessage("err", "Stats error", String(e?.message || e), e?._details || "");
      log(`GET STATS FAIL: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  function renderQualityQr(){
    const link = QUALITY_FORM_URL;
    if (app.qualityFormLink) app.qualityFormLink.textContent = link;
    if (app.qualityQrImg) app.qualityQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}`;
  }

  function syncRequestManagerPanel(){
    if (!app.requestManagerPanel) return;
    const entity = getSelectedEntity();
    const visible = entity?.name === "Request" && canManageRequests();
    app.requestManagerPanel.style.display = visible ? "block" : "none";
    if (!visible) return;
    const id = state.selectedRowId;
    const row = state.selectedRowObj || {};
    if (app.managerCurrentRequest) app.managerCurrentRequest.textContent = id == null ? "—" : String(id);
    if (app.managerMasterId) app.managerMasterId.value = row.MasterId ?? row.masterId ?? "";
    if (app.managerStatus) app.managerStatus.value = row.RequestStatus ?? row.requestStatus ?? "Новая";
    const d = row.CompletionDate ?? row.completionDate ?? "";
    if (app.managerCompletionDate) app.managerCompletionDate.value = d ? String(d).slice(0, 10) : "";
  }

  async function assignMasterAction(){
    if (!canManageRequests()) return showMessage("warn","Нет доступа","Это действие доступно только менеджеру или оператору.");
    if (!state.selectedRowId) return showMessage("warn","Нет заявки","Сначала выбери заявку.");
    const raw = (app.managerMasterId?.value || "").trim();
    const masterId = raw === "" ? null : Number(raw);
    if (raw !== "" && Number.isNaN(masterId)) return showMessage("warn","Неверный мастер","Укажи числовой ID мастера.");
    try{
      setBusy(true, "Assign master");
      const url = apiUrl(`/Request/${state.selectedRowId}/assign-master`);
      await http("PATCH", url, { masterId }, true);
      showMessage("ok","Готово","Мастер назначен.");
      await reload();
    } catch(e){
      showMessage("err","Ошибка назначения", String(e?.message || e), e?._details || "");
    } finally { setBusy(false); }
  }

  async function changeStatusAction(){
    if (!state.selectedRowId) return showMessage("warn","Нет заявки","Сначала выбери заявку.");
    const requestStatus = (app.managerStatus?.value || "").trim();
    if (!requestStatus) return showMessage("warn","Нет статуса","Выбери статус.");
    try{
      setBusy(true, "Change status");
      const url = apiUrl(`/Request/${state.selectedRowId}/change-status`);
      await http("PATCH", url, { requestStatus }, true);
      showMessage("ok","Готово","Статус заявки обновлен.");
      await reload();
    } catch(e){
      showMessage("err","Ошибка статуса", String(e?.message || e), e?._details || "");
    } finally { setBusy(false); }
  }

  async function extendDeadlineAction(){
    if (!canManageRequests()) return showMessage("warn","Нет доступа","Это действие доступно только менеджеру или оператору.");
    if (!state.selectedRowId) return showMessage("warn","Нет заявки","Сначала выбери заявку.");
    const completionDate = (app.managerCompletionDate?.value || "").trim();
    const comment = (app.managerComment?.value || "").trim();
    if (!completionDate) return showMessage("warn","Нет даты","Укажи новую дату завершения.");
    try{
      setBusy(true, "Extend deadline");
      const url = apiUrl(`/Request/${state.selectedRowId}/extend-deadline`);
      await http("PATCH", url, { completionDate, comment }, true);
      showMessage("ok","Готово","Срок выполнения заявки продлен.");
      await reload();
    } catch(e){
      showMessage("err","Ошибка продления", String(e?.message || e), e?._details || "");
    } finally { setBusy(false); }
  }

  function isPkField(entity, fieldName){
    return entity?.pk && fieldName && fieldName.toLowerCase() === entity.pk.toLowerCase();
  }

  function inputTypeFor(t){
    const x = (t||"").toLowerCase();
    if (["int","long","short","byte","decimal","double","float"].includes(x)) return "number";
    if (["bool","boolean"].includes(x)) return "checkbox";
    if (["datetime","datetimeoffset"].includes(x)) return "datetime-local";
    return "text";
  }

  function hintFor(field){
    const n = (field?.name || "");
    const t = (field?.type || "").toLowerCase();
    if (["int","long","short","byte","decimal","double","float","number"].includes(t)) return "Введите число (например 10 или 99.5).";
    if (t === "bool" || t === "boolean") return "Флажок: да/нет.";
    if (t === "datetime" || t === "datetimeoffset") return "Дата и время (локально).";
    if (n.toLowerCase().includes("email")) return "Введите email в формате name@example.com.";
    if (n.toLowerCase().includes("phone")) return "Введите телефон (любая форма).";
    if (n.toLowerCase().includes("title") || n.toLowerCase().includes("name")) return "Короткое понятное название.";
    return "Заполните значение.";
  }

  function toDatetimeLocal(v){
    if (v===null || v===undefined || v==="") return "";
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;
    if (s.includes("T")) return s.replace("Z","").slice(0,16);
    return s;
  }

  function renderForm(entity, mode){
    state.currentEntity = entity;
    state.currentFormMode = mode;
    app.formFields.innerHTML = "";
    const isCreate = mode === "create";
    app.formTitle.textContent = isCreate ? `Add: ${entity.name}` : `Edit: ${entity.name}`;
    app.formBadge.textContent = isCreate ? "CREATE" : "EDIT";
    setBadge(app.formBadge, isCreate ? "ok" : "warn");
    const row = state.selectedRowObj || {};

    for (const f of (entity.fields || [])){
      if (!f?.name) continue;
      if (isPkField(entity, f.name)) continue;
      const wrap = document.createElement("div");
      wrap.className = "field";
      const lab = document.createElement("label");
      lab.textContent = f.name;
      wrap.appendChild(lab);
      const itype = inputTypeFor(f.type);
      const input = document.createElement("input");
      input.type = itype === "checkbox" ? "checkbox" : itype;
      input.dataset.field = f.name;
      input.dataset.ftype = itype;
      const errId = `err_${f.name}`;
      input.dataset.err = errId;

      if (mode === "edit" && row){
        const k1 = findKeyCI(row, f.name);
        const k2 = findKeyCI(row, camelCase(f.name));
        const key = k1 || k2;
        const v = key ? row[key] : null;
        if (itype === "checkbox") input.checked = !!v;
        else if (itype === "number") input.value = (v === null || v === undefined) ? "" : String(v);
        else if (itype === "datetime-local") input.value = toDatetimeLocal(v);
        else input.value = (v === null || v === undefined) ? "" : String(v);
      }

      if (itype === "number") input.placeholder = "0";
      else if (itype === "datetime-local") input.placeholder = "YYYY-MM-DDTHH:MM";
      else input.placeholder = f.name;

      const hint = document.createElement("div");
      hint.className = "hint";
      hint.textContent = hintFor(f);
      const err = document.createElement("div");
      err.className = "errtxt";
      err.id = errId;
      input.addEventListener("input", () => {
        err.textContent = "";
        if (itype === "number"){
          const raw = (input.value || "").trim();
          if (raw !== "" && Number.isNaN(Number(raw))) err.textContent = "Нужно число.";
        }
      });
      wrap.appendChild(input);
      wrap.appendChild(hint);
      wrap.appendChild(err);
      app.formFields.appendChild(wrap);
    }
  }

  function buildPayloadFromForm(){
    const obj = {};
    let ok = true;
    for (const err of app.formFields.querySelectorAll(".errtxt")) err.textContent = "";
    for (const el of app.formFields.querySelectorAll("[data-field]")){
      const name = el.dataset.field;
      const type = el.dataset.ftype || "text";
      const errId = el.dataset.err;
      const errEl = errId ? document.getElementById(errId) : null;
      let value;
      if (type === "checkbox") value = !!el.checked;
      else if (type === "number"){
        const raw = (el.value || "").trim();
        value = raw === "" ? null : Number(raw);
        if (raw !== "" && Number.isNaN(value)){
          ok = false;
          if (errEl) errEl.textContent = "Нужно число.";
          continue;
        }
      } else if (type === "datetime-local"){
        const raw = (el.value || "").trim();
        value = raw === "" ? null : raw;
      } else {
        value = (el.value || "");
      }
      obj[name] = value;
    }
    return { ok, obj };
  }

  function buildPatchOps(obj){
    return Object.entries(obj||{}).map(([k,v]) => ({ op:"replace", path:"/"+k, value:v }));
  }

  async function submitForm(){
    const entity = state.currentEntity;
    const mode = state.currentFormMode;
    if (!entity || !mode) return;
    const { ok, obj } = buildPayloadFromForm();
    if (!ok){
      showMessage("warn","Validation","Исправьте ошибки в форме.");
      return;
    }
    const route = normRoute(entity);
    try{
      setBusy(true,"Saving");
      if (mode === "create"){
        const url = apiUrl(`/${route}`);
        await http("POST", url, obj, true);
        closeModal(app.formModal);
        showMessage("ok","Done","Created.");
        await reload();
      } else {
        const id = state.selectedRowId;
        if (id===null || id===undefined || id===""){
          showMessage("warn","No selection","Select a card first.");
          return;
        }
        const url = apiUrl(`/${route}/${id}`);
        await http("PATCH", url, buildPatchOps(obj), true);
        closeModal(app.formModal);
        showMessage("ok","Done","Updated.");
        await reload();
      }
    } catch(e){
      showMessage("err","Save error", String(e?.message || e), e?._details || "");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSelected(){
    const entity = getSelectedEntity();
    if (!entity) return;
    const id = state.selectedRowId;
    if (id===null || id===undefined || id===""){
      showMessage("warn","No selection","Select a card first.");
      return;
    }
    const ok = await confirmDialog("Delete", `Delete ${entity.name} with ID = ${id}?`);
    if (!ok) return;
    try{
      setBusy(true,"Deleting");
      const url = apiUrl(`/${normRoute(entity)}/${id}`);
      await http("DELETE", url, undefined, false);
      showMessage("ok","Done","Deleted.");
      await reload();
    } catch(e){
      showMessage("err","Delete error", String(e?.message || e), e?._details || "");
    } finally {
      setBusy(false);
    }
  }

  function setActiveNav(btn){
    for (const b of [app.navTables, app.navStats, app.navLogs, app.navHistory]){
      if (!b) continue;
      b.classList.toggle("active", b === btn);
    }
  }

  function showView(viewId){
    for (const v of [app.viewTables, app.viewStats, app.viewLogs, app.viewHistory]){
      if (!v) continue;
      v.classList.toggle("active", v.id === viewId);
    }
  }

  function initLoginPage(){
    wireModalClose(shared.msgModal);
    shared.btnDoLogin?.addEventListener("click", () => doLogin(false));
    shared.btnRegister?.addEventListener("click", () => doLogin(true));
    shared.btnGoApp?.addEventListener("click", () => goToApp());
    shared.loginUser?.addEventListener("keydown", (ev) => { if (ev.key === "Enter") doLogin(false); });
    shared.loginPass?.addEventListener("keydown", (ev) => { if (ev.key === "Enter") doLogin(false); });
    if (state.token) setTimeout(() => goToApp(), 50);
  }

  function initAppPage(){
    if (!state.token) { goToLogin(); return; }
    wireModalClose(shared.msgModal);
    wireModalClose(app.tokenModal);
    wireModalClose(app.formModal);
    wireModalClose(app.detailsModal);
    wireModalClose(app.confirmModal);

    app.btnConfirmYes?.addEventListener("click", () => {
      closeModal(app.confirmModal);
      const r = state.confirmResolve;
      state.confirmResolve = null;
      if (r) r(true);
    });
    app.confirmModal?.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") {
        const r = state.confirmResolve;
        state.confirmResolve = null;
        if (r) r(false);
      }
    });

    app.navTables?.addEventListener("click", () => { setActiveNav(app.navTables); showView("view_tables"); });
    app.navStats?.addEventListener("click", async () => {
      if (!canViewStats()) return showMessage("warn", "Нет доступа", "Статистика доступна только ролям Менеджер, Оператор и Мастер.");
      setActiveNav(app.navStats);
      showView("view_stats");
      await loadStats();
    });
    app.navLogs?.addEventListener("click", () => { setActiveNav(app.navLogs); showView("view_logs"); });
    app.navHistory?.addEventListener("click", () => { setActiveNav(app.navHistory); showView("view_history"); });
    app.navExit?.addEventListener("click", async () => {
      const ok = await confirmDialog("Exit", "Logout and exit?");
      if (ok) doLogout();
    });

    app.btnTokenToggle?.addEventListener("click", () => openModal(app.tokenModal));
    app.btnTokenCopy?.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(state.token || "");
        showMessage("ok","Copied","Token copied.");
      } catch {
        showMessage("warn","Clipboard blocked","Browser denied clipboard access.");
      }
    });
    app.btnLoginPage?.addEventListener("click", () => goToLogin());
    app.btnLogout?.addEventListener("click", () => doLogout());
    app.btnDetailsCopy?.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(JSON.stringify(state.selectedRowObj || {}, null, 2));
        showMessage("ok","Copied","Row JSON copied.");
      } catch {
        showMessage("warn","Clipboard blocked","Browser denied clipboard access.");
      }
    });
    app.btnLogsClear?.addEventListener("click", () => { if (app.log) app.log.textContent = ""; });

    renderEntities();
    setAuthUI();
    renderQualityQr();
    if (app.navStats) app.navStats.style.display = canViewStats() ? "" : "none";
    if (app.pageSize) app.pageSize.value = String(state.pageSize);

    app.btnReload?.addEventListener("click", reload);
    app.btnOpenView?.addEventListener("click", openDetails);
    app.btnStatsReload?.addEventListener("click", loadStats);
    app.btnOpenQualityForm?.addEventListener("click", () => window.open(QUALITY_FORM_URL, "_blank", "noopener,noreferrer"));
    app.btnCopyQualityLink?.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(QUALITY_FORM_URL);
        showMessage("ok", "Copied", "Ссылка на форму скопирована.");
      } catch {
        showMessage("warn", "Clipboard blocked", "Браузер не дал доступ к буферу обмена.");
      }
    });

    app.btnAssignMaster?.addEventListener("click", assignMasterAction);
    app.btnChangeStatus?.addEventListener("click", changeStatusAction);
    app.btnExtendDeadline?.addEventListener("click", extendDeadlineAction);

    app.btnOpenCreate?.addEventListener("click", () => {
      const entity = getSelectedEntity();
      if (!entity) return showMessage("warn","No entity","Choose entity first.");
      state.selectedRowObj = null;
      state.selectedRowId = null;
      renderForm(entity, "create");
      openModal(app.formModal);
    });

    app.btnOpenEdit?.addEventListener("click", () => {
      const entity = getSelectedEntity();
      if (!entity) return showMessage("warn","No entity","Choose entity first.");
      if (!state.selectedRowObj) return showMessage("warn","No selection","Select a card first.");
      renderForm(entity, "edit");
      openModal(app.formModal);
    });

    app.btnOpenDelete?.addEventListener("click", deleteSelected);
    app.btnFormSubmit?.addEventListener("click", submitForm);

    app.btnPrev?.addEventListener("click", () => gotoPage(state.page - 1));
    app.btnNext?.addEventListener("click", () => gotoPage(state.page + 1));
    app.btnPageGo?.addEventListener("click", () => {
      const n = parseInt((app.pageInput?.value || "").trim(), 10);
      if (!isNaN(n)) gotoPage(n);
    });
    app.btnGotoId?.addEventListener("click", gotoId);
    app.btnPageApply?.addEventListener("click", () => {
      const n = parseInt((app.pageSize?.value || "").trim(), 10);
      if (!isNaN(n) && n > 0) state.pageSize = n;
      gotoPage(1);
    });

    app.searchQ?.addEventListener("keydown", (ev) => { if (ev.key==="Enter") searchLocal(); });
    app.searchQ?.addEventListener("input", () => {
      const entity = getSelectedEntity();
      if (entity?.name === "Request") return;
      searchLocal();
    });
    app.entitySelect?.addEventListener("change", () => reload());

    resetSelection();
    syncRequestManagerPanel();
    setTimeout(() => reload(), 50);
  }

  if (page === "login") initLoginPage();
  else initAppPage();
})();
