let count = 0
callWhiteOut = (tab) => {
  const {id, url} = tab;

    chrome.scripting.executeScript(
      {
        target: {tabId: id, allFrames: true},
        files: ['content.js']
      }
    )
}

getCurrentTab = async () => {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}





document.getElementById('enable').addEventListener('click', function() {
  if (count === 0) {
    getCurrentTab().then((tab) => {
      callWhiteOut(tab)
    })
    count = 1
  }
});