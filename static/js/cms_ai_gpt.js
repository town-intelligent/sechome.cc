import { getWeightMeta } from './api/weight.js';

const openBtn = document.querySelector("#open");
const closeBtn = document.querySelector("#close");
const header = document.querySelector("header");
const selectTwo = document.querySelector("#selectTwo");
const input = document.querySelector("input.form-control");
const submitBtn = document.querySelector("#submit");
const chat = document.querySelector(".chat");
const inputFixed = document.querySelector(".input-fixed");
let selectTwoText = "";

const settings = {
  version: "AI-Gen-V1.1.0",
  username: "您",
  assistant_name: "Eva",
  message: "您好，我是您的 AI 永續顧問 Eva，有甚麼需要幫助的地方?",
};

const versionEl = document.querySelector("#version");
versionEl.textContent = `版本：` + settings.version;

const greetingsEl = document.querySelector("#greetings");
greetingsEl.textContent = settings.assistant_name + "：" + settings.message;

// 載入 SDGs 權重數據
const allWeights = [];
if (allWeights.length === 0) {
  for (let i = 0; i < WEIGHTS.length; i++) {
    try {
      const weightData = await getWeightMeta(WEIGHTS[i]);
      allWeights.push(...weightData.content.categories);
    } catch (error) {
      console.error("Error fetching or processing weight data:", error);
    }
  }
}

const toggleHeader = () => {
  header.classList.toggle("transform-open");
};

// SDG 選擇相關
let list_target_sdgs = [];

const createSDGIcon = (btn) => {
  const icon = document.createElement("img");
  icon.className = "rounded-0 mt-3 mr-3 mb-3 mt-md-0 cursor-pointer";
  icon.style.height = "40px";
  icon.style.width = "40px";
  icon.src = btn.querySelector("img").src;
  icon.alt = btn.querySelector("img").alt;
  icon.setAttribute("data-sdg", btn.getAttribute("name"));
  return icon;
};

const addSDGToList = (icon) => {
  const sdgNumber = icon.getAttribute("data-sdg");
  if (!list_target_sdgs.includes(sdgNumber)) {
    list_target_sdgs.push(sdgNumber);
  }
};

const removeSDGFromList = (icon) => {
  list_target_sdgs = list_target_sdgs.filter(
    (item) => item !== icon.getAttribute("data-sdg")
  );
};

const handleClickEvent = (btn) => {
  const icon_container = document.querySelector("#icon_container");
  const icon = createSDGIcon(btn);
  addSDGToList(icon);
  icon_container.appendChild(icon);
  updateInputValue();
  
  // 切換背景顏色
  const isSelected = btn.style.backgroundColor === "gray";
  btn.style.backgroundColor = isSelected ? "" : "gray";

  icon.addEventListener("click", () => {
    removeSDGFromList(icon);
    icon.remove();
    updateInputValue();
    btn.style.backgroundColor = "";
  });
};

// 事件監聽器設置
document.addEventListener("click", (event) => {
  if (event.target.closest("#btn_sdg")) {
    handleClickEvent(event.target.closest("#btn_sdg"));
  }
});

const modleCloseBtn = document.querySelector("#closeSDGsModal");
modleCloseBtn.addEventListener("click", () => {
  const grayElements = document.querySelectorAll(
    "[style='background-color: gray;']"
  );
  grayElements.forEach((element) => {
    element.style.backgroundColor = "";
  });
});

openBtn.addEventListener("click", toggleHeader);
closeBtn.addEventListener("click", toggleHeader);

const checkAndShowModal = () => {
  selectTwo.value !== "---請選擇---"
    ? $("#SDGsModal").modal("show")
    : $("#SDGsModal").modal("hide");
};

const updateInputValue = (prompt = null) => {
  if (prompt !== null) {
    input.value = prompt;
    return;
  }
  
  let sdgsText = "";
  for (let i = 0; i < list_target_sdgs.length; i++) {
    sdgsText = sdgsText + allWeights[list_target_sdgs[i] - 1].title + "、";
  }
  sdgsText = sdgsText.slice(0, -1); // 移除最後一個頓號
  input.value = `請${selectTwoText}，符合${sdgsText}。`;
};

