import { draws, draws_task_weight_chart } from "./app.js";
import { plan_info, list_plan_tasks, getProjectWeight } from "./plan.js";
import { getTaskWeight, get_task_info, list_children_tasks } from "./tasks.js";
import {
  append_chart_container,
  draw_bar,
  draw_bar_chart,
  getMappedSdgData,
  sdgImages,
  draw_doughnut_chart,
  isValidDoughnutChartData,
} from "./chart/bar.js";
import { getSroiData } from "./api/sroi.js";
import { renderHandlebars } from "./utils/handlebars.js";
import { parse_sdgs_items } from "./utils/transformers.js";
import { isOverflow } from "./utils/widgets.js";
import { getNFT } from "./nft.js";

import { getWeightMeta } from './api/weight.js';

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

export function draw_sdgs_chart(totalProjectWeight, elementID) {
  // Draw
  var array_weight_colors = [
    "#e5243b",
    "#DDA63A",
    "#4C9F38",
    "#C5192D",
    "#FF3A21",
    "#26BDE2",
    "#FCC30B",
    "#A21942",
    "#FD6925",
    "#DD1367",
    "#FD9D24",
    "#BF8B2E",
    "#3F7E44",
    "#0A97D9",
    "#56C02B",
    "#00689D",
    "#19486A",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
  ];
  draw_bar_chart({
    elementId: elementID,
    title: "專案指標累積",
    data: getMappedSdgData(totalProjectWeight),
    backgroundColor: array_weight_colors,
    skipZero: true,
    titlePosition: "bottom",
    titleFontSize: 16,
  });
}

export function draw_project_chart(uuid, canvasId) {
  var weight_task = getTaskWeight(uuid);
  var array_weight_colors = [
    "#e5243b",
    "#DDA63A",
    "#4C9F38",
    "#C5192D",
    "#FF3A21",
    "#26BDE2",
    "#FCC30B",
    "#A21942",
    "#FD6925",
    "#DD1367",
    "#FD9D24",
    "#BF8B2E",
    "#3F7E44",
    "#0A97D9",
    "#56C02B",
    "#00689D",
    "#19486A",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
    "#0075A1",
  ];
  draw_bar_chart({
    elementId: canvasId,
    title: "永續指標",
    data: getMappedSdgData(weight_task),
    backgroundColor: array_weight_colors,
    skipZero: true,
    titlePosition: "bottom",
    titleFontSize: 16,
  });
}

function project_weight_chart(obj_project) {
  const id = "observablehq-chart-" + obj_project.uuid;
  append_chart_container("#obj_digital_fp_chart1", id);

  var obj_parent_tasks = list_plan_tasks(obj_project.uuid, 1);
  var weight = getProjectWeight(obj_parent_tasks.tasks);
  draw_sdgs_chart(weight, id);
}

function task_weight_chart(obj_task) {
  var obj_digital_fp_chart1_img = document.createElement("div");
  obj_digital_fp_chart1_img.id = "observablehq-chart-" + obj_task.uuid;
  document
    .getElementById("obj_digital_fp_chart1")
    .append(obj_digital_fp_chart1_img);

  // Draw
  draws_task_weight_chart(obj_task.uuid);
}

function set_location(obj_project) {
  // Location
  var list_location = [];

  try {
    list_location = obj_project.location.split(",");
  } catch (e) {}

  // Location
  var obj_location = document.getElementById("location");
  for (var index = 0; index < list_location.length; index++) {
    if (parseInt(list_location[index]) == 1) {
      if (index == 0) {
        obj_location.innerHTML = obj_location.innerHTML + "T-Planet @ 台北";
      } else if (index == 1) {
        obj_location.innerHTML = "T-Planet @ 竹山";
      } else if (index == 2) {
        obj_location.innerHTML = obj_location.innerHTML + "T-Planet @ 高雄";
      } else if (index == 3) {
        obj_location.innerHTML = obj_location.innerHTML + "T-Planet @ 花蓮";
      } else {
        obj_location.innerHTML = obj_location.innerHTML + "T-Planet @ 馬祖";
      }
    }
  }
}

function relate_people(obj_tasks) {
  var obj_project_relate_people = document.getElementById("relate_people");

  var list_weight = getProjectWeight(obj_tasks.tasks);

  var total_weight = 0;
  for (var key in list_weight) {
    total_weight = total_weight + parseInt(list_weight[key]);
  }

  obj_project_relate_people.innerHTML = total_weight;
}

