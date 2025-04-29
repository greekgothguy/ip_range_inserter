document.getElementById('insertInclude').addEventListener('click', async () => {
  const ipRange = document.getElementById('ipRangeInclude').value;
  await insertIntoPage(ipRange, 'includeList');
});

document.getElementById('insertExclude').addEventListener('click', async () => {
  const ipRange = document.getElementById('ipRangeExclude').value;
  await insertIntoPage(ipRange, 'excludeList');
});

async function insertIntoPage(ipRange, targetId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: insertIPs,
    args: [ipRange, targetId]
  });
}

function insertIPs(ipRange, targetId) {
  console.log(`Starting IP insertion for range: ${ipRange} into field: ${targetId}`);

  const match = ipRange.match(/^(\d+\.\d+\.\d+\.)(\d+)-(\d+)$/);
  if (!match) {
    alert("Invalid format: use e.g. 10.10.2.10-15");
    return;
  }

  const prefix = match[1];
  const start = parseInt(match[2]);
  const end = parseInt(match[3]);

  const textarea = document.getElementById(targetId);
  if (!textarea) {
    alert(`Could not find textarea with id='${targetId}'`);
    console.error("Textarea not found");
    return;
  }

  textarea.focus();
  let current = start;

  function insertNext() {
    if (current > end) {
      console.log("✅ Finished inserting IPs");
      return;
    }

    const ip = `${prefix}${current}`;
    console.log("Typing IP:", ip);

    textarea.value = ip;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const enterEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      code: 'Enter',
      keyCode: 13
    });
    textarea.dispatchEvent(enterEvent);

    current++;
    setTimeout(insertNext, 100); // Delay between typing
  }

  insertNext();
}
