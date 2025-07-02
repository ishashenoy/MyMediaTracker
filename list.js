function exportData(){
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    console.log(watchlist);

    const jsonString = JSON.stringify(watchlist, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.json';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}    

function show(elmnt){
    let x = document.getElementById(elmnt);
    if (x.style.display === "none"){
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

//TABS
function openList(evt, listName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName(".tab.link");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(listName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();

// LIST PAGES
document.addEventListener('DOMContentLoaded', () => {
  // Load media items from localStorage
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  for(let media of watchlist){
    let listItem = document.createElement('div');
    listItem.classList.add('list-item');
    listItem.innerHTML = `
                      <img class="list-item-image" src=${media.image}>
                      <p class="list-item-title">${media.title}</p>
                      <p class="list-item-type" style="display:none;">${media.type}</p>
                      <select name="list-item-status" class="list-item-status">
                          <option value="plan-to-watch">🔵 Plan to Watch</option>
                          <option value="watching">🟡 Watching</option>
                          <option value="watched">🟢 Watched</option>
                          <option value="on-hold">🔴 On Hold</option>
                      </select>
                      `;
    
    let progressDiv = document.createElement('div');
    progressDiv.classList.add('list-item-progress');

    let currentEpisode = document.createElement('div');
    currentEpisode.type = 'text';
    currentEpisode.contentEditable = true;
    currentEpisode.classList.add('list-item-current');
    currentEpisode.innerText = media.progress || "";
    progressDiv.appendChild(currentEpisode);

    let divider = document.createElement('p');
    divider.innerText = "‎ /‎ ‎ ";
    progressDiv.appendChild(divider);

    let totalEpisode = document.createElement('p');
    totalEpisode.innerText = media.episodes;
    progressDiv.appendChild(totalEpisode);

    listItem.appendChild(progressDiv);

    listItem.innerHTML += `
                      <select name="list-item-rating" class="list-item-rating">
                          <option value="0">☆☆☆☆☆</option>
                          <option value="1">⭐☆☆☆☆</option>
                          <option value="2">⭐⭐☆☆☆</option>
                          <option value="3">⭐⭐⭐☆☆</option>
                          <option value="4">⭐⭐⭐⭐☆</option>
                          <option value="5">⭐⭐⭐⭐⭐</option>
                      </select>
                      `;

    listItem.querySelector('.list-item-status').value = media.status || "plan-to-watch";
    listItem.querySelector('.list-item-rating').value = media.rating || "0";

    let removeFromListButton = document.createElement('div');
    removeFromListButton.innerText = "‎ ";
    removeFromListButton.classList.add("list-item-remove");
    removeFromListButton.addEventListener('click', () => {
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

        const index = watchlist.findIndex(item => 
            item.title === media.title && item.type === media.type
        );

        if (index > -1) {
          watchlist.splice(index, 1);
          localStorage.setItem('watchlist', JSON.stringify(watchlist));
          listItem.remove();
        }

        document.getElementById(media.type).querySelector('.list-container').removeChild(listItem);
    });
    listItem.appendChild(removeFromListButton);
    document.getElementById(media.type).querySelector('.list-container').appendChild(listItem);
  }

});

window.addEventListener("beforeunload", updateLocalData);

function updateLocalData(){
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  let title, type, status, progress, rating;

  $('.list-item').each(function() {
    title = $(this).find('.list-item-title').text();
    type = $(this).find('.list-item-type').text();
    status = $(this).find('.list-item-status').val();
    progress = $(this).find('.list-item-current').text();
    rating = $(this).find('.list-item-rating').val();

    const itemIndex = watchlist.findIndex(item => 
        item.title === title && item.type === type
    );

    if (itemIndex !== -1) {
      watchlist[itemIndex].status = status;
      watchlist[itemIndex].progress = progress;
      watchlist[itemIndex].rating = rating;
    } else {
      console.warn("Item not found in watchlist for update:", title, type);
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  });
}

function exportData(){
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    console.log(watchlist);

    const jsonString = JSON.stringify(watchlist, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.json';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}    

function show(elmnt){
    let x = document.getElementById(elmnt);
     x.style.display = "block";
    document.documentElement.style.overflow = "hidden";
    document.querySelectorAll('*').forEach(el => el.style.overflow = 'hidden');
}

function hide(elmnt){
    let x = document.getElementById(elmnt);
    x.style.display = "none";
    document.documentElement.style.overflow = "auto";
}

let jsonData;

document.getElementById("file").addEventListener("change", async function(event) {
  const file = event.target.files[0]; 
  if (file) {
    jsonData = await parseJsonFile(file); 
    console.log(jsonData);
    localStorage.setItem('watchlist', JSON.stringify(jsonData));
    alert('File upload complete!');
  }
});


async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = event => resolve(JSON.parse(event.target.result))
    fileReader.onerror = error => reject(error)
    fileReader.readAsText(file)
  })
}