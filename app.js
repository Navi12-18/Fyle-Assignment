// Global variables
let username = '';        // GitHub username for which repositories will be fetched.
let perPage = 10;          // Default repositories per page.
let currentPage = 1;       // Initial page number.

// Function to show loader by ID
function showLoader(loaderId) {
  const loader = document.getElementById(loaderId);
  loader.style.display = 'block';
}

// Function to hide loader by ID
function hideLoader(loaderId) {
  const loader = document.getElementById(loaderId);
  loader.style.display = 'none';
}

// Function to fetch user details from GitHub API
function fetchUser() {
  showLoader('loaderUser');
  const apiUrl = `https://api.github.com/users/${username}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(user => {
      // Display user details
      const userImage = document.getElementById('userImage');
      userImage.src = user.avatar_url;
      userImage.alt = user.name ? `User Image - ${user.name}` : 'User Image - Not available';

      const userName = document.getElementById('userName');
      const userNameHeading = document.createElement('h4');
      const userNameLink = document.createElement('a');

      userNameLink.textContent = user.name || user.login;
      userNameLink.href = user.html_url;
      userNameLink.target = '_blank';
      userNameLink.style.color = '#3498db';

      userNameHeading.appendChild(userNameLink);
      userName.innerHTML = '';
      userName.appendChild(userNameHeading);

      const userLocation = document.getElementById('userLocation');
      userLocation.textContent = user.location || 'Location not specified';
    })
    .catch(error => {
      console.error('Error fetching user:', error);
    })
    .finally(() => {
      hideLoader('loaderUser');
    });
}

// Function to fetch repositories from GitHub API
function fetchRepos(page) {
  showLoader('loaderRepos');
  const apiUrl = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(repositories => {
      const repositoriesContainer = document.getElementById('repositoriesContainer');
      repositoriesContainer.innerHTML = ''; // Clear existing repositories

      if (repositories.length === 0) {
        const noRepoMessage = document.createElement('p');
        noRepoMessage.textContent = 'No repositories found for the given username.';
        repositoriesContainer.appendChild(noRepoMessage);
      } else {
        repositories.forEach(repo => {
          // Display repository cards
          const repoCard = document.createElement('div');
          repoCard.className = 'repo-card';

          const title = document.createElement('h2');
          title.textContent = repo.name;
          title.onclick = () => {
            console.log('Repository URL:', repo.html_url);
            window.open(repo.html_url, '_blank');
          };

          const description = document.createElement('p');
          description.textContent = repo.description || 'No description available.';

          const tagDiv = document.createElement('div');
          tagDiv.className = 'tag';
          tagDiv.textContent = repo.language || 'Not specified';

          repoCard.appendChild(title);
          repoCard.appendChild(description);
          repoCard.appendChild(tagDiv);

          repositoriesContainer.appendChild(repoCard);
        });
      }
    })
    .catch(error => console.error('Error fetching repositories:', error))
    .finally(() => {
      hideLoader('loaderRepos');
    });
}

// Function to handle the search functionality
function searchRepositories() {
  username = document.getElementById('searchField').value;
  const userContainer = document.getElementById('userContainer');
  const repositoriesContainer = document.getElementById('repositoriesContainer');
  const perPageContainer = document.getElementById('perPageContainer');
  const enterUsernameMessage = document.getElementById('enterUsername');
  const repoSearchBarContainer = document.getElementById('repoSearchBarContainer');

  if (username) {
    currentPage = 1;
    userContainer.style.display = 'flex';
    showLoader('loaderUser');
    fetchUser();
    fetchRepos(currentPage);
    updatePagination();
    enterUsernameMessage.style.display = 'none';

    // Show perPageContainer and repoSearchBarContainer when a username is entered
    perPageContainer.style.display = 'block';
    repoSearchBarContainer.style.display = 'block';
  } else {
    // Hide userContainer, perPageContainer, and repoSearchBarContainer when no username is entered
    userContainer.style.display = 'none';
    repositoriesContainer.innerHTML = '';
    perPageContainer.style.display = 'none';
    enterUsernameMessage.style.display = 'block';

    // Hide paginationContainer when no username is entered
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    // Hide repoSearchBarContainer when no username is entered
    repoSearchBarContainer.style.display = 'none';
  }
}

// Function to handle the change in repositories per page
function changePerPage() {
  perPage = document.getElementById('perPage').value;
  currentPage = 1; // Reset page to 1 when changing perPage.
  fetchRepos(currentPage);
  updatePagination();
}

// Function to update pagination based on the total number of repositories
function updatePagination() {
  if (!username) {
    return; // No need to update pagination if no username is entered.
  }

  const apiUrl = `https://api.github.com/users/${username}`;
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(user => {
      // Simulate a total of 100 repositories (replace with actual total repositories count if available).
      const totalRepositories = user.public_repos;

      const paginationContainer = document.getElementById('paginationContainer');
      paginationContainer.innerHTML = '';

      const totalPages = Math.ceil(totalRepositories / perPage);

      for (let i = 1; i <= totalPages; i++) {
        // Create page links
        const pageLink = document.createElement('span');
        pageLink.className = 'page-link';
        pageLink.textContent = i;
        pageLink.onclick = () => {
          currentPage = i;
          fetchRepos(currentPage);
          updatePagination();
        };

        paginationContainer.appendChild(pageLink);
      }
    })
    .catch(error => console.error('Error:', error));
}

// Function to filter repositories based on search term
function filterRepositories() {
  const searchTerm = document.getElementById('repoSearchBar').value.toLowerCase();
  const repoCards = document.querySelectorAll('.repo-card');

  repoCards.forEach(repoCard => {
    const title = repoCard.querySelector('h2').textContent.toLowerCase();
    const description = repoCard.querySelector('p').textContent.toLowerCase();

    // Check if the title or description contains the search term
    const isVisible = title.includes(searchTerm) || description.includes(searchTerm);

    // Toggle visibility based on the search result
    repoCard.style.display = isVisible ? 'block' : 'none';
  });
}

// Initial fetch and pagination setup.
fetchUser();
fetchRepos(currentPage);
updatePagination();