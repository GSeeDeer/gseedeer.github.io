(function () {
  "use strict";

  function enablePageViews() {
    var article = document.querySelector("article.page.single");
    if (!article) {
      return;
    }

    var path = window.location.pathname.replace(/\/+$/, "");
    if (path === "/about" || path === "/en/about") {
      return;
    }

    var date = article.querySelector(".post-meta-line time");
    if (!date) {
      return;
    }

    var metaLine = date.closest(".post-meta-line");
    if (!metaLine || metaLine.querySelector(".page-views")) {
      return;
    }

    var views = document.createElement("span");
    views.className = "page-views";
    views.style.marginLeft = "0.75rem";
    views.innerHTML =
      '<i class="far fa-eye" aria-hidden="true"></i>&nbsp;' +
      '<span id="busuanzi_container_page_pv" style="display:none;">' +
      '阅读 <span id="busuanzi_value_page_pv"></span> 次' +
      "</span>";

    metaLine.appendChild(views);

    if (document.querySelector("script[data-busuanzi]")) {
      return;
    }

    var script = document.createElement("script");
    script.src =
      "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    script.async = true;
    script.setAttribute("data-busuanzi", "true");
    document.body.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enablePageViews);
  } else {
    enablePageViews();
  }
})();
