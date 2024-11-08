const response = await fetch("https://retune.so/api/chat/11ef9c89-c2af-abc0-a3c6-c11db46091fd/new-thread", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Workspace-API-Key": "11ee4071-239b-0c70-8690-bba825ed91b5"
    },
    body: JSON.stringify({
    })
});
const data = await response.json();
console.log(data);