const STORAGE_KEY = "lastExecutionDate";
const DEFAULT_DATE = "2001-01-01";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    chrome.storage.local.get(STORAGE_KEY, function (data) {
      const today = getToday();
      let lastExecutionDate = data.lastExecutionDate || DEFAULT_DATE;

      const hasAlreadyBeenClickedToday = lastExecutionDate == today;
      if (hasAlreadyBeenClickedToday) {
        return;
      }

      clickTheBelly(today);
    });
  }
});
function clickTheBelly(today) {
  chrome.tabs.query({}, function (tabs) {
    const pajacykTab = tabs.find((t) => {
      return t.url.indexOf("pajacyk.pl") > -1;
    });

    const isPajacykTabExists = pajacykTab !== undefined;

    if (!isPajacykTabExists) {
      chrome.tabs.create({
        url: "https://www.pajacyk.pl/",
      });
    } else {
      chrome.scripting.executeScript(
        {
          target: {
            tabId: pajacykTab.id,
            allFrames: false,
          },
          func: function () {
            const CLICK_THE_BELLY_DELEY = 1000;
            const CLOSE_TAB_DELEY = 2000;

            setTimeout(function () {
              const $clickBox = document.querySelector(".pajacyk__clickbox");
              $clickBox.click();

              setTimeout(function () {
                window.close();
              }, CLOSE_TAB_DELEY);
            }, CLICK_THE_BELLY_DELEY);
          },
        },
        function () {
          chrome.storage.local.set(
            {
              lastExecutionDate: today,
            },
            function () {}
          );
        }
      );
    }
  });
}
