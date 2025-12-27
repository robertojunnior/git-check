const analyzeBtn = document.getElementById("analyzeBtn");
const usernameInput = document.getElementById("usernameInput");
const resultDiv = document.getElementById("result");

async function fetchAllPages(baseUrl) {
  let page = 1;
  let allResults = [];

  while (true) {
    const response = await fetch(`${baseUrl}?per_page=100&page=${page}`);

    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) break;

    allResults = allResults.concat(data);
    page++;
  }

  return allResults;
}

analyzeBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Digite um username do GitHub");
    return;
  }

  resultDiv.innerHTML = `
  <div class="loading">
    <div class="spinner"></div>
    <span>Buscando dados no GitHub...</span>
  </div>
  `;

  try {
    const followers = await fetchAllPages(
      `https://api.github.com/users/${username}/followers`
    );

    const following = await fetchAllPages(
      `https://api.github.com/users/${username}/following`
    );

    resultDiv.innerHTML = `
      <p>Seguidores: <strong>${followers.length}</strong></p>
      <p>Seguindo: <strong>${following.length}</strong></p>
    `;

    console.log("Followers:", followers);
    console.log("Following:", following);
    const followersUsernames = followers.map((user) => user.login);
    const notFollowingBack = following.filter(
      (user) => !followersUsernames.includes(user.login)
    );

    console.log("Não me seguem de volta:", notFollowingBack);
    resultDiv.innerHTML = `
  <h3>Não me seguem de volta (${notFollowingBack.length})</h3>

  <ul>
    ${notFollowingBack
      .map(
        (user) =>
          `<li>
            <a
              class="user-item"
              href="https://github.com/${user.login}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="${user.avatar_url}" alt="${user.login}" />
              <span>${user.login}</span>
            </a>
          </li>`
      )
      .join("")}
  </ul>
    `;
  } catch (error) {
    if (error.message === "404") {
      resultDiv.innerHTML = "Usuário não encontrado.";
    } else if (error.message === "401" || error.message === "403") {
      resultDiv.innerHTML =
        "Erro de autenticação!<br>Verifique o limite de requisições de seu token no GitHub.";
    } else {
      resultDiv.innerHTML = "Erro inesperado ao buscar dados.";
    }

    console.error("Erro:", error.message);
  }
});
