import scramjet from "../scripts/proxy";

const tabContainer = document.getElementById("tabs-wrapper");
const frameContainer = document.getElementById("frame-section");
const urlBar = document.getElementById("urlInput");
const newTabButton = document.getElementById("new-tab-button");
const urlForm = document.getElementById("urlForm");
const reloadButton = document.getElementById("reload-button");
const backButton = document.getElementById("back-button");
const forwardButton = document.getElementById("forward-button");
const homeButton = document.getElementById("home-button");
const aiButton = document.getElementById("ai-button");

class TabManager {
  activeTabId: number | null;
  tabs: Array<Tab>;

  constructor() {
    this.activeTabId = null;
    this.tabs = [];
  }

  addTab(url: string) {
    const tab = new Tab();
    tab.url = url;
    this.tabs.push(tab);
    drawNewTab(tab);
    this.setActiveTab(tab.id);
    urlBar?.focus();
  }

  setActiveTab(id: number) {
    const foundTab = this.tabs.find((tab) => tab.id === id);
    if (!foundTab) {
      console.error(`Trying to Set Active Tab: Tab with id ${id} not found.`);
      return;
    }
    if (foundTab) {
      foundTab.isActive = true;
      this.tabs.forEach((tab) => {
        if (tab != foundTab) {
          tab.isActive = false;
        }
      });
      this.activeTabId = foundTab.id;
      updateActiveElements();
    }
  }

  getActiveTab(): Tab | undefined {
    return this.tabs.find((tab) => tab.isActive);
  }

  closeTab(id: number) {
    const tabIndex = this.tabs.findIndex((tab) => tab.id === id);
    if (tabIndex === -1) {
      console.error(`Trying to close non-existent tab with id ${id}`);
      return;
    }
    const tabToClose = this.tabs[tabIndex];
    const wasActive = tabToClose.isActive;
    tabToClose.tabElement?.remove();
    tabToClose.frameElement?.remove();
    this.tabs = this.tabs.filter((tab) => tab.id !== id);
    if (wasActive && this.tabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
      const newActiveTab = this.tabs[newActiveIndex];
      this.setActiveTab(newActiveTab.id);
    }
    if (this.tabs.length === 0) {
      this.activeTabId = null;
      this.addTab("bolt://newtab");
    }
  }
}

class Tab {
  static nextId = 1;
  id: number;
  favicon: string;
  title: string;
  url: string;
  isActive: boolean;
  tabElement: HTMLElement | null;
  frameElement: HTMLIFrameElement | null;
  constructor() {
    this.id = Tab.nextId++;
    this.url = "";
    this.title = "New Tab";
    this.favicon = "";
    this.isActive = false;
    this.tabElement = null;
    this.frameElement = null;
  }
}

const tabManager = new TabManager();

function drawNewTab(tab: Tab) {
  if (!tabContainer || !frameContainer || !urlBar) return;

  const tabElement = document.createElement("div");
  const frameElement = document.createElement("iframe");
  const tabText = document.createElement("h3");
  const closeButton = document.createElement("div");

  closeButton.innerHTML =
    '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d = "M17 7L7 17M7 7L17 17" stroke = "currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  closeButton.addEventListener("click", function () {
    tabManager.closeTab(tab.id);
  });
  tabElement.className = "tab";
  tabText.textContent = tab.title;
  tabElement.appendChild(tabText);
  tabElement.appendChild(closeButton);
  tabElement.dataset.id = tab.id.toString();

  frameElement.className = "frame";
  frameElement.dataset.id = tab.id.toString();

  if (tab.url === "bolt://newtab") {
    frameElement.src = "../newtab";
  } else if (tab.url.includes("../")) {
    frameElement.src = tab.url;
  } else {
    frameElement.src = scramjet.encodeUrl(tab.url);
  }

  tab.tabElement = tabElement;
  tab.frameElement = frameElement;

  frameElement.addEventListener("load", () => {
    if (tabManager.activeTabId === tab.id) {
      if (
        !String(frameElement.contentWindow?.location.href).includes("newtab")
      ) {
        (urlBar as HTMLInputElement).value = scramjet.decodeUrl(
          frameElement.contentWindow?.location.href
        );
        tab.title = frameElement.contentDocument?.title ?? "New Tab";
        tabElement.children[0].textContent = tab.title;
      } else {
        (urlBar as HTMLInputElement).value = "";
      }
    }
  });

  tabContainer.appendChild(tabElement);
  frameContainer.appendChild(frameElement);
}

