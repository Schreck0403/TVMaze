"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Search for shows by term and return array of show objects. */
async function getShowsByTerm(term) {
  const response = await fetch(`http://api.tvmaze.com/search/shows?q=${term}`);
  const data = await response.json();

  return data.map(item => ({
    id: item.show.id,
    name: item.show.name,
    summary: item.show.summary,
    image: item.show.image ? item.show.image.medium : "https://tinyurl.com/tv-missing"
  }));
}

/** Create show elements from an array of shows and append to the DOM. */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>`
    );
    $showsList.append($show);
  }
}

/** Handle form submission: hide episodes, get shows, and display them. */
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
});

/** Given a show ID, fetch and return array of episodes: {id, name, season, number}. */
async function getEpisodesOfShow(id) {
  const response = await fetch(`http://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = await response.json();

  return episodes.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
}

/** Populate episodes into #episodesList and show the episodes area. */
function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($episode);
  }

  $episodesArea.show();
}

// Add click event listener for fetching and displaying episodes.
$showsList.on("click", ".Show-getEpisodes", async function (evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});