function add_task_sdgs(obj_task) {
  // Get child tasks
  var list_child_tasks = list_children_tasks(obj_task.uuid);

  // Get content of child tasks
  if (list_child_tasks.length == 0) {
    return null;
  }

  // SDGs element
  var obj_sdg_div = document.createElement("p");
    for (var index = 0; index < list_child_tasks.length; index++) {
      var obj_child_task = get_task_info(list_child_tasks[index]);
  
      // Create SDGs icon
      for (var index_sdg = 1; index_sdg <= allWeights.length; index_sdg++) {
        var obj_content = JSON.parse(obj_child_task.content);
  
        if (parseInt(obj_content["sdgs-" + index_sdg]) == 1) {
          var obj_img_p = document.createElement("p");
          var obj_img = document.createElement("img");
          obj_img.className = "mr-2";
  
          obj_img.src = allWeights[index_sdg - 1].thumbnail;
          obj_img.alt = "";
          obj_img.style = "width: 30px";
          obj_sdg_div.append(obj_img);
        }
      }
    }

  return obj_sdg_div;
}

function add_project_sdgs(obj_project) {
  var obj_sdgs_container = document.getElementById("project_sdg_container");

  var list_weight = [];

  try {
    list_weight = obj_project.weight.split(",");
  } catch (e) {}
    for (var index = 0; index < list_weight.length; index++) {
      // Append to DOM
      if (parseInt(list_weight[index]) == 1) {
        var obj_div = document.createElement("div");
        obj_div.className = "col-2 col-md-1 pr-0";
  
        var obj_a = document.createElement("p");
        obj_a.href = "#";
  
        var obj_img = document.createElement("img");
        obj_img.className = "w-100";
        obj_img.src = allWeights[index].thumbnail;
        obj_img.alt = "";
  
        // Append
        obj_a.append(obj_img);
        obj_div.append(obj_a);
        obj_sdgs_container.append(obj_div);
      }
    }
}