const windowForAnalysisProjectSROI = () => {
  return new Promise((resolve, reject) => {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.tabIndex = "-1";
    modal.role = "dialog";

    const modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog modal-dialog-centered";
    modalDialog.role = "document";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    // Modal header
    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    const title = document.createElement("h5");
    title.className = "modal-title";
    title.innerText = "輸入專案編號";
    
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-close";
    closeButton.setAttribute("data-bs-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");
    
    modalHeader.appendChild(title);
    modalHeader.appendChild(closeButton);

    // Modal body
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control";
    input.placeholder = "請輸入專案編號";
    input.value = "38896996";
    modalBody.appendChild(input);

    // Modal footer
    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn btn-primary";
    confirmBtn.innerText = "確認";
    confirmBtn.onclick = () => {
      const projectId = input.value;
      if (projectId) {
        resolve(projectId);
        bootstrapModal.hide();
      } else {
        alert("請輸入專案編號");
      }
    };
    modalFooter.appendChild(confirmBtn);

    // 組裝 Modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    modal.addEventListener("hidden.bs.modal", () => {
      document.body.removeChild(modal);
      reject('視窗被關閉');
    });
  });
};

selectTwo.addEventListener("change", async () => {
  selectTwoText = selectTwo.options[selectTwo.selectedIndex].text;
  
  if (selectTwoText === "分析專案的 SROI 權重") {
    try {
      let uuid = await windowForAnalysisProjectSROI();   
      updateInputValue("請幫我分析專案編號為 " + uuid + " 的專案。");
    } catch (error) {
      console.log('Modal was closed or operation was cancelled');
    }
  } else {
    updateInputValue();
    checkAndShowModal();
  }
});

submitBtn.addEventListener("click", async () => {
  if (!input.value.trim()) {
    alert("請輸入查詢內容");
    return;
  }

  const requestBody = {
    role: "小鎮賦能",
    message: input.value,
    params: {
      weight: list_target_sdgs,
      format: "html"
    }
  };

  // 創建問答元素
  const questionEl = document.createElement("p");
  const responseEl = document.createElement("p");
  questionEl.classList.add("p-lg-3", "p-1");
  responseEl.classList.add("bg-gpt-third", "p-lg-3", "p-1", "mb-5", "d-flex", "align-items-start");
  questionEl.id = "question";
  responseEl.id = "response";
  questionEl.textContent = `${settings.username}：${input.value}`;
  
  // 添加到聊天容器
  chat.appendChild(questionEl);
  chat.appendChild(responseEl);

  // 清空輸入
  input.value = "";

  // 顯示載入動畫
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  responseEl.appendChild(spinner);

  try {
    const response = await fetch(HOST_URL_LLMTWINS + "/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    spinner.remove();
    responseEl.innerHTML = `${settings.assistant_name}：${data.message}`;

    // 清空狀態
    list_target_sdgs = [];
    selectTwo.value = "---請選擇---";
    const icon_container = document.querySelector("#icon_container");
    icon_container.innerHTML = "";

    // 滾動到底部
    chat.scrollTop = chat.scrollHeight;
  } catch (error) {
    console.error("Error:", error);
    spinner.remove();
    responseEl.innerHTML = `${settings.assistant_name}：很抱歉，發生了錯誤，請稍後再試。`;
  }
});

// 視窗大小調整
const setInputFixedWidth = () => {
  const greetingsWidth = document.querySelector("#greetings").offsetWidth;
  inputFixed.style.width = `${greetingsWidth}px`;
};

window.addEventListener("resize", setInputFixedWidth);
window.addEventListener("load", setInputFixedWidth);

// 初始化 SDGs 選擇器
const weight_container = document.querySelector("#weight_container");
allWeights.forEach((category, idx) => {
  const index = idx + 1;
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card mt-2';
  
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.className = 'card-body p-2';
  
  const alignDiv = document.createElement('div');
  alignDiv.className = 'd-flex align-items-center';
  alignDiv.id = 'btn_sdg';
  alignDiv.setAttribute('name', index.toString().padStart(2, '0'));
  
  const img = document.createElement('img');
  img.alt = '';
  img.className = 'mr-2';
  img.src = category.thumbnail;
  img.style.width = '50px';
  
  const p = document.createElement('p');
  p.className = 'mb-0';
  p.textContent = category.title;
  
  alignDiv.appendChild(img);
  alignDiv.appendChild(p);
  cardBodyDiv.appendChild(alignDiv);
  cardDiv.appendChild(cardBodyDiv);
  weight_container.appendChild(cardDiv);
});