function updateActiveElements() {
  if (!tabContainer || !frameContainer) return;

  const activeId = tabManager.activeTabId;

  tabManager.tabs.forEach((tab) => {
    if (tab.tabElement && tab.frameElement) {
      if (tab.id === activeId) {
        tab.tabElement.classList.add("active");
        tab.frameElement.style.display = "block";

        if (
          !String(tab.frameElement.contentWindow?.location.href).includes(
            "newtab"
          )
        ) {
          (urlBar as HTMLInputElement).value = scramjet.decodeUrl(
            tab.frameElement.contentWindow?.location.href
          );
        } else {
          (urlBar as HTMLInputElement).value = "";
        }
      } else {
        tab.tabElement.classList.remove("active");
        tab.frameElement.style.display = "none";
      }
    }
  });
}

function navigateActiveTab(query: string) {
  const activeTab = tabManager.getActiveTab();
  if (activeTab && activeTab.frameElement) {
    let destinationUrl: string;

    if (query.startsWith("https://") || query.startsWith("http://")) {
      destinationUrl = query;
    } else if (query.includes(".") && !query.includes(" ")) {
      destinationUrl = "https://" + query;
    } else {
      destinationUrl = "https://duckduckgo.com/?q=" + query;
    }

    activeTab.url = scramjet.encodeUrl(destinationUrl);
    activeTab.frameElement.src = activeTab.url;
  }
}

urlForm?.addEventListener("submit", function (event) {
  event.preventDefault();
  const query = (urlBar as HTMLInputElement)?.value;
  if (query) {
    navigateActiveTab(query);
  }
});

reloadButton?.addEventListener("click", function () {
  const activeTab = tabManager.getActiveTab();
  if (activeTab && activeTab.frameElement) {
    activeTab.frameElement.contentWindow?.location.reload();
  }
});

backButton?.addEventListener("click", function () {
  const activeTab = tabManager.getActiveTab();
  if (activeTab && activeTab.frameElement) {
    activeTab.frameElement.contentWindow?.history.back();
  }
});
forwardButton?.addEventListener("click", function () {
  const activeTab = tabManager.getActiveTab();
  if (activeTab && activeTab.frameElement) {
    activeTab.frameElement.contentWindow?.history.forward();
  }
});
document.getElementById("disc-button")?.addEventListener("click", function () {
  window.open("https://discord.gg/UPGBjxZut2", "_blank");
});

homeButton?.addEventListener("click", function () {
  const activeTab = tabManager.getActiveTab();
  if (activeTab && activeTab.tabElement && activeTab.frameElement) {
    activeTab.frameElement.src = "../newtab";
    activeTab.title = "New Tab";
    activeTab.tabElement.children[0].textContent = "New Tab";
  }
});

function init() {
  if (!tabContainer || !frameContainer) return;

  tabContainer.innerHTML = "";
  frameContainer.innerHTML = "";

  tabContainer.addEventListener("click", (event) => {
    const clickedTab = (event.target as HTMLElement).closest(".tab");
    if (clickedTab && (clickedTab as HTMLElement).dataset.id) {
      const tabId = Number((clickedTab as HTMLElement).dataset.id);
      tabManager.setActiveTab(tabId);
    }
  });

  if (newTabButton) {
    newTabButton.addEventListener("click", () => {
      tabManager.addTab("bolt://newtab");
    });
  }

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (data && data.type === "navigate" && data.query) {
      navigateActiveTab(data.query);
    }
  });

  tabManager.addTab("bolt://newtab");
}

init();