export async function set_page_info_content() {
  // Get path
  var path = window.location.pathname;

  // Get parent uuid
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uuid = urlParams.get("uuid");

  var obj_project = plan_info(uuid);

  // Project data

  // Set cover
  if (obj_project.img != null) {
    var path_cover =
      HOST_URL_TPLANET_DAEMON +
      "/static/project/" +
      uuid +
      "/media/cover/cover.png";
    var obj_cover = document.getElementById("project_cover");
    obj_cover.src = path_cover;
  }

  document.getElementById("project_name").innerHTML = obj_project.name;
  document.getElementById("project_period").innerHTML = obj_project.period;
  document.getElementById("project_uuid").innerHTML =
    "計畫編號: " + obj_project.uuid;
  document.getElementById("hoster").innerHTML = obj_project.hoster;
  document.getElementById("project_a").innerHTML = obj_project.project_a;
  document.getElementById("project_b").innerHTML = obj_project.project_b;
  document.getElementById("email").innerHTML = obj_project.email;
  document.getElementById("philosophy").innerHTML = obj_project.philosophy;

  if (obj_project.is_budget_revealed === true)
    document.getElementById("budget").innerHTML = obj_project.budget;
  else
    document.getElementById("budget").innerHTML = "-";

  // Location
  set_location(obj_project);

  // Project weight
  add_project_sdgs(obj_project);

  // Project weight descriptio11n
  const sdgs_items = parse_sdgs_items(obj_project);
  const sdgsMap = sdgs_items.reduce((map, sdg) => {
    map[sdg.index] = sdg;
    return map;
  }, {});

  const matchedWeights = allWeights
  .map(weight => {
    const index = ("0" + weight.id).slice(-2);
    const sdg = sdgsMap[index];
    if (sdg) {
      return {
        ...weight,
        value: sdg.value
      };
    }
    return null;
  })
  .filter(weight => weight !== null);
  renderHandlebars("project_weight_description", "tpl-sdgs", { matchedWeights });

  $("#project_weight_description").on("click", ".read-more", (e) => {
    e.preventDefault();
    const sdg_text = $(e.target)
      .parents(".sdg-text-container")
      .find(".sdg-text");
    $("#SDGsModal .modal-title").html(sdg_text.attr("data-title"));
    $("#SDGsModal .modal-body").html(sdg_text.html());
    $("#SDGsModal").modal("show");
  });

  $(window).resize(() => {
    $("#project_weight_description .sdg-text")
      .filter((_, element) => isOverflow(element))
      .map((_, element) => $(element).parent().find(".read-more"))
      .map((_, element) => $(element).show());

    $("#project_weight_description .sdg-text")
      .filter((_, element) => !isOverflow(element))
      .map((_, element) => $(element).parent().find(".read-more"))
      .map((_, element) => $(element).hide());
  });
  window.dispatchEvent(new Event("resize"));

  // Task data
  var obj_tasks = list_plan_tasks(obj_project.uuid, 1);

  // Relate people
  relate_people(obj_tasks);

  project_weight_chart(obj_project);

  var list_tasks = obj_tasks.tasks;
  var obj_tasks_container = document.getElementById("tasks_container");

  for (var index = 0; index < list_tasks.length; index++) {
    var obj_task = get_task_info(list_tasks[index]);

    // Task container
    var obj_div_root = document.createElement("div");
    obj_div_root.className = "row mt-4";

    var obj_div_product = document.createElement("div");
    obj_div_product.className = "col-md-6";

    var obj_div_text_center = document.createElement("div");
    obj_div_text_center.className = "text-center";

    var obj_img_product = document.createElement("img");
    obj_img_product.className = "w-100";

    if (obj_task.thumbnail == "") {
      // obj_img_product.src = "/static/imgs/ab_project_detail.png";
      obj_img_product.width = 480;
      obj_img_product.height = 300;
    } else {
      var path_cover = HOST_URL_TPLANET_DAEMON + obj_task.thumbnail;
      obj_img_product.src = path_cover;
    }

    obj_img_product.alt = "";

    var obj_div_img_root = document.createElement("div");
    obj_div_img_root.className = "col-md-6 mt-4 mt-md-0";

    var obj_div_img_text_center = document.createElement("div");
    obj_div_img_text_center.className = "text-center";

    var obj_div_img = document.createElement("div");
    obj_div_img.className =
      "h-100 d-flex align-items-center justify-content-center mt-4 mt-md-0 flex-column";
    var obj_img = document.createElement("img");
    obj_img.className = "w-100 h-100";

    const chartId = "observablehq-chart-" + obj_task.uuid;
    append_chart_container($(obj_div_img_root), chartId);

    obj_div_img_root.append(obj_div_img_text_center);

    var obj_col_12 = document.createElement("div");
    obj_col_12.className = "col-12";

    var obj_row_1 = document.createElement("div");
    obj_row_1.className = "row mt-3";
    var obj_col_6_1 = document.createElement("div");
    obj_col_6_1.className = "col-md-6";

    var obj_col_6_2 = document.createElement("div");
    obj_col_6_2.className = "col-md-6 text-md-right";

    var obj_div_des = document.createElement("div");

    obj_div_des.className = "col-12 mb-2 h5";
    obj_div_des.style = "font-weight: bolder;";
    var obj_p_name = document.createElement("p");
    obj_p_name.className = "h5 fw-bold text-title";
    obj_p_name.innerHTML = "活動設計名稱: ";
    var obj_span_name = document.createElement("span");
    obj_span_name.className = "pl-2";
    obj_span_name.innerHTML = obj_task.name;
    var obj_p_period = document.createElement("p");
    obj_p_period.className = "small";
    obj_p_period.innerHTML = "日期: ";
    var obj_span_period = document.createElement("span");
    obj_span_period.innerHTML = obj_task.period;
    var obj_p_idea = document.createElement("p");
    obj_p_idea.className = "small";
    obj_p_idea.innerHTML = obj_task.overview;
    var obj_sdg_div = add_task_sdgs(obj_task);
    obj_p_name.append(obj_span_name);
    obj_p_period.append(obj_span_period);

    obj_col_6_1.append(obj_p_name);
    // obj_flex.append(obj_p_name);

    if (obj_sdg_div != null) {
      obj_col_6_2.append(obj_sdg_div);
    }

    obj_row_1.append(obj_col_6_1);
    obj_row_1.append(obj_col_6_2);
    obj_div_des.append(obj_row_1);
    obj_div_des.append(obj_p_period);
    obj_div_des.append(obj_p_idea);

    // Update NFT
    var txn_nft = "https://testnets.opensea.io/assets/mumbai/0x63818f1dd00287d70a9e8e976618471a3659d30a/17";
    var obj_nft = getNFT(obj_task.uuid);

    if (obj_nft !== null && typeof obj_nft !== "undefined") {
      txn_nft = obj_nft.txn;
    }

    var obj_p_nft = document.createElement("p");
    obj_p_nft.className = "bg-light ml-2 p-3 text-wrap";

    var obj_span_nft = document.createElement("span");
    obj_span_nft.className = "fw-bold";
    // obj_span_nft.innerText = "NFT: ";

    var obj_span_nft_hash = document.createElement("span");
    obj_span_nft_hash.className = "word-wrap";
    // obj_span_nft_hash.innerHTML = '<input type="button" value="NFT on OpenSea" onclick="window.open(\'' + txn_nft + '\', \'_blank\');" />';

    obj_p_nft.append(obj_span_nft);
    obj_p_nft.append(obj_span_nft_hash);

    obj_div_text_center.append(obj_img_product);
    obj_div_product.append(obj_div_text_center);
    obj_div_root.append(obj_div_product);
    obj_div_root.append(obj_div_img_root);
    // obj_flex_column.append(obj_div_des);

    obj_div_root.append(obj_div_des);
    obj_div_root.append(obj_p_nft);
    obj_tasks_container.append(obj_div_root);

    // Draw task weight
    draw_project_chart(obj_task.uuid, chartId);

    // Tabs
    $(".tabs a").on("click", (e) => {
      e.preventDefault();

      $('.tabs a').addClass('text-muted').removeClass('text-dark');
      $(e.target).removeClass('text-muted').addClass('text-dark');

      $(".tabs .tabs-section").hide();
      $($(e.target).attr("href")).show();
    });

    $('.tabs a').get(0).click();

    // SROI
    if (SROI) {

      const sroiData = await getSroiData(uuid);
      const { social_subtotal, economy_subtotal, environment_subtotal } =
        sroiData;

      if (
        social_subtotal == 0 &&
        economy_subtotal == 0 &&
        environment_subtotal == 0
      ) {
        sroiData.visible = false;
      }

      const html = document.getElementById("tpl-sroi-section").innerHTML;
      const template = Handlebars.compile(html);
      document.getElementById("sroi-section").innerHTML = template(sroiData);

      const labels = ["社會價值", "經濟價值", "環境價值"];
      const datasetData = [
        social_subtotal,
        economy_subtotal,
        environment_subtotal,
      ];

      // 當社會價值、經濟價值、環境價值都為0時，不顯示圓餅圖
      if (isValidDoughnutChartData(datasetData)) {
        draw_doughnut_chart({
          element: document.querySelector("#sroi-section #sroi_chart"),
          data: {
            labels,
            datasets: [
              {
                data: datasetData,
              },
            ],
          },
        });
      }
    }

    // Tabs
    $(".tabs a").on("click", (e) => {
      e.preventDefault();

      $(".tabs a").addClass("text-muted").removeClass("text-dark");
      $(e.target).removeClass("text-muted").addClass("text-dark");

      $(".tabs .tabs-section").hide();
      $($(e.target).attr("href")).show();
    });

    $(".tabs a").get(0).click();

    renderHandlebars("sroi-section", "tpl-sroi-section-loading", {});

    // SROI
    getSroiData(uuid)
      .then((sroiData) => renderSroiSection(sroiData))
      .catch((e) => renderHandlebars("sroi-section", "tpl-sroi-section-error", {}));
  }
}

const renderSroiSection = (sroiData) => {
  const { social_subtotal, economy_subtotal, environment_subtotal } = sroiData;

  if (
    social_subtotal == 0 &&
    economy_subtotal == 0 &&
    environment_subtotal == 0
  ) {
    sroiData.visible = false;
  }

  renderHandlebars("sroi-section", "tpl-sroi-section", sroiData);

  const labels = ["社會價值", "經濟價值", "環境價值"];
  const datasetData = [social_subtotal, economy_subtotal, environment_subtotal];

  // 當社會價值、經濟價值、環境價值都為0時，不顯示圓餅圖
  if (isValidDoughnutChartData(datasetData)) {
    draw_doughnut_chart({
      element: document.querySelector("#sroi-section #sroi_chart"),
      data: {
        labels,
        datasets: [
          {
            data: datasetData,
          },
        ],
      },
    });
  }
};
